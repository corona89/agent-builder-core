'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Library, 
  Cpu, 
  User, 
  LogOut,
  Sparkles,
  Settings,
  Save,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Key,
  Globe
} from 'lucide-react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProviders = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const res = await fetch('https://unlike-teaching-refused-add.trycloudflare.com/providers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProviders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const updateProvider = async (name: string, data: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://unlike-teaching-refused-add.trycloudflare.com/providers/${name}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchProviders();
    } catch (e) {
      alert('Failed to update provider settings');
    }
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
          <button onClick={() => router.push('/apps')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.875rem' }}><Bot size={18} /> Agents</button>
          <button onClick={() => router.push('/knowledge')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.875rem' }}><Library size={18} /> Knowledge Base</button>
          <button onClick={() => router.push('/providers')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: '#18181b', color: '#fafafa', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}><Settings size={18} /> Model Providers</button>
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid #18181b' }}>
           <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid #27272a', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>TERMINATE</button>
        </div>
      </aside>

      <main style={{ marginLeft: '280px', flex: 1, padding: '3rem 4rem' }}>
        <header style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Model Providers</h2>
          <p style={{ color: '#a1a1aa' }}>Activate neural intelligence protocols and manage subscription keys...</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {providers.map(p => (
            <div key={p.name} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '2rem', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#09090b', borderRadius: '1rem' }}>
                    <Cpu size={24} color={p.enabled ? "#3b82f6" : "#3f3f46"} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.enabled ? '#22c55e' : '#3f3f46' }}></div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: p.enabled ? '#22c55e' : '#3f3f46' }}>{p.enabled ? "PROTOCOL ACTIVE" : "OFFLINE"}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => updateProvider(p.name, { ...p, enabled: !p.enabled })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.enabled ? '#3b82f6' : '#3f3f46' }}
                >
                  {p.enabled ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#3f3f46', letterSpacing: '0.1em' }}>
                    {p.name === 'ollama' ? 'BASE ENDPOINT URL' : 'API CREDENTIAL / TOKEN'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#3f3f46' }}>
                      {p.name === 'ollama' ? <Globe size={14} /> : <Key size={14} />}
                    </div>
                    <input 
                      type={p.name === 'ollama' ? 'text' : 'password'}
                      style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.75rem 1rem 0.75rem 2.5rem', color: '#fafafa', fontSize: '0.8rem', outline: 'none' }}
                      placeholder={p.name === 'ollama' ? 'http://localhost:11434' : `Enter ${p.name} API key...`}
                      value={(p.name === 'ollama' ? p.base_url : p.api_key) || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = [...providers];
                        const idx = updated.findIndex(item => item.name === p.name);
                        if (p.name === 'ollama') updated[idx].base_url = val;
                        else updated[idx].api_key = val;
                        setProviders(updated);
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => updateProvider(p.name, p)}
                    style={{ flex: 1, backgroundColor: '#fafafa', color: '#09090b', border: 'none', padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Save size={14} /> SYNC PROTOCOL
                  </button>
                  <button 
                    style={{ padding: '0.75rem', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', color: '#71717a', cursor: 'pointer' }}
                    onClick={() => alert('Subscription verification initialized...')}
                  >
                    <ShieldCheck size={18} />
                  </button>
                </div>
              </div>

              {p.name === 'ollama' && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#1e3a8a33', borderRadius: '1rem', border: '1px solid #1e40af44', display: 'flex', gap: '0.75rem' }}>
                  <AlertCircle size={16} color="#3b82f6" />
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#93c5fd', lineHeight: 1.5 }}>
                    Local node detected. Ensure Ollama is running with OLLAMA_ORIGINS="*" configured in your environment.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
