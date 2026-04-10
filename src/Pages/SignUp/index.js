// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../../config/api';
import './style.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !mobile || !password) {
      setError('Name, Email, Mobile and Password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        buildApiUrl('/api/user/register'),
        { name, email, mobile, password }, // 👈 include mobile
        { withCredentials: true, timeout: 20000 }
      );

      setLoading(false);
      alert(response.data.message || 'SignUp Successful! Check your email for verification.');

      // Navigate to verification page and pass email
      navigate('/verify', { state: { email } });
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.message || `Server Error: ${err.response.status}`);
      } else if (err.code === 'ECONNABORTED') {
        setError('Server is taking too long. Please try again in a few seconds.');
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <section className="signup-section">
      <div className="signup-container">
        <h2 className="signup-title">Sign Up</h2>
        {error && <p className="login-error">{error}</p>}
        <form className="signup-form" onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignUp;