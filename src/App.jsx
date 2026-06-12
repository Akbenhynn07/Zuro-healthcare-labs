import React, { useState, useEffect } from 'react';
import PatientDashboard from './components/PatientDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { sendWhatsAppMessage } from './utils/whatsapp';

const translations = {
  en: {
    title: 'Zuro Labs',
    subtitle: 'Hospital OS - Please sign in',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'e.g. +91 98765 43210',
    sendOtp: 'Send OTP',
    otpLabel: 'Enter 6-Digit OTP',
    otpPlaceholder: '••••••',
    verifyBtn: 'Verify & Sign In',
    changeNumber: 'Change Number',
    noAccount: "Don't have an account?",
    registerPatient: 'Register as Patient',
    registerAdmin: 'Register as Admin',
    registerDoctor: 'Register as Doctor',
    dummyMessage: '✓ OTP sent! Use dummy code: 123456',
    successMessage: '✓ Successfully signed in!',
    invalidOtp: '⚠ Invalid OTP. Please use 123456.',
    invalidPhone: '⚠ Please enter a valid mobile number.',
    demoTitle: 'Demo Account (OTP: 123456):',
    rolePatientTab: 'Patient',
    roleAdminTab: 'Admin',
    roleDoctorTab: 'Doctor',
    rolePatient: 'Patient: +91 98765 43210',
    roleAdmin: 'Admin: +91 87654 32109',
    roleDoctor: 'Doctor: +91 76543 21098',
    loadingSend: 'Sending OTP...',
    loadingVerify: 'Verifying...'
  },
  hi: {
    title: 'ज़ूरो लैब्स',
    subtitle: 'हॉस्पिटल OS - कृपया साइन इन करें',
    mobileLabel: 'मोबाइल नंबर',
    mobilePlaceholder: 'उदा. +91 98765 43210',
    sendOtp: 'ओटीपी भेजें',
    otpLabel: '6-अंकीय ओटीपी दर्ज करें',
    otpPlaceholder: '••••••',
    verifyBtn: 'सत्यापित करें और साइन इन करें',
    changeNumber: 'नंबर बदलें',
    noAccount: 'खाता नहीं है?',
    registerPatient: 'रोगी के रूप में पंजीकरण करें',
    registerAdmin: 'अड्मिन के रूप में पंजीकरण करें',
    registerDoctor: 'डॉक्टर के रूप में पंजीकरण करें',
    dummyMessage: '✓ ओटीपी भेजा गया! डमी कोड का उपयोग करें: 123456',
    successMessage: '✓ सफलतापूर्वक साइन इन किया गया!',
    invalidOtp: '⚠ अमान्य ओटीपी। कृपया 123456 का उपयोग करें।',
    invalidPhone: '⚠ कृपया एक मान्य मोबाइल नंबर दर्ज करें।',
    demoTitle: 'डेमो खाता (ओटीपी: 123456):',
    rolePatientTab: 'रोगी',
    roleAdminTab: 'अड्मिन',
    roleDoctorTab: 'डॉक्टर',
    rolePatient: 'मरीज: +91 98765 43210',
    roleAdmin: 'अड्मिन: +91 87654 32109',
    roleDoctor: 'डॉक्टर: +91 76543 21098',
    loadingSend: 'ओटीपी भेजा जा रहा है...',
    loadingVerify: 'सत्यापित किया जा रहा है...'
  },
  es: {
    title: 'Zuro Labs',
    subtitle: 'Hospital OS - Por favor inicie sesión',
    mobileLabel: 'Número de Teléfono Móvil',
    mobilePlaceholder: 'ej. +91 98765 43210',
    sendOtp: 'Enviar OTP',
    otpLabel: 'Ingrese el OTP de 6 dígitos',
    otpPlaceholder: '••••••',
    verifyBtn: 'Verificar e Iniciar Sesión',
    changeNumber: 'Cambiar Número',
    noAccount: '¿No tienes una cuenta?',
    registerPatient: 'Registrarse como Paciente',
    registerAdmin: 'Registrarse como Administrador',
    registerDoctor: 'Registrarse como Doctor',
    dummyMessage: '¡OTP enviado! Use el código dummy: 123456',
    successMessage: '¡Sesión iniciada con éxito!',
    invalidOtp: 'OTP inválido. Por favor use 123456.',
    invalidPhone: 'Por favor ingrese un número de móvil válido.',
    demoTitle: 'Cuenta de Demostración (OTP: 123456):',
    rolePatientTab: 'Paciente',
    roleAdminTab: 'Admin',
    roleDoctorTab: 'Doctor',
    rolePatient: 'Paciente: +91 98765 43210',
    roleAdmin: 'Administrador: +91 87654 32109',
    roleDoctor: 'Doctor: +91 76543 21098',
    loadingSend: 'Enviando OTP...',
    loadingVerify: 'Verificando...'
  },
  te: {
    title: 'జురో లాబ్స్',
    subtitle: 'హాస్పిటల్ OS - దయచేసి సైన్ ఇన్ చేయండి',
    mobileLabel: 'మొబైల్ నంబర్',
    mobilePlaceholder: 'ఉదా. +91 98765 43210',
    sendOtp: 'OTP పంపండి',
    otpLabel: '6-అంకెల OTPని నమోదు చేయండి',
    otpPlaceholder: '••••••',
    verifyBtn: 'ధృవీకరించండి & సైన్ ఇన్ చేయండి',
    changeNumber: 'నంబర్ మార్చండి',
    noAccount: 'ఖాతా లేదా?',
    registerPatient: 'రోగిగా నమోదు చేసుకోండి',
    registerAdmin: 'అడ్మిన్‌గా నమోదు చేసుకోండి',
    registerDoctor: 'వైద్యుడిగా నమోదు చేసుకోండి',
    dummyMessage: '✓ OTP పంపబడింది! డమీ కోడ్ ఉపయోగించండి: 123456',
    successMessage: '✓ విజయవంతంగా సైన్ ఇన్ చేసారు!',
    invalidOtp: '⚠ చెల్లని OTP. దయచేసి 123456ని ఉపయోగించండి.',
    invalidPhone: '⚠ దయచేసి సరైన మొబైల్ నంబర్‌ను నమోదు చేయండి.',
    demoTitle: 'డెమో ఖాతా (OTP: 123456):',
    rolePatientTab: 'రోగి',
    roleAdminTab: 'అడ్మిన్',
    roleDoctorTab: 'వైద్యుడు',
    rolePatient: 'రోగి: +91 98765 43210',
    roleAdmin: 'అడ్మిన్: +91 87654 32109',
    roleDoctor: 'వైద్యుడు: +91 76543 21098',
    loadingSend: 'OTP పంపుతోంది...',
    loadingVerify: 'ధృవీకరిస్తోంది...'
  }
};

