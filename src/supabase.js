// Supabase integration module for Personal Study Vault (Manage)
export const SUPABASE_URL = 'https://zjgldhqggxnsnvxbdgcv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZ2xkaHFnZ3huc252eGJkZ2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMjUyNDgsImV4cCI6MjEwOTYwMTI0OH0.ricjQE5t9Kq1nMc43Pbvw4XsqqgPkwb-br1lJ5w5In8';

const headers = (extra = {}) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  ...extra
});

export function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function fetchRemoteData() {
  if (!isConfigured()) return null;
  try {
    const [sRes, pRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/sources?select=*&order=created_at.desc`, { headers: headers() }),
      fetch(`${SUPABASE_URL}/rest/v1/problems?select=*&order=created_at.desc`, { headers: headers() })
    ]);
    if (!sRes.ok || !pRes.ok) return null;
    const sources = await sRes.json();
    const problems = await pRes.json();
    return { sources, problems };
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

export function mapRemoteToState(remote, existingState = {}) {
  const { sources = [], problems = [] } = remote;
  const documents = sources.map(s => ({
    id: s.id,
    title: s.title,
    subject: s.subject || 'Mathematics',
    pageCount: s.page_count || 4,
    dueDate: s.due_date ? s.due_date.slice(0, 10) : '',
    status: s.status === 'completed' ? 'completed' : s.status === 'in_progress' ? 'in_progress' : 'not_started',
    lastPage: s.last_page || 1,
    createdAt: s.created_at,
    lastOpenedAt: s.created_at,
    completedAt: s.status === 'completed' ? s.created_at : null,
    sample: false,
    pdfUrl: s.file_path ? `${SUPABASE_URL}/storage/v1/object/public/sources/${encodeURIComponent(s.file_path)}` : null,
    previewUrl: s.thumbnail_url || null,
    notes: s.notes || '',
    typeIds: []
  }));

  const mappedProblems = problems.map((p, i) => {
    const d = documents.find(doc => doc.id === p.source_id);
    const title = p.note_text ? p.note_text.slice(0, 40).replace(/\n/g, ' ') : (d ? `${d.title} #${i + 1}` : `Câu hỏi #${i + 1}`);
    return {
      id: p.id,
      title,
      documentId: p.source_id || null,
      sourcePage: p.source_page || 1,
      subject: d ? d.subject : (p.tags && p.tags[0]) || 'Mathematics',
      reason: p.note_text || '',
      trap: '',
      method: '',
      status: 'review',
      updatedAt: p.created_at,
      sample: false,
      imageUrl: p.image_path?.startsWith('http') ? p.image_path : `${SUPABASE_URL}/storage/v1/object/public/problem_snippets/${encodeURIComponent(p.image_path || '')}`,
      cropRect: { x: 0.08, y: 0.19, width: 0.84, height: 0.22 },
      typeIds: []
    };
  });

  const notes = sources.filter(s => s.notes).map(s => ({
    documentId: s.id,
    strategy: s.notes,
    traps: '',
    method: '',
    updatedAt: s.created_at
  }));

  return {
    documents,
    problems: mappedProblems,
    notes,
    types: existingState.types || [],
    version: 2
  };
}

export async function uploadFile(bucket, filename, fileBlob, contentType) {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: headers({
        'Content-Type': contentType || 'application/octet-stream',
        'x-upsert': 'true'
      }),
      body: fileBlob
    });
    return res.ok;
  } catch (err) {
    console.error(`Storage upload to ${bucket} failed:`, err);
    return false;
  }
}

export async function saveRemoteSource(doc, file) {
  if (!isConfigured()) return;
  try {
    let filePath = null;
    if (file) {
      filePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      await uploadFile('sources', filePath, file, 'application/pdf');
    }

    const payload = {
      title: doc.title,
      subject: doc.subject,
      status: doc.status === 'completed' ? 'completed' : doc.status === 'in_progress' ? 'in_progress' : 'pending',
      due_date: doc.dueDate ? new Date(doc.dueDate).toISOString() : null
    };
    if (filePath) payload.file_path = filePath;

    if (doc.id && doc.id.length > 20) {
      await fetch(`${SUPABASE_URL}/rest/v1/sources?id=eq.${doc.id}`, {
        method: 'PATCH',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/sources`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...payload, id: doc.id })
      });
    }
  } catch (err) {
    console.warn('Remote source save warning:', err);
  }
}

export async function updateRemoteSourceStatus(id, status) {
  if (!isConfigured() || !id || id.length < 20) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/sources?id=eq.${id}`, {
      method: 'PATCH',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status: status === 'completed' ? 'completed' : 'pending' })
    });
  } catch (err) {
    console.warn('Update remote source status failed:', err);
  }
}

export async function saveRemoteNotes(id, noteText) {
  if (!isConfigured() || !id || id.length < 20) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/sources?id=eq.${id}`, {
      method: 'PATCH',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ notes: noteText })
    });
  } catch (err) {
    console.warn('Save remote notes failed:', err);
  }
}

export async function deleteRemoteSource(id) {
  if (!isConfigured() || !id || id.length < 20) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/sources?id=eq.${id}`, {
      method: 'DELETE',
      headers: headers()
    });
  } catch (err) {
    console.warn('Delete remote source failed:', err);
  }
}

export async function saveRemoteProblem(problem, cropBlob) {
  if (!isConfigured()) return;
  try {
    let imageUrl = problem.imageUrl;
    if (cropBlob) {
      const filename = `crop_${Date.now()}_${problem.id.slice(0, 8)}.png`;
      const uploaded = await uploadFile('problem_snippets', filename, cropBlob, 'image/png');
      if (uploaded) {
        imageUrl = `${SUPABASE_URL}/storage/v1/object/public/problem_snippets/${filename}`;
      }
    }

    const payload = {
      id: problem.id,
      source_id: (problem.documentId && problem.documentId.length > 20) ? problem.documentId : null,
      image_path: imageUrl,
      note_text: problem.reason || problem.title || '',
      tags: [problem.subject].filter(Boolean)
    };

    await fetch(`${SUPABASE_URL}/rest/v1/problems`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Save remote problem failed:', err);
  }
}

export async function deleteRemoteProblem(id) {
  if (!isConfigured() || !id || id.length < 20) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/problems?id=eq.${id}`, {
      method: 'DELETE',
      headers: headers()
    });
  } catch (err) {
    console.warn('Delete remote problem failed:', err);
  }
}
