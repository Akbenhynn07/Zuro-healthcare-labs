import React, { useState, useEffect, useRef } from 'react';

// Hardcoded hospitals list with ratings, distance, next slot, and doctor previews
const HOSPITALS = [
  {
    id: 'zuro-central',
    name: 'Zuro Central Clinic',
    branch: 'City Center Branch',
    desc: 'Primary care, wellness checks, and family medicine. High availability and quick consultation.',
    tag: 'General Medicine',
    icon: '🏥',
    distance: 1.8, // in km
    rating: 4.7,
    doctors: 'Dr. Amit Verma (General Medicine)',
    nextSlot: '10:00 AM Today'
  },
  {
    id: 'city-general',
    name: 'City General Hospital',
    branch: 'Metro Plaza District',
    desc: '24/7 emergency response, advanced diagnostics, ICU, and a wide array of senior specialists.',
    tag: 'Multi-Specialty',
    icon: '🏢',
    distance: 4.2,
    rating: 4.5,
    doctors: 'Dr. Sarah Collins (Internal Medicine)',
    nextSlot: '02:15 PM Today'
  },
  {
    id: 'st-michaels',
    name: 'St. Michael Pediatrics',
    branch: 'Greenwood Valley',
    desc: 'Dedicated child healthcare, immunizations, developmental pediatrics, and emergency kids care.',
    tag: 'Pediatrics',
    icon: '🧸',
    distance: 5.6,
    rating: 4.9,
    doctors: 'Dr. Priya Patel (Pediatrics)',
    nextSlot: '09:30 AM Tomorrow'
  },
  {
    id: 'apex-heart',
    name: 'Apex Heart & Vascular',
    branch: 'Downtown Tech Park',
    desc: 'State-of-the-art cardiology clinic, vascular therapies, heart health checkups, and surgery.',
    tag: 'Cardiology',
    icon: '❤️',
    distance: 7.1,
    rating: 4.8,
    doctors: 'Dr. Rajesh Kumar (Cardiologist)',
    nextSlot: '11:00 AM Today'
  }
];

// Multilingual translations dictionaries inside dashboard
const LOCAL_TRANS = {
  en: {
    welcome: 'Welcome Back',
    liveQueue: 'Live Appointment Queue Tracker',
    position: 'Your position in queue',
    estWait: 'Estimated Wait Time',
    records: 'Electronic Medical Records',
    billing: 'Billing & Fee Payments',
    chat: 'Interactive Help Desk Chat',
    searchPlaceholder: 'Search hospitals by name or branch...',
    allSpecs: 'All Specializations',
    maxDist: 'Max Distance',
    minRate: 'Min Rating',
    availableDocs: 'Available Expert',
    nextSlotText: 'Next Slot',
    payFee: 'Pay Consultation Fee',
    paid: 'PAID',
    pending: 'PENDING',
    unpaid: 'UNPAID',
    cancellationTitle: 'Please select a reason for cancellation',
    submit: 'Submit'
  },
  hi: {
    welcome: 'आपका स्वागत है',
    liveQueue: 'लाइव अपॉइंटमेंट कतार ट्रैकर',
    position: 'कतार में आपकी स्थिति',
    estWait: 'अनुमानित प्रतीक्षा समय',
    records: 'इलेक्ट्रॉनिक मेडिकल रिकॉर्ड',
    billing: 'बिलिंग और शुल्क भुगतान',
    chat: 'सहायता डेस्क चैट',
    searchPlaceholder: 'अस्पताल या शाखा द्वारा खोजें...',
    allSpecs: 'सभी विशेषताएँ',
    maxDist: 'अधिकतम दूरी',
    minRate: 'न्यूनतम रेटिंग',
    availableDocs: 'उपलब्ध विशेषज्ञ',
    nextSlotText: 'अगला समय',
    payFee: 'परामर्श शुल्क का भुगतान करें',
    paid: 'भुगतान किया गया',
    pending: 'लंबित',
    unpaid: 'अवैतनिक',
    cancellationTitle: 'कृपया रद्द करने का कारण चुनें',
    submit: 'जमा करें'
  },
  es: {
    welcome: 'Bienvenido de nuevo',
    liveQueue: 'Rastreador de cola de citas en vivo',
    position: 'Su posición en la cola',
    estWait: 'Tiempo de espera estimado',
    records: 'Registros Médicos Electrónicos',
    billing: 'Facturación y Pagos de Tasas',
    chat: 'Chat de la mesa de ayuda',
    searchPlaceholder: 'Buscar hospitales por nombre...',
    allSpecs: 'Todas las especialidades',
    maxDist: 'Distancia máxima',
    minRate: 'Calificación mínima',
    availableDocs: 'Experto disponible',
    nextSlotText: 'Siguiente turno',
    payFee: 'Pagar tarifa de consulta',
    paid: 'PAGADO',
    pending: 'PENDIENTE',
    unpaid: 'IMPAGADO',
    cancellationTitle: 'Seleccione un motivo de cancelación',
    submit: 'Enviar'
  },
  te: {
    welcome: 'మళ్ళీ స్వాగతం',
    liveQueue: 'లైవ్ అపాయింట్‌మెంట్ క్యూ ట్రాకర్',
    position: 'క్యూలో మీ స్థానం',
    estWait: 'అంచనా వేసిన నిరీక్షణ సమయం',
    records: 'ఎలక్ట్రానిక్ వైద్య రికార్డులు',
    billing: 'బిల్లింగ్ & ఫీజు చెల్లింపులు',
    chat: 'సహాయ కేంద్రం చాట్',
    searchPlaceholder: 'ఆసుపత్రుల కోసం వెతకండి...',
    allSpecs: 'అన్ని విభాగాలు',
    maxDist: 'గరిష్ట దూరం',
    minRate: 'కనిష్ట రేటింగ్',
    availableDocs: 'అందుబాటులో ఉన్న నిపుణుడు',
    nextSlotText: 'తదుపరి స్లాట్',
    payFee: 'సంప్రదింపు రుసుము చెల్లించండి',
    paid: 'చెల్లించబడింది',
    pending: 'పెండింగ్',
    unpaid: 'చెల్లించని',
    cancellationTitle: 'దయచేసి రద్దు చేయడానికి కారణాన్ని ఎంచుకోండి',
    submit: 'సమర్పించండి'
  }
};