const themeColors = {
  patient: {
    primary: '#0052ff',
    primaryHover: '#0042cc',
    primaryActive: '#0037a8',
    light: 'rgba(0, 82, 255, 0.15)'
  },
  admin: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryActive: '#3730a3',
    light: 'rgba(99, 102, 241, 0.15)'
  },
  doctor: {
    primary: '#10b981',
    primaryHover: '#059669',
    primaryActive: '#047857',
    light: 'rgba(16, 185, 129, 0.15)'
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [role, setRole] = useState('patient'); // 'patient' | 'admin' | 'doctor'
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [expectedOtp, setExpectedOtp] = useState('123456');

  // Restore user session on mount
  useEffect(() => {
    const session = localStorage.getItem('zuro_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const t = translations[lang];
  const currentTheme = themeColors[role];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setStep(1);
    setPhone('');
    setOtp('');
    setError('');
    setSuccess('');
    setInfo('');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInfo('');

    if (!phone.trim()) {
      setError(t.invalidPhone);
      return;
    }

    setLoading(true);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(generatedOtp);

    setTimeout(async () => {
      setStep(2);
      await sendWhatsAppMessage(
        phone,
        `Your Zuro Labs Clinic PWA login verification OTP is: ${generatedOtp}. Use this 6-digit code to complete your secure check-in. Valid for 10 minutes.`
      );
      setInfo(`✓ OTP sent to WhatsApp number! Use code: ${generatedOtp}`);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      if (otp === expectedOtp || otp === '123456') {
        setSuccess(t.successMessage);
        setInfo('');
        const sessionUser = {
          phone: phone,
          role: role,
          name: role === 'patient' ? 'Amit Verma' : 'Staff Admin'
        };
        setUser(sessionUser);
        localStorage.setItem('zuro_session', JSON.stringify(sessionUser));
      } else {
        setError(t.invalidOtp);
      }
      setLoading(false);
    }, 1000);
  };

  const handleChangeNumber = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
    setInfo('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zuro_session');
    setStep(1);
    setPhone('');
    setOtp('');
    setSuccess('');
  };

  // Get current active register link and callback text
  const getRegisterDetails = () => {
    if (role === 'admin') {
      return { text: t.registerAdmin, alert: 'Redirecting to Admin Registration...' };
    }
    if (role === 'doctor') {
      return { text: t.registerDoctor, alert: 'Redirecting to Doctor Registration...' };
    }
    return { text: t.registerPatient, alert: 'Redirecting to Patient Registration...' };
  };

  // Get current demo details
  const getDemoDetails = () => {
    if (role === 'admin') return t.roleAdmin;
    if (role === 'doctor') return t.roleDoctor;
    return t.rolePatient;
  };

  const regDetails = getRegisterDetails();

  if (user) {
    if (user.role === 'patient') {
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    } else if (user.role === 'admin') {
      return <ReceptionistDashboard user={user} onLogout={handleLogout} />;
    } else {
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    }
  }

  return (
    <div className="app-container">
      <div className="ambient-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>
      <div 
        className="login-card"
        style={{
          '--primary': currentTheme.primary,
          '--primary-hover': currentTheme.primaryHover,
          '--primary-active': currentTheme.primaryActive,
          '--input-focus-shadow': currentTheme.light,
        }}
      >
        
        {/* Language Selector Top Right */}
        <div className="card-header-actions">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)} 
            className="lang-select"
            aria-label="Language Selector"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="es">Español</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        {/* Logo Badge */}
        <div className="logo-badge" style={{ marginTop: '12px', padding: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
          <img src="/logo.png" alt="Zuro Labs Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* Header */}
        <div className="login-header" style={{ marginBottom: '16px' }}>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {/* Role Tab Selector */}
        <div className="role-tabs">
          <button 
            type="button" 
            className={`role-tab ${role === 'patient' ? 'active-patient' : ''}`}
            onClick={() => handleRoleChange('patient')}
          >
            {t.rolePatientTab}
          </button>
          <button 
            type="button" 
            className={`role-tab ${role === 'admin' ? 'active-admin' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            {t.roleAdminTab}
          </button>
          <button 
            type="button" 
            className={`role-tab ${role === 'doctor' ? 'active-doctor' : ''}`}
            onClick={() => handleRoleChange('doctor')}
          >
            {t.roleDoctorTab}
          </button>
        </div>

        {/* Alerts for visual feedback */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {info && <div className="alert alert-success">{info}</div>}

        {/* Dynamic form step */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label htmlFor="phone">{t.mobileLabel}</label>
              <input
                id="phone"
                type="tel"
                placeholder={t.mobilePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? t.loadingSend : t.sendOtp}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  📱 {phone}
                </span>
                <button 
                  type="button" 
                  onClick={handleChangeNumber}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary)', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    textDecoration: 'underline' 
                  }}
                >
                  {t.changeNumber}
                </button>
              </div>
              <label htmlFor="otp">{t.otpLabel}</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={t.otpPlaceholder}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '0.2em', 
                  fontSize: '18px', 
                  fontWeight: '700' 
                }}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? t.loadingVerify : t.verifyBtn}
            </button>
          </form>
        )}

        {/* Register link */}
        <p className="register-prompt">
          {t.noAccount}
          <a 
            href="#register" 
            onClick={(e) => { 
              e.preventDefault(); 
              alert(regDetails.alert); 
            }}
          >
            {regDetails.text}
          </a>
        </p>

        {/* Demo Accounts List */}
        <div className="demo-box">
          <h3>{t.demoTitle}</h3>
          <ul>
            <li>{getDemoDetails()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

