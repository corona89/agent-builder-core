'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Terminal, 
  Database, 
  ArrowRight, 
  Bot, 
  Command, 
  Settings, 
  LayoutGrid, 
  Library, 
  Cpu, 
  User, 
  LogOut,
  Sparkles,
  Loader2,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  Rocket,
  Info,
  Layers,
  Zap
} from 'lucide-react';

export default function AppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [knowledges, setKnowledges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Agent Creation Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    prompt: '',
    agent_type: 'general',
    model_id: 'gemini-3-flash-preview:cloud',
    knowledge_id: null,
    mcp_tools: '',
    skills: '',
    sub_agents: '',
    middlewares: ''
  });

  const fetchApps = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const res = await fetch('https://filename-stickers-tied-inflation.trycloudflare.com/apps/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setApps(await res.json());
      else if (res.status === 401) router.push('/');

      const knRes = await fetch('https://filename-stickers-tied-inflation.trycloudflare.com/knowledges/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (knRes.ok) setKnowledges(await knRes.json());
    } catch (e) { console.error(e); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleCreateAgent = async () => {
    if (!form.name) return;
    setIsProcessing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://filename-stickers-tied-inflation.trycloudflare.com/apps/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setStep(1);
        setForm({
          name: '',
          description: '',
          prompt: '',
          model_id: 'gpt-4o',
          knowledge_id: null,
          mcp_tools: '',
          skills: '',
          sub_agents: '',
          middlewares: ''
        });
        await fetchApps();
      }
    } catch (e) {
      alert('Failed to deploy agent');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteApp = async (id: number) => {
    if (!confirm('Terminate this neural agent?')) return;
    const token = localStorage.getItem('token');
    await fetch(`https://filename-stickers-tied-inflation.trycloudflare.com/apps/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchApps();
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
            <p style={{ fontSize: '10px', color: '#71717a', margin: 0, fontWeight: 600 }}>CORE OS v6.0.0</p>
          </div>
        </div>
        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => router.push('/apps')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: '#18181b', color: '#fafafa', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}><Bot size={18} /> Agents</button>
          <button onClick={() => router.push('/knowledge')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.875rem' }}><Library size={18} /> Knowledge Base</button>
          <button onClick={() => router.push('/providers')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.875rem' }}><Settings size={18} /> Model Providers</button>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid #18181b' }}>
           <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid #27272a', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>TERMINATE</button>
        </div>
      </aside>

      <main style={{ marginLeft: '280px', flex: 1, padding: '3rem 4rem' }}>
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Neural Agents</h2>
            <p style={{ color: '#a1a1aa' }}>Management of autonomous neural clusters...</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#fafafa', color: '#09090b', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> DEPLOY NEW AGENT
          </button>
        </header>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '240px', borderRadius: '2rem', backgroundColor: '#18181b', opacity: 0.3 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {apps.map(a => (
              <div key={a.id} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '2.5rem', padding: '2rem', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#09090b', borderRadius: '1.25rem' }}><Bot size={24} color="#fafafa" /></div>
                  <button onClick={() => deleteApp(a.id)} style={{ background: 'transparent', border: 'none', color: '#3f3f46', cursor: 'pointer' }}><Trash2 size={20} /></button>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{a.name}</h3>
                <p style={{ color: '#71717a', fontSize: '0.875rem', margin: '0 0 2rem 0', minHeight: '3rem' }}>{a.description || "Active neural component."}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                   <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#09090b', padding: '0.4rem 0.8rem', borderRadius: '100px', border: '1px solid #27272a' }}>{a.agent_type?.toUpperCase() || 'GENERAL'}</span>
                   <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#09090b', padding: '0.4rem 0.8rem', borderRadius: '100px', border: '1px solid #27272a' }}>{a.model_id}</span>
                   {a.knowledge_id && <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#fafafa', color: '#09090b', padding: '0.4rem 0.8rem', borderRadius: '100px' }}>RAG ACTIVE</span>}
                   {a.sub_agents && <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#3b82f6', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '100px' }}>{a.sub_agents.split(',').length} SUB-AGENTS</span>}
                </div>
                <button onClick={() => router.push(`/playground/${a.id}`)} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#27272a', border: 'none', borderRadius: '1.25rem', color: '#fafafa', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  INITIALIZE LINK <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Deployment Wizard Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '650px', backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '3rem', padding: '3.5rem', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', background: 'none', border: 'none', color: '#3f3f46', cursor: 'pointer' }}><X size={28} /></button>
            
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '4px', flex: 1, backgroundColor: step >= i ? '#fafafa' : '#18181b', borderRadius: '2px', transition: 'all 0.4s' }} />
                ))}
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                {step === 1 && "Identity & Logic"}
                {step === 2 && "Neural Intelligence"}
                {step === 3 && "Advanced Protocols"}
              </h3>
            </div>

            <div style={{ minHeight: '400px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '1rem' }}>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>AGENT ALIAS</label>
                    <input autoFocus style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none' }} placeholder="e.g., Cyberdyne T-800" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>AGENT TYPE</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => setForm({...form, agent_type: 'general'})}
                        style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid #27272a', backgroundColor: form.agent_type === 'general' ? '#fafafa' : '#18181b', color: form.agent_type === 'general' ? '#09090b' : '#71717a', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        GENERAL
                      </button>
                      <button 
                        onClick={() => setForm({...form, agent_type: 'meeting'})}
                        style={{ flex: 1, padding: '1rem', borderRadius: '1rem', border: '1px solid #27272a', backgroundColor: form.agent_type === 'meeting' ? '#fafafa' : '#18181b', color: form.agent_type === 'meeting' ? '#09090b' : '#71717a', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        MEETING
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>OBJECTIVE (SYSTEM PROMPT)</label>
                    <textarea style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none', height: '150px', resize: 'none' }} placeholder="Define the agent's core directive and behavior..." value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>AGENT DESCRIPTION</label>
                    <input style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none' }} placeholder="Short summary for your records..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>MODEL ARCHITECTURE</label>
                    <select style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none', appearance: 'none' }} value={form.model_id} onChange={e => setForm({...form, model_id: e.target.value})}>
                      <option value="gemini-3-flash-preview:cloud">Ollama: Gemini 3 Flash (Cloud Default)</option>
                      <option value="gpt-4o">OpenAI: GPT-4o (Reasoning)</option>
                      <option value="deepseek-r1:8b">Ollama: DeepSeek R1 8B (Local)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>INJECT KNOWLEDGE VAULT</label>
                    <select style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none', appearance: 'none' }} value={form.knowledge_id || ''} onChange={e => setForm({...form, knowledge_id: e.target.value ? parseInt(e.target.value) : null})}>
                      <option value="">No Knowledge Link</option>
                      {knowledges.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>LINK NEURAL SUB-AGENTS</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: '#18181b', padding: '1rem', borderRadius: '1rem', border: '1px solid #27272a' }}>
                      {apps.length === 0 && <p style={{ fontSize: '12px', color: '#3f3f46', margin: 0 }}>No agents available to link.</p>}
                      {apps.map(a => (
                        <button 
                          key={a.id} 
                          onClick={() => {
                            const ids = form.sub_agents ? form.sub_agents.split(',') : [];
                            const newIds = ids.includes(a.id.toString()) 
                              ? ids.filter(i => i !== a.id.toString())
                              : [...ids, a.id.toString()];
                            setForm({...form, sub_agents: newIds.join(',')});
                          }}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '100px', 
                            fontSize: '11px', 
                            fontWeight: 800, 
                            cursor: 'pointer',
                            border: '1px solid #27272a',
                            backgroundColor: form.sub_agents.split(',').includes(a.id.toString()) ? '#3b82f6' : '#09090b',
                            color: form.sub_agents.split(',').includes(a.id.toString()) ? '#fff' : '#71717a'
                          }}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>SKILLS (ABILITIES)</label>
                    <input style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none' }} placeholder="web-search, file-manager, coder..." value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>MCP TOOLS (PROTOCOL)</label>
                    <textarea style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none', height: '100px', resize: 'none', fontFamily: 'monospace', fontSize: '11px' }} placeholder='{"filesystem": ["/shared"]}' value={form.mcp_tools} onChange={e => setForm({...form, mcp_tools: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>NEURAL MIDDLEWARES</label>
                    <input style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.25rem', color: '#fafafa', outline: 'none' }} placeholder="guard-rail, logger, optimizer..." value={form.middlewares} onChange={e => setForm({...form, middlewares: e.target.value})} />
                  </div>
                  <div style={{ padding: '1.5rem', backgroundColor: '#fafafa', color: '#09090b', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <Zap size={24} fill="#09090b" />
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800 }}>SYNC READY: MULTI-AGENT PROTOCOL INITIALIZED</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
               <button onClick={() => step > 1 ? setStep(step - 1) : setIsModalOpen(false)} style={{ flex: 1, padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: '#18181b', border: 'none', color: '#fafafa', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {step === 1 ? "ABORT" : <><ChevronLeft size={20} /> PREV</>}
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.name} style={{ flex: 2, padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: '#fafafa', border: 'none', color: '#09090b', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (step === 1 && !form.name) ? 0.5 : 1 }}>
                  NEXT PROTOCOL <ChevronRight size={20} />
                </button>
              ) : (
                <button onClick={handleCreateAgent} disabled={isProcessing} style={{ flex: 2, padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: '#fafafa', border: 'none', color: '#09090b', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={20} /> DEPLOY NEURAL LINK</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
