import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state && location.state.email ? location.state.email : '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setError("OTP expired. Please request a new one.");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp) {
      setError('Email and OTP are required');
      return;
    }

    if (timeLeft <= 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5001/api/user/verify-email',
        { email, otp },
        { withCredentials: true }
      );

      setLoading(false);
      setSuccess(data.message || 'Email verified successfully!');
      
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message || `Server Error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    if (!email) {
      setError('Email is required');
      setResendLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        'http://localhost:5001/api/user/resend-otp',
        { email },
        { withCredentials: true }
      );

      setResendLoading(false);
      setSuccess(data.message || 'New OTP sent successfully!');
      setTimeLeft(600); // Reset timer to 10 minutes
      setOtp(''); // Clear OTP field
      
    } catch (err) {
      setResendLoading(false);
      if (err.response) {
        setError(err.response.data.message || `Server Error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <section className="verification-section">
      <div className="verification-container">
        <h2 className="verification-title">Verify Your Email</h2>
        
        {email && (
          <p className="verification-email-info">
            We've sent a verification code to: <strong>{email}</strong>
          </p>
        )}
        
        {timeLeft > 0 && (
          <div className="verification-timer">
            <p>Time remaining: <span className="timer-value">{formatTime(timeLeft)}</span></p>
          </div>
        )}

        {error && <p className="verification-error">{error}</p>}
        {success && <p className="verification-success">{success}</p>}

        <form className="verification-form" onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || resendLoading}
          />
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            required
            disabled={loading || resendLoading || timeLeft <= 0}
          />

          <button 
            type="submit" 
            disabled={loading || timeLeft <= 0 || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="verification-actions">
          <button 
            onClick={handleResendOTP} 
            disabled={resendLoading}
            className="resend-btn"
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </button>
          
          <button 
            onClick={() => navigate('/signup')} 
            className="back-btn"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </section>
  );
};

export default Verification;