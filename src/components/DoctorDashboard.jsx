import React, { useState, useEffect, useRef } from 'react';

// Help helper to evaluate triage priority from symptoms text
const getTriageLevel = (symptoms = '') => {
  const sym = symptoms.toLowerCase();
  if (sym.includes('chest pain') || sym.includes('breathing') || sym.includes('severe pain') || sym.includes('unconscious') || sym.includes('emergency')) {
    return { level: 'EMERGENCY', color: 'red', text: '🔴 Emergency' };
  } else if (sym.includes('fever') || sym.includes('cough') || sym.includes('sprain') || sym.includes('vomiting') || sym.includes('pain')) {
    return { level: 'MODERATE', color: 'yellow', text: '🟡 Moderate' };
  } else {
    return { level: 'NORMAL', color: 'green', text: '🟢 Normal' };
  }
};

// Help helper to get AI clinical summaries
const getAISummary = (symptoms = '') => {
  const level = getTriageLevel(symptoms).level;
  if (level === 'EMERGENCY') {
    return 'Critical assessment required. Acute respiratory/cardiac distress indicators detected. Suggest immediate vitals monitoring and department review.';
  } else if (level === 'MODERATE') {
    return 'Sub-acute symptoms. Possible infectious or inflammatory response. Monitor body temperature and conduct systematic physical checkup.';
  } else {
    return 'Non-urgent presentation. Routine wellness checks or minor dermatological/chronic updates. General medicine consult suggested.';
  }
};

// AI assistant clinical analyzer data
const getAIDiagnosis = (symptoms = '') => {
  const level = getTriageLevel(symptoms).level;
  if (level === 'EMERGENCY') {
    return {
      diagnosis: 'Acute Coronary Syndrome / Asthmatic Bronchospasm',
      risk: 'CRITICAL / HIGH',
      dept: 'Cardiology / Pulmonology Emergency Room',
      tests: 'ECG 12-Lead, Troponin T test, Chest X-Ray PA view, Arterial Blood Gas (ABG)'
    };
  } else if (level === 'MODERATE') {
    return {
      diagnosis: 'Viral Gastroenteritis / Acute Pharyngitis',
      risk: 'MODERATE',
      dept: 'General Medicine / ENT',
      tests: 'Complete Blood Count (CBC), Throat Swab Culture, Rapid Antigen Test'
    };
  } else {
    return {
      diagnosis: 'Tension-type Headache / Mild Dermatitis',
      risk: 'LOW',
      dept: 'Family Medicine / Dermatology',
      tests: 'Routine checkup, blood pressure profiling'
    };
  }
};

