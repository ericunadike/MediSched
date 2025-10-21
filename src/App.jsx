import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, User, MapPin, Phone, Stethoscope, 
  Share2, Plus, Settings, Save, Upload, Download, 
  Users, Mail, Filter, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  FileUp, FileDown, Edit3, Trash2, Info, Search, Check, XCircle,
  AlertCircle, Image, BarChart3, TrendingUp, Activity
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const StatusBadge = ({ status }) => {
  const styles = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    'no-show': 'bg-orange-100 text-orange-800'
  };
  
  const icons = {
    scheduled: Clock,
    confirmed: Check,
    cancelled: XCircle,
    completed: Check,
    'no-show': AlertCircle
  };
  
  const Icon = icons[status] || Clock;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${styles[status] || styles.scheduled}`}>
      <Icon className="w-3 h-3" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') : 'Scheduled'}
    </span>
  );
};

// ============================================================================
// MODALS
// ============================================================================

const StatisticsModal = ({ appointments, setShowStatistics }) => {
  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;
    
    const deptCounts = {};
    appointments.forEach(apt => {
      if (apt.department) {
        deptCounts[apt.department] = (deptCounts[apt.department] || 0) + 1;
      }
    });
    
    const doctorCounts = {};
    appointments.forEach(apt => {
      if (apt.doctor) {
        doctorCounts[apt.doctor] = (doctorCounts[apt.doctor] || 0) + 1;
      }
    });
    
    const now = new Date();
    const thisMonth = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.getMonth() === now.getMonth() && 
             aptDate.getFullYear() === now.getFullYear();
    }).length;
    
    return {
      total, scheduled, confirmed, cancelled, completed, noShow,
      deptCounts, doctorCounts, thisMonth,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      confirmationRate: total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0,
      noShowRate: total > 0 ? ((noShow / total) * 100).toFixed(1) : 0
    };
  }, [appointments]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Appointment Statistics</h2>
              <p className="text-gray-600 text-sm">Comprehensive overview of your appointments</p>
            </div>
          </div>
          <button
            onClick={() => setShowStatistics(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600 font-medium">Confirmed</p>
              <p className="text-3xl font-bold text-green-900">{stats.confirmed}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-orange-600 font-medium">No-Show</p>
              <p className="text-3xl font-bold text-orange-900">{stats.noShow}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Confirmation Rate</p>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmationRate}%</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">No-Show Rate</p>
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.noShowRate}%</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Appointments by Department</h3>
            <div className="space-y-2">
              {Object.entries(stats.deptCounts).length > 0 ? (
                Object.entries(stats.deptCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{dept}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No department data available</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Appointments by Doctor</h3>
            <div className="space-y-2">
              {Object.entries(stats.doctorCounts).length > 0 ? (
                Object.entries(stats.doctorCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([doctor, count]) => (
                    <div key={doctor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{doctor}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No doctor data available</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowStatistics(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Close Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({ appointments, setView, setEditingAppointment, setCurrentAppointment, setShowCalendar }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const days = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 h-24"></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(apt => apt.appointmentDate === dateStr);
    
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    
    days.push(
      <div 
        key={day} 
        className={`p-2 border border-gray-200 h-24 overflow-y-auto ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
      >
        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {day}
        </div>
        {dayAppointments.map(apt => (
          <div 
            key={apt.id}
            onClick={() => {
              setEditingAppointment(apt);
              setCurrentAppointment(apt);
              setView('add-appointment');
              setShowCalendar(false);
            }}
            className="text-xs bg-blue-100 text-blue-800 p-1 mb-1 rounded cursor-pointer hover:bg-blue-200"
          >
            {apt.appointmentTime} - {apt.patientName}
          </div>
        ))}
      </div>
    );
  }
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCalendar(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    </div>
  );
};

