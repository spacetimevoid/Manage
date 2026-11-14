$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
$script:genericTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 } | Select-Object -First 1
$script:actionTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and -not $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
function Await-Result($Operation, $ResultType) {
 $task = $script:genericTask.MakeGenericMethod($ResultType).Invoke($null, @($Operation)); $task.Wait(); return $task.Result
}
function Await-Action($Operation) { $task = $script:actionTask.Invoke($null,@($Operation)); $task.Wait() }
$root = (Get-Location).Path
$source = Get-Content -LiteralPath '.taste/asset-work/study-sources.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$result = @()
foreach($doc in $source.documents) {
 $pdfPath = Join-Path $root "public/assets/documents/study-$($doc.id).pdf"
 $file = Await-Result ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)) ([Windows.Storage.StorageFile])
 $pdf = Await-Result ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
 if($pdf.PageCount -ne $doc.pages.Count) { throw "Wrong page count: $($doc.id)" }
 for($i=0;$i -lt $pdf.PageCount;$i++) {
  $page = $pdf.GetPage($i)
  $options = New-Object Windows.Data.Pdf.PdfPageRenderOptions
  $options.DestinationWidth = 1785; $options.DestinationHeight = 2526
  $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  Await-Action ($page.RenderToStreamAsync($stream,$options))
  $readStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
  $renderPath = Join-Path $root ".taste/asset-work/$($doc.id)-page-$($i+1).png"
  $outputStream = [System.IO.File]::Create($renderPath); $readStream.CopyTo($outputStream); $outputStream.Dispose()
  $bitmap = New-Object System.Drawing.Bitmap($renderPath)
  if($i -eq 0) {
   $thumb = New-Object System.Drawing.Bitmap(1190,1684)
   $g = [System.Drawing.Graphics]::FromImage($thumb); $g.InterpolationMode = 'HighQualityBicubic'; $g.DrawImage($bitmap,0,0,1190,1684); $g.Dispose()
   $thumb.Save((Join-Path $root "public/assets/previews/document-preview-$($doc.id).png"),[System.Drawing.Imaging.ImageFormat]::Png); $thumb.Dispose()
  }
  foreach($problem in $source.problems | Where-Object { $_.documentId -eq $doc.id -and $_.page -eq ($i+1) }) {
   $rect = New-Object System.Drawing.Rectangle(144,480,1497,540)
   $crop = $bitmap.Clone($rect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
   $crop.Save((Join-Path $root "public/assets/problems/problem-crop-$($problem.id).png"),[System.Drawing.Imaging.ImageFormat]::Png); $crop.Dispose()
  }
  $result += [PSCustomObject]@{documentId=$doc.id;page=($i+1);width=$bitmap.Width;height=$bitmap.Height;path=$renderPath}
  $bitmap.Dispose(); $readStream.Dispose(); $stream.Dispose(); $page.Dispose()
 }
 Write-Output "$($doc.id): $($pdf.PageCount) pages verified and rendered"
}
$result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath '.taste/asset-work/render-verification.json' -Encoding UTF8
