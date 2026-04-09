import express from 'express';
import auth from '../middlewares/auth.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  closeConversation,
  getUnreadCount,
} from '../controllers/message.controller.js';

const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(auth);

// Get all conversations for authenticated user
messageRouter.get('/', getConversations);

// Get unread message count
messageRouter.get('/unread', getUnreadCount);

// Get or create conversation
messageRouter.post('/create', getOrCreateConversation);

// Get messages for a conversation
messageRouter.get('/:conversationId', getMessages);

// Send a message
messageRouter.post('/:conversationId/send', sendMessage);

// Close conversation (admin only)
messageRouter.post('/:conversationId/close', closeConversation);

export default messageRouter;
