import React, { useState } from 'react';
import { 
  Calendar, Clock, User, MapPin, Phone, Stethoscope, 
  Share2, Plus, Settings, Save, Upload, Download, 
  Users, Mail, Filter, Menu, X, ChevronDown,
  FileUp, FileDown, Edit3, Trash2, Info
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
  const [tempSettings, setTempSettings] = useState(hospitalInfo);
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [filterDate, setFilterDate] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showCSVInstructions, setShowCSVInstructions] = useState(false);

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
        
        // Validate headers
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

  // Delete appointment - FIXED: Using window.confirm properly
  const handleDeleteAppointment = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setSelectedAppointments(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
      alert('Appointment deleted successfully!');
    }
  };

  // FIXED: Bulk WhatsApp sharing - ensures each appointment gets its own message
  const handleBulkShare = () => {
    if (selectedAppointments.size === 0) {
      alert('Please select appointments to share');
      return;
    }

    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    
    // Create a unique WhatsApp window for EACH appointment
    selectedApts.forEach((appointment, index) => {
      setTimeout(() => {
        shareSingleAppointment(appointment);
      }, index * 3000); // 3-second delay between each message
    });

    alert(`Scheduling ${selectedApts.length} separate WhatsApp messages... Each appointment will open in its own window.`);
  };

  // FIXED: Single appointment sharing with unique window names
  const shareSingleAppointment = (appointment) => {
    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const [hours, minutes] = appointment.appointmentTime.split(':');
    const timeObj = new Date(2000, 0, 1, hours, minutes);
    const formattedTime = timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const shareText = `
*${hospitalInfo.name.toUpperCase()}*
──────────────────────────────

*APPOINTMENT CONFIRMATION*

*Patient:* ${appointment.patientName}
*Date:* ${formattedDate}
*Time:* ${formattedTime}
*Doctor:* ${appointment.doctor}
*Department:* ${appointment.department}
*Reason:* ${appointment.reason}

${appointment.specialInstructions ? `*Special Instructions:*\n${appointment.specialInstructions}\n` : ''}
*Location:*
${hospitalInfo.address}

*Contact:*
${hospitalInfo.phone}

──────────────────────────────

We look forward to seeing you!
    `.trim();

    const phoneNumber = appointment.patientPhone.replace(/\D/g, '');
    
    // Create unique window name for each appointment to prevent overwriting
    const windowName = `whatsapp_${appointment.id}_${Date.now()}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`;
    
    // Open in new window with unique name - this ensures each appointment gets its own window
    window.open(whatsappURL, windowName);
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

  // CSV Instructions Modal - FIXED: Now properly defined
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

  // Settings Modal Component - FIXED: Now properly defined
  const SettingsModal = () => (
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
            onClick={() => setShowSettings(false)}
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
              onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
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
              onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
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
                setTempSettings(hospitalInfo);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setHospitalInfo(tempSettings);
                setShowSettings(false);
                alert('Settings saved successfully!');
              }}
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

  // Mobile Menu Component - FIXED: Now properly defined
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
                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-3">
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
                  Share {selectedAppointments.size} Selected Appointment{selectedAppointments.size > 1 ? 's' : ''} via WhatsApp
                </button>
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
}