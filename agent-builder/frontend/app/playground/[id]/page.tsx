'use client';
import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ChevronLeft,
  Rocket,
  Binary,
  Layers,
  Info,
  Send,
  Layout,
  Mic,
  MicOff,
  FileSearch
} from 'lucide-react';

export default function PlaygroundPage() {
  const params = useParams();
  const id = params.id;
  const [app, setApp] = useState<any>(null);
  const [knowledges, setKnowledges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionLanguage, setRecognitionLanguage] = useState('ko-KR');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [useLocalWhisper, setUseLocalWhisper] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-history-container');
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const isRecordingRef = typeof window !== 'undefined' ? { current: isRecording } : { current: false };
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (isRecordingRef as any).current = isRecording;
    }
  }, [isRecording]);

  useEffect(() => {
    if (recognition) {
      recognition.lang = recognitionLanguage;
      if (isRecording) {
        // Restart recognition with new language if already recording
        recognition.stop();
        setTimeout(() => {
          if ((isRecordingRef as any).current) recognition.start();
        }, 100);
      }
    }
  }, [recognitionLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = recognitionLanguage;

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const speechMsg = { role: 'user', content: `[STT] ${finalTranscript.trim()}` };
          setMessages(prev => [...prev, speechMsg]);
        }
        
        // Update input value with interim transcript to show user it's working
        if (interimTranscript) {
          setInputValue(interimTranscript);
        } else if (finalTranscript) {
          setInputValue("");
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech') {
          // Keep it running or notify silently
        } else {
          setIsRecording(false);
        }
      };

      rec.onend = () => {
        if ((isRecordingRef as any).current) {
          try {
            rec.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (useLocalWhisper) {
      if (isRecording) {
        setIsRecording(false);
      } else {
        startLocalRecording();
      }
      return;
    }

    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const startLocalRecording = async () => {
    console.log("Starting Local Whisper Recording Process...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone stream acquired.");
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];
      const CHUNK_SEND_INTERVAL = 3000;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log(`[MediaRecorder] Chunk received: ${e.data.size} bytes. Total chunks: ${chunks.length}`);
        }
      };

      const sendToWhisper = async (audioBlob: Blob) => {
        if (audioBlob.size < 500) return; // Ignore very small clips
        console.log(`[Whisper] Sending blob: ${audioBlob.size} bytes`);
        const formData = new FormData();
        formData.append('file', audioBlob, 'stream_record.webm');
        
        try {
          const res = await fetch('http://localhost:8003/transcribe', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            console.log("[Whisper] Result:", data);
            if (data.text) {
              setMessages(prev => [...prev, { role: 'user', content: `[Whisper Stream] ${data.text.trim()}` }]);
            }
          }
        } catch (e) {
          console.error("Whisper network error:", e);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      const streamTimer = setInterval(() => {
        if (!(isRecordingRef as any).current) {
          console.log("Stopping recorder...");
          if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          clearInterval(streamTimer);
          return;
        }

        if (chunks.length > 0) {
          const streamBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          sendToWhisper(streamBlob);
        }
      }, CHUNK_SEND_INTERVAL);
    } catch (e) {
      console.error("Recording failed to start:", e);
      alert("Microphone access denied.");
      setIsRecording(false);
    }
  };

  const handleSummarize = async () => {
    if (messages.length === 0 || isSummarizing) return;
    setIsSummarizing(true);
    try:
      const res = await fetch(`https://${window.location.hostname === 'localhost' ? 'localhost:8000' : 'your-backend-api.com'}/apps/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: `📝 회의 요약:\n\n${data.summary}` }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    try {
      const appRes = await fetch(`${window.location.origin.replace(':3000', ':8000')}/apps/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const apps = await appRes.json();
      const currentApp = apps.find((a:any) => a.id === parseInt(id as string));
      if (!currentApp) { router.push('/apps'); return; }
      setApp(currentApp);

      const knRes = await fetch(`${window.location.origin.replace(':3000', ':8000')}/knowledges/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (knRes.ok) setKnowledges(await knRes.json());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateApp = async (updates: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${window.location.origin.replace(':3000', ':8000')}/apps/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...app, ...updates })
    });
    if (res.ok) setApp(await res.json());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    const token = localStorage.getItem('token');
    
    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch(`${window.location.origin.replace(':3000', ':8000')}/apps/${id}/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMsg.content })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error cluster failed to respond." }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!app) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#fafafa" className="animate-spin" />
    </div>
  );

  return (
    <div 
      style={{ 
        minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', 
        fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', margin: 0
      }}
    >
      {/* Sidebar (Menu) - Consistent Sync */}
      <aside 
        style={{ 
          width: '280px', borderRight: '1px solid #18181b', backgroundColor: '#09090b',
          display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100
        }}
      >
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #18181b' }}>
          <div style={{ padding: '0.5rem', backgroundColor: '#fafafa', borderRadius: '0.5rem' }}>
            <Sparkles size={18} color="#09090b" />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>ARCHIVE</h1>
            <p style={{ fontSize: '10px', color: '#71717a', margin: 0, fontWeight: 600 }}>CORE OS v4.2.0</p>
          </div>
        </div>

        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 0.75rem 0.5rem 0.75rem' }}>
            Workspaces
          </div>
          <button 
            onClick={() => router.push('/apps')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.75rem', border: 'none', backgroundColor: '#18181b', color: '#fafafa',
              cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600
            }}
          >
            <Cpu size={18} color="#fafafa" /> Neural Clusters
          </button>
          <button 
            onClick={() => router.push('/knowledge')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa',
              cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500
            }}
          >
            <Library size={18} color="#3f3f46" /> Knowledge Base
          </button>
          <button 
            onClick={() => router.push('/providers')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '0.75rem', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa',
              cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500
            }}
          >
            <Settings size={18} color="#3f3f46" /> Model Providers
          </button>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #18181b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} />
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#fafafa' }}>STRONTIUM_OPS</p>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid #27272a', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            <LogOut size={14} /> TERMINATE
          </button>
        </div>
      </aside>

      {/* Main Content Area: Playground Sidebar + Editor */}
      <main style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <header style={{ height: '70px', borderBottom: '1px solid #18181b', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#09090b', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button onClick={() => router.push('/apps')} style={{ background: 'transparent', border: '1px solid #18181b', padding: '0.4rem', borderRadius: '0.5rem', cursor: 'pointer', color: '#71717a' }}>
               <ChevronLeft size={16} />
             </button>
             <div>
               <h2 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>PLAYGROUND: {app.name}</h2>
               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <p style={{ fontSize: '10px', color: '#3f3f46', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Simulation Node Active</p>
                 <span style={{ fontSize: '9px', fontWeight: 900, backgroundColor: '#18181b', color: '#71717a', padding: '1px 6px', borderRadius: '4px', border: '1px solid #27272a' }}>{app.agent_type?.toUpperCase()}</span>
               </div>
             </div>
          </div>
          <button style={{ backgroundColor: '#fafafa', color: '#09090b', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Rocket size={14} /> DEPLOY
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Playground Settings Panel */}
          <aside style={{ width: '320px', borderRight: '1px solid #18181b', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', backgroundColor: '#09090b' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#3f3f46' }}>
                <Settings size={14} />
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Parameters</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#71717a' }}>Neural Architecture</label>
                  <select 
                    value={app.model_id} 
                    onChange={(e) => updateApp({ model_id: e.target.value })}
                    style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.6rem', color: '#fafafa', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="gemini-3-flash-preview:cloud">Gemini 3 Flash (Cloud)</option>
                    <option value="deepseek-r1:8b">DeepSeek R1 8B (Local)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#71717a' }}>Knowledge Binding</label>
                  <select 
                    value={app.knowledge_id || ''} 
                    onChange={(e) => updateApp({ knowledge_id: e.target.value ? parseInt(e.target.value) : null })}
                    style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.6rem', color: '#fafafa', fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="">No Knowledge Linked</option>
                    {knowledges.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#3f3f46' }}>
                <Binary size={14} />
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Plugins</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <input placeholder="Sub-Agent IDs..." style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.75rem', color: '#fafafa', fontSize: '0.75rem', outline: 'none' }} value={app.sub_agents || ''} onChange={(e) => setApp({...app, sub_agents: e.target.value})} onBlur={() => updateApp({ sub_agents: app.sub_agents })} />
                 <input placeholder="Middleware IDs..." style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '0.75rem', color: '#fafafa', fontSize: '0.75rem', outline: 'none' }} value={app.middlewares || ''} onChange={(e) => setApp({...app, middlewares: e.target.value})} onBlur={() => updateApp({ middlewares: app.middlewares })} />
              </div>
            </div>
          </aside>

          {/* Editor Area */}
          <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#09090b', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
              <div style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Layers size={14} color="#71717a" />
                     <span style={{ fontSize: '10px', fontWeight: 800, color: '#71717a', textTransform: 'uppercase' }}>System Instruction Layer</span>
                   </div>
                   <Info size={14} color="#27272a" />
                </div>
                <textarea 
                  style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '2rem', color: '#e4e4e7', fontSize: '0.9rem', lineHeight: 1.6, resize: 'none', fontFamily: 'monospace' }} 
                  placeholder="Declare the cluster's base operational instructions..."
                  value={app.prompt || ''}
                  onChange={(e) => setApp({...app, prompt: e.target.value})}
                  onBlur={() => updateApp({ prompt: app.prompt })}
                />
              </div>

              {/* Chat History View */}
              <div style={{ flex: 1.5, backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#3f3f46' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={14} />
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Real-time Simulation Trace</span>
                  </div>
                  {app.agent_type === 'meeting' && (
                    <button 
                      onClick={handleSummarize}
                      disabled={isSummarizing || messages.length === 0}
                      style={{ 
                        backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', 
                        padding: '0.3rem 0.6rem', color: '#fafafa', fontSize: '9px', fontWeight: 800, 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' 
                      }}
                    >
                      {isSummarizing ? <Loader2 size={10} className="animate-spin" /> : <FileSearch size={10} />}
                      SUMMARIZE MEETING
                    </button>
                  )}
                </div>
                <div 
                  id="chat-history-container"
                  style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  {messages.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#27272a', opacity: 0.5 }}>
                      <Binary size={48} style={{ marginBottom: '1rem' }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Link Standby</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', backgroundColor: m.role === 'user' ? 'transparent' : '#18181b', padding: '1rem', borderRadius: '1rem' }}>
                      <div style={{ padding: '4px' }}>
                        {m.role === 'user' ? <User size={16} color="#71717a" /> : <Sparkles size={16} color="#fafafa" />}
                      </div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: m.role === 'user' ? '#a1a1aa' : '#fafafa', whiteSpace: 'pre-wrap' }}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#18181b', padding: '1rem', borderRadius: '1rem' }}>
                      <Loader2 size={16} className="animate-spin" color="#3f3f46" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3f3f46' }}>PROBING NEURAL NODES...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Simulation Interface */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1.5rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ paddingLeft: '0.5rem' }}>
                 <Terminal size={18} color="#3f3f46" />
               </div>
               
               {app.agent_type === 'meeting' && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem', borderRight: '1px solid #27272a', paddingRight: '1rem' }}>
                   <button 
                     onClick={() => setUseLocalWhisper(!useLocalWhisper)}
                     style={{ 
                       padding: '0.3rem 0.6rem', borderRadius: '0.4rem', fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                       backgroundColor: useLocalWhisper ? '#10b981' : 'transparent',
                       color: useLocalWhisper ? '#fafafa' : '#3f3f46',
                       border: '1px solid ' + (useLocalWhisper ? '#10b981' : '#27272a')
                     }}
                   >
                     WHISPER: {useLocalWhisper ? 'ON' : 'OFF'}
                   </button>

                   {!useLocalWhisper && (
                     <>
                       <button 
                         onClick={() => setRecognitionLanguage('ko-KR')}
                         style={{ 
                           padding: '0.3rem 0.6rem', borderRadius: '0.4rem', fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                           backgroundColor: recognitionLanguage === 'ko-KR' ? '#fafafa' : 'transparent',
                           color: recognitionLanguage === 'ko-KR' ? '#09090b' : '#3f3f46',
                           border: '1px solid ' + (recognitionLanguage === 'ko-KR' ? '#fafafa' : '#27272a')
                         }}
                       >
                         KOR
                       </button>
                       <button 
                         onClick={() => setRecognitionLanguage('en-US')}
                         style={{ 
                           padding: '0.3rem 0.6rem', borderRadius: '0.4rem', fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                           backgroundColor: recognitionLanguage === 'en-US' ? '#fafafa' : 'transparent',
                           color: recognitionLanguage === 'en-US' ? '#09090b' : '#3f3f46',
                           border: '1px solid ' + (recognitionLanguage === 'en-US' ? '#fafafa' : '#27272a')
                         }}
                       >
                         ENG
                       </button>
                     </>
                   )}
                   
                   <button 
                     onClick={toggleRecording}
                     style={{ 
                       background: 'transparent', border: 'none', color: isRecording ? '#ef4444' : '#71717a', 
                       cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem'
                     }}
                   >
                     {isRecording ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
                   </button>
                 </div>
               )}

               <input 
                 style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#fafafa', fontSize: '0.875rem', padding: '0.5rem 0' }}
                 placeholder="Input simulation signal to probe agent response..."
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={isSending}
                 style={{ 
                   backgroundColor: isSending ? '#27272a' : '#fafafa', 
                   color: '#09090b', border: 'none', padding: '0.6rem', borderRadius: '0.75rem', 
                   cursor: isSending ? 'not-allowed' : 'pointer', display: 'flex' 
                 }}
               >
                 {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
