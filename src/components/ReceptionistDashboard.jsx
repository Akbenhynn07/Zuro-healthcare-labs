import React, { useState, useEffect } from 'react';
import { sendWhatsAppMessage } from '../utils/whatsapp';

// Hardcoded initial data for doctors, clinics, payments, alerts, audit logs, and communications
const INITIAL_DOCTORS = [
  { id: 'doc-1', name: 'Dr. Rajesh Kumar', spec: 'Cardiology', schedule: 'Mon-Fri 09:00 - 17:00', branch: 'Apex Heart & Vascular', status: 'ACTIVE', performance: '94% rating (42 patients/wk)' },
  { id: 'doc-2', name: 'Dr. Priya Patel', spec: 'Pediatrics', schedule: 'Mon-Wed 08:00 - 14:00', branch: 'St. Michael Pediatrics', status: 'ACTIVE', performance: '98% rating (38 patients/wk)' },
  { id: 'doc-3', name: 'Dr. Amit Verma', spec: 'General Medicine', schedule: 'Tue-Sat 10:00 - 18:00', branch: 'Zuro Central Clinic', status: 'ACTIVE', performance: '89% rating (50 patients/wk)' },
  { id: 'doc-4', name: 'Dr. Sarah Collins', spec: 'Multi-Specialty', schedule: 'Thu-Sun 09:00 - 16:00', branch: 'City General Hospital', status: 'INACTIVE', performance: 'N/A' }
];

const INITIAL_BRANCHES = [
  { id: 'br-1', name: 'Zuro Central Clinic', location: 'City Center', activeDoctors: 2, volume: 'Low' },
  { id: 'br-2', name: 'City General Hospital', location: 'Metro Plaza', activeDoctors: 4, volume: 'High' },
  { id: 'br-3', name: 'St. Michael Pediatrics', location: 'Greenwood Valley', activeDoctors: 1, volume: 'Moderate' },
  { id: 'br-4', name: 'Apex Heart & Vascular', location: 'Downtown Tech Park', activeDoctors: 1, volume: 'Moderate' }
];

const INITIAL_PAYMENTS = [
  { id: 'pay-1', patient: 'Amit Verma', amount: 500, date: '2026-05-22', status: 'PAID', doctor: 'Dr. Rajesh Kumar', dept: 'Cardiology' },
  { id: 'pay-2', patient: 'Rohit Sharma', amount: 350, date: '2026-05-22', status: 'PENDING', doctor: 'Dr. Amit Verma', dept: 'General Medicine' },
  { id: 'pay-3', patient: 'Sunita Rao', amount: 800, date: '2026-05-21', status: 'PAID', doctor: 'Dr. Priya Patel', dept: 'Pediatrics' },
  { id: 'pay-4', patient: 'Karan Singh', amount: 450, date: '2026-05-20', status: 'UNPAID', doctor: 'Dr. Sarah Collins', dept: 'Multi-Specialty' }
];

const INITIAL_COMMS = [
  { id: 'com-1', time: '14:32', phone: '+91 98765 43210', channel: 'WhatsApp', msg: 'Your appointment request has been confirmed for 2026-05-25.', status: 'SENT' },
  { id: 'com-2', time: '14:33', phone: '+91 98765 43210', channel: 'SMS', msg: 'Reminder: Scheduled consultation on Monday at 10:00 AM.', status: 'DELIVERED' },
  { id: 'com-3', time: '15:05', phone: '+91 87654 32109', channel: 'WhatsApp', msg: 'System Alert: Doctor running late by 15m.', status: 'READ' }
];

const INITIAL_AUDITS = [
  { id: 'aud-1', time: '14:20:05', user: 'Staff Admin', action: 'Approved appointment request for Amit Verma' },
  { id: 'aud-2', time: '14:20:10', user: 'Staff Admin', action: 'Assigned Token #105 to Amit Verma' },
  { id: 'aud-3', time: '14:30:15', user: 'Staff Admin', action: 'Activated account for user: Dr. Priya Patel' },
  { id: 'aud-4', time: '15:10:12', user: 'Staff Admin', action: 'Updated schedule for Zuro Central Clinic' }
];

