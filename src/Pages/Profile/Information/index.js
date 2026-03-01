import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { buildApiUrl } from '../../../config/api';
import './style.css';

const PasswordChange = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!form.newPassword) {
      setError('New password is required');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // First verify current password by attempting login
      const loginCheck = await axios.post(
        buildApiUrl('/api/user/login'),
        { email: userInfo.email, password: form.currentPassword },
        { withCredentials: true }
      );

      if (!loginCheck.data.success) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const response = await axios.put(
        buildApiUrl('/api/user/profile/update'),
        { password: form.newPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return <div className="password-loading">Loading...</div>;

  return (
    <section className="password-section">
      <div className="password-container">
        <h2 className="password-title">Change Password</h2>
        {error && <p className="password-error">{error}</p>}
        {success && <p className="password-success">{success}</p>}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
            />
          </div>

          <div className="password-buttons">
            <button type="submit" className="password-save-btn" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="password-cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PasswordChange;