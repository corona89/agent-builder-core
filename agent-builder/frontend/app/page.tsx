'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const res = await fetch('https://filename-stickers-tied-inflation.trycloudflare.com/token', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        router.push('/apps');
      } else {
        const err = await res.json();
        alert(err.detail || 'Login failed');
      }
    } catch (err) {
      alert('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        backgroundColor: '#09090b', 
        color: '#fafafa', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. AI Illustration (Sparkles) - Enlarged and Centered */}
      <div 
        style={{ 
          display: 'flex', 
          padding: '2rem', 
          backgroundColor: '#18181b', 
          border: '1px solid #27272a', 
          borderRadius: '3rem', 
          marginBottom: '2.5rem', 
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
          animation: 'pulse 2s infinite ease-in-out'
        }}
      >
        <Sparkles size={80} color="#fafafa" strokeWidth={1.5} />
      </div>

      {/* 2. Welcome Message */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 0.75rem 0' }}>
          Welcome to Archive
        </h1>
        <p style={{ fontSize: '1rem', color: '#a1a1aa', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
          Authorized access only. Initialize neural link to proceed.
        </p>
      </div>

      {/* 3. Login Form (Email -> Password -> Continue) */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          backgroundColor: '#18181b', 
          border: '1px solid #27272a', 
          borderRadius: '2rem', 
          padding: '2.5rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        }}
      >
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '0.25rem' }}>
              Identification
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#3f3f46" style={{ position: 'absolute', left: '1rem', top: '1.1rem' }} />
              <input 
                type="email" 
                placeholder="USER_ID@ARCHIVE.CORE"
                style={{ 
                  width: '100%', 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '1rem', 
                  padding: '1rem 1rem 1rem 3rem', 
                  color: '#fafafa', 
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '0.25rem' }}>
              Access Cipher
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#3f3f46" style={{ position: 'absolute', left: '1rem', top: '1.1rem' }} />
              <input 
                type="password" 
                placeholder="••••••••••••"
                style={{ 
                  width: '100%', 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '1rem', 
                  padding: '1rem 1rem 1rem 3rem', 
                  color: '#fafafa', 
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Continue Button */}
          <button 
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              height: '3.5rem', 
              backgroundColor: '#fafafa', 
              color: '#09090b', 
              border: 'none', 
              borderRadius: '1rem', 
              fontWeight: 800, 
              fontSize: '1rem', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
            }}
          >
            {isLoading && <Loader2 size={20} className="animate-spin" />}
            {isLoading ? "SYNCING..." : "INITIALIZE SESSION"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.2 }}>
        <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', margin: '0 0 0.4rem 0' }}>Archive OS v4.2.0-LION</p>
        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Strontium Deep Learning Node</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        input:focus {
          border-color: #fafafa !important;
          box-shadow: 0 0 0 2px rgba(250, 250, 250, 0.1);
        }
        button:hover {
          background-color: #e4e4e7 !important;
          transform: translateY(-2px);
        }
        button:active {
          transform: translateY(0);
        }
      `}} />
    </div>
  );
}
