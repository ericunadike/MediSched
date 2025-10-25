import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; 
import { 
  Calendar, Clock, User, MapPin, Phone, Stethoscope, 
  Share2, Plus, Settings, Save, Upload, Download, 
  Users, Mail, Filter, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  FileUp, FileDown, Edit3, Trash2, Info, Search, Check, XCircle,
  AlertCircle, Image, BarChart3, TrendingUp, Activity,
  LogOut, History, UserPlus, Lock, Key, Eye, EyeOff,
  MessageCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================================

const Toast = ({ message, type = 'info', onClose }) => {
  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-orange-50 border-orange-200',
    error: 'bg-red-50 border-red-200'
  };

  const textColor = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-orange-800',
    error: 'text-red-800'
  };

  const icons = {
    info: Info,
    success: Check,
    warning: AlertCircle,
    error: XCircle
  };

  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 min-w-80 ${bgColor[type]} ${textColor[type]} shadow-lg`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 shadow-2xl min-w-48 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-gray-700 text-sm">{message}</p>
    </div>
  </div>
);

// ============================================================================
// AUTHENTICATION COMPONENT
// ============================================================================

const LoginPage = ({ hospitalInfo, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setResetSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (showForgotPassword) {
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
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {resetSent ? (
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Reset Link Sent!
                  </h3>
                  <p className="text-green-700">
                    Check your email for a password reset link. The link will expire in 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="resetEmail"
                      name="resetEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

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

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
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
// PASSWORD RESET COMPONENT
// ============================================================================

const PasswordResetPage = ({ hospitalInfo, onPasswordReset }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onPasswordReset();
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              <div className="bg-green-600 p-3 rounded-xl">
                <Check className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Password Updated!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your password has been successfully reset
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="bg-green-50 rounded-lg p-6">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Success!
              </h3>
              <p className="text-green-700">
                Your password has been updated successfully. Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Key className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a new password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
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
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ hospitalInfo, setHospitalInfo, setShowSettings }) => {
  const [formData, setFormData] = useState({ ...hospitalInfo });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(hospitalInfo.logo);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      let logoUrl = formData.logo;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('hospital-logos')
          .upload(fileName, logoFile);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('hospital-logos')
          .getPublicUrl(fileName);
          
        logoUrl = data.publicUrl;
      }
      
      const updatedInfo = {
        ...formData,
        logo: logoUrl
      };
      
      localStorage.setItem('hospitalInfo', JSON.stringify(updatedInfo));
      setHospitalInfo(updatedInfo);
      
      document.documentElement.style.setProperty('--primary-color', updatedInfo.primaryColor);
      
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setFormData(prev => ({ ...prev, logo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Hospital Logo" className="w-full h-full object-contain" />
                ) : (
                  <Image className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Change Logo
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px PNG or JPG</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter hospital name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter hospital address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  onClick={() => setFormData(prev => ({ ...prev, primaryColor: color.value }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.primaryColor === color.value 
                      ? 'border-gray-400 ring-2 ring-offset-2 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {colorOptions.find(c => c.value === formData.primaryColor)?.name}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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

const AppointmentScheduler = () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  // Authentication & Session
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Application State
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'MediCare Hospital',
    address: '123 Healthcare St, Medical City',
    logo: '',
    primaryColor: '#3b82f6'
  });
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form State
  const [currentAppointment, setCurrentAppointment] = useState({
    patientName: '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    department: '',
    doctor: '',
    notes: '',
    status: 'scheduled'
  });
  
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Operations
  const [operationLoading, setOperationLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Password Reset
  const [passwordResetMode, setPasswordResetMode] = useState(false);
  
  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================
  
  const showToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);
  
  // ==========================================================================
  // VALIDATION FUNCTIONS
  // ==========================================================================
  
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };
  
  const validateAppointmentDateTime = async (date, time, excludeAppointmentId = null) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      return 'Appointment date and time must be in the future';
    }
    
    const conflictingAppointment = appointments.find(apt => {
      if (apt.id === excludeAppointmentId) return false;
      return apt.appointmentDate === date && apt.appointmentTime === time;
    });
    
    if (conflictingAppointment) {
      return 'Another appointment already exists at this date and time';
    }
    
    return null;
  };
  
  // ==========================================================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================================================
  
  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const checkPasswordResetFlow = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user?.aud === 'authenticated') {
        setPasswordResetMode(true);
      }
    }
  }, []);
  
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setOperationLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error during logout', 'error');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handlePasswordResetComplete = () => {
    setPasswordResetMode(false);
    showToast('Password updated successfully', 'success');
  };
  
  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    const handleUserActivity = () => {
      resetActivityTimer();
    };
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetActivityTimer]);
  
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeSinceLastActivity > thirtyMinutes) {
        handleLogout();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user, lastActivity]);
  
  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================
  
  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    
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
      showToast('Error loading appointments', 'error');
    }
  }, [user]);
  
  const fetchPatients = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showToast('Error loading patients', 'error');
    }
  }, [user]);
  
  const loadHospitalInfo = useCallback(() => {
    const saved = localStorage.getItem('hospitalInfo');
    if (saved) {
      const info = JSON.parse(saved);
      setHospitalInfo(info);
      document.documentElement.style.setProperty('--primary-color', info.primaryColor);
    }
  }, []);
  
  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  
  useEffect(() => {
    checkAuth();
    checkPasswordResetFlow();
    loadHospitalInfo();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'PASSWORD_RECOVERY') {
        setPasswordResetMode(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [checkAuth, checkPasswordResetFlow, loadHospitalInfo]);
  
  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchPatients();
    }
  }, [user, fetchAppointments, fetchPatients]);
  
  // ==========================================================================
  // PATIENT MANAGEMENT
  // ==========================================================================
  
  const handleCreateNewPatient = async (name) => {
    if (!name.trim()) {
      showToast('Patient name is required', 'error');
      return null;
    }
    
    setOperationLoading(true);
    
    try {
      const phone = prompt('Enter phone number for the new patient:');
      if (!phone || !validatePhoneNumber(phone)) {
        showToast('Valid phone number is required', 'error');
        return null;
      }
      
      const { data, error } = await supabase
        .from('patients')
        .insert([{ name: name.trim(), phone: phone.trim() }])
        .select()
        .single();
        
      if (error) throw error;
      
      setPatients(prev => [...prev, data]);
      setSelectedPatient(data);
      setPatientSearch(name.trim());
      showToast('Patient created successfully', 'success');
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      showToast('Error creating patient', 'error');
      return null;
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setCurrentAppointment(prev => ({
      ...prev,
      patientName: patient.name,
      patientPhone: patient.phone
    }));
  };
  
  // ==========================================================================
  // APPOINTMENT MANAGEMENT
  // ==========================================================================
  
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    
    try {
      // Validation
      if (!currentAppointment.patientName.trim()) {
        showToast('Patient name is required', 'error');
        return;
      }
      
      if (!currentAppointment.patientPhone.trim() || !validatePhoneNumber(currentAppointment.patientPhone)) {
        showToast('Valid phone number is required', 'error');
        return;
      }
      
      if (!currentAppointment.appointmentDate || !currentAppointment.appointmentTime) {
        showToast('Appointment date and time are required', 'error');
        return;
      }
      
      if (!currentAppointment.department.trim()) {
        showToast('Department is required', 'error');
        return;
      }
      
      if (!currentAppointment.doctor.trim()) {
        showToast('Doctor is required', 'error');
        return;
      }
      
      // Check for time conflicts
      const timeConflict = await validateAppointmentDateTime(
        currentAppointment.appointmentDate,
        currentAppointment.appointmentTime,
        editingAppointment?.id
      );
      
      if (timeConflict) {
        showToast(timeConflict, 'error');
        return;
      }
      
      let appointmentData = {
        ...currentAppointment,
        patientName: currentAppointment.patientName.trim(),
        patientPhone: currentAppointment.patientPhone.trim(),
        department: currentAppointment.department.trim(),
        doctor: currentAppointment.doctor.trim(),
        notes: currentAppointment.notes.trim()
      };
      
      if (editingAppointment) {
        // Update existing appointment
        const { data, error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointment.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setAppointments(prev => prev.map(apt => apt.id === editingAppointment.id ? data : apt));
        showToast('Appointment updated successfully', 'success');
      } else {
        // Create new appointment
        const { data, error } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select()
          .single();
          
        if (error) throw error;
        
        setAppointments(prev => [...prev, data]);
        showToast('Appointment created successfully', 'success');
      }
      
      // Reset form
      setCurrentAppointment({
        patientName: '',
        patientPhone: '',
        appointmentDate: '',
        appointmentTime: '',
        department: '',
        doctor: '',
        notes: '',
        status: 'scheduled'
      });
      setSelectedPatient(null);
      setPatientSearch('');
      setEditingAppointment(null);
      setView('dashboard');
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      showToast('Error saving appointment', 'error');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setCurrentAppointment(appointment);
    setSelectedPatient(patients.find(p => p.name === appointment.patientName && p.phone === appointment.patientPhone) || null);
    setPatientSearch(appointment.patientName);
    setView('add-appointment');
  };
  
  const handleDeleteAppointment = async (appointment) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    setOperationLoading(true);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);
        
      if (error) throw error;
      
      setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
      showToast('Appointment deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showToast('Error deleting appointment', 'error');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handleStatusChange = async (appointment, newStatus) => {
    setOperationLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setAppointments(prev => prev.map(apt => apt.id === appointment.id ? data : apt));
      showToast(`Appointment marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showToast('Error updating appointment status', 'error');
    } finally {
      setOperationLoading(false);
    }
  };
  
  // ==========================================================================
  // DATA EXPORT/IMPORT
  // ==========================================================================
  
  const exportToCSV = () => {
    setOperationLoading(true);
    
    try {
      const headers = ['Patient Name', 'Phone', 'Date', 'Time', 'Department', 'Doctor', 'Status', 'Notes'];
      const csvData = appointments.map(apt => [
        apt.patientName,
        apt.patientPhone,
        apt.appointmentDate,
        apt.appointmentTime,
        apt.department,
        apt.doctor,
        apt.status,
        apt.notes || ''
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      showToast('Appointments exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('Error exporting appointments', 'error');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setOperationLoading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const importedAppointments = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
            const appointment = {};
            headers.forEach((header, index) => {
              appointment[header.toLowerCase().replace(' ', '')] = values[index] || '';
            });
            return appointment;
          })
          .filter(apt => apt.patientname && apt.appointmentdate && apt.appointmenttime);
        
        if (importedAppointments.length === 0) {
          showToast('No valid appointments found in CSV', 'warning');
          return;
        }
        
        const { data, error } = await supabase
          .from('appointments')
          .insert(importedAppointments)
          .select();
          
        if (error) throw error;
        
        setAppointments(prev => [...prev, ...data]);
        showToast(`${data.length} appointments imported successfully`, 'success');
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Error importing CSV:', error);
        showToast('Error importing appointments', 'error');
      } finally {
        setOperationLoading(false);
      }
    };
    
    reader.readAsText(file);
  };
  
  // ==========================================================================
  // FILTERED DATA
  // ==========================================================================
  
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone.includes(searchTerm) ||
        apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(apt => apt.appointmentDate === today);
          break;
        case 'tomorrow':
          filtered = filtered.filter(apt => apt.appointmentDate === tomorrow);
          break;
        case 'week':
          const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          filtered = filtered.filter(apt => apt.appointmentDate >= today && apt.appointmentDate <= weekFromNow);
          break;
        case 'month':
          const monthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          filtered = filtered.filter(apt => apt.appointmentDate >= today && apt.appointmentDate <= monthFromNow);
          break;
      }
    }
    
    return filtered;
  }, [appointments, searchTerm, statusFilter, dateFilter]);
  
  // ==========================================================================
  // RENDER CONDITIONS
  // ==========================================================================
  
  if (loading || operationLoading) {
    return <LoadingSpinner message={operationLoading ? "Processing..." : "Loading..."} />;
  }
  
  if (!user && !passwordResetMode) {
    return <LoginPage hospitalInfo={hospitalInfo} onLogin={setUser} />;
  }
  
  if (passwordResetMode) {
    return (
      <PasswordResetPage 
        hospitalInfo={hospitalInfo} 
        onPasswordReset={handlePasswordResetComplete}
      />
    );
  }
  
  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50" onClick={resetActivityTimer}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                {hospitalInfo.logo ? (
                  <img 
                    src={hospitalInfo.logo} 
                    alt="Hospital Logo" 
                    className="h-8 w-auto"
                  />
                ) : (
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{hospitalInfo.name}</h1>
                  <p className="text-sm text-gray-600">Appointment System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCalendar(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                <Calendar className="w-4 h-4" />
                Calendar View
              </button>
              
              <button
                onClick={() => setShowStatistics(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                Statistics
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:shadow-none transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
                <div className="flex items-center gap-3">
                  {hospitalInfo.logo ? (
                    <img 
                      src={hospitalInfo.logo} 
                      alt="Hospital Logo" 
                      className="h-8 w-auto"
                    />
                  ) : (
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="font-semibold text-gray-900">{hospitalInfo.name}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                <button
                  onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition duration-200 ${
                    view === 'dashboard' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </button>
                
                <button
                  onClick={() => { setView('add-appointment'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition duration-200 ${
                    view === 'add-appointment' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">New Appointment</span>
                </button>
                
                <button
                  onClick={() => { setShowCalendar(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Calendar View</span>
                </button>
                
                <button
                  onClick={() => { setShowStatistics(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Statistics</span>
                </button>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Export CSV</span>
                  </button>
                  
                  <label className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200 cursor-pointer">
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Import CSV</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={importFromCSV}
                      className="hidden"
                    />
                  </label>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {view === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                    <p className="text-gray-600">Manage and track all appointments</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                    
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {filteredAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Department
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredAppointments.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50 transition duration-150">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{appointment.patientName}</div>
                                  <div className="text-sm text-gray-600">{appointment.patientPhone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{appointment.appointmentDate}</div>
                                <div className="text-sm text-gray-600">{appointment.appointmentTime}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{appointment.department}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{appointment.doctor}</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={appointment.status} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditAppointment(appointment)}
                                    className="p-1 text-blue-600 hover:text-blue-800 transition duration-200"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(appointment)}
                                    className="p-1 text-red-600 hover:text-red-800 transition duration-200"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  {appointment.status === 'scheduled' && (
                                    <button
                                      onClick={() => handleStatusChange(appointment, 'confirmed')}
                                      className="p-1 text-green-600 hover:text-green-800 transition duration-200"
                                      title="Confirm"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                    <button
                                      onClick={() => handleStatusChange(appointment, 'cancelled')}
                                      className="p-1 text-orange-600 hover:text-orange-800 transition duration-200"
                                      title="Cancel"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                      <p className="text-gray-600 mb-6">Get started by creating a new appointment</p>
                      <button
                        onClick={() => setView('add-appointment')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                      >
                        Create Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'add-appointment' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                  </h2>
                  <p className="text-gray-600">
                    {editingAppointment ? 'Update appointment details' : 'Schedule a new appointment for a patient'}
                  </p>
                </div>

                <form onSubmit={handleSubmitAppointment} className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search or Create Patient
                        </label>
                        <PatientAutocomplete
                          patients={patients}
                          selectedPatient={selectedPatient}
                          onPatientSelect={handlePatientSelect}
                          onNewPatient={handleCreateNewPatient}
                          searchTerm={patientSearch}
                          onSearchChange={setPatientSearch}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Patient Name
                          </label>
                          <input
                            type="text"
                            required
                            value={currentAppointment.patientName}
                            onChange={(e) => setCurrentAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter patient name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            value={currentAppointment.patientPhone}
                            onChange={(e) => setCurrentAppointment(prev => ({ ...prev, patientPhone: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Date
                          </label>
                          <input
                            type="date"
                            required
                            value={currentAppointment.appointmentDate}
                            onChange={(e) => setCurrentAppointment(prev => ({ ...prev, appointmentDate: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Time
                          </label>
                          <input
                            type="time"
                            required
                            value={currentAppointment.appointmentTime}
                            onChange={(e) => setCurrentAppointment(prev => ({ ...prev, appointmentTime: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <input
                            type="text"
                            required
                            value={currentAppointment.department}
                            onChange={(e) => setCurrentAppointment(prev => ({ ...prev, department: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g., Cardiology"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Doctor
                          </label>
                          <input
                            type="text"
                            required
                            value={currentAppointment.doctor}
                            onChange={(e) => setCurrentAppointment(prev => ({ ...prev, doctor: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g., Dr. Smith"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={currentAppointment.status}
                          onChange={(e) => setCurrentAppointment(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No Show</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={currentAppointment.notes}
                          onChange={(e) => setCurrentAppointment(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setView('dashboard');
                        setEditingAppointment(null);
                        setCurrentAppointment({
                          patientName: '',
                          patientPhone: '',
                          appointmentDate: '',
                          appointmentTime: '',
                          department: '',
                          doctor: '',
                          notes: '',
                          status: 'scheduled'
                        });
                        setSelectedPatient(null);
                        setPatientSearch('');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                    >
                      {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          hospitalInfo={hospitalInfo}
          setHospitalInfo={setHospitalInfo}
          setShowSettings={setShowSettings}
        />
      )}

      {showStatistics && (
        <StatisticsModal
          appointments={appointments}
          setShowStatistics={setShowStatistics}
        />
      )}

      {showCalendar && (
        <CalendarView
          appointments={appointments}
          setView={setView}
          setEditingAppointment={setEditingAppointment}
          setCurrentAppointment={setCurrentAppointment}
          setShowCalendar={setShowCalendar}
        />
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-gray-600 text-sm">Are you sure you want to logout?</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AppointmentScheduler;
