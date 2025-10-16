import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, MapPin, Phone, Stethoscope, 
  Share2, Plus, Settings, Save, Upload, Download, 
  Users, Mail, Filter, Menu, X, ChevronDown,
  FileUp, FileDown, Edit3, Trash2, Info, Search
} from 'lucide-react';

// Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BatchAppointmentSystem() {
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState({
    patientName: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    doctor: '',
    department: '',
    reason: '',
    specialInstructions: '',
  });

  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'MediCare General Hospital',
    address: '123 Healthcare Avenue, Ikeja, Lagos',
    phone: '+234 801 234 5678',
    logo: '',
    primaryColor: '#2563eb',
    secondaryColor: '#4f46e5',
  });

  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(hospitalInfo);
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showCSVInstructions, setShowCSVInstructions] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0, status: '' });

  const refreshAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').order('createdAt', { ascending: false });
    setAppointments(data || []);
  };

  // Fetch appointments from Supabase with realtime
  useEffect(() => {
    refreshAppointments();

    // Realtime subscription
    const channel = supabase.channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        refreshAppointments();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Fetch hospitalInfo from Supabase with realtime
  useEffect(() => {
    const fetchHospitalInfo = async () => {
      const { data } = await supabase.from('hospital_info').select('*').eq('id', 'info').single();
      if (data) setHospitalInfo(data);
    };
    fetchHospitalInfo();

    // Realtime subscription
    const channel = supabase.channel('hospital_info-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hospital_info' }, () => fetchHospitalInfo())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Sync tempSettings when hospitalInfo changes
  useEffect(() => {
    setTempSettings(hospitalInfo);
  }, [hospitalInfo]);

  // Normalize phone number to WhatsApp format
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // Handle different formats:
    // "08138983149" -> "2348138983149"
    // "2348138983149" -> "2348138983149"
    // "23408138983149" -> "2348138983149"
    
    if (digits.startsWith('0') && digits.length === 11) {
      // Local format: 08138983149 -> 2348138983149
      digits = '234' + digits.substring(1);
    } else if (digits.startsWith('2340') && digits.length === 14) {
      // Extra zero: 23408138983149 -> 2348138983149
      digits = '234' + digits.substring(4);
    }
    // If already in format 234XXXXXXXXXX (13 digits), keep as is
    
    return digits;
  };

  // Generate personalized message text
  const generateMessageText = (appointment) => {
    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const [hours, minutes] = appointment.appointmentTime.split(':');
    const timeObj = new Date(2000, 0, 1, hours, minutes);
    const formattedTime = timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const specialInstructionsSection = appointment.specialInstructions 
      ? `*Special Instructions:*\n${appointment.specialInstructions}\n`
      : '';

    return `
Dear ${appointment.patientName},

You have been scheduled for an appointment at *${hospitalInfo.name}*.

*Appointment Details:*
Date: ${formattedDate}
Time: ${formattedTime}
Doctor: ${appointment.doctor}
Department: ${appointment.department}
Reason: ${appointment.reason}

${specialInstructionsSection}
*Location:*
${hospitalInfo.address}

*Contact Us:*
${hospitalInfo.phone}

Please arrive 15 minutes before your scheduled time. If you need to reschedule, kindly contact us at least 24 hours in advance.

We look forward to seeing you and providing you with the best care!

Best regards,
${hospitalInfo.name} Team
    `.trim();
  };

  // Single appointment sharing
  const shareSingleAppointment = (appointment) => {
    const shareText = generateMessageText(appointment);
    const phoneNumber = normalizePhoneNumber(appointment.patientPhone);
    const windowName = `whatsapp_${appointment.id}_${Date.now()}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappURL, windowName);
  };

  // Handle CSV Import (add to Supabase)
  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('CSV file is empty or has no data rows');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const expectedHeaders = ['patientname', 'patientphone', 'appointmentdate', 'appointmenttime', 'doctor', 'department', 'reason', 'specialinstructions'];
        const isValidCSV = expectedHeaders.every(header => headers.includes(header));
        
        if (!isValidCSV) {
          alert('Invalid CSV format. Please use the template provided.');
          setShowCSVInstructions(true);
          return;
        }

        const newAppointments = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 8) continue;

          const appointment = {
            patientName: values[0] || '',
            patientPhone: values[1] || '',
            appointmentDate: values[2] || '',
            appointmentTime: values[3] || '',
            doctor: values[4] || '',
            department: values[5] || '',
            reason: values[6] || '',
            specialInstructions: values[7] || '',
            status: 'scheduled',
            createdAt: new Date().toISOString()
          };
          newAppointments.push(appointment);
        }
        
        // Bulk insert to Supabase
        const { error } = await supabase.from('appointments').insert(newAppointments);
        if (error) throw error;
        
        alert(`Successfully imported ${newAppointments.length} appointments`);
        
      } catch (error) {
        alert('Error reading CSV file or saving to database. Please check the format and try again.');
        console.error('CSV Import Error:', error);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  };

  // Export appointments as CSV
  const exportAppointments = () => {
    if (appointments.length === 0) {
      alert('No appointments to export');
      return;
    }

    const headers = ['PatientName', 'PatientPhone', 'AppointmentDate', 'AppointmentTime', 'Doctor', 'Department', 'Reason', 'SpecialInstructions'];
    const csvContent = [
      headers.join(','),
      ...appointments.map(apt => {
        // Format date
        const formattedDate = new Date(apt.appointmentDate).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        
        // Format time
        let formattedTime = apt.appointmentTime;
        if (apt.appointmentTime) {
          const [hours, minutes] = apt.appointmentTime.split(':');
          const timeObj = new Date(2000, 0, 1, hours, minutes);
          formattedTime = timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        
        return [
          `"${apt.patientName}"`,
          `"${apt.patientPhone}"`,
          `"${formattedDate}"`,
          `"${formattedTime}"`,
          `"${apt.doctor}"`,
          `"${apt.department}"`,
          `"${apt.reason}"`,
          `"${apt.specialInstructions}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Add single appointment
  const handleAddAppointment = async () => {
    if (!currentAppointment.patientName || !currentAppointment.appointmentDate) {
      alert('Please fill in patient name and appointment date');
      return;
    }

    const newAppointment = {
      ...currentAppointment,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('appointments').insert(newAppointment);
    if (error) {
      alert('Error adding appointment: ' + error.message);
      return;
    }

    // Reset form but stay on the same page
    setCurrentAppointment({
      patientName: '',
      patientPhone: '',
      appointmentDate: '',
      appointmentTime: '',
      doctor: '',
      department: '',
      reason: '',
      specialInstructions: '',
    });
    
    alert('Appointment added successfully! You can add another appointment.');
  };

  // Edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setCurrentAppointment(appointment);
    setView('add-appointment');
  };

  // Update appointment
  const handleUpdateAppointment = async () => {
    if (!currentAppointment.patientName || !currentAppointment.appointmentDate) {
      alert('Please fill in patient name and appointment date');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update(currentAppointment)
      .eq('id', editingAppointment.id);

    if (error) {
      alert('Error updating appointment: ' + error.message);
      return;
    }

    setEditingAppointment(null);
    setCurrentAppointment({
      patientName: '',
      patientPhone: '',
      appointmentDate: '',
      appointmentTime: '',
      doctor: '',
      department: '',
      reason: '',
      specialInstructions: '',
    });
    setView('dashboard');
    alert('Appointment updated successfully!');
  };

  // Delete appointment
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        alert('Error deleting appointment: ' + error.message);
        return;
      }
      setSelectedAppointments(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
      alert('Appointment deleted successfully!');
    }
  };

  // Bulk sharing: Generates improved HTML with better logs
  const handleBulkShare = () => {
    if (selectedAppointments.size === 0) {
      alert('Please select appointments to share');
      return;
    }

    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    
    if (selectedApts.length > 500) {
      if (!window.confirm(`You are about to generate an auto-sender for ${selectedApts.length} appointments. This may take time and could trigger WhatsApp limits if not paced properly. Continue?`)) {
        return;
      }
    }

    setBulkProgress({ sent: 0, total: selectedApts.length, status: 'Generating auto-sender...' });

    // Generate array of WhatsApp URLs with personalized messages
    const waLinks = selectedApts.map(appointment => {
      const shareText = generateMessageText(appointment);
      const phoneNumber = normalizePhoneNumber(appointment.patientPhone);
      return { url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`, patientName: appointment.patientName };
    });

    // Create HTML with enhanced JS
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Auto-Opener - ${hospitalInfo.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; max-width: 800px; margin: 0 auto; }
    h1 { color: #2563eb; }
    .instructions { background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7; }
    #controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
    button { padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    button:hover { background: #128C7E; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    #progress { font-weight: bold; margin-bottom: 20px; color: #d35400; }
    #log { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px; height: 300px; overflow-y: auto; white-space: pre-wrap; font-family: monospace; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>WhatsApp Auto-Opener for ${selectedApts.length} Appointments</h1>
  <div class="instructions">
    <p><strong>IMPORTANT NOTES:</strong></p>
    <ul>
      <li><strong>Login First:</strong> Open <a href="https://web.whatsapp.com" target="_blank">web.whatsapp.com</a> in another tab and scan the QR code with your WhatsApp app. Refresh if not connected.</li>
      <li><strong>No Auto-Send:</strong> This only OPENS pre-filled chats. You MUST manually click "Send" in each tab—WhatsApp blocks automation.</li>
      <li><strong>Delay:</strong> Use 10000-30000ms to avoid bans. Start small!</li>
      <li><strong>Troubleshooting:</strong> If tabs don't open: Disable popup blocker (browser settings). Check console (F12) for errors.</li>
      <li><strong>Progress:</strong> Watch the log below. Each open is logged with patient name.</li>
    </ul>
  </div>
  
  <div id="controls">
    <button id="checkConnection">Check WhatsApp Connection</button>
    <button id="startBtn">Start Opening Tabs</button>
    <button id="pauseBtn" disabled>Pause</button>
    <button id="resumeBtn" disabled>Resume</button>
    <label>Delay (ms): <input type="number" id="delayInput" value="15000" min="5000" step="1000"></label>
  </div>
  
  <div id="progress">Progress: 0 / ${selectedApts.length}</div>
  <div id="log">Ready. Click 'Check WhatsApp Connection' first!\n</div>

  <script>
    const links = ${JSON.stringify(waLinks)};
    let currentIndex = 0;
    let intervalId = null;
    let isPaused = false;

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const delayInput = document.getElementById('delayInput');
    const progress = document.getElementById('progress');
    const log = document.getElementById('log');
    const checkConnection = document.getElementById('checkConnection');

    function updateProgress() {
      progress.textContent = \`Progress: \${currentIndex} / \${links.length} tabs opened\`;
    }

    function appendLog(message, isError = false) {
      const timestamp = new Date().toLocaleTimeString();
      log.textContent += \`\${timestamp} - \${message}\${isError ? ' (ERROR)' : ''}\\n\`;
      log.scrollTop = log.scrollHeight;
    }

    function sendNext() {
      if (currentIndex >= links.length || isPaused) return;

      const item = links[currentIndex];
      const win = window.open(item.url, '_blank');
      if (win) {
        appendLog(\`Opened tab for \${item.patientName || 'Patient ' + (currentIndex + 1)}\`);
      } else {
        appendLog('Failed to open tab - popup blocked?', true);
      }
      currentIndex++;
      updateProgress();

      if (currentIndex >= links.length) {
        appendLog('All tabs opened! Now manually send in each.');
        clearInterval(intervalId);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
      }
    }

    checkConnection.addEventListener('click', () => {
      const testWin = window.open('https://web.whatsapp.com', '_blank');
      if (testWin) {
        appendLog('Test tab opened - check if WhatsApp Web is logged in there.');
      } else {
        appendLog('Popup blocked - allow popups in browser settings.', true);
      }
    });

    startBtn.addEventListener('click', () => {
      if (currentIndex >= links.length) {
        currentIndex = 0;
        updateProgress();
        appendLog('Resetting...');
      }
      const delay = parseInt(delayInput.value) || 15000;
      if (delay < 5000) {
        appendLog('Delay too low - increased to 5000ms for safety.', true);
        delayInput.value = 5000;
      }
      intervalId = setInterval(sendNext, delay);
      appendLog(\`Started opening with \${delay}ms delay. Manually send in tabs!\`);
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
      isPaused = false;
    });

    pauseBtn.addEventListener('click', () => {
      isPaused = true;
      clearInterval(intervalId);
      appendLog('Paused - resume or close tabs.');
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resumeBtn.disabled = false;
    });

    resumeBtn.addEventListener('click', () => {
      const delay = parseInt(delayInput.value) || 15000;
      intervalId = setInterval(sendNext, delay);
      appendLog('Resumed opening.');
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
      isPaused = false;
    });
  </script>
</body>
</html>
`;

    // Download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-auto-opener-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setBulkProgress({ sent: selectedApts.length, total: selectedApts.length, status: 'Auto-opener generated! Download complete.' });
    setTimeout(() => setBulkProgress({ sent: 0, total: 0, status: '' }), 5000);
    alert(`Generated improved auto-opener HTML for ${selectedApts.length} appointments. Open it, connect WhatsApp Web, and click Start. Remember: Manual send required per tab!`);
  };

  // Select/deselect all appointments
  const toggleSelectAll = () => {
    if (selectedAppointments.size === filteredAppointments.length) {
      setSelectedAppointments(new Set());
    } else {
      setSelectedAppointments(new Set(filteredAppointments.map(apt => apt.id)));
    }
  };

  // Toggle single appointment selection
  const toggleAppointmentSelection = (id) => {
    const newSelection = new Set(selectedAppointments);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAppointments(newSelection);
  };

  // Filter appointments by date range and search term
  const filteredAppointments = appointments.filter(apt => {
    let matchesDate = true;
    
    if (filterDateStart && filterDateEnd) {
      const aptDate = new Date(apt.appointmentDate);
      const startDate = new Date(filterDateStart);
      const endDate = new Date(filterDateEnd);
      matchesDate = aptDate >= startDate && aptDate <= endDate;
    } else if (filterDateStart) {
      const aptDate = new Date(apt.appointmentDate);
      const startDate = new Date(filterDateStart);
      matchesDate = aptDate >= startDate;
    } else if (filterDateEnd) {
      const aptDate = new Date(apt.appointmentDate);
      const endDate = new Date(filterDateEnd);
      matchesDate = aptDate <= endDate;
    }
    
    const matchesSearch = searchTerm ? 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm) 
      : true;
    return matchesDate && matchesSearch;
  });

  // CSV Instructions Modal
  const CSVInstructionsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">CSV Import Instructions</h2>
              <p className="text-gray-600 text-sm">Required format for importing appointments</p>
            </div>
          </div>
          <button
            onClick={() => setShowCSVInstructions(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">CSV Format Requirements:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm block whitespace-pre-wrap">
{`PatientName,PatientPhone,AppointmentDate,AppointmentTime,Doctor,Department,Reason,SpecialInstructions
John Doe,+2348012345678,2024-01-15,09:00,Dr. Smith,Pediatrics,Vaccination,"Bring vaccination card"
Jane Smith,+2348023456789,2024-01-15,10:00,Dr. Johnson,General,Check-up,"Come fasting"
Michael Brown,+2348034567890,2024-01-16,14:30,Dr. Williams,Surgery,Follow-up,""`}
              </code>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">File must have these exact column headers (case-sensitive)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Date format: YYYY-MM-DD (e.g., 2024-01-15)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Time format: HH:MM (e.g., 09:00 or 14:30)</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Tip:</strong> You can export your current appointments first to see the exact format, then modify the CSV file for new imports.
            </p>
          </div>

          <button
            onClick={() => setShowCSVInstructions(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Got it, close instructions
          </button>
        </div>
      </div>
    </div>
  );

  // Settings Modal - FIXED
  const SettingsModal = () => {
    const handleSaveSettings = async () => {
      try {
        // First, check if hospital_info record exists
        const { data: existingData, error: fetchError } = await supabase
          .from('hospital_info')
          .select('*')
          .eq('id', 'info')
          .single();

        let saveError = null;
        
        if (fetchError && fetchError.code === 'PGRST116') {
          // Record doesn't exist, insert it
          const { error: insertError } = await supabase
            .from('hospital_info')
            .insert([{ 
              id: 'info', 
              name: tempSettings.name,
              address: tempSettings.address,
              phone: tempSettings.phone,
              primaryColor: tempSettings.primaryColor,
              secondaryColor: tempSettings.secondaryColor
            }]);
          
          saveError = insertError;
        } else if (!fetchError) {
          // Record exists, update it
          const { error: updateError } = await supabase
            .from('hospital_info')
            .update({
              name: tempSettings.name,
              address: tempSettings.address,
              phone: tempSettings.phone,
              primaryColor: tempSettings.primaryColor,
              secondaryColor: tempSettings.secondaryColor
            })
            .eq('id', 'info');
          
          saveError = updateError;
        } else {
          saveError = fetchError;
        }

        if (saveError) {
          console.error('Save error:', saveError);
          alert('Error saving settings: ' + saveError.message);
        } else {
          setHospitalInfo({...tempSettings});
          setShowSettings(false);
          alert('Settings saved successfully!');
        }
      } catch (error) {
        console.error('Settings save error:', error);
        alert('Error saving settings: ' + error.message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Hospital Settings</h2>
                <p className="text-gray-600 text-sm">Customize your hospital information</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSettings(false);
                setTempSettings({...hospitalInfo});
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name
              </label>
              <input
                type="text"
                value={tempSettings.name}
                onChange={(e) => setTempSettings({ ...tempSettings, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter hospital name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Address
              </label>
              <textarea
                value={tempSettings.address}
                onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="2"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={tempSettings.phone}
                onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="+234 XXX XXX XXXX"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={tempSettings.primaryColor}
                  onChange={(e) => setTempSettings({ ...tempSettings, primaryColor: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={tempSettings.secondaryColor}
                  onChange={(e) => setTempSettings({ ...tempSettings, secondaryColor: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setTempSettings({...hospitalInfo});
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Menu
  const MobileMenu = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
      <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => { refreshAppointments(); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200"
          >
            <span className="text-xl">↻</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => { setView('add-appointment'); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Add Appointment</span>
          </button>
          <label className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200 cursor-pointer">
            <FileDown className="w-5 h-5 text-green-600" />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => { setShowCSVInstructions(true); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200"
          >
            <Info className="w-5 h-5 text-blue-600" />
            <span>CSV Format Help</span>
          </button>
          <button
            onClick={() => { exportAppointments(); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200"
          >
            <FileUp className="w-5 h-5 text-purple-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => { setShowSettings(true); setShowMobileMenu(false); }}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard View
  if (view === 'dashboard') {
    return (
      <>
        {showSettings && <SettingsModal />}
        {showCSVInstructions && <CSVInstructionsModal />}
        {showMobileMenu && <MobileMenu />}
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-2xl shadow-lg"
                  style={{ backgroundColor: hospitalInfo.primaryColor }}
                >
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">MediSched</h1>
                  <p className="text-gray-600">Efficiently manage patient appointments</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3">
                  <button
                    onClick={refreshAppointments}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition duration-200 flex items-center gap-2 shadow-sm"
                  >
                    ↻ Refresh
                  </button>
                  <button
                    onClick={() => { setView('add-appointment'); setEditingAppointment(null); setCurrentAppointment({
                      patientName: '', patientPhone: '', appointmentDate: '', appointmentTime: '', doctor: '', department: '', reason: '', specialInstructions: ''
                    }); }}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition duration-200 flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Appointment
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition duration-200 flex items-center gap-2 shadow-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="lg:hidden bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg border border-gray-200 transition duration-200 shadow-sm"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: Users, label: 'Total Appointments', value: appointments.length, color: 'blue' },
                { icon: Calendar, label: 'Scheduled', value: appointments.filter(apt => apt.status === 'scheduled').length, color: 'green' },
                { icon: Mail, label: 'Selected', value: selectedAppointments.size, color: 'orange' },
                { icon: Filter, label: 'Filtered', value: filteredAppointments.length, color: 'purple' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <button
                onClick={() => { setView('add-appointment'); setEditingAppointment(null); setCurrentAppointment({
                  patientName: '', patientPhone: '', appointmentDate: '', appointmentTime: '', doctor: '', department: '', reason: '', specialInstructions: ''
                }); }}
                className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Add Appointment</h3>
                    <p className="text-sm text-gray-600">Add new appointment</p>
                  </div>
                </div>
              </button>
              
              <label className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <FileDown className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Import CSV</h3>
                    <p className="text-sm text-gray-600">Bulk import appointments</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowCSVInstructions(true)}
                className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">CSV Help</h3>
                    <p className="text-sm text-gray-600">View format instructions</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={exportAppointments}
                className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <FileUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Export CSV</h3>
                    <p className="text-sm text-gray-600">Download all data</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Bulk Share Button */}
            {selectedAppointments.size > 0 && (
              <div className="mb-6">
                <button
                  onClick={handleBulkShare}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition duration-200 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  Generate Auto-Sender for {selectedAppointments.size} Selected Appointment{selectedAppointments.size > 1 ? 's' : ''} via WhatsApp
                </button>
                {bulkProgress.total > 0 && (
                  <div className="mt-2 text-center text-sm text-gray-600">
                    {bulkProgress.status} ({bulkProgress.sent}/{bulkProgress.total})
                  </div>
                )}
              </div>
            )}

            {/* Filter and Search Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Name or Phone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                      placeholder="Search..."
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setFilterDateStart('');
                    setFilterDateEnd('');
                    setSearchTerm('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAppointments.size === filteredAppointments.length && filteredAppointments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Doctor</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.has(appointment.id)}
                            onChange={() => toggleAppointmentSelection(appointment.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{appointment.patientPhone}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{appointment.appointmentDate}</p>
                            <p className="text-sm text-gray-500">{appointment.appointmentTime}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{appointment.doctor}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => shareSingleAppointment(appointment)}
                              className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                            <button
                              onClick={() => handleEditAppointment(appointment)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No appointments found</p>
                    <p className="text-gray-400">Add appointments or import from CSV</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Add/Edit Appointment View
  if (view === 'add-appointment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: hospitalInfo.primaryColor }}
                >
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {editingAppointment ? 'Update patient appointment details' : 'Add a new patient appointment'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setView('dashboard'); setEditingAppointment(null); }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={currentAppointment.patientName}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, patientName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter patient's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Phone
                  </label>
                  <input
                    type="tel"
                    value={currentAppointment.patientPhone}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, patientPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={currentAppointment.appointmentDate}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, appointmentDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Time
                  </label>
                  <input
                    type="time"
                    value={currentAppointment.appointmentTime}
                    onChange={(e) => setCurrentAppointment({ ...currentAppointment, appointmentTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={currentAppointment.doctor}
                  onChange={(e) => setCurrentAppointment({ ...currentAppointment, doctor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={currentAppointment.department}
                  onChange={(e) => setCurrentAppointment({ ...currentAppointment, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Pediatrics, General Practice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={currentAppointment.reason}
                  onChange={(e) => setCurrentAppointment({ ...currentAppointment, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Follow-up, Vaccination, Consultation, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={currentAppointment.specialInstructions}
                  onChange={(e) => setCurrentAppointment({ ...currentAppointment, specialInstructions: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows="3"
                  placeholder="e.g., Bring previous test results, Come fasting, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setView('dashboard'); setEditingAppointment(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAppointment ? handleUpdateAppointment : handleAddAppointment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
