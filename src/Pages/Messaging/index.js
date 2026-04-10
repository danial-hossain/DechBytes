import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Mail, MapPin, Send, Plus, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './style.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAccessToken = () => {
  const directToken = localStorage.getItem('token');
  if (directToken) return directToken;

  try {
    const savedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return savedUser?.accessToken || null;
  } catch (error) {
    return null;
  }
};

export default function MessagingPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const conversationRequestInFlight = useRef(false);
  const messagesRequestInFlight = useRef(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!selectedConversation || !messagesContainerRef.current) return;

    // Auto-scroll only inside chat box, not the full page
    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight;
  }, [messages, selectedConversation]);

  // Load conversations
  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(true), 8000); // Background refresh
    return () => clearInterval(interval);
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      const interval = setInterval(() => loadMessages(selectedConversation.id, true), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async (silent = false) => {
    if (conversationRequestInFlight.current) {
      return;
    }

    conversationRequestInFlight.current = true;

    try {
      if (!silent) {
        setError(null);
      }
      const token = getAccessToken();

      if (!token) {
        setError('Not authenticated. Redirecting to login...');
        setLoading(false);
        navigate('/login', { state: { from: '/messaging' } });
        return;
      }

      const response = await axios.get(`${API_URL}/api/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        timeout: 15000,
      });

      if (!response.data.success) {
        const errorMsg = response.data.message || 'Failed to load conversations';
        setError(errorMsg);
        setLoading(false);
        if (String(errorMsg).toLowerCase().includes('unauthenticated')) {
          navigate('/login', { state: { from: '/messaging' } });
        }
        return;
      }

      setConversations(response.data.conversations || []);

      // Load unread count
      try {
        const unreadRes = await axios.get(`${API_URL}/api/messages/unread`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 8000,
        });
        if (unreadRes.data.success) {
          setUnreadCount(unreadRes.data.unread_count);
        }
      } catch (err) {
        console.warn('Failed to load unread count:', err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load conversations';
      if (!silent) {
        setError(errorMsg);
        toast.error('Error: ' + errorMsg);
      }
      setLoading(false);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: '/messaging' } });
      }
    } finally {
      conversationRequestInFlight.current = false;
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    if (messagesRequestInFlight.current) {
      return;
    }

    messagesRequestInFlight.current = true;

    try {
      if (!silent) {
        setError(null);
      }
      const token = getAccessToken();
      if (!token) {
        navigate('/login', { state: { from: '/messaging' } });
        return;
      }
      const response = await axios.get(`${API_URL}/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        timeout: 15000,
      });

      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load messages';
      if (!silent) {
        setError(errorMsg);
      }
    } finally {
      messagesRequestInFlight.current = false;
    }
  };

  const startNewConversation = async () => {
    try {
      setError(null);
      const token = getAccessToken();

      if (!token) {
        setError('Not authenticated. Please login first.');
        toast.error('Please login to create a conversation');
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/messages/create`,
        { subject: 'Support Request' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setSelectedConversation(response.data.conversation);
        await loadConversations(true);
        toast.success('New conversation started');
      } else {
        throw new Error(response.data.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Create conversation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create conversation';
      setError(errorMsg);
      toast.error('Error: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (createdAt) => {
    if (!createdAt) return '';
    
    // Parse the ISO format timestamp
    const date = new Date(createdAt);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', createdAt);
      return 'Invalid time';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    // Check if it's yesterday
    else if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    // Older dates
    else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setError(null);
      const token = getAccessToken();
      if (!token) {
        navigate('/login', { state: { from: '/messaging' } });
        return;
      }
      const response = await axios.post(
        `${API_URL}/api/messages/${selectedConversation.id}/send`,
        { message: messageInput },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 15000,
        }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setMessageInput('');
        loadConversations(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      setError(errorMsg);
      toast.error('Error: ' + errorMsg);
    }
  };

  return (
    <section className="messaging-page">
      <div className="messaging-background"></div>
      <div className="messaging-background-2"></div>

      <div className="messaging-container">
        {/* Loading State */}
        {loading && (
          <div className="messaging-loading">
            <Loader className="loading-spinner" />
            <p>Loading conversations...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="messaging-error">
            <AlertCircle className="error-icon" />
            <div>
              <p className="error-title">Error</p>
              <p className="error-message">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadConversations();
                }}
                className="error-retry-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="messaging-header">
              <h1 className="messaging-title">
                <MessageCircle className="title-icon" />
                Support Center
              </h1>
              <button onClick={startNewConversation} disabled={loading} className="new-message-btn">
                <Plus className="btn-icon" />
                New Message
              </button>
            </div>

            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <div className="unread-badge">
                You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </div>
            )}

            <div className="messaging-grid">
              {/* Conversations List */}
              <div className="conversations-panel">
                <div className="conversations-header">Conversations</div>

                <div className="conversations-list">
                  {conversations.length === 0 ? (
                    <div className="no-conversations">
                      <p>No conversations yet</p>
                      <button onClick={startNewConversation} className="start-conversation-btn">
                        Start one now
                      </button>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                      >
                        <div className="conversation-content">
                          <p className="conversation-name">{conv.user?.name || 'User'}</p>
                          <p className="conversation-preview">
                            {conv.lastMessage?.message || 'No messages yet'}
                          </p>
                        </div>
                        {conv.status === 'closed' && (
                          <span className="conversation-status-badge">Closed</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="chat-panel">
                {selectedConversation ? (
                  <>
                    {/* Header */}
                    <div className="chat-header">
                      <div>
                        <p className="chat-header-subtitle">Conversation with</p>
                        <p className="chat-header-title">
                          {selectedConversation.admin?.name || 'Support Team'}
                        </p>
                      </div>
                      <span
                        className={`chat-status-badge ${
                          selectedConversation.status === 'active' ? 'active' : 'closed'
                        }`}
                      >
                        {selectedConversation.status}
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="messages-container" ref={messagesContainerRef}>
                      {messages.length === 0 ? (
                        <div className="no-messages">
                          <MessageCircle className="no-messages-icon" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`message-bubble-wrapper ${
                              msg.sender_type === 'user' ? 'user-message' : 'admin-message'
                            }`}
                          >
                            <div
                              className={`message-bubble ${
                                msg.sender_type === 'user' ? 'user' : 'admin'
                              }`}
                            >
                              <p className="message-sender">{msg.sender?.name}</p>
                              <p className="message-text">{msg.message}</p>
                              <p className="message-time">
                                {formatMessageTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input */}
                    {selectedConversation.status === 'active' && (
                      <div className="chat-input-container">
                        <div className="chat-input-wrapper">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your message..."
                            className="chat-input"
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!messageInput.trim()}
                            className="send-btn"
                          >
                            <Send className="send-icon" />
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedConversation.status === 'closed' && (
                      <div className="chat-closed-notice">
                        This conversation has been closed
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-conversation-selected">
                    <MessageCircle className="no-conversation-icon" />
                    <p className="no-conversation-title">Select a conversation to start</p>
                    <p className="no-conversation-subtitle">or create a new one to get support</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="contact-info-grid">
              <div className="contact-info-card">
                <Mail className="contact-icon" />
                <p className="contact-title">Email</p>
                <p className="contact-value">support@dechbytes.com</p>
              </div>
              <div className="contact-info-card">
                <Phone className="contact-icon" />
                <p className="contact-title">Phone</p>
                <p className="contact-value">+880 1234 567890</p>
              </div>
              <div className="contact-info-card">
                <MapPin className="contact-icon" />
                <p className="contact-title">Location</p>
                <p className="contact-value">Dhaka, Bangladesh</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
