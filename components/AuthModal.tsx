import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AuthTabType, AuthModalProps } from '../types'; 
import { UserIcon, LockClosedIcon, EnvelopeIcon, IdentificationIcon } from './icons';

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'login', 
  onSwitchTab,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<AuthTabType>(initialTab);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
      setSuccessMessage(null);
      // Don't clear fields immediately, allow retry with same data
      // setFullName('');
      // setEmail('');
      // setPassword('');
      // setConfirmPassword('');
      // setAgreeToTerms(false);
    }
  }, [isOpen, initialTab]);

  const handleTabSwitch = (tab: AuthTabType) => {
    setActiveTab(tab);
    if (onSwitchTab) onSwitchTab(tab);
    setError(null); 
    setSuccessMessage(null);
    // Clear form fields on tab switch for a cleaner experience
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreeToTerms(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (activeTab === 'signup') {
      if (!fullName.trim()) {
        setError("Full name is required.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }
      if (!agreeToTerms) {
        setError("You must agree to the terms and conditions.");
        setIsLoading(false);
        return;
      }
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("A valid email is required.");
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

    setIsLoading(false);
    if (activeTab === 'login') {
      // Simulate successful login
      // In a real app, you'd get user data from the backend
      setSuccessMessage("Login successful! Welcome back.");
      onLoginSuccess({ email }); 
    } else { // Signup
      setSuccessMessage("Sign up successful! Please complete your profile.");
      onLoginSuccess({ email, fullName });
    }
  };

  const renderInput = (
    id: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (val: string) => void,
    IconComponent?: React.FC<React.SVGProps<SVGSVGElement>>
  ) => (
    <div className="relative mb-4">
      {IconComponent && <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-light focus:border-transparent outline-none transition-shadow ${IconComponent ? 'pl-10' : ''}`}
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeTab === 'login' ? "Welcome Back!" : "Create Account"} size="md">
      <div className="p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabSwitch('login')}
            className={`py-3 px-6 font-medium text-center w-1/2 transition-colors ${activeTab === 'login' ? 'text-brand border-b-2 border-brand' : 'text-textMuted hover:text-textBase'}`}
            aria-pressed={activeTab === 'login'}
          >
            Login
          </button>
          <button
            onClick={() => handleTabSwitch('signup')}
            className={`py-3 px-6 font-medium text-center w-1/2 transition-colors ${activeTab === 'signup' ? 'text-brand border-b-2 border-brand' : 'text-textMuted hover:text-textBase'}`}
            aria-pressed={activeTab === 'signup'}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        {successMessage && !error && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          {activeTab === 'signup' && (
            renderInput("fullName", "text", "Full Name", fullName, setFullName, IdentificationIcon)
          )}
          
          {renderInput("email", "email", "Email Address", email, setEmail, EnvelopeIcon)}
          {renderInput("password", "password", "Password", password, setPassword, LockClosedIcon)}

          {activeTab === 'signup' && (
            renderInput("confirmPassword", "password", "Confirm Password", confirmPassword, setConfirmPassword, LockClosedIcon)
          )}
          
          {activeTab === 'login' && (
            <div className="text-right mb-6">
              <a href="#" onClick={(e) => { e.preventDefault(); setError("Password reset is not implemented yet.");}} className="text-sm text-brand hover:underline">Forgot password?</a>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="mb-6">
              <label htmlFor="terms" className="flex items-center space-x-2 text-sm text-textMuted cursor-pointer">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="rounded text-brand focus:ring-brand-light"
                />
                <span>I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} className="text-brand hover:underline">Terms and Conditions</a></span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
            ) : (activeTab === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {activeTab === 'login' ? (
            <p className="text-textMuted">
              Don't have an account? <button onClick={() => handleTabSwitch('signup')} className="font-medium text-brand hover:underline">Sign Up</button>
            </p>
          ) : (
            <p className="text-textMuted">
              Already have an account? <button onClick={() => handleTabSwitch('login')} className="font-medium text-brand hover:underline">Login</button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;