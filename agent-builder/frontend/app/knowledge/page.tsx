'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Library, 
  Cpu, 
  Settings, 
  Database, 
  User, 
  LogOut, 
  Sparkles, 
  Plus, 
  Archive, 
  ArrowRight, 
  Layers, 
  Share2, 
  Search,
  Sliders,
  ChevronRight,
  Loader2,
  Trash2,
  FileText,
  X,
  CheckCircle2,
  ChevronLeft as ChevronLeftIcon,
  Save,
  Upload
} from 'lucide-react';

export default function KnowledgePage() {
  const [knowledges, setKnowledges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    description: '',
    embedding_model: 'nomic-embed-text',
    top_k: 5,
    threshold: 0.5
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchKnowledges = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const res = await fetch('https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKnowledges(data);
      }
      else if (res.status === 401) router.push('/');
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchKnowledges(); }, []);

  const handleCreateKnowledge = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('token');
    try {
      // 1. Create Knowledge Base
      const knRes = await fetch('https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!knRes.ok) throw new Error('Failed to create knowledge base');
      const knData = await knRes.json();

      // 2. Upload and Embed File if exists
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadRes = await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/${knData.id}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('File upload failed');
      }

      setStep(4); // Success step
      await fetchKnowledges();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteKnowledge = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vault?')) return;
    const token = localStorage.getItem('token');
    await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchKnowledges();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setForm({
      name: '',
      description: '',
      embedding_model: 'nomic-embed-text',
      top_k: 5,
      threshold: 0.5
    });
    setSelectedFile(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
      <aside style={{ width: '280px', borderRight: '1px solid #18181b', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #18181b' }}>
          <div style={{ padding: '0.5rem', backgroundColor: '#fafafa', borderRadius: '0.5rem' }}><Sparkles size={18} color="#09090b" /></div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>ARCHIVE</h1>
            <p style={{ fontSize: '10px', color: '#71717a', margin: 0, fontWeight: 600 }}>CORE OS v5.0.0</p>
          </div>
        </div>
        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => router.push('/apps')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.875rem' }}><Cpu size={18} /> Neural Clusters</button>
          <button onClick={() => router.push('/knowledge')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: '#18181b', color: '#fafafa', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}><Library size={18} /> Knowledge Base</button>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid #18181b' }}>
           <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid #27272a', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>TERMINATE</button>
        </div>
      </aside>

      <main style={{ marginLeft: '280px', flex: 1, padding: '3rem 4rem' }}>
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Knowledge Base</h2>
            <p style={{ color: '#a1a1aa' }}>Orchestrating injectable intelligence for RAG nodes...</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#fafafa', color: '#09090b', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> INITIALIZE NEW VAULT
          </button>
        </header>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '200px', borderRadius: '1.5rem', backgroundColor: '#18181b', opacity: 0.3 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: '2rem' }}>
            {knowledges.map(k => (
              <div key={k.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '2rem', padding: '2rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#09090b', borderRadius: '1rem' }}><Archive size={22} color="#a1a1aa" /></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#09090b', border: '1px solid #22c55e', color: '#22c55e', padding: '0.2rem 0.5rem', borderRadius: '100px', alignSelf: 'center' }}>SYNCED</div>
                      <button onClick={() => deleteKnowledge(k.id)} style={{ background: 'transparent', border: 'none', color: '#3f3f46', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{k.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#71717a', margin: '0 0 1.5rem 0', minHeight: '2.5rem' }}>{k.description || 'Neural repository initialized.'}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#09090b', padding: '0.75rem', borderRadius: '0.75rem', flex: 1 }}>
                      <p style={{ fontSize: '9px', fontWeight: 800, color: '#3f3f46', margin: '0 0 0.25rem 0' }}>MODEL</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>{k.embedding_model}</p>
                    </div>
                    <div style={{ backgroundColor: '#09090b', padding: '0.75rem', borderRadius: '0.75rem', flex: 1 }}>
                      <p style={{ fontSize: '9px', fontWeight: 800, color: '#3f3f46', margin: '0 0 0.25rem 0' }}>TOP-K</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>{k.top_k}</p>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => router.push(`/knowledge/${k.id}`)} style={{ width: '100%', padding: '1rem', backgroundColor: '#27272a', border: 'none', borderRadius: '1rem', color: '#fafafa', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  ACCESS DATA VAULT <ChevronRight size={16} />
                </button>
              </div>
            ))}
            <div onClick={() => setIsModalOpen(true)} style={{ border: '2px dashed #18181b', borderRadius: '2rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer', minHeight: '300px' }}>
              <div style={{ padding: '1rem', backgroundColor: '#18181b', borderRadius: '100px' }}><Plus size={32} color="#3f3f46" /></div>
              <p style={{ color: '#3f3f46', fontWeight: 700, fontSize: '0.875rem' }}>INITIALIZE NEW NODE</p>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '550px', backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '2rem', padding: '3rem', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '4px', flex: 1, backgroundColor: step >= i ? '#fafafa' : '#18181b', borderRadius: '2px', transition: 'all 0.3s' }} />
                ))}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {step === 1 && "Initialization Info"}
                {step === 2 && "Neural Configuration"}
                {step === 3 && "Secure Ingestion"}
                {step === 4 && "Deployment Successful"}
              </h3>
            </div>
            <div style={{ minHeight: '300px' }}>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46' }}>VAULT NAME</label>
                    <input autoFocus style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fafafa', outline: 'none' }} placeholder="Name..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46' }}>DESCRIPTION</label>
                    <textarea style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fafafa', outline: 'none', height: '100px', resize: 'none' }} placeholder="Description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46' }}>EMBEDDING MODEL</label>
                    <select style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fafafa', outline: 'none' }} value={form.embedding_model} onChange={e => setForm({...form, embedding_model: e.target.value})}>
                      <option value="nomic-embed-text">Ollama: nomic-embed-text</option>
                      <option value="all-minilm">Ollama: all-minilm</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46' }}>TOP-K</label>
                      <input type="number" style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fafafa', outline: 'none' }} value={form.top_k} onChange={e => setForm({...form, top_k: parseInt(e.target.value)})} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46' }}>THRESHOLD</label>
                      <input type="number" step="0.1" style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', color: '#fafafa', outline: 'none' }} value={form.threshold} onChange={e => setForm({...form, threshold: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', border: '2px dashed #18181b', borderRadius: '1.5rem', backgroundColor: '#0c0c0e' }}>
                  {selectedFile ? (
                    <div style={{ textAlign: 'center' }}>
                      <FileText size={32} color="#fafafa" />
                      <p style={{ fontWeight: 800 }}>{selectedFile.name}</p>
                      <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>REMOVE</button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                      <Upload size={32} color="#3f3f46" />
                      <p>SELECT FILE (.txt, .pdf)</p>
                      <input type="file" accept=".txt,.pdf" style={{ display: 'none' }} onChange={e => e.target.files && setSelectedFile(e.target.files[0])} />
                    </label>
                  )}
                </div>
              )}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                  <CheckCircle2 size={48} color="#22c55e" />
                  <h4>VAULT DEPLOYED</h4>
                </div>
              )}
            </div>
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
              {step < 4 && (
                <>
                  <button onClick={() => step > 1 ? setStep(step - 1) : closeModal()} style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#18181b', border: 'none', color: '#fafafa', cursor: 'pointer' }}>
                    {step === 1 ? "CANCEL" : "BACK"}
                  </button>
                  {step < 3 ? (
                    <button onClick={() => setStep(step + 1)} style={{ flex: 2, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fafafa', border: 'none', color: '#09090b', cursor: 'pointer' }}>NEXT</button>
                  ) : (
                    <button onClick={handleCreateKnowledge} disabled={isProcessing} style={{ flex: 2, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fafafa', border: 'none', color: '#09090b', cursor: 'pointer' }}>
                      {isProcessing ? "PROCESSING..." : "CONFIRM & INGEST"}
                    </button>
                  )}
                </>
              )}
              {step === 4 && (
                <button onClick={closeModal} style={{ width: '100%', padding: '1rem', borderRadius: '1rem', backgroundColor: '#fafafa', border: 'none', color: '#09090b' }}>FINISH</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
