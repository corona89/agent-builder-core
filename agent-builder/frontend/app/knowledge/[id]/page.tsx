'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  FileText, 
  Plus, 
  Database, 
  CornerDownRight, 
  Save, 
  Trash2, 
  Search, 
  Filter,
  Library,
  Cpu,
  User,
  LogOut,
  Sparkles,
  Loader2,
  Settings,
  Sliders,
  Upload,
  Binary,
  ArrowRight
} from 'lucide-react';

export default function DocumentsPage() {
  const { id } = useParams();
  const [docs, setDocs] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any>(null);
  const [newDoc, setNewDoc] = useState({ title: '', content: '' });
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState('');
  const [isChunking, setIsChunking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const knRes = await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!knRes.ok) throw new Error('API Sync Failed');
      const kns = await knRes.json();
      const currentKn = kns.find((k:any) => k.id === parseInt(id as string));
      setKnowledge(currentKn);

      const res = await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/${id}/documents/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDocs(await res.json());
    } catch (err) { 
      console.error(err);
      setIsLoading(false);
    }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const addDoc = async () => {
    if (!newDoc.title || !newDoc.content) return;
    const token = localStorage.getItem('token');
    setIsLoading(true);
    await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/${id}/documents/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc)
    });
    setNewDoc({ title: '', content: '' });
    fetchData();
  };

  const handleChunking = async () => {
    if (!newDoc.content) return;
    const token = localStorage.getItem('token');
    setIsChunking(true);
    try {
      const res = await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/${id}/chunk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-r1:8b', text: newDoc.content })
      });
      if (res.ok) {
        alert('LLM Chunking complete!');
        setNewDoc({ title: '', content: '' });
        fetchData();
      }
    } catch (e) { alert('Chunking failed'); }
    finally { setIsChunking(false); }
  };

  const handleSearch = async () => {
    if (!testQuery) return;
    const token = localStorage.getItem('token');
    setIsSearching(true);
    try {
      const res = await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/${id}/search`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery })
      });
      const data = await res.json();
      setTestResults(data.results || 'No relevant context found.');
    } catch (e) { setTestResults('Search failed'); }
    finally { setIsSearching(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
      <aside style={{ width: '280px', borderRight: '1px solid #18181b', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '2.5rem', borderBottom: '1px solid #18181b' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>VAULT OPS</h1>
          <p style={{ fontSize: '10px', color: '#71717a', margin: 0 }}>RAG CONFIGURATION</p>
        </div>
        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#3f3f46', marginBottom: '1rem' }}>PARAMETERS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Model: <span style={{ color: '#fafafa' }}>{knowledge?.embedding_model}</span></div>
              <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Top-K: <span style={{ color: '#fafafa' }}>{knowledge?.top_k}</span></div>
              <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Threshold: <span style={{ color: '#fafafa' }}>{knowledge?.threshold}</span></div>
            </div>
          </div>
          <button onClick={() => router.push('/knowledge')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '0.8rem' }}><ChevronLeft size={14} /> Back to Library</button>
        </nav>
      </aside>

      <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Ingestion Area */}
          <section style={{ width: '450px', borderRight: '1px solid #18181b', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={16} /> DATA INGESTION</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input placeholder="Doc Title" style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.75rem', color: '#fafafa' }} value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} />
                <textarea placeholder="Paste text for LLM-powered chunking or direct embed..." style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fafafa', height: '300px', resize: 'none' }} value={newDoc.content} onChange={e => setNewDoc({...newDoc, content: e.target.value})} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={addDoc} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#fafafa', color: '#09090b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>DIRECT COMMIT</button>
                  <button onClick={handleChunking} disabled={isChunking} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fafafa', fontWeight: 800, cursor: 'pointer' }}>
                    {isChunking ? <Loader2 size={16} className="animate-spin" /> : 'LLM CHUNKING'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #18181b', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Search size={16} /> RETRIEVAL TEST</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input placeholder="Input query to test RAG retrieval..." style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.75rem', color: '#fafafa' }} value={testQuery} onChange={e => setTestQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                  <button onClick={handleSearch} style={{ padding: '0.75rem', backgroundColor: '#fafafa', color: '#09090b', border: 'none', borderRadius: '0.75rem', cursor: 'pointer' }}>
                    {isSearching ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  </button>
                </div>
                <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1rem', minHeight: '150px', fontSize: '0.8rem', color: '#a1a1aa', whiteSpace: 'pre-wrap' }}>
                  {testResults || 'Retrieval results will appear here...'}
                </div>
              </div>
            </div>
          </section>

          {/* Database Feed */}
          <section style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Database size={24} /> VAULT MANIFEST</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {docs.map(d => (
                <div key={d.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3f3f46' }}>ID: {d.id}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3f3f46' }}>{d.embedding ? 'VECTOR_SYNCED' : 'PENDING'}</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontWeight: 700 }}>{d.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#71717a', lineHeight: 1.5, margin: 0 }}>{d.content}</p>
                </div>
              ))}
              {docs.length === 0 && <div style={{ padding: '5rem', textAlign: 'center', color: '#27272a' }}><Binary size={48} style={{ marginBottom: '1rem' }} /><p>EMPTY ARCHIVE</p></div>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
