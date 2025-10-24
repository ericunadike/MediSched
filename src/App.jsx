import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, User, MapPin, Phone, Stethoscope, 
  Share2, Plus, Settings, Save, Upload, Download, 
  Users, Mail, Filter, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  FileUp, FileDown, Edit3, Trash2, Info, Search, Check, XCircle,
  AlertCircle, Image, BarChart3, TrendingUp, Activity,
  LogOut, History, UserPlus
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// AUTHENTICATION COMPONENT
// ============================================================================

const LoginPage = ({ hospitalInfo, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      onLogin(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {hospitalInfo.logo ? (
            <img 
              src={hospitalInfo.logo} 
              alt="Hospital Logo" 
              className="h-16 w-auto"
            />
          ) : (
            <div className="bg-blue-600 p-3 rounded-xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {hospitalInfo.name}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Appointment Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hospital Staff Access Only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
// PATIENT AUTOCOMPLETE COMPONENT
// ============================================================================

const PatientAutocomplete = ({ 
  patients, 
  selectedPatient, 
  onPatientSelect, 
  onNewPatient,
  searchTerm,
  onSearchChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handlePatientSelect = (patient) => {
    onPatientSelect(patient);
    setIsOpen(false);
    onSearchChange(patient.name);
  };

  const handleInputChange = (value) => {
    onSearchChange(value);
    if (value.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => searchTerm.length > 0 && setIsOpen(true)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Type patient name or phone..."
        />
        <User className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredPatients.length > 0 ? (
            <>
              {filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{patient.name}</div>
                  <div className="text-sm text-gray-600">{patient.phone}</div>
                </button>
              ))}
            </>
          ) : searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onNewPatient(searchTerm)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600"
            >
              <UserPlus className="w-4 h-4" />
              Create new patient: "{searchTerm}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PATIENT HISTORY MODAL
// ============================================================================

const PatientHistoryModal = ({ patient, appointments, onClose }) => {
  const patientAppointments = appointments.filter(apt => 
    apt.patient_id === patient.id
  ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Patient History</h2>
              <p className="text-gray-600 text-sm">{patient.name} - {patient.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {patientAppointments.length > 0 ? (
            <div className="space-y-4">
              {patientAppointments.map(appointment => (
                <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={appointment.status} />
                      <span className="font-medium text-gray-900">
                        {appointment.appointmentDate} at {appointment.appointmentTime}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(appointment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Doctor:</span>
                      <p className="text-gray-900">{appointment.doctor || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Department:</span>
                      <p className="text-gray-900">{appointment.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-900">{appointment.reason || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {appointment.specialInstructions && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700 text-sm">Instructions:</span>
                      <p className="text-gray-900 text-sm">{appointment.specialInstructions}</p>
                    </div>
                  )}
                  
                  {appointment.patientResponse && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-700 text-sm">Patient Response:</span>
                      <p className="text-gray-900 text-sm">{appointment.patientResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment History</h3>
              <p className="text-gray-600">This patient has no previous appointments.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOLS DROPDOWN COMPONENT
// ============================================================================

const ToolsDropdown = ({ 
  setShowStatistics, 
  setShowCalendar, 
  exportToCSV, 
  importFromCSV, 
  setShowCSVInstructions 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
      >
        <span>Tools</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <button
            onClick={() => { setShowStatistics(true); setIsOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <BarChart3 className="w-4 h-4" />
            Statistics
          </button>
          <button
            onClick={() => { setShowCalendar(true); setIsOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <Calendar className="w-4 h-4" />
            Calendar View
          </button>
          <button
            onClick={() => { exportToCSV(); setIsOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <FileUp className="w-4 h-4" />
            Export CSV
          </button>
          <label className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200 cursor-pointer">
            <FileDown className="w-4 h-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={(e) => { importFromCSV(e); setIsOpen(false); }}
              className="hidden"
            />
          </label>
          <button
            onClick={() => { setShowCSVInstructions(true); setIsOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <Info className="w-4 h-4" />
            CSV Instructions
          </button>
        </div>
      )}
    </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Scheduled</span>
                  <span className="font-medium text-gray-900">{stats.scheduled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confirmed</span>
                  <span className="font-medium text-gray-900">{stats.confirmed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium text-gray-900">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="font-medium text-gray-900">{stats.cancelled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">No Show</span>
                  <span className="font-medium text-gray-900">{stats.noShow}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-gray-900">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Confirmation Rate</span>
                    <span className="text-sm font-medium text-gray-900">{stats.confirmationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stats.confirmationRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">No-Show Rate</span>
                    <span className="text-sm font-medium text-gray-900">{stats.noShowRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${stats.noShowRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
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
  const [selectedDate, setSelectedDate] = useState(null);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointmentDate === dateString);
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
              <p className="text-gray-600 text-sm">Browse appointments by date</p>
            </div>
          </div>
          <button
            onClick={() => setShowCalendar(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">{monthName}</h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-24 p-2 border rounded-lg text-left transition duration-200 ${
                    isToday ? 'bg-blue-50 border-blue-200' : 
                    isSelected ? 'bg-gray-100 border-gray-300' : 
                    'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayAppointments.slice(0, 2).map(apt => {
                      const patientName = apt.patients?.name || apt.patientName;
                      return (
                        <div
                          key={apt.id}
                          className={`text-xs p-1 rounded truncate ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                          title={`${patientName} - ${apt.appointmentTime}`}
                        >
                          {apt.appointmentTime} - {patientName.split(' ')[0]}
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Appointments for {selectedDate.toLocaleDateString()}
              </h4>
              <div className="space-y-2">
                {getAppointmentsForDate(selectedDate).map(apt => {
                  const patientName = apt.patients?.name || apt.patientName;
                  const patientPhone = apt.patients?.phone || apt.patientPhone;
                  
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{patientName}</div>
                        <div className="text-sm text-gray-600">{apt.appointmentTime} • {apt.doctor}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={apt.status} />
                        <button
                          onClick={() => {
                            setCurrentAppointment(apt);
                            setEditingAppointment(apt);
                            setShowCalendar(false);
                            setView('add-appointment');
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {getAppointmentsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No appointments for this date</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusUpdateModal = ({ appointment, setShowStatusModal, handleStatusUpdate }) => {
  const [status, setStatus] = useState(appointment.status);
  const [response, setResponse] = useState(appointment.patientResponse || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleStatusUpdate(appointment.id, status, response);
    setShowStatusModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Update Status</h2>
              <p className="text-gray-600 text-sm">Update appointment status and patient response</p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Patient feedback or response..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsModal = ({ tempSettings, setTempSettings, hospitalInfo, setHospitalInfo, setShowSettings }) => {
  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('hospital_info')
        .upsert({ 
          id: 'info',
          ...tempSettings,
          updated_at: new Date()
        });

      if (error) throw error;
      
      setHospitalInfo(tempSettings);
      setShowSettings(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
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
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name
              </label>
              <input
                type="text"
                value={tempSettings.name}
                onChange={(e) => setTempSettings({...tempSettings, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={tempSettings.phone}
                onChange={(e) => setTempSettings({...tempSettings, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={tempSettings.address}
                onChange={(e) => setTempSettings({...tempSettings, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={tempSettings.logo}
                onChange={(e) => setTempSettings({...tempSettings, logo: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={tempSettings.primaryColor}
                onChange={(e) => setTempSettings({...tempSettings, primaryColor: e.target.value})}
                className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CSVInstructionsModal = ({ setShowCSVInstructions }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">CSV Import Instructions</h2>
              <p className="text-gray-600 text-sm">How to format your CSV file for import</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Columns</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-700">
                PatientName, PatientPhone, AppointmentDate, AppointmentTime
              </code>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              These four columns are mandatory. Other columns are optional.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Optional Columns</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-700">
                Doctor, Department, Reason, SpecialInstructions, Status, PatientResponse
              </code>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Date and Time Format</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>AppointmentDate:</strong> YYYY-MM-DD (e.g., 2024-12-25)</p>
              <p><strong>AppointmentTime:</strong> HH:MM (24-hour format, e.g., 14:30)</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Example CSV</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
{`PatientName,PatientPhone,AppointmentDate,AppointmentTime,Doctor,Department,Reason
John Doe,+2348012345678,2024-12-25,14:30,Dr. Smith,Cardiology,Regular check-up
Jane Smith,+2348098765432,2024-12-26,10:00,Dr. Johnson,Pediatrics,Vaccination`}
              </pre>
            </div>
          </div>

          <button
            onClick={() => setShowCSVInstructions(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Close Instructions
          </button>
        </div>
      </div>
    </div>
  );
};

const WhatsAppBulkModal = ({ selectedAppointments, appointments, hospitalInfo, setShowBulkWhatsApp, bulkProgress, setBulkProgress }) => {
  const selectedAppointmentsList = appointments.filter(apt => selectedAppointments.has(apt.id));

  const generateBulkWhatsApp = () => {
    const links = selectedAppointmentsList.map(appointment => {
      const shareText = generateMessageText(appointment);
      const patientPhone = appointment.patients?.phone || appointment.patientPhone;
      const phoneNumber = normalizePhoneNumber(patientPhone);
      return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`;
    });

    // Create a simple HTML page with all the links
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Bulk WhatsApp Messages</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .link { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; }
        a { color: #25D366; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Bulk WhatsApp Messages - ${hospitalInfo.name}</h1>
    <p>Click each link to open WhatsApp with pre-filled message:</p>
    ${links.map((link, index) => {
      const apt = selectedAppointmentsList[index];
      const patientName = apt.patients?.name || apt.patientName;
      return `
        <div class="link">
            <strong>${patientName}</strong> - ${apt.appointmentDate} at ${apt.appointmentTime}<br>
            <a href="${link}" target="_blank">Open WhatsApp for ${patientName}</a>
        </div>
      `;
    }).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-bulk-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateMessageText = (appointment) => {
    const patientName = appointment.patients?.name || appointment.patientName;
    const patientPhone = appointment.patients?.phone || appointment.patientPhone;
    
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
Dear ${patientName},

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

  const normalizePhoneNumber = (phone) => {
    let digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '234' + digits.substring(1);
    } else if (digits.startsWith('2340') && digits.length === 14) {
      digits = '234' + digits.substring(4);
    }
    
    return digits;
  };

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
              <p className="text-gray-600 text-sm">Generate WhatsApp messages for selected appointments</p>
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {selectedAppointmentsList.length} Appointment{selectedAppointmentsList.length > 1 ? 's' : ''} Selected
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedAppointmentsList.map(appointment => {
                const patientName = appointment.patients?.name || appointment.patientName;
                const patientPhone = appointment.patients?.phone || appointment.patientPhone;
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{patientName}</div>
                      <div className="text-sm text-gray-600">
                        {appointment.appointmentDate} at {appointment.appointmentTime} • {appointment.doctor}
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">How it works:</p>
                <p>This will generate an HTML file with individual WhatsApp links for each selected appointment. Open the file and click each link to send the message.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkWhatsApp(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={generateBulkWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Generate WhatsApp Links
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
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
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
    name: 'Magodo Specialist Hospital Ltd.',
    address: '10 Jaiye Oyedotun, Magodo G.R.A Phase II, Lagos, Nigeria',
    phone: '+234 706 756 8895',
    logo: '',
    primaryColor: '0000f9'
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
    patientResponse: '',
    patient_id: null
  });

  // Initialize and fetch data
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await initializeApp();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeApp = async () => {
    await Promise.all([fetchAppointments(), fetchPatients(), fetchHospitalInfo()]);
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (name, phone)
        `)
        .order('appointmentDate', { ascending: true })
        .order('appointmentTime', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
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

  // Patient management
  const createNewPatient = async (name, phone = '') => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{ 
          name, 
          phone: phone || 'Not provided',
          created_at: new Date()
        }])
        .select()
        .single();

      if (error) throw error;
      
      setPatients(prev => [...prev, data]);
      setSelectedPatient(data);
      setFormData(prev => ({
        ...prev,
        patientName: data.name,
        patientPhone: data.phone,
        patient_id: data.id
      }));
      
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error creating patient: ' + error.message);
      return null;
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientName: patient.name,
      patientPhone: patient.phone,
      patient_id: patient.id
    }));
  };

  const handleNewPatient = async (name) => {
    const patient = await createNewPatient(name);
    if (patient) {
      setPatientSearch(patient.name);
    }
  };

  const viewPatientHistory = (patient) => {
    setSelectedPatientHistory(patient);
    setShowPatientHistory(true);
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
      patientResponse: '',
      patient_id: null
    });
    setSelectedPatient(null);
    setPatientSearch('');
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
      // If no patient_id, create a new patient first
      let patientId = formData.patient_id;
      if (!patientId) {
        const newPatient = await createNewPatient(formData.patientName, formData.patientPhone);
        if (!newPatient) return;
        patientId = newPatient.id;
      }

      const appointmentData = {
        ...formData,
        patient_id: patientId
      };

      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
        
        setAppointments(prev => 
          prev.map(apt => apt.id === editingAppointment.id ? { ...apt, ...appointmentData } : apt)
        );
        alert('Appointment updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([{ ...appointmentData, createdAt: new Date() }])
          .select(`
            *,
            patients (name, phone)
          `);

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
      patientName: appointment.patients?.name || appointment.patientName || '',
      patientPhone: appointment.patients?.phone || appointment.patientPhone || '',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      doctor: appointment.doctor || '',
      department: appointment.department || '',
      reason: appointment.reason || '',
      specialInstructions: appointment.specialInstructions || '',
      status: appointment.status || 'scheduled',
      patientResponse: appointment.patientResponse || '',
      patient_id: appointment.patient_id || null
    });
    
    if (appointment.patient_id) {
      const patient = patients.find(p => p.id === appointment.patient_id);
      if (patient) {
        setSelectedPatient(patient);
        setPatientSearch(patient.name);
      }
    }
    
    setEditingAppointment(appointment);
    setCurrentAppointment(appointment);
    setView('add-appointment');
  };

  // Authentication
  const handleLogin = (user) => {
    setUser(user);
    initializeApp();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAppointments([]);
      setPatients([]);
      resetForm();
    } catch (error) {
      console.error('Logout error:', error);
    }
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
    const patientName = appointment.patients?.name || appointment.patientName;
    const patientPhone = appointment.patients?.phone || appointment.patientPhone;
    
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
Dear ${patientName},

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
    const patientPhone = appointment.patients?.phone || appointment.patientPhone;
    const phoneNumber = normalizePhoneNumber(patientPhone);
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
      ...appointments.map(apt => {
        const patientName = apt.patients?.name || apt.patientName;
        const patientPhone = apt.patients?.phone || apt.patientPhone;
        
        return headers.map(header => {
          let value = '';
          if (header === 'PatientName') value = patientName;
          else if (header === 'PatientPhone') value = patientPhone;
          else value = apt[header.toLowerCase()] || '';
          
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      })
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
          .select(`
            *,
            patients (name, phone)
          `);

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

  // Filter appointments with date range
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const patientName = apt.patients?.name || apt.patientName;
      const patientPhone = apt.patients?.phone || apt.patientPhone;
      
      const matchesSearch = patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patientPhone?.includes(searchTerm) ||
                           apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      
      // Date range filter logic
      let matchesDateRange = true;
      if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
        const appointmentDate = new Date(apt.appointmentDate);
        const startDate = new Date(dateRangeFilter.startDate);
        const endDate = new Date(dateRangeFilter.endDate);
        matchesDateRange = appointmentDate >= startDate && appointmentDate <= endDate;
      } else if (dateRangeFilter.startDate) {
        const appointmentDate = new Date(apt.appointmentDate);
        const startDate = new Date(dateRangeFilter.startDate);
        matchesDateRange = appointmentDate >= startDate;
      } else if (dateRangeFilter.endDate) {
        const appointmentDate = new Date(apt.appointmentDate);
        const endDate = new Date(dateRangeFilter.endDate);
        matchesDateRange = appointmentDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [appointments, searchTerm, statusFilter, dateRangeFilter]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointmentDate === today);
    
    return {
      total: appointments.length,
      today: todayAppointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      selected: selectedAppointments.size,
      totalPatients: patients.length
    };
  }, [appointments, selectedAppointments, patients]);

  // Show login if not authenticated
  if (!user) {
    return <LoginPage hospitalInfo={hospitalInfo} onLogin={handleLogin} />;
  }

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
            {/* Left: Logo & Hospital Name */}
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

            {/* Center: Navigation Links */}
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
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* User info */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>

              {/* Primary Action */}
              <button
                onClick={() => { setView('add-appointment'); resetForm(); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Appointment</span>
              </button>

              {/* Tools Dropdown */}
              <ToolsDropdown
                setShowStatistics={setShowStatistics}
                setShowCalendar={setShowCalendar}
                exportToCSV={exportToCSV}
                importFromCSV={importFromCSV}
                setShowCSVInstructions={setShowCSVInstructions}
              />

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
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
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.email}
                </div>
                <button
                  onClick={() => { setShowStatistics(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                  Statistics
                </button>
                <button
                  onClick={() => { setShowCalendar(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <Calendar className="w-4 h-4" />
                  Calendar View
                </button>
                <button
                  onClick={() => { exportToCSV(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <FileUp className="w-4 h-4" />
                  Export CSV
                </button>
                <label className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 cursor-pointer">
                  <FileDown className="w-4 h-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => { importFromCSV(e); setMobileMenuOpen(false); }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => { setShowCSVInstructions(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <Info className="w-4 h-4" />
                  CSV Instructions
                </button>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
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
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalPatients}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Selected</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.selected}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-yellow-600" />
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
                    {filteredAppointments.slice(0, 5).map(appointment => {
                      const patientName = appointment.patients?.name || appointment.patientName;
                      const patientPhone = appointment.patients?.phone || appointment.patientPhone;
                      
                      return (
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
                              <p className="font-medium text-gray-900">{patientName}</p>
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
                            {appointment.patient_id && (
                              <button
                                onClick={() => viewPatientHistory(patients.find(p => p.id === appointment.patient_id))}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition duration-200"
                                title="View Patient History"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) => setDateRangeFilter(prev => ({...prev, startDate: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) => setDateRangeFilter(prev => ({...prev, endDate: e.target.value}))}
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
                    {filteredAppointments.map(appointment => {
                      const patientName = appointment.patients?.name || appointment.patientName;
                      const patientPhone = appointment.patients?.phone || appointment.patientPhone;
                      
                      return (
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
                              <div className="text-sm font-medium text-gray-900">{patientName}</div>
                              <div className="text-sm text-gray-500">{patientPhone}</div>
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
                              {appointment.patient_id && (
                                <button
                                  onClick={() => viewPatientHistory(patients.find(p => p.id === appointment.patient_id))}
                                  className="text-purple-600 hover:text-purple-900 p-1"
                                  title="View Patient History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                              )}
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
                      );
                    })}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Search *
                  </label>
                  <PatientAutocomplete
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onPatientSelect={handlePatientSelect}
                    onNewPatient={handleNewPatient}
                    searchTerm={patientSearch}
                    onSearchChange={setPatientSearch}
                  />
                  {selectedPatient && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Patient selected: {selectedPatient.name} - {selectedPatient.phone}</span>
                      <button
                        type="button"
                        onClick={() => viewPatientHistory(selectedPatient)}
                        className="text-blue-600 hover:text-blue-800 ml-2 flex items-center gap-1"
                      >
                        <History className="w-3 h-3" />
                        View History
                      </button>
                    </div>
                  )}
                </div>

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
              © 2025 {hospitalInfo.name}. All rights reserved.
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

      {showPatientHistory && selectedPatientHistory && (
        <PatientHistoryModal
          patient={selectedPatientHistory}
          appointments={appointments}
          onClose={() => {
            setShowPatientHistory(false);
            setSelectedPatientHistory(null);
          }}
        />
      )}
    </div>
  );
};

export default HospitalAppointmentSystem;
