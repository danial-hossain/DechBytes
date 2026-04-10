import * as conversationModel from '../models/conversation.model.js';
import * as messageModel from '../models/message.model.js';
import * as userModel from '../models/user.model.js';

const resolveIsAdmin = async (userId, tokenRole) => {
  if (String(tokenRole || '').toUpperCase() === 'ADMIN') {
    return true;
  }

  const user = await userModel.findUserById(userId);
  return String(user?.role || '').toUpperCase() === 'ADMIN';
};

/**
 * Get all conversations for authenticated user
 * Admins see assigned conversations + unassigned inbox
 * Users see their own conversations
 */
export async function getConversations(req, res) {
  try {
    const userId = Number(req.userId);
    const isAdmin = await resolveIsAdmin(userId, req.userRole);

    let conversations;

    if (isAdmin) {
      // Admins see their assigned conversations + unassigned inbox
      conversations = await conversationModel.getConversationsForAdmin(userId);
    } else {
      // Users see their own conversations
      conversations = await conversationModel.getConversationsByUserId(userId);
    }

    return res.status(200).json({
      success: true,
      conversations: conversations,
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load conversations',
    });
  }
}

/**
 * Get or create a conversation for user
 */
export async function getOrCreateConversation(req, res) {
  try {
    const userId = Number(req.userId);
    const { subject = 'Support Request' } = req.body;

    // Check if user already has active conversation
    let conversation = await conversationModel.getActiveConversationByUserId(userId);

    if (!conversation) {
      // Create new conversation
      const conversationId = await conversationModel.createConversation({
        user_id: userId,
        subject: subject,
        status: 'active',
      });

      conversation = await conversationModel.getConversationById(conversationId);
    }

    return res.status(200).json({
      success: true,
      conversation: conversation,
    });
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create/get conversation',
    });
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(req, res) {
  try {
    const userId = Number(req.userId);
    const isAdmin = await resolveIsAdmin(userId, req.userRole);
    const { conversationId } = req.params;

    // Get conversation
    const conversation = await conversationModel.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user/admin has access to this conversation
    const hasAccess = await conversationModel.canAccessConversation(conversationId, userId, isAdmin);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get messages
    const messages = await messageModel.getMessagesByConversationId(conversationId);

    // Mark messages as read
    await messageModel.markMessagesAsRead(conversationId, userId);

    return res.status(200).json({
      success: true,
      messages: messages,
      conversation: conversation,
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load messages',
    });
  }
}

/**
 * Send a message
 */
export async function sendMessage(req, res) {
  try {
    const userId = Number(req.userId);
    const isAdmin = await resolveIsAdmin(userId, req.userRole);
    const { conversationId } = req.params;
    const { message: messageText } = req.body;

    // Validate input
    if (!messageText || messageText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    if (messageText.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long (max 5000 characters)',
      });
    }

    // Get conversation
    const conversation = await conversationModel.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user/admin has access to this conversation
    const hasAccess = await conversationModel.canAccessConversation(conversationId, userId, isAdmin);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // If admin is responding for the first time, auto-assign
    if (isAdmin && !conversation.admin_id) {
      await conversationModel.updateConversation(conversationId, {
        admin_id: userId,
        status: 'active',
      });
    }

    // Create message
    const messageId = await messageModel.createMessage({
      conversation_id: conversationId,
      sender_id: userId,
      message: messageText.trim(),
      sender_type: isAdmin ? 'admin' : 'user',
    });

    // Get message with sender info
    const newMessage = await messageModel.getMessageById(messageId);

    // Update conversation's updated_at
    await conversationModel.updateConversation(conversationId, {});

    return res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message',
    });
  }
}

/**
 * Close a conversation
 */
export async function closeConversation(req, res) {
  try {
    const userId = Number(req.userId);
    const isAdmin = await resolveIsAdmin(userId, req.userRole);
    const { conversationId } = req.params;

    // Only admin can close
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can close conversations',
      });
    }

    // Get conversation
    const conversation = await conversationModel.getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify conversation is assigned to this admin
    if (conversation.admin_id && Number(conversation.admin_id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Close conversation
    await conversationModel.closeConversation(conversationId);

    return res.status(200).json({
      success: true,
      message: 'Conversation closed',
    });
  } catch (error) {
    console.error('Error in closeConversation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to close conversation',
    });
  }
}

/**
 * Get unread message count
 */
export async function getUnreadCount(req, res) {
  try {
    const userId = Number(req.userId);

    const unreadCount = await messageModel.getUnreadCountForUser(userId);

    return res.status(200).json({
      success: true,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get unread count',
    });
  }
}
