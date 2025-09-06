import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import apiService from '../services/api';

// --- Helper Data ---
const INTERESTS = [
  'Gaming', 'Technology', 'Science', 'Programming', 'Movies', 'Music',
  'Art & Design', 'Books', 'Travel', 'Fitness', 'Food', 'Finance'
];

// --- Step 1: Sign Up Form Component ---
const SignUpForm = ({ onSubmit, isSubmitting, error }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent submission if already in progress
    onSubmit({ email, username, password });
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center mb-6">
        <img alt="Reddit logo" className="h-8 w-8 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArk5zM6LUnu6xZaJNY8c-MTV2t2IvQHyK8w3cEizmgS8DaJR3h_bCEuk53vESSF6b8S5fL_XUoSGisvnnxdXGlGeV8T3hfAhC7gAke98R5SA0RjiJiU6maV7OuJorAPrnzDJPa1D9GTRAz9XAppOHq7Eb2KRWIq_K1P-dCLWMUg_Iugh6vLl6WzNWWKT3Xxt46MzKiH377MRCvi0mSdriP_yH9OYiXlkjo5yLrRupcfKFbtnIDFvkgVw8tHMe7gecqxRJ7wOa817xD" />
        <span className="text-gray-100 text-2xl font-bold">reddit</span>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Create your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-400 mb-1 block" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-400 mb-1 block" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Choose a username"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-400 mb-1 block" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Create a password"
            required
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
             </>
          ) : (
            'Continue'
          )}
        </button>
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </form>
      <p className="text-center text-xs text-gray-500 mt-6">
        Already a redditor? <a href="/login" className="text-blue-400 hover:underline">Log In</a>
      </p>
    </div>
  );
};

// --- Step 2: OTP Verification Component ---
const OtpVerification = ({ onSubmit, email, error, isSubmitting }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(otp);
  };

  return (
    <div className="w-full max-w-md text-center">
      <i className="material-icons text-blue-500 text-5xl mb-4">mark_email_read</i>
      <h2 className="text-2xl font-bold text-gray-100 mb-2">Verify your email</h2>
      <p className="text-gray-400 mb-6">
        We've sent a verification code to <span className="font-semibold text-gray-200">{email}</span>. Please enter it below.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 text-gray-200 text-center tracking-[0.5em] text-lg px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
          placeholder="_ _ _ _ _ _"
          maxLength="6"
          required
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </button>
      </form>
       <p className="text-center text-xs text-gray-500 mt-6">
        Didn't receive the code? <a href="#" className="text-blue-400 hover:underline">Resend</a>
      </p>
    </div>
  );
};

// --- Step 3: Interest Selection Component ---
const InterestSelection = ({ onSubmit, isSubmitting, error }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    );
  };
  
  const handleSubmit = () => {
    onSubmit(selectedInterests);
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-2xl font-bold text-gray-100 mb-2">Customize your feed</h2>
      <p className="text-gray-400 mb-6">Select a few interests to get started.</p>
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {INTERESTS.map(interest => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 text-sm
                ${isSelected
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-600'
                }`
              }
            >
              {interest}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleSubmit}
        className="w-full max-w-xs bg-blue-600 text-white font-semibold py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={selectedInterests.length < 3 || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </>
        ) : (
          `Finish ${selectedInterests.length > 0 ? `(${selectedInterests.length})` : ''}`
        )}
      </button>
      {selectedInterests.length < 3 && 
        <p className="text-xs text-gray-500 mt-2">Select at least {3 - selectedInterests.length} more.</p>
      }
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};


// --- Main Page Component to manage the signup flow ---
function SignUpPage() {
  const navigate = useNavigate(); // Initialize navigate
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Called from SignUpForm to handle OTP sending
  const handleSignUpSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    console.log("Sign Up Data:", data);
    
    try {
      const response = await apiService.signupStart(data);
      console.log("OTP sent successfully:", response);
      setUserData(data);
      setStep(2);
    } catch (error) {
      console.error("Signup failed:", error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called from OtpVerification
  const handleOtpSubmit = async (otp) => {
    setOtpError('');
    setIsSubmitting(true);
    
    try {
      const response = await apiService.verifyOtp(userData.email, otp);
      console.log("OTP verified successfully:", response);
      setStep(3);
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtpError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Called from InterestSelection
  const handleInterestSubmit = async (interests) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await apiService.signupComplete(userData.email, interests);
      console.log("Signup completed successfully:", response);
      alert("Signup complete! Please log in.");
      navigate('/login'); // KEY CHANGE: Redirect to login page
    } catch (error) {
      console.error("Signup completion failed:", error);
      setError(error.message || 'Failed to complete signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SignUpForm onSubmit={handleSignUpSubmit} isSubmitting={isSubmitting} error={error} />;
      case 2:
        return <OtpVerification onSubmit={handleOtpSubmit} email={userData?.email} error={otpError} isSubmitting={isSubmitting} />;
      case 3:
        return <InterestSelection onSubmit={handleInterestSubmit} isSubmitting={isSubmitting} error={error} />;
      default:
        return <SignUpForm onSubmit={handleSignUpSubmit} isSubmitting={isSubmitting} error={error} />;
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg w-full max-w-screen-sm mx-auto flex justify-center">
        {renderStep()}
      </div>
    </div>
  );
}

export default SignUpPage;