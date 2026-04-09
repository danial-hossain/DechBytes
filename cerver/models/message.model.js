import { sql, connectMssqlDB } from '../config/db.js';

// Function to create a new message
export async function createMessage(messageData) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('conversation_id', sql.Int, messageData.conversation_id)
            .input('sender_id', sql.Int, messageData.sender_id)
            .input('message', sql.NVarChar(sql.MAX), messageData.message)
            .input('sender_type', sql.NVarChar, messageData.sender_type || 'user')
            .query(`INSERT INTO Messages (conversation_id, sender_id, message, sender_type)
                    VALUES (@conversation_id, @sender_id, @message, @sender_type);
                    SELECT SCOPE_IDENTITY() as id;`);
        return result.recordset[0].id;
    } catch (err) {
        console.error("Error creating message:", err);
        throw err;
    }
}

// Function to get message by ID with sender info
export async function getMessageById(messageId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('message_id', sql.Int, messageId)
            .query(`
                SELECT m.*,
                       u.id as sender_id, u.name as sender_name, u.email as sender_email, u.avatar as sender_avatar
                FROM Messages m
                LEFT JOIN Users u ON m.sender_id = u.id
                WHERE m.id = @message_id
            `);
        
        if (!result.recordset[0]) return null;
        
        const row = result.recordset[0];
        return {
            id: row.id,
            conversation_id: row.conversation_id,
            sender_id: row.sender_id,
            message: row.message,
            sender_type: row.sender_type,
            is_read: row.is_read,
            read_at: row.read_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            sender: {
                id: row.sender_id,
                name: row.sender_name,
                email: row.sender_email,
                avatar: row.sender_avatar
            }
        };
    } catch (err) {
        console.error("Error getting message by ID:", err);
        throw err;
    }
}

// Function to get all messages for a conversation
export async function getMessagesByConversationId(conversationId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('conversation_id', sql.Int, conversationId)
            .query(`
                SELECT m.*,
                       u.id as sender_id, u.name as sender_name, u.email as sender_email, u.avatar as sender_avatar
                FROM Messages m
                LEFT JOIN Users u ON m.sender_id = u.id
                WHERE m.conversation_id = @conversation_id
                ORDER BY m.created_at ASC
            `);
        
        return result.recordset.map(row => ({
            id: row.id,
            conversation_id: row.conversation_id,
            sender_id: row.sender_id,
            message: row.message,
            sender_type: row.sender_type,
            is_read: row.is_read,
            read_at: row.read_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            sender: {
                id: row.sender_id,
                name: row.sender_name,
                email: row.sender_email,
                avatar: row.sender_avatar
            }
        }));
    } catch (err) {
        console.error("Error getting messages by conversation ID:", err);
        throw err;
    }
}

// Function to mark messages as read
export async function markMessagesAsRead(conversationId, userId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        
        await request
            .input('conversation_id', sql.Int, conversationId)
            .input('sender_id', sql.Int, userId)
            .query(`
                UPDATE Messages 
                SET is_read = 1, read_at = GETDATE(), updated_at = GETDATE()
                WHERE conversation_id = @conversation_id AND sender_id != @sender_id AND is_read = 0
            `);
        
        return true;
    } catch (err) {
        console.error("Error marking messages as read:", err);
        throw err;
    }
}

// Function to get unread message count for a user
export async function getUnreadCountForUser(userId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT COUNT(*) as count
                FROM Messages m
                INNER JOIN Conversations c ON m.conversation_id = c.id
                WHERE (c.user_id = @user_id OR c.admin_id = @user_id)
                AND m.sender_id != @user_id
                AND m.is_read = 0
            `);
        
        return result.recordset[0].count;
    } catch (err) {
        console.error("Error getting unread count:", err);
        throw err;
    }
}

// Function to get unread count for a specific conversation
export async function getUnreadCountForConversation(conversationId, userId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('conversation_id', sql.Int, conversationId)
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT COUNT(*) as count
                FROM Messages
                WHERE conversation_id = @conversation_id
                AND sender_id != @user_id
                AND is_read = 0
            `);
        
        return result.recordset[0].count;
    } catch (err) {
        console.error("Error getting unread count for conversation:", err);
        throw err;
    }
}

// Function to delete a message (only for admin)
export async function deleteMessage(messageId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        
        await request
            .input('message_id', sql.Int, messageId)
            .query('DELETE FROM Messages WHERE id = @message_id');
        
        return true;
    } catch (err) {
        console.error("Error deleting message:", err);
        throw err;
    }
}