export default function ReceptionistDashboard({ user, onLogout }) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'users' | 'analytics' | 'finance' | 'comms' | 'security'
  
  // Database States
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState(INITIAL_DOCTORS);
  const [branchesList, setBranchesList] = useState(INITIAL_BRANCHES);
  const [paymentsList, setPaymentsList] = useState(INITIAL_PAYMENTS);
  const [commsList, setCommsList] = useState(INITIAL_COMMS);
  const [auditsList, setAuditsList] = useState(INITIAL_AUDITS);
  
  // Selection and Bulk states
  const [selectedApptIds, setSelectedApptIds] = useState([]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Forms & Modal states
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', spec: 'General Medicine', schedule: '', branch: 'Zuro Central Clinic' });
  const [showRescheduleId, setShowRescheduleId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  // Floating notifications
  const [alerts, setAlerts] = useState([]);

  // Auto polling from localStorage to simulate real-time database sync
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

  // Push audit log helper
  const addAuditLog = (actionText) => {
    const newLog = {
      id: 'aud_' + Date.now(),
      time: new Date().toTimeString().split(' ')[0],
      user: 'Staff Admin',
      action: actionText
    };
    setAuditsList(prev => [newLog, ...prev]);
  };

  // Trigger floating alert toast helper
  const triggerAlert = (message) => {
    const newAlert = { id: Date.now(), msg: message };
    setAlerts(prev => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 5000);
  };

  // 1. Queue Operations (Approve, Reject, Override)
  const handleApprove = (id, autoToken = '') => {
    const token = autoToken || Math.floor(Math.random() * 200 + 100).toString();
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        addAuditLog(`Approved appointment for ${appt.patientName} & assigned Token #${token}`);
        triggerAlert(`Approved appointment for ${appt.patientName}. Token: #${token}`);

        // Find branch location for WhatsApp message details
        const branch = branchesList.find(b => b.name === appt.hospital) || { location: 'Main Clinic Area' };

        // Trigger WhatsApp notification asynchronously
        sendWhatsAppMessage(
          appt.patientPhone,
          `Hello ${appt.patientName},\n\nYour appointment at *${appt.hospital}* is CONFIRMED!\n\n📋 *Token Number*: #${token}\n📍 *Location*: ${branch.location}\n⏰ *Slot Timing*: ${appt.date} at ${appt.time}\n\nPlease arrive 10 minutes prior to your slot. Thank you for choosing Zuro Labs.`
        ).catch(err => console.error('Failed to send WhatsApp:', err));

        return { ...appt, status: 'APPROVED', tokenNumber: token };
      }
      return appt;
    });
    saveAppointments(updated);
  };

  const handleReject = (id) => {
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        addAuditLog(`Declined appointment request for ${appt.patientName}`);
        triggerAlert(`Declined appointment request for ${appt.patientName}`);
        return { ...appt, status: 'CANCELLED' };
      }
      return appt;
    });
    saveAppointments(updated);
  };

  const handleReschedule = (id) => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please specify date and time.');
      return;
    }
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        addAuditLog(`Rescheduled appointment for ${appt.patientName} to ${rescheduleData.date} at ${rescheduleData.time}`);
        triggerAlert(`Rescheduled ${appt.patientName} to ${rescheduleData.date}`);
        return { ...appt, date: rescheduleData.date, time: rescheduleData.time };
      }
      return appt;
    });
    saveAppointments(updated);
    setShowRescheduleId(null);
    setRescheduleData({ date: '', time: '' });
  };

  // 2. Emergency Override bump to top
  const handleEmergencyOverride = (id) => {
    const list = [...appointments];
    const index = list.findIndex(a => a.id === id);
    if (index > -1) {
      const item = list.splice(index, 1)[0];
      // Bump symptoms to include high risk triggers
      item.symptoms = `⚠️ EMERGENCY OVERRIDE: ${item.symptoms}`;
      // Put at start
      const updated = [item, ...list];
      saveAppointments(updated);
      addAuditLog(`🚨 EMERGENCY OVERRIDE: Promoted ${item.patientName} to the top of the queue`);
      triggerAlert(`Emergency Override activated for ${item.patientName}. Promoted to top.`);
      
      // Log notification outbox
      const newComm = {
        id: 'com_' + Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        phone: item.patientPhone,
        channel: 'WhatsApp',
        msg: `🚨 Emergency Alert: Dr. Rajesh Kumar notified. Please proceed to triage room.`,
        status: 'SENT'
      };
      setCommsList(prev => [newComm, ...prev]);
    }
  };

  // 3. Bulk Actions
  const handleBulkSelect = (id) => {
    setSelectedApptIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (selectedApptIds.length === 0) return;
    let tokenSeq = 200;
    const updated = appointments.map(appt => {
      if (selectedApptIds.includes(appt.id) && appt.status === 'PENDING') {
        tokenSeq++;
        addAuditLog(`Bulk Approved ${appt.patientName} (Token #${tokenSeq})`);

        const branch = branchesList.find(b => b.name === appt.hospital) || { location: 'Main Clinic Area' };

        sendWhatsAppMessage(
          appt.patientPhone,
          `Hello ${appt.patientName},\n\nYour appointment at *${appt.hospital}* is CONFIRMED!\n\n📋 *Token Number*: #${tokenSeq}\n📍 *Location*: ${branch.location}\n⏰ *Slot Timing*: ${appt.date} at ${appt.time}\n\nPlease arrive 10 minutes prior to your slot. Thank you for choosing Zuro Labs.`
        ).catch(err => console.error('Failed to send WhatsApp:', err));

        return { ...appt, status: 'APPROVED', tokenNumber: tokenSeq.toString() };
      }
      return appt;
    });
    saveAppointments(updated);
    triggerAlert(`Bulk approved ${selectedApptIds.length} requests successfully.`);
    setSelectedApptIds([]);
  };

  const handleBulkReassign = () => {
    if (selectedApptIds.length === 0) return;
    // Reassign all selected to Dr. Amit Verma (General Medicine)
    const updated = appointments.map(appt => {
      if (selectedApptIds.includes(appt.id)) {
        addAuditLog(`Reassigned ${appt.patientName} to Dr. Amit Verma`);
        return { ...appt, hospital: 'Zuro Central Clinic' };
      }
      return appt;
    });
    saveAppointments(updated);
    triggerAlert(`Reassigned ${selectedApptIds.length} appointments to Zuro Central Clinic.`);
    setSelectedApptIds([]);
  };

  // 4. Delay Notifications Transmitter
  const handleSendDelayNotification = (doctorName, minutes) => {
    addAuditLog(`Sent delay notification: ${doctorName} running late by ${minutes}m`);
    triggerAlert(`WhatsApp & SMS delay alerts sent to patients of ${doctorName}.`);
    
    // Append communications logs
    const activeAppts = appointments.filter(a => a.status === 'APPROVED');
    const newComms = activeAppts.map(appt => ({
      id: 'com_' + Math.random(),
      time: new Date().toTimeString().split(' ')[0],
      phone: appt.patientPhone,
      channel: 'WhatsApp',
      msg: `⚠️ Notice: ${doctorName} is running ${minutes}m late due to emergency workload. Average wait extended.`,
      status: 'SENT'
    }));
    setCommsList(prev => [...newComms, ...prev]);
  };

  // 5. User / Account Control Panel
  const handleToggleDocStatus = (id) => {
    const updated = doctorsList.map(doc => {
      if (doc.id === id) {
        const nextStatus = doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        addAuditLog(`Toggled doctor account status: ${doc.name} set to ${nextStatus}`);
        triggerAlert(`Account for ${doc.name} is now ${nextStatus}`);
        return { ...doc, status: nextStatus };
      }
      return doc;
    });
    setDoctorsList(updated);
  };

  const handleAddDoctorSubmit = (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.schedule) {
      alert('Please fill out Name and Schedule.');
      return;
    }
    const docItem = {
      id: 'doc_' + Date.now(),
      name: newDoctor.name,
      spec: newDoctor.spec,
      schedule: newDoctor.schedule,
      branch: newDoctor.branch,
      status: 'ACTIVE',
      performance: '100% rating (0 patients/wk)'
    };
    setDoctorsList([...doctorsList, docItem]);
    addAuditLog(`Registered new doctor: ${newDoctor.name} (${newDoctor.spec})`);
    triggerAlert(`Registered ${newDoctor.name} to branch database.`);
    setShowDocModal(false);
    setNewDoctor({ name: '', spec: 'General Medicine', schedule: '', branch: 'Zuro Central Clinic' });
  };

  // Filters calculation
  const filteredAppointments = appointments.filter(appt => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = appt.patientName.toLowerCase().includes(query) || appt.patientPhone.includes(query);
    const matchesDoctor = filterDoctor ? appt.hospital.includes(filterDoctor) || appt.symptoms.includes(filterDoctor) : true;
    const matchesHospital = filterHospital ? appt.hospital === filterHospital : true;
    const matchesStatus = filterStatus ? appt.status === filterStatus : true;
    return matchesSearch && matchesDoctor && matchesHospital && matchesStatus;
  });

  // Financial analytics indicators
  const totalRevenue = paymentsList.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = paymentsList.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
  const unpaidRevenue = paymentsList.filter(p => p.status === 'UNPAID').reduce((acc, curr) => acc + curr.amount, 0);

  // Status distributions
  const statsPending = appointments.filter(a => a.status === 'PENDING').length;
  const statsApproved = appointments.filter(a => a.status === 'APPROVED').length;
  const statsCompleted = appointments.filter(a => a.status === 'COMPLETED').length;
  const statsCancelled = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div className="dashboard-container animate-fade-in" style={{ '--primary': '#6366f1' }}>
      
      {/* Sidebar navigation */}
      <aside className="dashboard-sidebar" style={{ borderRight: '1.5px solid #eef2f6' }}>
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo" style={{ backgroundColor: 'transparent', padding: 0, overflow: 'hidden' }}>
              <img src="/Zuro_logo.png" alt="Zuro Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h2>Hospital OS</h2>
          </div>

          <div className="sidebar-menu">
            <span className="sidebar-menu-title">Operations Console</span>
            <button className={`sidebar-menu-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
              ⏳ Queue Monitor
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              👥 System & Users
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              📈 Analytics Insights
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
              💰 Finance & Billing
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'comms' ? 'active' : ''}`} onClick={() => setActiveTab('comms')}>
              💬 Communication Logs
            </button>
            <button className={`sidebar-menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              🔒 Security Audit
            </button>
          </div>
        </div>

        <div>
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              A
            </div>
            <div className="profile-info">
              <span className="profile-name">Staff Admin</span>
              <span className="profile-role">Super Administrator</span>
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
            <h1>Hospital Control Room</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Logged in: <strong>Super Administrator Console</strong> (Live sync active)
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            {statsPending > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{statsPending}</span>
            )}
          </div>
        </div>

        {/* 1. Queue Monitoring Tab */}
        {activeTab === 'queue' && (
          <div className="animate-fade-in">
            
            {/* AI Insights Co-pilot banner */}
            <div className="ai-insights-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#312e81', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>
                <span>🧠 AI Operations Co-Pilot Insights</span>
              </div>
              <div className="ai-insight-card-item">
                <div className="ai-insight-title-row">
                  <span>📈 Load Forecast Warning</span>
                </div>
                High volume anticipated between <strong>03:00 PM - 05:00 PM today</strong> (+35% increase based on emergency patterns). Recommend opening an extra consultation slot.
              </div>
              {statsPending > 2 && (
                <div className="ai-insight-card-item" style={{ borderLeft: '3px solid #ef4444' }}>
                  <div className="ai-insight-title-row" style={{ color: '#991b1b' }}>
                    <span>⚠️ Bottleneck Warning</span>
                  </div>
                  Doctor Workload imbalance detected. Clinic queue delay of 18m identified. Suggest re-routing pending cases to General Medicine.
                </div>
              )}
            </div>

            {/* Quick stats delay triggers */}
            <section className="console-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 className="section-title">Delay Notifications Transmitters</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Send instant delay SMS alerts to patients booked under specific clinics</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-action" style={{ background: '#fef3c7', color: '#d97706' }} onClick={() => handleSendDelayNotification('Dr. Rajesh Kumar (Apex Heart)', 15)}>
                  📢 Rajesh Kumar running 15m late
                </button>
                <button className="btn-action" style={{ background: '#fef3c7', color: '#d97706' }} onClick={() => handleSendDelayNotification('Dr. Priya Patel (Pediatrics)', 30)}>
                  📢 Priya Patel running 30m late
                </button>
                <button className="btn-action" style={{ background: '#fee2e2', color: '#dc2626' }} onClick={() => handleSendDelayNotification('Zuro Central Clinic (All Doctors)', 45)}>
                  🚨 Clinic Emergency Delay Alert (45m)
                </button>
              </div>
            </section>

            {/* Filter controls */}
            <section className="filter-action-bar">
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search patient name or phone number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select value={filterHospital} onChange={(e) => setFilterHospital(e.target.value)} className="form-select" style={{ width: '180px', height: '42px', padding: '0 12px' }}>
                  <option value="">All Branch Clinics</option>
                  <option value="Zuro Central Clinic">Zuro Central Clinic</option>
                  <option value="City General Hospital">City General Hospital</option>
                  <option value="St. Michael Pediatrics">St. Michael Pediatrics</option>
                  <option value="Apex Heart & Vascular">Apex Heart & Vascular</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select" style={{ width: '150px', height: '42px', padding: '0 12px' }}>
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </section>

            {/* Bulk actions control bar */}
            {selectedApptIds.length > 0 && (
              <div className="bulk-actions-toolbar">
                <span style={{ fontSize: '13.5px', color: '#1e3a8a', fontWeight: '700' }}>
                  Selected: <strong>{selectedApptIds.length}</strong> items
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-action btn-action-approve" style={{ padding: '8px 16px' }} onClick={handleBulkApprove}>
                    Bulk Approve Selection
                  </button>
                  <button className="btn-action" style={{ padding: '8px 16px', background: '#bfdbfe', color: '#1e3a8a' }} onClick={handleBulkReassign}>
                    Bulk Reassign Clinic
                  </button>
                  <button className="btn-action btn-action-cancel" style={{ padding: '8px 16px' }} onClick={() => setSelectedApptIds([])}>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Queue Table */}
            <section className="console-card">
              <div className="table-wrapper">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedApptIds.length === filteredAppointments.length && filteredAppointments.length > 0}
                          onChange={() => {
                            if (selectedApptIds.length === filteredAppointments.length) {
                              setSelectedApptIds([]);
                            } else {
                              setSelectedApptIds(filteredAppointments.map(a => a.id));
                            }
                          }}
                        />
                      </th>
                      <th>Patient Details</th>
                      <th>Clinic Location</th>
                      <th>Demographics</th>
                      <th>Symptoms & Risk</th>
                      <th>Status / Token</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(appt => {
                        const isChronic = appt.age > 60 || appt.symptoms.toLowerCase().includes('heart') || appt.symptoms.toLowerCase().includes('breathing');
                        return (
                          <tr key={appt.id} style={{ backgroundColor: isChronic ? '#fefcbf' : '' }}>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={selectedApptIds.includes(appt.id)} 
                                onChange={() => handleBulkSelect(appt.id)}
                              />
                            </td>
                            <td>
                              <div className="table-patient-cell">
                                <span className="table-patient-name">{appt.patientName}</span>
                                <span className="table-patient-phone">{appt.patientPhone}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: '600' }}>{appt.hospital}</span>
                            </td>
                            <td>
                              <div style={{ fontSize: '12.5px' }}>
                                Age: <strong>{appt.age}</strong> ({appt.gender})
                              </div>
                            </td>
                            <td>
                              <div style={{ maxWidth: '240px' }}>
                                <p style={{ fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {appt.symptoms}
                                </p>
                                {isChronic && (
                                  <span style={{ fontSize: '9px', fontWeight: '700', backgroundColor: '#c53030', color: 'white', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                    🧬 CHRONIC / RISK
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className={`badge-status badge-${appt.status.toLowerCase()}`}>
                                  {appt.status} {appt.tokenNumber && `(#${appt.tokenNumber})`}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                
                                {appt.status === 'PENDING' && (
                                  <>
                                    <button onClick={() => handleApprove(appt.id)} className="btn-action btn-action-approve" style={{ fontSize: '11px', padding: '6px 10px' }}>
                                      Approve
                                    </button>
                                    <button onClick={() => setShowRescheduleId(appt.id)} className="btn-action" style={{ fontSize: '11px', padding: '6px 10px', background: '#e2e8f0', color: '#475569' }}>
                                      Reschedule
                                    </button>
                                    <button onClick={() => handleReject(appt.id)} className="btn-action btn-action-cancel" style={{ fontSize: '11px', padding: '6px 10px' }}>
                                      Decline
                                    </button>
                                  </>
                                )}

                                {appt.status === 'APPROVED' && (
                                  <button onClick={() => handleEmergencyOverride(appt.id)} className="btn-action btn-action-cancel" style={{ fontSize: '11px', padding: '6px 10px', background: '#fee2e2', color: '#c53030', borderColor: '#fca5a5' }}>
                                    🚨 Promote Emergency
                                  </button>
                                )}

                                {showRescheduleId === appt.id && (
                                  <div style={{
                                    position: 'absolute',
                                    right: '20px',
                                    background: 'white',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    zIndex: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                  }}>
                                    <input 
                                      type="date" 
                                      value={rescheduleData.date}
                                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                      style={{ height: '32px', fontSize: '12px' }}
                                    />
                                    <input 
                                      type="time" 
                                      value={rescheduleData.time}
                                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                      style={{ height: '32px', fontSize: '12px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button onClick={() => handleReschedule(appt.id)} className="btn-action btn-action-approve" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                        Confirm
                                      </button>
                                      <button onClick={() => setShowRescheduleId(null)} className="btn-action btn-action-cancel" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* 2. System and Users Control Tab */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <section className="console-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>System Users Directory</h3>
                <button className="btn-submit" style={{ maxWidth: '180px' }} onClick={() => setShowDocModal(true)}>
                  ➕ Add New Doctor
                </button>
              </div>

              <div className="table-wrapper">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Specialization</th>
                      <th>Clinic Location</th>
                      <th>Availability / Schedule</th>
                      <th>Performance</th>
                      <th>Status Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map(doc => (
                      <tr key={doc.id}>
                        <td>
                          <strong style={{ color: '#1e293b' }}>{doc.name}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b' }}>
                            Doctor
                          </span>
                        </td>
                        <td>{doc.spec}</td>
                        <td>{doc.branch}</td>
                        <td>{doc.schedule}</td>
                        <td style={{ color: '#059669', fontWeight: '600' }}>{doc.performance}</td>
                        <td>
                          <span 
                            className={`status-pill-toggle ${doc.status === 'ACTIVE' ? 'status-pill-active' : 'status-pill-deactive'}`}
                            onClick={() => handleToggleDocStatus(doc.id)}
                          >
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Branch Locations control list */}
            <section className="console-card" style={{ padding: '24px' }}>
              <h3 className="section-title">Multi-Hospital Clinics & Branches Control</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Manage clinic locations and trace active load volumes</p>
              
              <div className="branch-grid">
                {branchesList.map(b => (
                  <div key={b.id} className="branch-card">
                    <span style={{ fontSize: '24px' }}>🏥</span>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '12px' }}>{b.name}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>📍 Location: {b.location}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '12px', fontSize: '12.5px' }}>
                      <span>Doctors: <strong>{b.activeDoctors}</strong></span>
                      <span style={{ 
                        color: b.volume === 'High' ? '#ef4444' : b.volume === 'Moderate' ? '#f59e0b' : '#10b981', 
                        fontWeight: '700' 
                      }}>
                        Load: {b.volume}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 3. Analytics insights Tab */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <section className="stat-summary-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card">
                <span className="stat-card-title">Appointments/Week</span>
                <span className="stat-card-value">{appointments.length + 24}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">Average Wait Time</span>
                <span className="stat-card-value">14 mins</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-title">Doctor Workload Ratio</span>
                <span className="stat-card-value">72%</span>
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Line chart widget */}
              <div className="chart-card-wrapper">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Weekly Appointment Trends</h3>
                <p style={{ fontSize: '11.5px', color: '#64748b' }}>Daily consultation volume tracking</p>
                
                <div className="line-chart-simulation">
                  <svg viewBox="0 0 500 150">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    {/* Line Chart path */}
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3.5"
                      points="10,120 100,75 200,90 300,45 400,105 490,60"
                    />
                    {/* Chart Dots */}
                    <circle cx="10" cy="120" r="5" fill="#4f46e5" />
                    <circle cx="100" cy="75" r="5" fill="#4f46e5" />
                    <circle cx="200" cy="90" r="5" fill="#4f46e5" />
                    <circle cx="300" cy="45" r="5" fill="#4f46e5" />
                    <circle cx="400" cy="105" r="5" fill="#4f46e5" />
                    <circle cx="490" cy="60" r="5" fill="#4f46e5" />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '8px', padding: '0 8px' }}>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                </div>
              </div>

              {/* Bar chart and Distribution */}
              <div className="chart-card-wrapper">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Doctor Workload Analysis</h3>
                <p style={{ fontSize: '11.5px', color: '#64748b' }}>Assigned clinical slots ratio</p>
                
                <div className="custom-chart-flex">
                  <div className="chart-bar-item">
                    <div className="chart-bar-fill" style={{ height: '70%' }}>
                      <span className="chart-bar-value">70%</span>
                    </div>
                    <span className="chart-bar-label">Dr. Rajesh</span>
                  </div>
                  <div className="chart-bar-item">
                    <div className="chart-bar-fill chart-bar-fill-alt" style={{ height: '85%' }}>
                      <span className="chart-bar-value">85%</span>
                    </div>
                    <span className="chart-bar-label">Dr. Priya</span>
                  </div>
                  <div className="chart-bar-item">
                    <div className="chart-bar-fill" style={{ height: '40%' }}>
                      <span className="chart-bar-value">40%</span>
                    </div>
                    <span className="chart-bar-label">Dr. Amit</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Critical performance metrics insights panel */}
            <section className="console-card" style={{ padding: '24px', marginTop: '24px' }}>
              <h3 className="section-title">Critical System Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>% Emergency Cases</span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444', marginTop: '6px' }}>24%</div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Patients flagged with high-severity triage triggers</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Drop-off Rate</span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>12%</div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Cancelled appointment ratios over 7 days</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>No-show Rate</span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#0369a1', marginTop: '6px' }}>4%</div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Patients failing to complete approved schedules</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 4. Billing and Revenue Tab */}
        {activeTab === 'finance' && (
          <div className="animate-fade-in">
            <section className="stat-summary-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                <span className="stat-card-title">Daily Revenue</span>
                <span className="stat-card-value">₹{totalRevenue}</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <span className="stat-card-title">Pending Billing</span>
                <span className="stat-card-value">₹{pendingRevenue}</span>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="stat-card-title">Unpaid Billings</span>
                <span className="stat-card-value">₹{unpaidRevenue}</span>
              </div>
            </section>

            <section className="console-card" style={{ padding: '24px' }}>
              <h3 className="section-title">Payments and Invoices ledger</h3>
              <div className="table-wrapper">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Patient</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Department</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.map(pay => (
                      <tr key={pay.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{pay.id}</span>
                        </td>
                        <td>{pay.patient}</td>
                        <td style={{ fontWeight: '700' }}>₹{pay.amount}</td>
                        <td>{pay.date}</td>
                        <td>{pay.dept}</td>
                        <td>{pay.doctor}</td>
                        <td>
                          <span className={`badge-status badge-${pay.status.toLowerCase()}`}>
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* 5. Communications logs Tab */}
        {activeTab === 'comms' && (
          <div className="animate-fade-in">
            <section className="console-card" style={{ padding: '24px' }}>
              <h3 className="section-title">Outbound Alerts & Reminders Logs</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>WhatsApp and SMS transaction outbox metrics</p>
              
              <div className="table-wrapper">
                <table className="console-table">
                  <thead>
                    <tr>
                      <th>Time Sent</th>
                      <th>Channel</th>
                      <th>Recipient Mobile</th>
                      <th>Message Content</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commsList.map(com => (
                      <tr key={com.id}>
                        <td>{com.time}</td>
                        <td>
                          <strong style={{ color: '#0369a1' }}>{com.channel}</strong>
                        </td>
                        <td>{com.phone}</td>
                        <td style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {com.msg}
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            backgroundColor: com.status === 'READ' ? '#d1fae5' : '#f1f5f9', 
                            color: com.status === 'READ' ? '#065f46' : '#64748b', 
                            padding: '3px 8px', 
                            borderRadius: '8px' 
                          }}>
                            {com.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* 6. Security Audit logs Tab */}
        {activeTab === 'security' && (
          <div className="animate-fade-in">
            <section className="console-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="section-title">Operations Security Audit Trails</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>Chronological logging of administrative configuration alterations</p>
              
              <div className="audit-list">
                {auditsList.map(log => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-meta">
                      <span className="audit-action-text">{log.action}</span>
                      <span className="audit-timestamp">Operator: {log.user}</span>
                    </div>
                    <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#94a3b8' }}>
                      ⏰ {log.time}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Account access logs */}
            <section className="console-card" style={{ padding: '24px' }}>
              <h3 className="section-title">System Access History</h3>
              <div className="audit-list">
                <div className="audit-item" style={{ borderLeft: '3px solid #10b981' }}>
                  <div className="audit-meta">
                    <span className="audit-action-text">Authorized Administrator login successful</span>
                    <span className="audit-timestamp">IP: 192.168.1.105 (Mac OS Safari)</span>
                  </div>
                  <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#94a3b8' }}>15:23:05</span>
                </div>
                <div className="audit-item" style={{ borderLeft: '3px solid #10b981' }}>
                  <div className="audit-meta">
                    <span className="audit-action-text">Authorized Doctor login successful (Dr. Rajesh Kumar)</span>
                    <span className="audit-timestamp">IP: 192.168.1.109 (Windows 11 Chrome)</span>
                  </div>
                  <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#94a3b8' }}>15:08:42</span>
                </div>
                <div className="audit-item" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="audit-meta">
                    <span className="audit-action-text">Session verification timeout - Auto logout triggered</span>
                    <span className="audit-timestamp">Operator: Front-desk Receptionist</span>
                  </div>
                  <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#94a3b8' }}>14:15:00</span>
                </div>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* Floating Alert Stack bottom-right */}
      {alerts.length > 0 && (
        <div className="alert-toast-container">
          {alerts.map(a => (
            <div key={a.id} className="alert-toast-item animate-fade-in" style={{ backgroundColor: '#0f172a' }}>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{a.msg}</span>
              <button className="alert-toast-close" onClick={() => setAlerts(prev => prev.filter(al => al.id !== a.id))}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add Doctor */}
      {showDocModal && (
        <div className="modal-backdrop" onClick={() => setShowDocModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Register New Clinical Doctor</span>
              <button className="modal-close" onClick={() => setShowDocModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddDoctorSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="docName">Doctor Name *</label>
                  <input 
                    type="text" 
                    id="docName"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="docSpec">Medical Specialty</label>
                    <select 
                      id="docSpec" 
                      value={newDoctor.spec} 
                      onChange={(e) => setNewDoctor({ ...newDoctor, spec: e.target.value })}
                      className="form-select"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Multi-Specialty">Multi-Specialty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="docBranch">Assigned Location Branch</label>
                    <select 
                      id="docBranch" 
                      value={newDoctor.branch} 
                      onChange={(e) => setNewDoctor({ ...newDoctor, branch: e.target.value })}
                      className="form-select"
                    >
                      <option value="Zuro Central Clinic">Zuro Central Clinic</option>
                      <option value="City General Hospital">City General Hospital</option>
                      <option value="St. Michael Pediatrics">St. Michael Pediatrics</option>
                      <option value="Apex Heart & Vascular">Apex Heart & Vascular</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="docSchedule">Weekly Shift Schedule *</label>
                  <input 
                    type="text" 
                    id="docSchedule"
                    placeholder="e.g. Mon-Fri 09:00 AM - 05:00 PM"
                    value={newDoctor.schedule}
                    onChange={(e) => setNewDoctor({ ...newDoctor, schedule: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-submit" style={{ backgroundColor: '#f1f5f9', color: '#475569', flex: 1 }} onClick={() => setShowDocModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" style={{ flex: 2 }}>
                    Add Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