export default function DoctorDashboard({ user, onLogout }) {
  // Application State
  const [appointments, setAppointments] = useState([]);
  const [acceptingPatients, setAcceptingPatients] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState(null);
  
  // Timer States
  const [consultationTime, setConsultationTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Stats
  const [totalTreated, setTotalTreated] = useState(4); // Default starts at 4 as per image
  const [followUpsCount, setFollowUpsCount] = useState(1); // Default starts at 1 as per image
  const [avgTimeSec, setAvgTimeSec] = useState(434); // Average 7 mins 14 secs initially

  // Prescription Form State
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [medications, setMedications] = useState([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState('Standard');

  // AI Assistant States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Toast Alerts States
  const [alerts, setAlerts] = useState([]);

  // Load and polling
  const loadData = () => {
    const stored = localStorage.getItem('zuro_appointments');
    if (stored) {
      try {
        const appts = JSON.parse(stored);
        setAppointments(appts);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync to localstorage
  const saveAppointments = (newAppts) => {
    setAppointments(newAppts);
    localStorage.setItem('zuro_appointments', JSON.stringify(newAppts));
  };

  // Consultation Timer Effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setConsultationTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Trigger Toast Notification Helper
  const triggerAlert = (message) => {
    const newAlert = { id: Date.now(), msg: message };
    setAlerts(prev => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 5000);
  };

  // Availability toggle alert
  const handleAvailabilityToggle = () => {
    setAcceptingPatients(prev => {
      const next = !prev;
      triggerAlert(next ? 'Resumed accepting new patient assignments.' : 'Availability set to OFF. Stopped new assignments.');
      return next;
    });
  };

  // Emergency Mode toggle alert
  const handleEmergencyModeToggle = () => {
    setEmergencyMode(prev => {
      const next = !prev;
      if (next) {
        triggerAlert('🚨 Emergency Mode Activated! High-risk patients prioritized.');
      } else {
        triggerAlert('Emergency Mode Deactivated. Standard queue sorting restored.');
      }
      return next;
    });
  };

  // Quick Prescription: Add medicine tag
  const handleAddMedication = (e) => {
    e.preventDefault();
    if (medicationInput.trim()) {
      setMedications([...medications, medicationInput.trim()]);
      setMedicationInput('');
    }
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // Call Patient
  const handleCallPatient = (patient) => {
    if (activeConsultation) {
      if (!window.confirm('You have an active consultation. Do you want to swap and park the current patient?')) {
        return;
      }
    }
    setActiveConsultation(patient);
    setConsultationTime(0);
    setTimerRunning(true);
    setNotes('');
    setDiagnosis('');
    setMedications([]);
    setFollowUpDate('');
    setAiAnalysis(null);
    triggerAlert(`Current consultation started for ${patient.patientName}.`);
  };

  // Skip / Move to back of Queue
  const handleSkipPatient = (id) => {
    const list = [...appointments];
    const index = list.findIndex(a => a.id === id);
    if (index > -1) {
      const item = list.splice(index, 1)[0];
      list.push(item); // Push to back
      saveAppointments(list);
      triggerAlert(`Patient ${item.patientName} moved to the back of the queue.`);
    }
  };

  // Move Patient Up (Priority Override)
  const handleMoveUp = (id) => {
    const list = [...appointments];
    const index = list.findIndex(a => a.id === id);
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      saveAppointments(list);
      triggerAlert('Queue sequence updated manually.');
    }
  };

  // Move Patient Down (Priority Override)
  const handleMoveDown = (id) => {
    const list = [...appointments];
    const index = list.findIndex(a => a.id === id);
    if (index > -1 && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      saveAppointments(list);
      triggerAlert('Queue sequence updated manually.');
    }
  };

  // AI Patient Analysis
  const handleAIAnalyze = () => {
    if (!activeConsultation) return;
    setAiAnalyzing(true);
    setTimeout(() => {
      const analysis = getAIDiagnosis(activeConsultation.symptoms);
      setAiAnalysis(analysis);
      setAiAnalyzing(false);
      triggerAlert('🧠 AI Analysis generated successfully.');
    }, 1500);
  };

  // Complete Consultation
  const handleCompleteConsultation = () => {
    if (!activeConsultation) return;

    // Check if we need follow-ups saved to pending count
    if (followUpDate) {
      setFollowUpsCount(prev => prev + 1);
    }

    // Save clinical history log into localStorage
    const historyKey = `zuro_history_${activeConsultation.patientPhone}`;
    const previousHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const visitRecord = {
      date: new Date().toLocaleDateString(),
      diagnosis: diagnosis || 'General Wellness Check',
      notes: notes || 'No clinical notes recorded.',
      medications: medications,
      followUp: followUpDate ? `${followUpDate} (${followUpPriority} priority)` : 'None'
    };

    localStorage.setItem(historyKey, JSON.stringify([visitRecord, ...previousHistory]));

    // Update appointment status to COMPLETED in global list
    const updated = appointments.map(appt => {
      if (appt.id === activeConsultation.id) {
        return {
          ...appt,
          status: 'COMPLETED',
          clinicalHistory: [visitRecord, ...(appt.clinicalHistory || [])]
        };
      }
      return appt;
    });

    saveAppointments(updated);

    // Update advanced analytics
    setTotalTreated(prev => prev + 1);
    setAvgTimeSec(prev => Math.round((prev * totalTreated + consultationTime) / (totalTreated + 1)));

    triggerAlert(`Consultation completed for ${activeConsultation.patientName}. Records saved.`);
    
    // Reset States
    setActiveConsultation(null);
    setTimerRunning(false);
    setConsultationTime(0);
    setNotes('');
    setDiagnosis('');
    setMedications([]);
    setFollowUpDate('');
    setAiAnalysis(null);
  };

  // Fetch past timeline history for active patient
  const getPatientTimeline = () => {
    if (!activeConsultation) return [];
    const historyKey = `zuro_history_${activeConsultation.patientPhone}`;
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
  };

  const patientTimeline = getPatientTimeline();

  // Filter queue logic: show pending or approved appointments
  const queueList = appointments.filter(
    a => (a.status === 'PENDING' || a.status === 'APPROVED') && (!activeConsultation || a.id !== activeConsultation.id)
  );

  // Sorting: If Emergency Mode is ON, move emergency level patient to the top
  const sortedQueue = [...queueList].sort((a, b) => {
    if (emergencyMode) {
      const aLevel = getTriageLevel(a.symptoms).level === 'EMERGENCY' ? 1 : 0;
      const bLevel = getTriageLevel(b.symptoms).level === 'EMERGENCY' ? 1 : 0;
      return bLevel - aLevel; // Emergency cases first
    }
    return 0; // Maintain receptionist sequence otherwise
  });

  // Today's total patient load
  const todayLoad = queueList.length + (activeConsultation ? 1 : 0);

  // Formatting helpers
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainSecs.toString().padStart(2, '0')}`;
  };

  const formatAvgTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}m ${remainSecs}s`;
  };

  // Compute Emergency % Today
  const emergencyPct = todayLoad > 0 
    ? Math.round((appointments.filter(a => getTriageLevel(a.symptoms).level === 'EMERGENCY').length / appointments.length) * 100) 
    : 0;

  return (
    <div className="dashboard-container animate-fade-in" style={{ '--primary': '#10b981' }}>
      
      {/* Sidebar Section */}
      <aside className="dashboard-sidebar" style={{ borderRight: '1.5px solid #ecfdf5' }}>
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo" style={{ backgroundColor: 'transparent', padding: 0, overflow: 'hidden' }}>
              <img src="/Zuro_logo.png" alt="Zuro Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h2>Zuro Doctor</h2>
          </div>

          <div className="sidebar-menu">
            <span className="sidebar-menu-title">Main Menu</span>
            <button className="sidebar-menu-item active" style={{ color: '#10b981' }}>
              🏥 Consultation Desk
            </button>
          </div>
        </div>

        <div>
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
              DR
            </div>
            <div className="profile-info">
              <span className="profile-name">Dr. Rajesh Kumar</span>
              <span className="profile-role">MD - General Medicine</span>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout} style={{ color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#fee2e2' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-panel">
        
        {/* Header bar */}
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '26px' }}>Welcome, Dr. Rajesh</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Here's your clinic overview for today
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            
            {/* Availability Smart Toggle */}
            <div className="switch-container">
              <span className="switch-label">Accepting Patients</span>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={acceptingPatients} 
                  onChange={handleAvailabilityToggle} 
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            {/* Emergency Mode Toggle */}
            <div className="switch-container" style={{ borderLeft: '1.5px solid #cbd5e1', paddingLeft: '20px' }}>
              <span className="switch-label" style={{ color: '#ef4444' }}>⚠️ Emergency Mode</span>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  className="switch-emergency"
                  checked={emergencyMode} 
                  onChange={handleEmergencyModeToggle} 
                />
                <span className="switch-slider"></span>
              </label>
            </div>

          </div>
        </div>

        {/* Smart Toggle Banner when OFF */}
        {!acceptingPatients && (
          <div className="availability-banner" style={{
            backgroundColor: '#fee2e2',
            border: '1.5px solid #fca5a5',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            color: '#b91c1c',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🔒 Availability Status: OFF (Stopped new assignments)</span>
            <span style={{ fontSize: '13px', backgroundColor: 'white', padding: '4px 10px', borderRadius: '20px' }}>
              Next available slot: <strong>09:00 AM Tomorrow</strong>
            </span>
          </div>
        )}

        {/* Emergency Mode Warning Banner */}
        {emergencyMode && (
          <div className="emergency-mode-banner">
            <span className="emergency-title">
              🚨 Emergency Mode Active: High-risk patient triage prioritized automatically
            </span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '12px' }}>
              PRIORITY OVERRIDE
            </span>
          </div>
        )}

        {/* Stats Section */}
        <section className="stat-summary-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="stat-card-title">Today's Patients</span>
            <span className="stat-card-value">{todayLoad}</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <span className="stat-card-title">Total Treated</span>
            <span className="stat-card-value">{totalTreated}</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="stat-card-title">Follow-ups Pending</span>
            <span className="stat-card-value">{followUpsCount}</span>
          </div>
        </section>

        {/* Main Work Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          
          {/* Left Column: Active consultation details & clinical summary */}
          <div>
            
            {/* Consultation Panel */}
            <div className="clinical-card" style={{ borderTop: '4px solid #10b981' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Current Consultation</span>
                {activeConsultation && (
                  <span className={`triage-badge triage-${getTriageLevel(activeConsultation.symptoms).color}`}>
                    {getTriageLevel(activeConsultation.symptoms).text}
                  </span>
                )}
              </h3>

              {!activeConsultation ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px dashed #e2e8f0',
                  borderRadius: '16px'
                }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>No Active Consultation</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Call the next patient from the live queue to begin counseling.</p>
                  
                  <button 
                    onClick={() => {
                      if (sortedQueue.length > 0) {
                        handleCallPatient(sortedQueue[0]);
                      } else {
                        alert('No patients waiting in queue.');
                      }
                    }}
                    className="btn-submit"
                    style={{ backgroundColor: '#10b981', maxWidth: '200px', margin: '0 auto' }}
                    disabled={sortedQueue.length === 0}
                  >
                    Call Next Patient
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  
                  {/* Timer widget */}
                  <div className={`timer-container ${consultationTime > 600 ? 'timer-overdue' : ''}`}>
                    <span className="timer-label">
                      ⏱️ Consultation Timer {consultationTime > 600 && ' (Overdue limit exceeded 10m)'}
                    </span>
                    <span className="timer-value">{formatTime(consultationTime)}</span>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                      {activeConsultation.patientName}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                      Age: <strong>{activeConsultation.age}</strong> | Gender: <strong>{activeConsultation.gender}</strong> | Phone: <strong>{activeConsultation.patientPhone}</strong>
                    </p>
                  </div>

                  {/* Clinical Alert Section (Critical allergy/chronic warnings) */}
                  {(activeConsultation.age > 60 || getTriageLevel(activeConsultation.symptoms).level === 'EMERGENCY') && (
                    <div className="clinical-alert-box">
                      <span style={{ fontSize: '18px' }}>🛑</span>
                      <div>
                        <strong>CRITICAL PATIENT ALERTS:</strong>
                        <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '12px' }}>
                          {getTriageLevel(activeConsultation.symptoms).level === 'EMERGENCY' && <li>Allergy Alert: Sensitive to Penicillin & NSAIDs</li>}
                          {activeConsultation.age > 60 && <li>Chronic Condition Alert: Diabetic Hypertension (Monitor BP)</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Diagnosis & Prescription Forms */}
                  <div className="clinical-sec-title">Quick Prescription / Consultation Notes</div>
                  
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="diagnosis">Diagnosis / Clinical Impression</label>
                    <input 
                      type="text" 
                      id="diagnosis"
                      placeholder="e.g. Viral Fever / Acute Bronchitis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </div>

                  <form onSubmit={handleAddMedication} className="form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="medication">Prescribe Medicines</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        id="medication"
                        placeholder="Type medicine name (e.g. Paracetamol 500mg) and hit enter"
                        value={medicationInput}
                        onChange={(e) => setMedicationInput(e.target.value)}
                      />
                      <button type="submit" className="btn-action btn-action-approve" style={{ padding: '0 16px', height: '48px' }}>
                        Add
                      </button>
                    </div>
                    
                    {/* Medicine tags list */}
                    {medications.length > 0 && (
                      <div className="prescription-tag-container">
                        {medications.map((med, index) => (
                          <span key={index} className="prescription-tag-badge">
                            💊 {med}
                            <span className="prescription-tag-remove" onClick={() => handleRemoveMedication(index)}>&times;</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </form>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="notes">Clinical Notes</label>
                    <textarea 
                      id="notes"
                      rows="3"
                      placeholder="Clinical details, recommendation, precautions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="form-textarea"
                    ></textarea>
                  </div>

                  {/* Follow-up scheduler widget */}
                  <div className="clinical-sec-title">Follow-Up Scheduler</div>
                  <div className="form-grid-2" style={{ marginBottom: '24px' }}>
                    <div className="form-group">
                      <label htmlFor="followUpDate">Scheduled Date</label>
                      <input 
                        type="date" 
                        id="followUpDate"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="followUpPriority">Schedule Priority</label>
                      <select 
                        id="followUpPriority"
                        value={followUpPriority}
                        onChange={(e) => setFollowUpPriority(e.target.value)}
                        className="form-select"
                      >
                        <option value="Urgent">🔴 Urgent Follow-Up</option>
                        <option value="Standard">🟡 Standard Review</option>
                        <option value="Routine">🟢 Routine Check</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Consultation */}
                  <button 
                    onClick={handleCompleteConsultation}
                    className="btn-submit"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    Complete Consultation & Close File
                  </button>

                </div>
              )}
            </div>

            {/* Patient Clinical Summary Card & AI Diagnostics */}
            {activeConsultation && (
              <div className="clinical-card">
                <h3 className="section-title">Clinical Profile & AI Assistant</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <div className="clinical-sec-title">Reported Symptoms</div>
                  <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    "{activeConsultation.symptoms}"
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div className="clinical-sec-title">AI Clinical Intake Analyzer</div>
                  <p style={{ fontSize: '13.5px', color: '#047857', backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                    🤖 <strong>AI Summary:</strong> {getAISummary(activeConsultation.symptoms)}
                  </p>
                </div>

                {/* AI Assistant game-changer block */}
                <div className="ai-assistant-box">
                  <div className="ai-assistant-header">
                    <span>🧠 AI Diagnosis Co-Pilot</span>
                  </div>
                  
                  {!aiAnalysis ? (
                    <button 
                      onClick={handleAIAnalyze}
                      className="btn-ai-analyze"
                      disabled={aiAnalyzing}
                    >
                      {aiAnalyzing ? 'Analyzing Clinical Biomarkers...' : 'Run Diagnostics AI Analysis'}
                    </button>
                  ) : (
                    <div className="animate-fade-in" style={{ fontSize: '13px', color: '#065f46' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Suspected Diagnosis:</strong> {aiAnalysis.diagnosis}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Patient Risk Assessment:</strong> <span style={{ fontWeight: '700', color: aiAnalysis.risk.includes('CRITICAL') ? '#ef4444' : '#d97706' }}>{aiAnalysis.risk}</span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Suggested Specialty Department:</strong> {aiAnalysis.dept}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Recommended Diagnostics:</strong> {aiAnalysis.tests}
                      </div>
                      <button onClick={() => setAiAnalysis(null)} style={{ background: 'none', border: 'none', color: '#047857', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                        Reset Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Visit History Timeline */}
            {activeConsultation && (
              <div className="clinical-card">
                <h3 className="section-title">Patient Clinical History Timeline</h3>
                {patientTimeline.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                    No previous electronic health records found for this patient.
                  </p>
                ) : (
                  <div className="clinical-timeline">
                    {patientTimeline.map((item, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-date">{item.date}</div>
                        <div className="timeline-content">
                          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                            Diagnosis: {item.diagnosis}
                          </div>
                          <div style={{ color: '#475569', marginBottom: '6px' }}>
                            <strong>Notes:</strong> {item.notes}
                          </div>
                          {item.medications && item.medications.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                              <strong>Meds:</strong>
                              {item.medications.map((m, mIdx) => (
                                <span key={mIdx} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.followUp && item.followUp !== 'None' && (
                            <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                              🔄 Follow-up: {item.followUp}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Live queue list, advanced stats */}
          <div>
            
            {/* Live Queue manager list */}
            <div className="console-card" style={{ marginBottom: '24px' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #edf2f7' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Live Queue ({sortedQueue.length} Waiting)</h3>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedQueue.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13.5px', padding: '24px' }}>
                    No other approved patient requests waiting.
                  </p>
                ) : (
                  sortedQueue.map((appt, index) => {
                    const triage = getTriageLevel(appt.symptoms);
                    return (
                      <div 
                        key={appt.id} 
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #edf2f7',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
                              TOKEN #{appt.tokenNumber || 'N/A'}
                            </span>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                              {appt.patientName}
                            </h4>
                          </div>
                          
                          {/* Triage level tag */}
                          <span className={`triage-badge triage-${triage.color}`}>
                            {triage.text}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px' }}>
                          <span>👤 Age: {appt.age} ({appt.gender})</span>
                          <span>📍 {appt.hospital}</span>
                        </div>

                        {/* Queue control actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          
                          {/* Reordering indicators */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              onClick={() => handleMoveUp(appt.id)}
                              className="btn-action"
                              style={{ padding: '4px 8px', background: '#f1f5f9', color: '#475569' }}
                              disabled={index === 0}
                              title="Move Up Queue"
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => handleMoveDown(appt.id)}
                              className="btn-action"
                              style={{ padding: '4px 8px', background: '#f1f5f9', color: '#475569' }}
                              disabled={index === sortedQueue.length - 1}
                              title="Move Down Queue"
                            >
                              ▼
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleSkipPatient(appt.id)}
                              className="btn-action"
                              style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569' }}
                            >
                              Skip
                            </button>
                            <button 
                              onClick={() => handleCallPatient(appt)}
                              className="btn-action btn-action-approve"
                              style={{ backgroundColor: '#10b981', color: 'white' }}
                            >
                              Call
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Advanced Stats analytics panel */}
            <div className="console-card" style={{ padding: '24px 20px' }}>
              <h3 className="section-title">Advanced Performance Stats</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Facility productivity metrics today</p>
              
              <div className="adv-stats-grid">
                <div className="adv-stat-card">
                  <span className="adv-stat-label">Avg Consult Time</span>
                  <div className="adv-stat-value">{formatAvgTime(avgTimeSec)}</div>
                </div>
                <div className="adv-stat-card">
                  <span className="adv-stat-label">Patients/Hour</span>
                  <div className="adv-stat-value">{(totalTreated > 0 ? (totalTreated / 1.5).toFixed(1) : '0.0')}</div>
                </div>
                <div className="adv-stat-card">
                  <span className="adv-stat-label">Emergency % Today</span>
                  <div className="adv-stat-value">{emergencyPct}%</div>
                </div>
                <div className="adv-stat-card">
                  <span className="adv-stat-label">Queue Delay Alert</span>
                  <div className="adv-stat-value" style={{ color: avgTimeSec > 600 ? '#ef4444' : '#10b981' }}>
                    {avgTimeSec > 600 ? '⚠️ High' : '🟢 Low'}
                  </div>
                </div>
              </div>

              {/* Load Trend widget mockup */}
              <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span className="adv-stat-label" style={{ display: 'block', marginBottom: '8px' }}>Hourly Queue Load Trend</span>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '40px', gap: '8px', padding: '4px 0' }}>
                  <div style={{ height: '30%', width: '100%', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
                  <div style={{ height: '60%', width: '100%', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
                  <div style={{ height: '80%', width: '100%', backgroundColor: '#a7f3d0', borderRadius: '2px' }}></div>
                  <div style={{ height: '100%', width: '100%', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                  <div style={{ height: '40%', width: '100%', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>09:00 AM</span>
                  <span>12:00 PM</span>
                  <span>03:00 PM</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Real-time Alerts Stack bottom right */}
      {alerts.length > 0 && (
        <div className="alert-toast-container">
          {alerts.map(a => (
            <div key={a.id} className="alert-toast-item animate-fade-in">
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{a.msg}</span>
              <button className="alert-toast-close" onClick={() => setAlerts(prev => prev.filter(al => al.id !== a.id))}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
