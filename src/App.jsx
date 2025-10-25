import React, { useState, useEffect, useMemo } from 'react';
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

    return `Dear ${appointment.patientName},

You have been scheduled for an appointment at *${hospitalInfo.name}*.

*Appointment Details:*
Date: ${formattedDate}
Time: ${formattedTime}
Doctor: ${appointment.doctor}
Department: ${appointment.department}
Reason: ${appointment.reason}

${specialInstructionsSection}*Location:*
${hospitalInfo.address}

*Contact Us:*
${hospitalInfo.phone}

Please arrive 15 minutes before your scheduled time. If you need to reschedule, kindly contact us at least 24 hours in advance.

We look forward to seeing you and providing you with the best care!

Best regards,
${hospitalInfo.name} Team`.trim();
  };

  // Generate WhatsApp auto-opener HTML
  const generateWhatsAppAutoOpener = () => {
    const selectedApts = appointments.filter(apt => selectedAppointments.has(apt.id));
    
    if (selectedApts.length === 0) {
      alert('No appointments selected');
      return;
    }

    // Generate array of WhatsApp URLs with personalized messages
    const waLinks = selectedApts.map(appointment => {
      const shareText = generateMessageText(appointment);
      const phoneNumber = normalizePhoneNumber(appointment.patientPhone);
      return { 
        url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`, 
        patientName: appointment.patientName 
      };
    });

    const htmlContent = `<!DOCTYPE html>
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
      progress.textContent = 'Progress: ' + currentIndex + ' / ' + links.length + ' tabs opened';
    }

    function appendLog(message, isError = false) {
      const timestamp = new Date().toLocaleTimeString();
      log.textContent += timestamp + ' - ' + message + (isError ? ' (ERROR)' : '') + '\\n';
      log.scrollTop = log.scrollHeight;
    }

    function sendNext() {
      if (currentIndex >= links.length || isPaused) return;

      const item = links[currentIndex];
      const win = window.open(item.url, '_blank');
      if (win) {
        appendLog('Opened tab for ' + (item.patientName || 'Patient ' + (currentIndex + 1)));
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
      appendLog('Started opening with ' + delay + 'ms delay. Manually send in tabs!');
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
</html>`;

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
// PASSWORD CHANGE MODAL
// ============================================================================

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
              <p className="text-gray-600 text-sm">Update your account password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <Check className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <p className="text-sm text-green-700 mt-1">Password updated successfully!</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                placeholder="Confirm new password"
                required
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// USER MENU MODAL COMPONENT
// ============================================================================

const UserMenuModal = ({ 
  user, 
  isOpen, 
  onClose, 
  onLogout, 
  onShowStatistics, 
  onShowCalendar, 
  onExportCSV, 
  onImportCSV, 
  onShowCSVInstructions, 
  onShowSettings,
  onChangePassword
}) => {
  if (!isOpen) return null;

  const fileInputRef = React.createRef();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    onImportCSV(e);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          <p className="text-sm text-gray-600">Hospital Staff</p>
        </div>

        {/* Account Management */}
        <div className="py-2">
          <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Account
          </p>
          <button
            onClick={() => { onChangePassword(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            <Lock className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
          </button>
        </div>

        {/* Tools Section */}
        <div className="py-2 border-t border-gray-200">
          <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tools
          </p>
          <button
            onClick={() => { onShowStatistics(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            <BarChart3 className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Statistics</p>
              <p className="text-sm text-gray-600">View appointment analytics</p>
            </div>
          </button>
          <button
            onClick={() => { onShowCalendar(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            <Calendar className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Calendar View</p>
              <p className="text-sm text-gray-600">Browse by calendar</p>
            </div>
          </button>
        </div>

        {/* Data Management */}
        <div className="py-2 border-t border-gray-200">
          <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Data Management
          </p>
          <button
            onClick={() => { onExportCSV(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            <FileUp className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Export CSV</p>
              <p className="text-sm text-gray-600">Download appointments data</p>
            </div>
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            <FileDown className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Import CSV</p>
              <p className="text-sm text-gray-600">Upload appointments data</p>
            </div>
          </button>
        </div>

        {/* Settings & Logout */}
        <div className="py-2 border-t border-gray-200">
          <button
            onClick={() => { onShowSettings(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            <Settings className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Hospital Settings</p>
              <p className="text-sm text-gray-600">Customize hospital info</p>
            </div>
          </button>
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition duration-200"
          >
            <LogOut className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Logout</p>
              <p className="text-sm text-red-600">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

// ============================================================================
// NAVIGATION BAR COMPONENT
// ============================================================================

const NavigationBar = ({ 
  user, 
  hospitalInfo, 
  view, 
  setView, 
  resetForm,
  onLogout,
  onShowStatistics,
  onShowCalendar,
  onExportCSV,
  onImportCSV,
  onShowSettings,
  onChangePassword,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
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
            
            {/* Hospital Logo and Name */}
            <div className="flex items-center gap-3">
              {hospitalInfo.logo ? (
                <img 
                  src={hospitalInfo.logo} 
                  alt="Hospital Logo" 
                  className="h-8 w-8 object-contain rounded-lg"
                />
              ) : (
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {hospitalInfo.name || 'Hospital Name'}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Appointment Management System
                </p>
              </div>
            </div>
          </div>

          {/* Center: Navigation Links - Hidden on mobile */}
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
            {/* Primary Action - Always visible */}
            <button
              onClick={() => { setView('add-appointment'); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Appointment</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <User className="w-5 h-5" />
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <UserMenuModal
                user={user}
                isOpen={userMenuOpen}
                onClose={() => setUserMenuOpen(false)}
                onLogout={onLogout}
                onShowStatistics={onShowStatistics}
                onShowCalendar={onShowCalendar}
                onExportCSV={onExportCSV}
                onImportCSV={onImportCSV}
                onShowSettings={onShowSettings}
                onChangePassword={onChangePassword}
              />
            </div>
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
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HospitalAppointmentSystem = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const LOGOUT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  const resetLogoutTimer = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
    
    const timer = setTimeout(() => {
      handleAutoLogout();
    }, LOGOUT_TIMEOUT);
    
    setLogoutTimer(timer);
  };

  const handleAutoLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Reset your other states...
    alert('Automatically logged out after 30 minutes of inactivity.');
  };

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const activities = ['mousemove', 'keypress', 'click', 'scroll'];
    const handleActivity = () => resetLogoutTimer();

    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity);
    });

    resetLogoutTimer();

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity);
      });
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [user]);
  // State management
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientData, setNewPatientData] = useState({ name: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkWhatsApp, setShowBulkWhatsApp] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState(new Set());
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0, status: '' });
  const [isResetPasswordFlow, setIsResetPasswordFlow] = useState(false);
  
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'Hospital Name',
    address: 'Enter hospital address',
    phone: '+234 XXX XXX XXXX',
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
    patientResponse: '',
    patientId: null,
    createdBy: '',
    lastModifiedBy: ''
  });

  // Check for password reset flow on component mount
  useEffect(() => {
    checkAuth();
    checkPasswordResetFlow();
  }, []);

  const checkPasswordResetFlow = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'recovery') {
      setIsResetPasswordFlow(true);
    }
  };

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

  // Data fetching functions
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointmentDate', { ascending: true });
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
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
      setPatients([]);
    }
  };

  const fetchHospitalInfo = async () => {
    try {
      const savedInfo = localStorage.getItem('hospitalInfo');
      if (savedInfo) {
        setHospitalInfo(JSON.parse(savedInfo));
        setTempSettings(JSON.parse(savedInfo));
      }
      
      // Also try to fetch from database
      const { data, error } = await supabase
        .from('hospital_info')
        .select('*')
        .eq('id', 'info')
        .single();

      if (data && !error) {
        setHospitalInfo(data);
        setTempSettings(data);
      }
    } catch (error) {
      console.error('Error fetching hospital info:', error);
    }
  };

  // Form handling functions
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
      patientId: null,
      createdBy: user?.email || '',
      lastModifiedBy: user?.email || ''
    });
    setSelectedPatient(null);
    setPatientSearch('');
    setEditingAppointment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientId: patient.id
    }));
  };

  const handleNewPatientClick = (name) => {
  setNewPatientData({ name, phone: formData.patientPhone || '' });
  setShowNewPatientModal(true);
  };
  
  const handleCreateNewPatient = async () => {
    if (!newPatientData.name.trim()) {
      alert('Patient name is required');
      return;
    }
  
    if (!newPatientData.phone.trim()) {
      alert('Patient phone number is required');
      return;
    }

  try {
    const newPatient = {
      name: newPatientData.name.trim(),
      phone: newPatientData.phone.trim(),
      createdAt: new Date().toISOString(),
      createdBy: user?.email || ''
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([newPatient])
      .select()
      .single();

    if (error) throw error;
    
    setPatients(prev => [...prev, data]);
    handlePatientSelect(data);
    setShowNewPatientModal(false);
    setNewPatientData({ name: '', phone: '' });
    alert(`New patient "${newPatientData.name}" created successfully!`);
  } catch (error) {
    console.error('Error creating patient:', error);
    alert('Error creating patient: ' + error.message);
  }
};

const handleCloseNewPatientModal = () => {
  setShowNewPatientModal(false);
  setNewPatientData({ name: '', phone: '' });
};
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.email || '',
        lastModifiedBy: user?.email || ''
      };

      if (editingAppointment) {
        // Update existing appointment
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
        // Create new appointment
        const { data, error } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select()
          .single();

        if (error) throw error;
        
        setAppointments(prev => [...prev, data]);
        alert('Appointment created successfully!');
      }

      resetForm();
      setView('appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error saving appointment: ' + error.message);
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

    return `Dear ${appointment.patientName},

You have been scheduled for an appointment at *${hospitalInfo.name}*.

*Appointment Details:*
Date: ${formattedDate}
Time: ${formattedTime}
Doctor: ${appointment.doctor}
Department: ${appointment.department}
Reason: ${appointment.reason}

${specialInstructionsSection}*Location:*
${hospitalInfo.address}

*Contact Us:*
${hospitalInfo.phone}

Please arrive 15 minutes before your scheduled time. If you need to reschedule, kindly contact us at least 24 hours in advance.

We look forward to seeing you and providing you with the best care!

Best regards,
${hospitalInfo.name} Team`.trim();
  };

  const shareSingleAppointment = (appointment) => {
    const shareText = generateMessageText(appointment);
    const phoneNumber = normalizePhoneNumber(appointment.patientPhone);
    const windowName = `whatsapp_${appointment.id}_${Date.now()}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappURL, windowName);
  };

  // CSV Export/Import
  const exportToCSV = () => {
    const headers = ['Patient Name', 'Phone', 'Date', 'Time', 'Doctor', 'Department', 'Reason', 'Status', 'Created By', 'Last Modified By'];
    const csvData = appointments.map(apt => [
      apt.patientName,
      apt.patientPhone,
      apt.appointmentDate,
      apt.appointmentTime,
      apt.doctor,
      apt.department,
      apt.reason,
      apt.status,
      apt.createdBy,
      apt.lastModifiedBy
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const newAppointments = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const appointment = {
            patientName: values[0] || '',
            patientPhone: values[1] || '',
            appointmentDate: values[2] || '',
            appointmentTime: values[3] || '',
            doctor: values[4] || '',
            department: values[5] || '',
            reason: values[6] || '',
            status: values[7] || 'scheduled',
            createdBy: user?.email || '',
            lastModifiedBy: user?.email || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          newAppointments.push(appointment);
        }

        // Insert into database
        const { error } = await supabase
          .from('appointments')
          .insert(newAppointments);

        if (error) throw error;
        
        await fetchAppointments();
        alert(`Successfully imported ${newAppointments.length} appointments`);
        
        // Reset file input
        e.target.value = '';
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV: ' + error.message);
      }
    };
    
    reader.readAsText(file);
  };

  // Authentication handlers
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

  const handlePasswordResetComplete = () => {
    setIsResetPasswordFlow(false);
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

  // Filter appointments based on search and filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.patientPhone?.includes(searchTerm) ||
                           apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      
      const matchesDateRange = (!dateRangeFilter.startDate || apt.appointmentDate >= dateRangeFilter.startDate) &&
                             (!dateRangeFilter.endDate || apt.appointmentDate <= dateRangeFilter.endDate);
      
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
      selected: selectedAppointments.size
    };
  }, [appointments, selectedAppointments]);

  // Apply theme colors
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', hospitalInfo.primaryColor);
  }, [hospitalInfo.primaryColor]);

  // Show appropriate component based on authentication state
  if (isResetPasswordFlow) {
    return (
      <PasswordResetPage 
        hospitalInfo={hospitalInfo} 
        onPasswordReset={handlePasswordResetComplete}
      />
    );
  }

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
    <div className="min-h-screen bg-gray-50" style={{ 
      '--primary-color': hospitalInfo.primaryColor,
      '--color-primary': hospitalInfo.primaryColor 
    }}>
      {/* Navigation Bar */}
      <NavigationBar
        user={user}
        hospitalInfo={hospitalInfo}
        view={view}
        setView={setView}
        resetForm={resetForm}
        onLogout={handleLogout}
        onShowStatistics={() => setShowStatistics(true)}
        onShowCalendar={() => setShowCalendar(true)}
        onExportCSV={exportToCSV}
        onImportCSV={importFromCSV}
        onShowSettings={() => setShowSettings(true)}
        onChangePassword={() => setShowPasswordChange(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
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
                              onClick={() => {
                                setEditingAppointment(appointment);
                                setFormData({
                                  patientName: appointment.patientName,
                                  patientPhone: appointment.patientPhone,
                                  appointmentDate: appointment.appointmentDate,
                                  appointmentTime: appointment.appointmentTime,
                                  doctor: appointment.doctor,
                                  department: appointment.department,
                                  reason: appointment.reason,
                                  specialInstructions: appointment.specialInstructions,
                                  status: appointment.status,
                                  patientResponse: appointment.patientResponse,
                                  patientId: appointment.patientId,
                                  createdBy: appointment.createdBy,
                                  lastModifiedBy: user?.email || ''
                                });
                                setView('add-appointment');
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this appointment?')) {
                                  try {
                                    const { error } = await supabase
                                      .from('appointments')
                                      .delete()
                                      .eq('id', appointment.id);
                                    
                                    if (error) throw error;
                                    
                                    setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
                                    setSelectedAppointments(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(appointment.id);
                                      return newSet;
                                    });
                                    alert('Appointment deleted successfully!');
                                  } catch (error) {
                                    console.error('Error deleting appointment:', error);
                                    alert('Error deleting appointment: ' + error.message);
                                  }
                                }
                              }}
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
          </div>
        )}

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

              <form onSubmit={handleSubmitAppointment} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Search
                    </label>
                    <PatientAutocomplete
                      patients={patients}
                      selectedPatient={selectedPatient}
                      onPatientSelect={handlePatientSelect}
                      onNewPatient={handleNewPatientClick}
                      searchTerm={patientSearch}
                      onSearchChange={setPatientSearch}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Phone
                    </label>
                    <input
                      type="text"
                      name="patientPhone"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date
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
                      Appointment Time
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
                      placeholder="Doctor's name"
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
                      placeholder="Department"
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
                    onClick={() => { setView('appointments'); resetForm(); }}
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
      {showPasswordChange && (
        <PasswordChangeModal
          isOpen={showPasswordChange}
          onClose={() => setShowPasswordChange(false)}
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

      {showSettings && (
        <SettingsModal
          tempSettings={tempSettings}
          setTempSettings={setTempSettings}
          hospitalInfo={hospitalInfo}
          setHospitalInfo={setHospitalInfo}
          setShowSettings={setShowSettings}
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
    {showNewPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Create New Patient</h2>
                  <p className="text-gray-600 text-sm">Add patient details</p>
                </div>
              </div>
              <button
                onClick={handleCloseNewPatientModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={newPatientData.name}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, name: e.target.value }))}
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
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseNewPatientModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewPatient}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                >
                  Create Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAppointmentSystem;