export default function PatientDashboard({ user, onLogout }) {
  // Localization
  const [lang, setLang] = useState('en');
  const t = LOCAL_TRANS[lang];

  // Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'records' | 'billing' | 'chat'

  // DB States
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([
    { id: 'rep-1', name: 'Blood Glucose Panel.pdf', date: '2026-05-10', size: '1.2 MB' },
    { id: 'rep-2', name: 'Chest X-Ray Digital.png', date: '2026-05-15', size: '4.8 MB' }
  ]);
  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', sender: 'staff', text: 'Hello Amit! How can Zuro assistance help you today?', time: '15:20' }
  ]);
  
  // Controls & Form States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterDistance, setFilterDistance] = useState('');
  const [filterRating, setFilterRating] = useState('');

  // Booking Form Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', age: '', gender: '', symptoms: '' });
  
  // Smart rescheduling & cancellations states
  const [showCancelId, setShowCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schedule Conflict');
  const [suggestedSlot, setSuggestedSlot] = useState(null);

  // Payment checkout states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentTargetId, setPaymentTargetId] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Ratings states
  const [ratingTargetId, setRatingTargetId] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Chat message input
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);

  // Notification states
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n-1', msg: '🏥 Appointment request under review for Zuro Central.', read: false },
    { id: 'n-2', msg: '💳 Billing invoice generated: ₹500 consult fee.', read: false }
  ]);

  // Audio turn alert chime
  const audioChimeRef = useRef(null);
  const [showTurnAlertModal, setShowTurnAlertModal] = useState(false);

  // Load appointments
  const loadAppointments = () => {
    const stored = localStorage.getItem('zuro_appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 2000);
    return () => clearInterval(interval);
  }, []);

  const saveAppointments = (newAppts) => {
    setAppointments(newAppts);
    localStorage.setItem('zuro_appointments', JSON.stringify(newAppts));
  };

  // Sound alert chime
  const playAlertSound = () => {
    // Generate simple synth beep using Web Audio API!
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 300);
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  };

  // Mock audio triggers when queue status changes to APPROVED/called
  useEffect(() => {
    const hasCalled = appointments.some(appt => appt.status === 'APPROVED' && appt.tokenNumber === '101');
    if (hasCalled) {
      // Trigger alarm
      setShowTurnAlertModal(true);
      playAlertSound();
    }
  }, [appointments]);

  // Auto doctor advisor based on symptoms
  const getSuggestedDoctor = (symptoms = '') => {
    const sym = symptoms.toLowerCase();
    if (sym.includes('heart') || sym.includes('chest') || sym.includes('pulse')) {
      return 'Dr. Rajesh Kumar (Cardiology Specialist)';
    } else if (sym.includes('child') || sym.includes('baby') || sym.includes('pediatrics')) {
      return 'Dr. Priya Patel (Pediatrician Expert)';
    } else {
      return 'Dr. Amit Verma (General Physician)';
    }
  };

  // Handle open booking modal
  const handleOpenBooking = (h) => {
    setSelectedHospital(h);
    setBookingForm({ date: '', time: '', age: '', gender: '', symptoms: '' });
    setValidationError('');
    setShowModal(true);
  };

  // Handle new appointment submission
  const handleBookSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const { date, time, age, gender, symptoms } = bookingForm;
    if (!date || !time || !age || !gender || !symptoms.trim() || !selectedHospital) {
      setValidationError('All fields are mandatory.');
      return;
    }

    const newAppt = {
      id: 'appt_' + Date.now(),
      hospital: selectedHospital.name,
      date,
      time,
      age,
      gender,
      symptoms: symptoms.trim(),
      status: 'PENDING',
      patientName: user.name || 'Amit Verma',
      patientPhone: user.phone || '+91 98765 43210',
      createdAt: new Date().toISOString(),
      paymentStatus: 'PENDING',
      amount: 500
    };

    const updated = [newAppt, ...appointments];
    saveAppointments(updated);
    
    // Add Notification
    setNotifications([
      { id: 'n_' + Date.now(), msg: `📅 Appointment booked at ${selectedHospital.name} for ${date}`, read: false },
      ...notifications
    ]);

    setShowModal(false);
    setSelectedHospital(null);
  };

  // Rescheduling Suggestions
  const handleOpenReschedule = (appt) => {
    // Generate a smart suggested slot
    const altDate = new Date();
    altDate.setDate(altDate.getDate() + 1);
    const suggestedStr = `${altDate.toISOString().split('T')[0]} at 11:30 AM (Wait time is shorter by 15 mins)`;
    setSuggestedSlot({ apptId: appt.id, text: suggestedStr, date: altDate.toISOString().split('T')[0], time: '11:30' });
  };

  const handleApplyReschedule = () => {
    if (!suggestedSlot) return;
    const updated = appointments.map(appt => {
      if (appt.id === suggestedSlot.apptId) {
        return { ...appt, date: suggestedSlot.date, time: suggestedSlot.time };
      }
      return appt;
    });
    saveAppointments(updated);
    setNotifications([
      { id: 'n_' + Date.now(), msg: `🔄 Rescheduled successfully to ${suggestedSlot.date}`, read: false },
      ...notifications
    ]);
    setSuggestedSlot(null);
  };

  // Cancellations with reason tracker
  const handleCancelClick = (id) => {
    setShowCancelId(id);
  };

  const handleConfirmCancel = () => {
    if (!showCancelId) return;
    const updated = appointments.map(appt => {
      if (appt.id === showCancelId) {
        return { ...appt, status: 'CANCELLED', cancelReason: cancelReason };
      }
      return appt;
    });
    saveAppointments(updated);
    setNotifications([
      { id: 'n_' + Date.now(), msg: `❌ Appointment cancelled: "${cancelReason}"`, read: false },
      ...notifications
    ]);
    setShowCancelId(null);
  };

  // Payment checkout flow
  const handleOpenPayment = (appt) => {
    setPaymentAmount(appt.amount || 500);
    setPaymentTargetId(appt.id);
    setCardDetails({ number: '', expiry: '', cvv: '' });
    setPaymentSuccess(false);
    setShowPaymentModal(true);
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      alert('Fill card details.');
      return;
    }
    // Mock processing spinner
    setTimeout(() => {
      setPaymentSuccess(true);
      // Update appointment paid status
      const updated = appointments.map(appt => {
        if (appt.id === paymentTargetId) {
          return { ...appt, paymentStatus: 'PAID' };
        }
        return appt;
      });
      saveAppointments(updated);
      setNotifications([
        { id: 'n_' + Date.now(), msg: `💳 Consultation payment of ₹${paymentAmount} successful.`, read: false },
        ...notifications
      ]);
    }, 1500);
  };

  // Patient Ratings Feedback
  const handleOpenRating = (appt) => {
    setRatingTargetId(appt.id);
    setStarCount(5);
    setReviewText('');
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();
    const updated = appointments.map(appt => {
      if (appt.id === ratingTargetId) {
        return { ...appt, doctorRating: starCount, doctorReview: reviewText };
      }
      return appt;
    });
    saveAppointments(updated);
    setRatingTargetId(null);
    alert('Thank you for your valuable feedback!');
  };

  // Chat desk send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      id: 'm_' + Date.now(),
      sender: 'patient',
      text: chatInput.trim(),
      time: new Date().toTimeString().split(' ')[0].substring(0, 5)
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setTyping(true);

    // Simulated receptionist reply
    setTimeout(() => {
      const staffReply = {
        id: 'mr_' + Date.now(),
        sender: 'staff',
        text: 'Received your query. We are verifying availability. Dr. Rajesh Kumar is on shift. Queue status is updated dynamically.',
        time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      };
      setChatMessages(prev => [...prev, staffReply]);
      setTyping(false);
    }, 1500);
  };

  // File Upload reports
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newReport = {
        id: 'rep_' + Date.now(),
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      };
      setLabReports([...labReports, newReport]);
      triggerAlert(`File "${file.name}" uploaded to clinical records.`);
    }
  };

  // Hospital Card filtering logic
  const filteredHospitals = HOSPITALS.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = filterSpec ? h.tag === filterSpec : true;
    const matchesDist = filterDistance ? h.distance <= parseFloat(filterDistance) : true;
    const matchesRate = filterRating ? h.rating >= parseFloat(filterRating) : true;
    return matchesSearch && matchesSpec && matchesDist && matchesRate;
  });

  // Fetch active queue status
  const activeAppt = appointments.find(
    a => a.status === 'PENDING' || a.status === 'APPROVED'
  );

  // Mock wait progress computation
  const getQueueProgress = (status) => {
    if (status === 'APPROVED') return 80;
    return 40;
  };

  const presentAppointments = appointments.filter(
    appt => appt.status === 'PENDING' || appt.status === 'APPROVED'
  );

  const pastAppointments = appointments.filter(
    appt => appt.status === 'COMPLETED' || appt.status === 'CANCELLED'
  );

  // Trigger floating alert toast helper
  const triggerAlert = (message) => {
    const newAlert = { id: Date.now(), msg: message };
    setAlerts(prev => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 5000);
  };

  const [alertsList, setAlerts] = useState([]);

  return (
    <div className="dashboard-container animate-fade-in" style={{ '--primary': '#10b981' }}>
      
      {/* Sidebar Section */}
      <aside className="dashboard-sidebar" style={{ borderRight: '1.5px solid #ecfdf5' }}>
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo" style={{ backgroundColor: '#10b981' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2>Zuro Patient</h2>
          </div>

          <div className="sidebar-menu">
            <span className="sidebar-menu-title">Main Portal</span>
            <button className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              📊 Dashboard
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
              📂 Health Records
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
              💰 Billing & Fees
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              💬 Clinic Helpdesk
            </button>
          </div>
        </div>

        <div>
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
              P
            </div>
            <div className="profile-info">
              <span className="profile-name">Amit Verma</span>
              <span className="profile-role">Patient ID: 2026-A</span>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout} style={{ color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#fee2e2' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main panel work desk */}
      <main className="main-panel">
        
        {/* Header bar */}
        <div className="dashboard-header">
          <div>
            <h1>{t.welcome}, Amit Verma</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Your electronic clinical portal overview
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            
            {/* Multi-language selector */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)} 
              className="lang-select"
              style={{ width: '120px', height: '40px', border: '1.5px solid #cbd5e1' }}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="es">Español</option>
              <option value="te">తెలుగు</option>
            </select>

            {/* Notifications panel dropdown trigger */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              <span style={{ fontSize: '24px' }}>🔔</span>
              {notifications.some(n => !n.read) && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }}></span>
              )}
              
              {/* Notification drop panel */}
              {showNotifDropdown && (
                <div className="notif-dropdown-wrapper" onClick={e => e.stopPropagation()}>
                  <div className="notif-dropdown-header">
                    <span>Notifications Panel</span>
                    <button style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold' }} onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}>
                      Mark read
                    </button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="notif-dropdown-item" style={{ backgroundColor: n.read ? '' : '#f0fdf4' }}>
                      {n.msg}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 1. Dashboard Tab Overview */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            
            {/* Health score widget & clinic metrics */}
            <div className="health-score-container">
              <div className="health-score-ring">
                <span>85</span>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#065f46' }}>Your Overall Health Score</h4>
                <p style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
                  Based on completed clinical checks & routine diagnostic assessments. Good job maintaining schedules!
                </p>
              </div>
            </div>

            {/* Live Queue Tracker Card */}
            {activeAppt && (
              <section className="clinical-card" style={{ borderTop: '4px solid #10b981' }}>
                <h3 className="section-title">⏳ {t.liveQueue}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Position:</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                      {activeAppt.status === 'APPROVED' ? 'Your Position: #2 in Queue' : 'Queue Pending Confirmation'}
                    </div>
                    
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${getQueueProgress(activeAppt.status)}%` }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                      <span>Arrived Check-In</span>
                      <span>Consultation Room</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{t.estWait}:</span>
                    <strong style={{ fontSize: '20px', color: '#10b981', marginTop: '2px' }}>
                      {activeAppt.status === 'APPROVED' ? 'Approx: 18 mins' : 'Awaiting confirmation'}
                    </strong>
                    
                    <a 
                      href="https://maps.google.com/?q=City+Center+Clinic+Zuro" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-action" 
                      style={{ marginTop: '12px', textAlign: 'center', textDecoration: 'none', background: '#10b981', color: 'white', display: 'block' }}
                    >
                      📍 Navigation to Clinic
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Smart Suggested Slot */}
            {suggestedSlot && (
              <div className="availability-banner" style={{
                backgroundColor: '#e0f2fe',
                border: '1.5px solid #bae6fd',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                color: '#0369a1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>💡 Smart Reschedule Suggestion:</strong>
                  <div style={{ fontSize: '13px', marginTop: '2px' }}>{suggestedSlot.text}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleApplyReschedule} className="btn-action btn-action-approve" style={{ padding: '6px 12px' }}>
                    Reschedule Now
                  </button>
                  <button onClick={() => setSuggestedSlot(null)} className="btn-action btn-action-cancel" style={{ padding: '6px 12px' }}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Hospital cards with search and filters */}
            <section style={{ marginBottom: '40px' }}>
              <h2 className="section-title">Find Hospital & Book Clinic</h2>

              {/* Filters list */}
              <div className="filter-action-bar">
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)} className="form-select" style={{ width: '150px', height: '42px', padding: '0 8px' }}>
                    <option value="">{t.allSpecs}</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Multi-Specialty">Multi-Specialty</option>
                  </select>

                  <select value={filterDistance} onChange={(e) => setFilterDistance(e.target.value)} className="form-select" style={{ width: '130px', height: '42px', padding: '0 8px' }}>
                    <option value="">{t.maxDist}</option>
                    <option value="2">{"< 2 km"}</option>
                    <option value="5">{"< 5 km"}</option>
                    <option value="10">{"< 10 km"}</option>
                  </select>

                  <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="form-select" style={{ width: '130px', height: '42px', padding: '0 8px' }}>
                    <option value="">{t.minRate}</option>
                    <option value="4.5">{"4.5★ & up"}</option>
                    <option value="4.8">{"4.8★ & up"}</option>
                  </select>
                </div>
              </div>

              {/* Grid cards */}
              <div className="hospital-grid">
                {filteredHospitals.map(h => (
                  <div key={h.id} className="hospital-card" onClick={() => handleOpenBooking(h)}>
                    <div>
                      <div className="hospital-card-header">
                        <span className="hospital-icon">{h.icon}</span>
                        <span className="hospital-tag">{h.tag}</span>
                      </div>
                      <h3>{h.name}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>
                        📍 {h.branch} ({h.distance} km away)
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#d97706', marginBottom: '12px' }}>
                        <span>⭐ {h.rating}</span>
                      </div>

                      {/* Available doctor preview */}
                      <div style={{ 
                        backgroundColor: '#f8fafc', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #edf2f7',
                        fontSize: '12px',
                        color: '#475569',
                        marginBottom: '16px'
                      }}>
                        <strong>{t.availableDocs}:</strong> {h.doctors}
                        <br />
                        <strong>{t.nextSlotText}:</strong> <span style={{ color: '#10b981', fontWeight: '700' }}>{h.nextSlot}</span>
                      </div>
                    </div>
                    
                    <button className="btn-book-hospital">
                      Select & Schedule
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 2. Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="animate-fade-in">
            
            {/* Upload reports form */}
            <section className="console-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="section-title">Upload Lab Reports / X-Rays</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>Upload clinical blood reports or imaging files to your profile</p>
              
              <label className="upload-drop-zone">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📤</span>
                <strong>Click here to upload medical files</strong>
                <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  Supports PDF, PNG, JPG files up to 10MB
                </span>
              </label>

              {/* Uploaded files listing */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Your Uploaded Files:</span>
                <div style={{ marginTop: '8px' }}>
                  {labReports.map(rep => (
                    <div key={rep.id} className="file-card-item">
                      <div>
                        <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>📄 {rep.name}</strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '12px' }}>Uploaded on: {rep.date}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{rep.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Past Visits history list */}
            <section className="console-card" style={{ padding: '24px' }}>
              <h3 className="section-title">{t.records}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {appointments.filter(a => a.status === 'COMPLETED').length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    No completed medical consult history logs found.
                  </p>
                ) : (
                  appointments.filter(a => a.status === 'COMPLETED').map(appt => (
                    <div key={appt.id} className="appointment-card" style={{ border: '1px solid #edf2f7' }}>
                      <div className="appointment-details">
                        <span className="appt-hospital-name">{appt.hospital}</span>
                        <div className="appt-meta-info" style={{ marginTop: '4px' }}>
                          <span>📅 Date: {appt.date}</span>
                          <span>⏰ Time: {appt.time}</span>
                        </div>
                        
                        {/* Mock Diagnoses and Prescription details */}
                        <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '13px' }}>
                          <div><strong>Diagnosis:</strong> Acute Upper Respiratory Tract Infection</div>
                          <div style={{ marginTop: '6px' }}><strong>Prescribed Medications:</strong> Paracetamol 500mg, Cough Syrup (10ml)</div>
                          <div style={{ marginTop: '6px' }}><strong>Doctor Notes:</strong> Rest for 3 days, drink lukewarm water, follow up if fever persists.</div>
                        </div>

                        {/* Star feedback rating block */}
                        {appt.doctorRating ? (
                          <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#d97706', fontWeight: '700' }}>
                            Your Rating: {'⭐'.repeat(appt.doctorRating)}
                            {appt.doctorReview && <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: '500', marginLeft: '12px' }}>"{appt.doctorReview}"</span>}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenRating(appt)} 
                            className="btn-action" 
                            style={{ marginTop: '12px', background: '#f59e0b', color: 'white' }}
                          >
                            ⭐ Review Doctor & Hospital
                          </button>
                        )}
                      </div>

                      {/* Mock PDF Receipt downloader */}
                      <button 
                        onClick={() => {
                          triggerAlert(`Download triggered for prescription_${appt.id}.pdf`);
                          alert(`Prescription file prescription_${appt.id}.pdf successfully created and saved to Downloads.`);
                        }}
                        className="btn-action" 
                        style={{ height: '36px', background: '#f1f5f9', color: '#475569' }}
                      >
                        📥 Download Rx PDF
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* 3. Billing and Invoice Tab */}
        {activeTab === 'billing' && (
          <div className="animate-fade-in">
            <section className="console-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="section-title">Outstanding Consultation Invoices</h3>
              
              <div style={{ marginTop: '16px' }}>
                {appointments.filter(a => a.status === 'APPROVED' && a.paymentStatus !== 'PAID').length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    No outstanding fee payments currently due.
                  </p>
                ) : (
                  appointments.filter(a => a.status === 'APPROVED' && a.paymentStatus !== 'PAID').map(appt => (
                    <div key={appt.id} className="appointment-card" style={{ border: '1.5px solid #bfdbfe', backgroundColor: '#f0f9ff' }}>
                      <div className="appointment-details">
                        <span className="appt-hospital-name">{appt.hospital}</span>
                        <div className="appt-meta-info" style={{ marginTop: '4px' }}>
                          <span>📅 Consultation Date: {appt.date}</span>
                          <span>💳 Consultation Fee: <strong>₹500</strong></span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleOpenPayment(appt)}
                        className="btn-submit" 
                        style={{ height: '40px', maxWidth: '160px', backgroundColor: '#10b981' }}
                      >
                        💳 Pay Fee (₹500)
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Payments history ledger */}
            <section className="console-card" style={{ padding: '24px' }}>
              <h3 className="section-title">Billing Transactions History</h3>
              <div className="table-wrapper" style={{ marginTop: '16px' }}>
                <table className="console-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Location</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter(a => a.paymentStatus === 'PAID').map(appt => (
                      <tr key={appt.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>#INV-{appt.id.substring(5, 12)}</span>
                        </td>
                        <td>{appt.hospital}</td>
                        <td style={{ fontWeight: '700' }}>₹500</td>
                        <td>{appt.date}</td>
                        <td>Credit Card (Ending 4242)</td>
                        <td>
                          <span className="badge-status badge-completed">{t.paid}</span>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: '700' }}>#INV-9905</span></td>
                      <td>Zuro Central Clinic</td>
                      <td style={{ fontWeight: '700' }}>₹500</td>
                      <td>2026-05-15</td>
                      <td>UPI (GPay)</td>
                      <td><span className="badge-status badge-completed">{t.paid}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* 4. Help Desk Chat Tab */}
        {activeTab === 'chat' && (
          <div className="animate-fade-in">
            <section className="console-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>{t.chat}</h3>
                
                {/* Dial clinic button */}
                <a href="tel:+919876543210" className="btn-action" style={{ background: '#f1f5f9', color: '#475569', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  📞 Call Clinic Helpline
                </a>
              </div>

              {/* Chat window */}
              <div className="chat-window">
                <div className="chat-message-list">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`chat-message-item ${msg.sender === 'patient' ? 'chat-message-patient' : 'chat-message-staff'}`}
                    >
                      {msg.text}
                      <span className="chat-message-time">{msg.time}</span>
                    </div>
                  ))}
                  {typing && (
                    <div className="chat-message-item chat-message-staff" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      Receptionist is typing...
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-row">
                  <input 
                    type="text" 
                    placeholder="Type message here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flex: 1, height: '42px', padding: '0 12px' }}
                  />
                  <button type="submit" className="btn-action btn-action-approve" style={{ height: '42px', padding: '0 20px' }}>
                    Send
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* Active Queue Appts list view (Present Appointments) */}
        {activeTab === 'dashboard' && (
          <section style={{ marginBottom: '40px', marginTop: '24px' }}>
            <h2 className="section-title">Your Appointments</h2>
            <div className="appointments-grid">
              {presentAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px dashed #edf2f7' }}>
                  No active appointments. Select a hospital above to book one.
                </div>
              ) : (
                presentAppointments.map(appt => (
                  <div key={appt.id} className="appointment-card" style={{ border: '1px solid #edf2f7' }}>
                    <div className="appointment-details">
                      <span className="appt-hospital-name">{appt.hospital}</span>
                      <div className="appt-meta-info">
                        <span>📅 Date: {appt.date}</span>
                        <span>⏰ Time: {appt.time}</span>
                        <span>👤 Age: {appt.age} ({appt.gender})</span>
                      </div>
                      <div className="appt-symptoms">
                        <strong>Symptoms:</strong> {appt.symptoms}
                      </div>
                      {appt.tokenNumber && (
                        <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                          🏷 Assigned Token: #{appt.tokenNumber}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={`badge-status badge-${appt.status.toLowerCase()}`}>
                        {appt.status}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          onClick={() => handleOpenReschedule(appt)}
                          className="btn-action"
                          style={{ fontSize: '11.5px', background: '#f1f5f9', color: '#475569' }}
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancelClick(appt.id)}
                          className="btn-action btn-action-cancel"
                          style={{ fontSize: '11.5px' }}
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

      </main>

      {/* Floating Alert Stack bottom-right */}
      {alertsList.length > 0 && (
        <div className="alert-toast-container">
          {alertsList.map(a => (
            <div key={a.id} className="alert-toast-item animate-fade-in" style={{ backgroundColor: '#0f172a' }}>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{a.msg}</span>
              <button className="alert-toast-close" onClick={() => setAlerts(prev => prev.filter(al => al.id !== a.id))}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Confirm Cancellation (With reason tracking) */}
      {showCancelId && (
        <div className="modal-backdrop" onClick={() => setShowCancelId(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Cancel Appointment Request</span>
              <button className="modal-close" onClick={() => setShowCancelId(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
                Are you sure you want to cancel? Please tell us why to help us improve:
              </p>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="cancelReason">Cancellation Reason</label>
                <select 
                  id="cancelReason" 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-select"
                >
                  <option value="Schedule Conflict">📅 Schedule Conflict</option>
                  <option value="Felt Better">😊 Felt Better / Resolved</option>
                  <option value="Long Wait Times">⏳ Long Wait Times</option>
                  <option value="Found another physician">🩺 Found another physician</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-submit" style={{ backgroundColor: '#f1f5f9', color: '#475569', flex: 1 }} onClick={() => setShowCancelId(null)}>
                  Keep Booking
                </button>
                <button onClick={handleConfirmCancel} className="btn-submit btn-action-cancel" style={{ flex: 2, background: '#ef4444', color: 'white' }}>
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Booking Form Dialog */}
      {showModal && selectedHospital && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setSelectedHospital(null); }}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Book Consultation</span>
              <button className="modal-close" onClick={() => { setShowModal(false); setSelectedHospital(null); }}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #edf2f7' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Facility Selected</span>
                <h3 style={{ fontSize: '17px', color: '#1e293b', fontWeight: '700' }}>{selectedHospital.name}</h3>
              </div>

              {validationError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{validationError}</div>}

              <form onSubmit={handleBookSubmit}>
                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input 
                      type="date" 
                      id="date" 
                      value={bookingForm.date} 
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">Time *</label>
                    <input 
                      type="time" 
                      id="time" 
                      value={bookingForm.time} 
                      onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})} 
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="age">Age *</label>
                    <input 
                      type="number" 
                      id="age" 
                      value={bookingForm.age} 
                      onChange={(e) => setBookingForm({...bookingForm, age: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender *</label>
                    <select 
                      id="gender" 
                      value={bookingForm.gender} 
                      onChange={(e) => setBookingForm({...bookingForm, gender: e.target.value})} 
                      className="form-select"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="symptoms">Symptoms *</label>
                  <textarea 
                    id="symptoms" 
                    rows="3" 
                    value={bookingForm.symptoms} 
                    onChange={(e) => setBookingForm({...bookingForm, symptoms: e.target.value})} 
                    className="form-textarea"
                    placeholder="Briefly state symptoms..."
                    required
                  />
                </div>

                {/* AI Assistant advisor preview */}
                {bookingForm.symptoms && (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: '#047857'
                  }}>
                    🤖 <strong>AI Doctor Suggestion:</strong> {getSuggestedDoctor(bookingForm.symptoms)}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-submit" style={{ backgroundColor: '#f1f5f9', color: '#475569', flex: 1 }} onClick={() => { setShowModal(false); setSelectedHospital(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" style={{ flex: 2 }}>
                    Book Appointment (₹500 Fee)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Payment checkout portal */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">💳 Clinical Fees Payment Checkout</span>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🟢</span>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#047857', marginBottom: '8px' }}>Payment Completed!</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Your receipt #INV-{paymentTargetId?.substring(5, 12)} is generated.</p>
                  <button onClick={() => setShowPaymentModal(false)} className="btn-submit" style={{ backgroundColor: '#10b981' }}>
                    Close Invoice
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCardSubmit}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice Amount</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>₹{paymentAmount}</div>
                  </div>

                  <div className="checkout-credit-card-form">
                    <div className="form-group">
                      <label htmlFor="cardNo">Credit/Debit Card Number</label>
                      <input 
                        type="text" 
                        id="cardNo"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label htmlFor="cardExpiry">Expiry Date</label>
                        <input 
                          type="text" 
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardCvv">CVV Code</label>
                        <input 
                          type="password" 
                          id="cardCvv"
                          placeholder="123"
                          maxLength={3}
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-submit" style={{ marginTop: '24px', backgroundColor: '#10b981' }}>
                    Authorize Transaction (₹{paymentAmount})
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Star Rating review */}
      {ratingTargetId && (
        <div className="modal-backdrop" onClick={() => setRatingTargetId(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">⭐ Consult Feedback & Star Ratings</span>
              <button className="modal-close" onClick={() => setRatingTargetId(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitRating}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Overall Star Rating</label>
                  <div className="star-rating-container">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`star-rating-item ${star <= starCount ? 'active' : ''}`}
                        onClick={() => setStarCount(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="reviewMsg">Write a Review</label>
                  <textarea 
                    id="reviewMsg"
                    rows="3"
                    placeholder="Tell us about the doctor's service, clinic facilities..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-submit" style={{ backgroundColor: '#f1f5f9', color: '#475569', flex: 1 }} onClick={() => setRatingTargetId(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" style={{ flex: 2 }}>
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal - "Your Turn" notification alert popup */}
      {showTurnAlertModal && (
        <div className="modal-backdrop" style={{ zIndex: 3000 }} onClick={() => setShowTurnAlertModal(false)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '350px', border: '2px solid #ef4444', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 12px' }}>
              <span style={{ fontSize: '56px', display: 'block', animation: 'heartbeat 1.5s infinite' }}>🚨</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#b91c1c', marginTop: '16px' }}>YOUR TURN ALERT</h3>
              <p style={{ fontSize: '13.5px', color: '#475569', marginTop: '12px', lineHeight: '1.4' }}>
                Your appointment is now active. Please proceed immediately to <strong>Consultation Room #2 (Dr. Rajesh Kumar)</strong>.
              </p>
              <button onClick={() => setShowTurnAlertModal(false)} className="btn-submit" style={{ backgroundColor: '#ef4444', color: 'white', marginTop: '24px' }}>
                Acknowledge Call
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
