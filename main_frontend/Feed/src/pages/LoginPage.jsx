import React, { useState } from 'react';
import apiService from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiService.login(email, password);
      console.log("Login successful:", response);
      
      // Store user data in localStorage for session management
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to feed
      window.location.assign('/');
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg w-full max-w-md mx-auto">
        <div className="flex items-center justify-center mb-6">
          <img 
            alt="Reddit logo" 
            className="h-8 w-8 mr-2" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuArk5zM6LUnu6xZaJNY8c-MTV2t2IvQHyK8w3cEizmgS8DaJR3h_bCEuk53vESSF6b8S5fL_XUoSGisvnnxdXGlGeV8T3hfAhC7gAke98R5SA0RjiJiU6maV7OuJorAPrnzDJPa1D9GTRAz9XAppOHq7Eb2KRWIq_K1P-dCLWMUg_Iugh6vLl6WzNWWKT3Xxt46MzKiH377MRCvi0mSdriP_yH9OYiXlkjo5yLrRupcfKFbtnIDFvkgVw8tHMe7gecqxRJ7wOa817xD" 
          />
          <span className="text-gray-100 text-2xl font-bold">reddit</span>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Log In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-400 mb-1 block" htmlFor="email">
              Email
            </label>
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
            <label className="text-sm font-semibold text-gray-400 mb-1 block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500 disabled:opacity-50"
              placeholder="Enter your password"
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
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </form>
        
        <p className="text-center text-xs text-gray-500 mt-6">
          Don't have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
