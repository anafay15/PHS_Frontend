import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/api';
import { API_BASE_URL } from '../../api/axios';
import CanvasBackground from '../../components/layout/CanvasBackground';
import CustomCursor from '../../components/layout/CustomCursor';
import {
  Disc,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Wifi,
  Sparkles,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';

const DEMO_CREDENTIALS = {
  email: 'lead@studio.local',
  password: 'password123',
  name: 'Studio Lead',
  role: 'Studio Administrator',
};

export default function LoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const { login, register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Ping backend to inform user of server connectivity status
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/`, { method: 'GET', mode: 'cors' });
        if (isMounted) {
          setBackendStatus(res.ok ? 'online' : 'offline');
        }
      } catch {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    };
    checkServer();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFillDemo = (autoSubmit = false) => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setMode('login');
    setErrorMessage('');
    toast.info('Demo credentials populated.');

    if (autoSubmit) {
      setTimeout(() => {
        executeLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
      }, 100);
    }
  };

  const copyDemoCredentials = () => {
    navigator.clipboard.writeText(`Email: ${DEMO_CREDENTIALS.email}\nPassword: ${DEMO_CREDENTIALS.password}`);
    setCopiedKey(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const executeLogin = async (loginEmail, loginPass) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const data = await login(loginEmail, loginPass);
      const userName = data?.user?.name || loginEmail.split('@')[0];
      toast.success(`Welcome back, ${userName}. Session authorized.`);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Authentication failed. Please verify credentials.');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'login') {
      await executeLogin(email.trim(), password);
    } else {
      if (!name.trim()) {
        setErrorMessage('Full operator name is required.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }

      setSubmitting(true);
      try {
        await register(name.trim(), email.trim(), password);
        toast.success(`Operator profile created for ${name.trim()}.`);
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Registration failed. Please check your inputs.');
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070708',
        color: '#f4f4f5',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        overflowX: 'hidden',
      }}
    >
      {/* 3D Wireframe Ambient Sculpture Background */}
      <CanvasBackground />
      <CustomCursor />

      {/* Subtle Background Radial Glow */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#080808',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(255, 255, 255, 0.25)',
            }}
          >
            <Disc size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              STUDIO OS
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: '#71717a',
                textTransform: 'uppercase',
              }}
            >
              AWAITED EDITORIAL
            </div>
          </div>
        </div>

        {/* Backend Connectivity Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            color: '#a1a1aa',
          }}
        >
          <Wifi
            size={12}
            color={
              backendStatus === 'online'
                ? '#22c55e'
                : backendStatus === 'offline'
                ? '#ef4444'
                : '#eab308'
            }
          />
          <span>
            {backendStatus === 'online' && 'BACKEND: ONLINE (:3000)'}
            {backendStatus === 'offline' && 'BACKEND: OFFLINE (PORT 3000)'}
            {backendStatus === 'checking' && 'CONNECTING TO API...'}
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main
        style={{
          width: '100%',
          maxWidth: '440px',
          margin: '36px auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="studio-card"
          style={{
            backgroundColor: 'rgba(15, 15, 17, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            padding: '32px 32px 28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Card Meta & Title */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span className="editorial-tag">SYSTEM GATEWAY // 00</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  color: '#52525b',
                }}
              >
                AUTH-PROTOCOL-V2
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                marginBottom: '6px',
              }}
            >
              {mode === 'login' ? 'Operator Sign In' : 'Register Operator'}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: '#a1a1aa',
                lineHeight: 1.45,
              }}
            >
              {mode === 'login'
                ? 'Authenticate to unlock studio telemetry, clients, and production schedules.'
                : 'Provision a new studio operator profile to access internal modules.'}
            </p>
          </div>

          {/* Mode Tabs (Sign In / Register) */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
              marginBottom: '24px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'login' ? '2px solid #ffffff' : '2px solid transparent',
                color: mode === 'login' ? '#ffffff' : '#71717a',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: mode === 'register' ? '2px solid #ffffff' : '2px solid transparent',
                color: mode === 'register' ? '#ffffff' : '#71717a',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Inline Error Notice */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '2px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={15} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: '#fca5a5',
                  lineHeight: 1.4,
                }}
              >
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate={false}>
            {/* Operator Full Name (Registration only) */}
            {mode === 'register' && (
              <div style={{ marginBottom: '18px' }}>
                <label htmlFor="operator-name" className="studio-label">
                  Operator Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="operator-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Studio Director"
                    className="studio-input"
                    style={{ paddingLeft: '36px' }}
                  />
                  <User
                    size={14}
                    color="#71717a"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="auth-email" className="studio-label">
                Operator Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@studio.internal"
                  className="studio-input"
                  style={{ paddingLeft: '36px' }}
                />
                <Mail
                  size={14}
                  color="#71717a"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor={mode === 'login' ? 'current-password' : 'new-password'}
                  className="studio-label"
                  style={{ marginBottom: 0 }}
                >
                  Access Key / Password
                </label>
                {mode === 'login' && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '10px',
                      color: '#71717a',
                    }}
                  >
                    MIN 8 CHARACTERS
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id={mode === 'login' ? 'current-password' : 'new-password'}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  enterKeyHint="done"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="studio-input"
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                />
                <Lock
                  size={14}
                  color="#71717a"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="studio-btn studio-btn-primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '12px',
                letterSpacing: '0.06em',
                fontWeight: 600,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{mode === 'login' ? 'Authorizing Clearance...' : 'Provisioning Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Authorize Session' : 'Create Operator Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant Box */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#22c55e" />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#d4d4d8',
                      fontWeight: 600,
                    }}
                  >
                    Verified Credentials
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyDemoCredentials}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                  title="Copy to clipboard"
                >
                  {copiedKey ? <Check size={11} color="#22c55e" /> : <Copy size={11} />}
                  <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              {/* Credential Details */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#71717a' }}>User:</span>
                  <span style={{ color: '#e4e4e7' }}>{DEMO_CREDENTIALS.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#71717a' }}>Email:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{DEMO_CREDENTIALS.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#71717a' }}>Password:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{DEMO_CREDENTIALS.password}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleFillDemo(false)}
                  style={{
                    padding: '7px 10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-medium, rgba(255,255,255,0.14))',
                    borderRadius: '2px',
                    color: '#f4f4f5',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <KeyRound size={12} />
                  <span>Auto-Fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo(true)}
                  disabled={submitting}
                  style={{
                    padding: '7px 10px',
                    background: '#ffffff',
                    border: '1px solid #ffffff',
                    borderRadius: '2px',
                    color: '#080808',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={12} />
                  <span>Quick Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          color: '#52525b',
          gap: '12px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div>
          STUDIO PRODUCTION OS // RESTRICTED ACCESS // 256-BIT JWT SECURED
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>LATENCY: &lt;15MS</span>
          <span>HOST: LOCALHOST:3000</span>
          <span>ENV: DEVELOPMENT</span>
        </div>
      </footer>
    </div>
  );
}
