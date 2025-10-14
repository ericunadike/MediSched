import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, MapPin, Phone, Stethoscope, 
  Share2, Plus, Settings, Save, Upload, Download, 
  Users, Mail, Filter, Menu, X, ChevronDown,
  FileUp, FileDown, Edit3, Trash2, Info, Copy,
  MessageCircle, CheckCircle, AlertCircle
} from 'lucide-react';

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
  const [tempSettings, setTempSettings] = useState({...hospitalInfo});
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [filterDate, setFilterDate] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showCSVInstructions, setShowCSVInstructions] = useState(false);
  
  // Bulk sharing state
  const [bulkShareProgress, setBulkShareProgress] = useState({
    isSharing: false,
    currentIndex: 0,
    total: 0,
    currentPatient: '',
    completed: 0,
    failed: 0,
    currentMessage: '',
    currentPhone: ''
  });

  const [showBulkShareModal, setShowBulkShareModal] = useState(false);

  // Initialize tempSettings when modal opens
  useEffect(() => {
    if (showSettings) {
      setTempSettings({...hospitalInfo});
    }
  }, [showSettings, hospitalInfo]);

  // Handle CSV Import
  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
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
            id: Date.now() + i,
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
        
        setAppointments(prev => [...prev, ...newAppointments]);
        alert(`Successfully imported ${newAppointments.length} appointments`);
        
      } catch (error) {
        alert('Error reading CSV file. Please check the format and try again.');
        console.error('CSV Import Error:', error);
      }
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
      ...appointments.map(apt => [
        `"${apt.patientName}"`,
        `"${apt.patientPhone}"`,
        `"${apt.appointmentDate}"`,
        `"${apt.appointmentTime}"`,
        `"${apt.doctor}"`,
        `"${apt.department}"`,
        `"${apt.reason}"`,
        `"${apt.specialInstructions}"`
      ].join(','))
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
  const handleAddAppointment = () => {
    if (!currentAppointment.patientName || !currentAppointment.appointmentDate) {
      alert('Please fill in patient name and appointment date');
      return;
    }

    const newAppointment = {
      ...currentAppointment,
      id: Date.now(),
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [...prev, newAppointment]);
    setCurrentAppointment({
      patientName: '', patientPhone: '', appointmentDate: '', appointmentTime: '', 
      doctor: '', department: '', reason: '', specialInstructions: '',
    });
    
    alert('Appointment added successfully!');
  };

  // Edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setCurrentAppointment({...appointment});
    setView('add-appointment');
  };

  // Update appointment
  const handleUpdateAppointment = () => {
    if (!currentAppointment.patientName || !currentAppointment.appointmentDate) {
      alert('Please fill in patient name and appointment date');
      return;
    }

    setAppointments(prev => 
      prev.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...currentAppointment, id: apt.id, createdAt: apt.createdAt }
          : apt
      )
    );

    setEditingAppointment(null);
    setCurrentAppointment({
      patientName: '', patientPhone: '', appointmentDate: '', appointmentTime: '', 
      doctor: '', department: '', reason: '', specialInstructions: '',
    });
    setView('dashboard');
    alert('Appointment updated successfully!');
  };

  // Delete appointment
  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setSelectedAppointments(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
    }
  };

  // Create personalized message
  const createPersonalizedMessage = (appointment) => {
    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const formattedTime = appointment.appointmentTime 
      ? new Date(`2000-01-01T${appointment.appointmentTime}`).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
      : 'Time to be confirmed';

    let message = `Dear ${appointment.patientName},\n\n` +
`You have been scheduled for an appointment at *${hospitalInfo.name}*.\n\n` +
`*Appointment Details:*\n` +
`📅 Date: ${formattedDate}\n` +
`⏰ Time: ${formattedTime}\n` +
`👨‍⚕️ Doctor: ${appointment.doctor}\n` +
`🏥 Department: ${appointment.department}\n` +
`📋 Reason: ${appointment.reason}\n`;

    if (appointment.specialInstructions && appointment.specialInstructions.trim() !== '') {
      message += `\n*Special Instructions:*\n${appointment.specialInstructions}\n`;
    }

    message += `\n*Location:*\n${hospitalInfo.address}\n\n` +
`*Contact Us:*\n${hospitalInfo.phone}\n\n` +
`Please arrive 15 minutes before your scheduled time. If you need to reschedule, kindly contact us at least 24 hours in advance.\n\n` +
`We look forward to seeing you and providing you with the best care!\n\n` +
`Best regards,\n` +
`${hospitalInfo.name} Team`;

    return message;
  };

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Nigerian numbers
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    } else if (!cleaned.startsWith('234') && cleaned.length === 10) {
      cleaned = '234' + cleaned;
    }
    
    return cleaned;
  };

  // Start sequential bulk sharing
  const startSequentialBulkShare = () => {
    if (selectedAppointments.size === 0) {
      alert('Please select appointments to share');
      return;
    }

    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    const validAppointments = selectedApts.filter(apt => 
      apt.patientPhone && apt.patientPhone.trim() !== ''
    );

    if (validAppointments.length === 0) {
      alert('No selected appointments have valid phone numbers');
      return;
    }

    setShowBulkShareModal(false);
    
    // Start with first appointment
    startNextAppointment(validAppointments, 0);
  };

  const startNextAppointment = (appointments, index) => {
    if (index >= appointments.length) {
      // All appointments processed
      setBulkShareProgress({
        isSharing: false,
        currentIndex: 0,
        total: 0,
        currentPatient: '',
        completed: 0,
        failed: 0,
        currentMessage: '',
        currentPhone: ''
      });
      
      const completed = appointments.length - bulkShareProgress.failed;
      alert(`✅ Bulk messaging completed!\n\nSuccessfully sent: ${completed} messages\nFailed: ${bulkShareProgress.failed} messages`);
      return;
    }

    const appointment = appointments[index];
    const message = createPersonalizedMessage(appointment);
    const phone = appointment.patientPhone;

    setBulkShareProgress({
      isSharing: true,
      currentIndex: index,
      total: appointments.length,
      currentPatient: appointment.patientName,
      completed: index, // Already completed previous ones
      failed: bulkShareProgress.failed,
      currentMessage: message,
      currentPhone: phone
    });

    // Auto-copy message to clipboard
    copyToClipboard(message);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.log('Clipboard failed:', err);
    }
  };

  const handleMessageSent = () => {
    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    const validAppointments = selectedApts.filter(apt => 
      apt.patientPhone && apt.patientPhone.trim() !== ''
    );

    const nextIndex = bulkShareProgress.currentIndex + 1;
    
    if (nextIndex < validAppointments.length) {
      startNextAppointment(validAppointments, nextIndex);
    } else {
      // All done
      setBulkShareProgress({
        isSharing: false,
        currentIndex: 0,
        total: 0,
        currentPatient: '',
        completed: 0,
        failed: 0,
        currentMessage: '',
        currentPhone: ''
      });
      
      alert(`✅ All messages sent successfully!\n\nTotal: ${validAppointments.length} appointments`);
    }
  };

  const handleSkipAppointment = () => {
    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    const validAppointments = selectedApts.filter(apt => 
      apt.patientPhone && apt.patientPhone.trim() !== ''
    );

    const nextIndex = bulkShareProgress.currentIndex + 1;
    
    setBulkShareProgress(prev => ({
      ...prev,
      failed: prev.failed + 1
    }));

    if (nextIndex < validAppointments.length) {
      startNextAppointment(validAppointments, nextIndex);
    } else {
      setBulkShareProgress({
        isSharing: false,
        currentIndex: 0,
        total: 0,
        currentPatient: '',
        completed: 0,
        failed: 0,
        currentMessage: '',
        currentPhone: ''
      });
      
      const completed = validAppointments.length - (bulkShareProgress.failed + 1);
      alert(`Bulk messaging completed!\n\nSuccessfully sent: ${completed} messages\nFailed: ${bulkShareProgress.failed + 1} messages`);
    }
  };

  const cancelBulkShare = () => {
    setBulkShareProgress({
      isSharing: false,
      currentIndex: 0,
      total: 0,
      currentPatient: '',
      completed: 0,
      failed: 0,
      currentMessage: '',
      currentPhone: ''
    });
  };

  const openWhatsAppWithMessage = () => {
    const formattedPhone = formatPhoneNumber(bulkShareProgress.currentPhone);
    const encodedMessage = encodeURIComponent(bulkShareProgress.currentMessage);
    const whatsappURL = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  // Single appointment sharing
  const shareSingleAppointment = (appointment) => {
    if (!appointment.patientPhone || appointment.patientPhone.trim() === '') {
      alert(`Cannot share: No phone number for ${appointment.patientName}`);
      return;
    }

    const message = createPersonalizedMessage(appointment);
    const phoneNumber = formatPhoneNumber(appointment.patientPhone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Copy to clipboard first
    copyToClipboard(message);
    
    // Then open WhatsApp
    window.open(whatsappURL, '_blank');
    
    alert(`Personalized message for ${appointment.patientName} copied to clipboard!`);
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

  // Filter appointments by date
  const filteredAppointments = filterDate 
    ? appointments.filter(apt => apt.appointmentDate === filterDate)
    : appointments;

  // Settings Modal
  const SettingsModal = () => {
    const handleSave = () => {
      setHospitalInfo({...tempSettings});
      setShowSettings(false);
      alert('Settings saved successfully!');
    };

    const handleCancel = () => {
      setShowSettings(false);
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
              onClick={handleCancel}
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
                onChange={(e) => setTempSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter hospital name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Address
              </label>
              <textarea
                value={tempSettings.address}
                onChange={(e) => setTempSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onChange={(e) => setTempSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setTempSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
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
                  onChange={(e) => setTempSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
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

  // Bulk Share Progress Component
  const BulkShareProgress = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Send Personalized Message</h2>
              <p className="text-gray-600 text-sm">
                {bulkShareProgress.currentIndex + 1} of {bulkShareProgress.total}
              </p>
            </div>
          </div>
          <button
            onClick={cancelBulkShare}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-800">Progress</span>
              <span className="text-blue-600">
                {bulkShareProgress.currentIndex + 1} / {bulkShareProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((bulkShareProgress.currentIndex + 1) / bulkShareProgress.total) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Current Patient */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Current Patient</h3>
                <p className="text-green-700">{bulkShareProgress.currentPatient}</p>
                <p className="text-green-600 text-sm">Phone: {bulkShareProgress.currentPhone}</p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Personalized Message</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(bulkShareProgress.currentMessage)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
                >
                  <Copy className="w-4 h-4" />
                  Copy Again
                </button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {bulkShareProgress.currentMessage}
              </pre>
            </div>
            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Message automatically copied to clipboard!
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Quick Steps:
            </h4>
            <ol className="text-yellow-700 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                <span><strong>Open WhatsApp</strong> - Message is pre-loaded with patient details</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                <span><strong>Find the patient</strong>: {bulkShareProgress.currentPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                <span><strong>Paste the message</strong> (already copied for you)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                <span><strong>Send the message</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
                <span><strong>Click "Message Sent"</strong> below to continue</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={openWhatsAppWithMessage}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp
            </button>
            <button
              onClick={handleSkipAppointment}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Skip
            </button>
            <button
              onClick={handleMessageSent}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Message Sent
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Bulk Share Confirmation Modal
  const BulkShareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Send Personalized Messages</h2>
              <p className="text-gray-600 text-sm">{selectedAppointments.size} appointments selected</p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkShareModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Personalized Messaging</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Each message includes patient's name</li>
              <li>• All appointment details included</li>
              <li>• Professional, friendly tone</li>
              <li>• One patient at a time</li>
              <li>• Message auto-copied to clipboard</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowBulkShareModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={startSequentialBulkShare}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Start Sending
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  // Add/Edit Appointment View
  if (view === 'add-appointment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

  // Dashboard View
  return (
    <>
      {showSettings && <SettingsModal />}
      {showCSVInstructions && <CSVInstructionsModal />}
      {showMobileMenu && <MobileMenu />}
      {showBulkShareModal && <BulkShareModal />}
      {bulkShareProgress.isSharing && <BulkShareProgress />}
      
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
                  onClick={() => { 
                    setView('add-appointment'); 
                    setEditingAppointment(null); 
                    setCurrentAppointment({
                      patientName: '', patientPhone: '', appointmentDate: '', appointmentTime: '', 
                      doctor: '', department: '', reason: '', specialInstructions: ''
                    }); 
                  }}
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
                onClick={() => setShowBulkShareModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition duration-200 flex items-center justify-center gap-3 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                Send Personalized Messages to {selectedAppointments.size} Patients
              </button>
              <p className="text-center text-gray-600 text-sm mt-2">
                One patient at a time • Personalized messages • No multiple tabs
              </p>
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setFilterDate('')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 mt-6 md:mt-0"
              >
                Clear Filter
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