const StatusUpdateModal = ({ appointment, setShowStatusModal, handleStatusUpdate }) => {
  const [status, setStatus] = useState(appointment.status || 'scheduled');
  const [response, setResponse] = useState(appointment.patientResponse || '');
  
  const statuses = ['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Update Status</h2>
            <p className="text-gray-600 text-sm">{appointment.patientName}</p>
          </div>
          <button
            onClick={() => setShowStatusModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {statuses.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes / Patient Response
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Add any notes or patient feedback..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowStatusModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleStatusUpdate(appointment.id, status, response);
                setShowStatusModal(false);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ tempSettings, setTempSettings, hospitalInfo, setHospitalInfo, setShowSettings }) => {
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hospital-assets')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('hospital-assets')
        .getPublicUrl(filePath);
        
      setTempSettings({ ...tempSettings, logo: data.publicUrl });
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading logo. Make sure the "hospital-assets" bucket exists in Supabase Storage and is set to public.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('hospital_info')
        .select('*')
        .eq('id', 'info')
        .single();

      let saveError = null;
      
      if (fetchError && fetchError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('hospital_info')
          .insert([{ 
            id: 'info', 
            name: tempSettings.name,
            address: tempSettings.address,
            phone: tempSettings.phone,
            logo: tempSettings.logo,
            primaryColor: tempSettings.primaryColor
          }]);
        
        saveError = insertError;
      } else if (!fetchError) {
        const { error: updateError } = await supabase
          .from('hospital_info')
          .update({
            name: tempSettings.name,
            address: tempSettings.address,
            phone: tempSettings.phone,
            logo: tempSettings.logo,
            primaryColor: tempSettings.primaryColor
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
              Hospital Logo
            </label>
            {tempSettings.logo && (
              <div className="mb-4 flex items-center gap-4">
                <img 
                  src={tempSettings.logo} 
                  alt="Hospital Logo" 
                  className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-2"
                />
                <button
                  onClick={() => setTempSettings({ ...tempSettings, logo: '' })}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Logo
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <Image className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                {uploading ? 'Uploading...' : 'Choose Logo Image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Max 2MB. Supported: JPG, PNG, SVG</p>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Brand Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={tempSettings.primaryColor}
                onChange={(e) => setTempSettings({ ...tempSettings, primaryColor: e.target.value })}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={tempSettings.primaryColor}
                onChange={(e) => setTempSettings({ ...tempSettings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="#2563eb"
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

const CSVInstructionsModal = ({ setShowCSVInstructions }) => (
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
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm block whitespace-pre">
{`PatientName,PatientPhone,AppointmentDate,AppointmentTime,Doctor,Department,Reason,SpecialInstructions
John Doe,+2348012345678,2024-01-15,09:00,Dr. Smith,Pediatrics,Vaccination,"Bring vaccination card"
Jane Smith,+2348023456789,2024-01-15,10:00,Dr. Johnson,General,Check-up,"Come fasting"`}
            </code>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-1 rounded mt-1">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-medium text-gray-800">File must have these exact column headers (case-sensitive)</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-1 rounded mt-1">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-medium text-gray-800">Date format: YYYY-MM-DD (e.g., 2024-01-15)</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-1 rounded mt-1">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-medium text-gray-800">Time format: HH:MM (24-hour format, e.g., 14:30)</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-1 rounded mt-1">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-medium text-gray-800">Phone numbers should include country code (e.g., +234...)</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Important Notes</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• All columns are required except SpecialInstructions</li>
                <li>• File must be saved as CSV (Comma Separated Values)</li>
                <li>• Avoid special characters in column headers</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCSVInstructions(false)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  </div>
);

// ============================================================================
// WHATSAPP BULK MESSAGING COMPONENTS
// ============================================================================

const WhatsAppBulkModal = ({ 
  selectedAppointments, 
  appointments, 
  hospitalInfo, 
  setShowBulkWhatsApp,
  bulkProgress,
  setBulkProgress 
}) => {
  const [delay, setDelay] = useState(15000);

  // Normalize phone number to WhatsApp format
  const normalizePhoneNumber = (phone) => {
    let digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '234' + digits.substring(1);
    } else if (digits.startsWith('2340') && digits.length === 14) {
      digits = '234' + digits.substring(4);
    }
    
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
    const formattedTime = timeObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

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

  // Generate WhatsApp auto-opener HTML
  const generateWhatsAppAutoOpener = () => {
    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    
    // Generate array of WhatsApp URLs with personalized messages
    const waLinks = selectedApts.map(appointment => {
      const shareText = generateMessageText(appointment);
      const phoneNumber = normalizePhoneNumber(appointment.patientPhone);
      return { 
        url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`, 
        patientName: appointment.patientName 
      };
    });

    const htmlContent = `
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
    <label>Delay (ms): <input type="number" id="delayInput" value="${delay}" min="5000" step="1000"></label>
  </div>
  
  <div id="progress">Progress: 0 / ${selectedApts.length}</div>
  <div id="log">Ready. Click 'Check WhatsApp Connection' first!\\n</div>

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
      progress.textContent = \\`Progress: \\${currentIndex} / \\${links.length} tabs opened\\`;
    }

    function appendLog(message, isError = false) {
      const timestamp = new Date().toLocaleTimeString();
      log.textContent += \\`\\${timestamp} - \\${message}\\${isError ? ' (ERROR)' : ''}\\\\n\\`;
      log.scrollTop = log.scrollHeight;
    }

    function sendNext() {
      if (currentIndex >= links.length || isPaused) return;

      const item = links[currentIndex];
      const win = window.open(item.url, '_blank');
      if (win) {
        appendLog(\\`Opened tab for \\${item.patientName || 'Patient ' + (currentIndex + 1)}\\`);
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
      appendLog(\\`Started opening with \\${delay}ms delay. Manually send in tabs!\\`);
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

    setBulkProgress({ 
      sent: selectedApts.length, 
      total: selectedApts.length, 
      status: 'Auto-opener generated! Download complete.' 
    });
    
    setTimeout(() => {
      setBulkProgress({ sent: 0, total: 0, status: '' });
      setShowBulkWhatsApp(false);
    }, 3000);
  };

  const selectedCount = Array.from(selectedAppointments).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Bulk WhatsApp Messages</h2>
              <p className="text-gray-600 text-sm">Generate auto-opener for {selectedCount} appointments</p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkWhatsApp(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Generates an HTML file with all WhatsApp links</li>
              <li>• Opens tabs automatically with delays to avoid bans</li>
              <li>• You must manually click "Send" in each WhatsApp tab</li>
              <li>• Requires WhatsApp Web to be logged in</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay between tabs (milliseconds)
            </label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value) || 15000)}
              min="5000"
              step="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="15000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 15000ms (15 seconds). Lower values may trigger WhatsApp limits.
            </p>
          </div>

          {bulkProgress.status && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">{bulkProgress.status}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowBulkWhatsApp(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={generateWhatsAppAutoOpener}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Generate Auto-Opener
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HospitalAppointmentSystem = () => {
  // State management
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCSVInstructions, setShowCSVInstructions] = useState(false);
  const [showBulkWhatsApp, setShowBulkWhatsApp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0, status: '' });
  
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'MediCare General Hospital',
    address: '123 Healthcare Avenue, Medical District, Lagos, Nigeria',
    phone: '+234 800 123 4567',
    logo: '',
    primaryColor: '#2563eb'
  });
  const [tempSettings, setTempSettings] = useState({...hospitalInfo});

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    doctor: '',
    department: '',
    reason: '',
    specialInstructions: '',
    status: 'scheduled',
    patientResponse: ''
  });

  // Initialize and fetch data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await Promise.all([fetchAppointments(), fetchHospitalInfo()]);
    setLoading(false);
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointmentDate', { ascending: true })
        .order('appointmentTime', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchHospitalInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_info')
        .select('*')
        .eq('id', 'info')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setHospitalInfo(data);
        setTempSettings(data);
      }
    } catch (error) {
      console.error('Error fetching hospital info:', error);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      appointmentDate: '',
      appointmentTime: '',
      doctor: '',
      department: '',
      reason: '',
      specialInstructions: '',
      status: 'scheduled',
      patientResponse: ''
    });
    setEditingAppointment(null);
    setCurrentAppointment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.patientPhone || !formData.appointmentDate || !formData.appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(formData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
        
        setAppointments(prev => 
          prev.map(apt => apt.id === editingAppointment.id ? { ...apt, ...formData } : apt)
        );
        alert('Appointment updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([{ ...formData, createdAt: new Date() }])
          .select();

        if (error) throw error;
        
        setAppointments(prev => [...prev, data[0]]);
        alert('Appointment created successfully!');
      }

      resetForm();
      setView('dashboard');
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error saving appointment: ' + error.message);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      setSelectedAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      alert('Appointment deleted successfully!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment: ' + error.message);
    }
  };

  const handleStatusUpdate = async (id, status, response) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status, 
          patientResponse: response,
          updatedAt: new Date()
        })
        .eq('id', id);

      if (error) throw error;
      
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status, patientResponse: response } : apt)
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const handleEditAppointment = (appointment) => {
    setFormData({
      patientName: appointment.patientName || '',
      patientPhone: appointment.patientPhone || '',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      doctor: appointment.doctor || '',
      department: appointment.department || '',
      reason: appointment.reason || '',
      specialInstructions: appointment.specialInstructions || '',
      status: appointment.status || 'scheduled',
      patientResponse: appointment.patientResponse || ''
    });
    setEditingAppointment(appointment);
    setCurrentAppointment(appointment);
    setView('add-appointment');
  };

  // WhatsApp Functions
  const normalizePhoneNumber = (phone) => {
    let digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '234' + digits.substring(1);
    } else if (digits.startsWith('2340') && digits.length === 14) {
      digits = '234' + digits.substring(4);
    }
    
    return digits;
  };

  const generateMessageText = (appointment) => {
    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const [hours, minutes] = appointment.appointmentTime.split(':');
    const timeObj = new Date(2000, 0, 1, hours, minutes);
    const formattedTime = timeObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

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

  const shareSingleAppointment = (appointment) => {
    const shareText = generateMessageText(appointment);
    const phoneNumber = normalizePhoneNumber(appointment.patientPhone);
    const windowName = `whatsapp_${appointment.id}_${Date.now()}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappURL, windowName);
  };

  // Selection functions
  const toggleSelectAll = () => {
    if (selectedAppointments.size === filteredAppointments.length) {
      setSelectedAppointments(new Set());
    } else {
      setSelectedAppointments(new Set(filteredAppointments.map(apt => apt.id)));
    }
  };

  const toggleAppointmentSelection = (id) => {
    const newSelection = new Set(selectedAppointments);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAppointments(newSelection);
  };

  // Import/Export functions
  const exportToCSV = () => {
    const headers = ['PatientName', 'PatientPhone', 'AppointmentDate', 'AppointmentTime', 'Doctor', 'Department', 'Reason', 'SpecialInstructions', 'Status', 'PatientResponse'];
    
    const csvContent = [
      headers.join(','),
      ...appointments.map(apt => 
        headers.map(header => {
          const value = apt[header.toLowerCase()] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const requiredHeaders = ['PatientName', 'PatientPhone', 'AppointmentDate', 'AppointmentTime'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          alert(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        const appointmentsToImport = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const appointment = {};
          
          headers.forEach((header, index) => {
            appointment[header.toLowerCase()] = values[index] || '';
          });
          
          if (appointment.patientname && appointment.patientphone && appointment.appointmentdate && appointment.appointmenttime) {
            appointmentsToImport.push({
              patientName: appointment.patientname,
              patientPhone: appointment.patientphone,
              appointmentDate: appointment.appointmentdate,
              appointmentTime: appointment.appointmenttime,
              doctor: appointment.doctor || '',
              department: appointment.department || '',
              reason: appointment.reason || '',
              specialInstructions: appointment.specialinstructions || '',
              status: 'scheduled',
              patientResponse: '',
              createdAt: new Date()
            });
          }
        }

        if (appointmentsToImport.length === 0) {
          alert('No valid appointments found in the CSV file');
          return;
        }

        const { data, error } = await supabase
          .from('appointments')
          .insert(appointmentsToImport)
          .select();

        if (error) throw error;

        setAppointments(prev => [...prev, ...data]);
        alert(`Successfully imported ${data.length} appointments!`);
        
        // Reset file input
        e.target.value = '';
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.patientPhone?.includes(searchTerm) ||
                           apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesDate = !dateFilter || apt.appointmentDate === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointmentDate === today);
    
    return {
      total: appointments.length,
      today: todayAppointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      selected: selectedAppointments.size
    };
  }, [appointments, selectedAppointments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Hospital Appointment System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--primary-color': hospitalInfo.primaryColor }}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {hospitalInfo.logo ? (
                <img src={hospitalInfo.logo} alt="Hospital Logo" className="h-8 w-auto" />
              ) : (
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              )}
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{hospitalInfo.name}</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Appointment Management System</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-2 rounded-lg font-medium transition duration-200 ${
                  view === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('appointments')}
                className={`px-3 py-2 rounded-lg font-medium transition duration-200 ${
                  view === 'appointments' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => { setView('add-appointment'); resetForm(); }}
                className={`px-3 py-2 rounded-lg font-medium transition duration-200 ${
                  view === 'add-appointment' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                New Appointment
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStatistics(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                title="View Statistics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCalendar(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                title="Calendar View"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition duration-200 ${
                  view === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setView('appointments'); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition duration-200 ${
                  view === 'appointments' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => { setView('add-appointment'); resetForm(); setMobileMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition duration-200 ${
                  view === 'add-appointment' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                New Appointment
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome to your appointment management system</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importFromCSV}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowCSVInstructions(true)}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  title="CSV Instructions"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.today}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.scheduled}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.confirmed}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Selected</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.selected}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk WhatsApp Button */}
            {selectedAppointments.size > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bulk WhatsApp Messages</h3>
                    <p className="text-gray-600">
                      {selectedAppointments.size} appointment{selectedAppointments.size > 1 ? 's' : ''} selected for messaging
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkWhatsApp(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Generate WhatsApp Auto-Opener
                  </button>
                </div>
              </div>
            )}

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAppointments.size === filteredAppointments.length && filteredAppointments.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredAppointments.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments.slice(0, 5).map(appointment => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.has(appointment.id)}
                            onChange={() => toggleAppointmentSelection(appointment.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="bg-white p-2 rounded-lg">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">{appointment.doctor} • {appointment.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.appointmentDate}</p>
                            <p className="text-sm text-gray-600">{appointment.appointmentTime}</p>
                          </div>
                          <button
                            onClick={() => shareSingleAppointment(appointment)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition duration-200"
                            title="Share via WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent appointments found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments List View */}
        {view === 'appointments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Appointments</h2>
                <p className="text-gray-600">Manage and view all patient appointments</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setView('add-appointment'); resetForm(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Appointment
                </button>
              </div>
            </div>

            {/* Bulk WhatsApp Button */}
            {selectedAppointments.size > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bulk WhatsApp Messages</h3>
                    <p className="text-gray-600">
                      {selectedAppointments.size} appointment{selectedAppointments.size > 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkWhatsApp(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Generate WhatsApp Auto-Opener
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patients, doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={toggleSelectAll}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    {selectedAppointments.size === filteredAppointments.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedAppointments.size === filteredAppointments.length && filteredAppointments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map(appointment => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedAppointments.has(appointment.id)}
                            onChange={() => toggleAppointmentSelection(appointment.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                            <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.appointmentDate}</div>
                          <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.doctor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => shareSingleAppointment(appointment)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Share via WhatsApp"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditAppointment(appointment)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setCurrentAppointment(appointment); setShowStatusModal(true); }}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Update Status"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => { setView('add-appointment'); resetForm(); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Appointment View */}
        {view === 'add-appointment' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                </h2>
                <p className="text-gray-600">
                  {editingAppointment ? 'Update patient appointment details' : 'Schedule a new patient appointment'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter patient full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="patientPhone"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Time *
                    </label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor
                    </label>
                    <input
                      type="text"
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Cardiology"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Regular check-up, consultation, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows="3"
                    placeholder="Any special instructions for the patient..."
                  />
                </div>

                {editingAppointment && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Response
                      </label>
                      <textarea
                        name="patientResponse"
                        value={formData.patientResponse}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        rows="3"
                        placeholder="Patient feedback or response..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => { setView('dashboard'); resetForm(); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {hospitalInfo.logo ? (
                <img src={hospitalInfo.logo} alt="Hospital Logo" className="h-8 w-auto" />
              ) : (
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{hospitalInfo.name}</p>
                <p className="text-sm text-gray-600">{hospitalInfo.address}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Contact: {hospitalInfo.phone}</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Hospital Appointment Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showCalendar && (
        <CalendarView
          appointments={appointments}
          setView={setView}
          setEditingAppointment={setEditingAppointment}
          setCurrentAppointment={setCurrentAppointment}
          setShowCalendar={setShowCalendar}
        />
      )}

      {showStatistics && (
        <StatisticsModal
          appointments={appointments}
          setShowStatistics={setShowStatistics}
        />
      )}

      {showStatusModal && currentAppointment && (
        <StatusUpdateModal
          appointment={currentAppointment}
          setShowStatusModal={setShowStatusModal}
          handleStatusUpdate={handleStatusUpdate}
        />
      )}

      {showSettings && (
        <SettingsModal
          tempSettings={tempSettings}
          setTempSettings={setTempSettings}
          hospitalInfo={hospitalInfo}
          setHospitalInfo={setHospitalInfo}
          setShowSettings={setShowSettings}
        />
      )}

      {showCSVInstructions && (
        <CSVInstructionsModal
          setShowCSVInstructions={setShowCSVInstructions}
        />
      )}

      {showBulkWhatsApp && (
        <WhatsAppBulkModal
          selectedAppointments={selectedAppointments}
          appointments={appointments}
          hospitalInfo={hospitalInfo}
          setShowBulkWhatsApp={setShowBulkWhatsApp}
          bulkProgress={bulkProgress}
          setBulkProgress={setBulkProgress}
        />
      )}
    </div>
  );
};

export default HospitalAppointmentSystem;
