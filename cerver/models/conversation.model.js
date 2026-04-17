import { sql, connectMssqlDB } from '../config/db.js';

// Function to create a new conversation
export async function createConversation(conversationData) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('user_id', sql.Int, conversationData.user_id)
            .input('subject', sql.NVarChar, conversationData.subject || 'Support Request')
            .input('status', sql.NVarChar, conversationData.status || 'active')
            .query(`INSERT INTO Conversations (user_id, subject, status)
                    VALUES (@user_id, @subject, @status);
                    SELECT SCOPE_IDENTITY() as id;`);
        return result.recordset[0].id;
    } catch (err) {
        console.error("Error creating conversation:", err);
        throw err;
    }
}

// Function to get all conversations for a user (user view)
export async function getConversationsByUserId(userId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT c.*, 
                       u.id as user_id, u.name as user_name, u.email as user_email, u.avatar as user_avatar,
                       a.id as admin_id, a.name as admin_name, a.email as admin_email, a.avatar as admin_avatar,
                       m.id as msg_id, m.sender_id, m.message, m.sender_type, m.created_at as msg_created_at,
                       su.name as sender_name, su.email as sender_email
                FROM Conversations c
                LEFT JOIN Users u ON c.user_id = u.id
                LEFT JOIN Users a ON c.admin_id = a.id
                OUTER APPLY (
                    SELECT TOP 1 * FROM Messages
                    WHERE conversation_id = c.id
                    ORDER BY created_at DESC
                ) m
                LEFT JOIN Users su ON m.sender_id = su.id
                WHERE c.user_id = @user_id
                ORDER BY c.updated_at DESC
            `);
        
        // Transform results to proper structure
        const conversations = result.recordset.map(row => ({
            id: row.id,
            user_id: row.user_id,
            admin_id: row.admin_id,
            subject: row.subject,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                avatar: row.user_avatar
            },
            admin: row.admin_id ? {
                id: row.admin_id,
                name: row.admin_name,
                email: row.admin_email,
                avatar: row.admin_avatar
            } : null,
            lastMessage: row.msg_id ? {
                id: row.msg_id,
                sender_id: row.sender_id,
                message: row.message,
                sender_type: row.sender_type,
                created_at: row.msg_created_at,
                sender: {
                    id: row.sender_id,
                    name: row.sender_name,
                    email: row.sender_email
                }
            } : null
        }));
        
        return conversations;
    } catch (err) {
        console.error("Error getting conversations by user ID:", err);
        throw err;
    }
}

// Function to get all conversations for admin (admin view)
export async function getConversationsForAdmin(adminId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('admin_id', sql.Int, adminId)
            .query(`
                SELECT c.*, 
                       u.id as user_id, u.name as user_name, u.email as user_email, u.avatar as user_avatar,
                       a.id as admin_id, a.name as admin_name, a.email as admin_email, a.avatar as admin_avatar,
                       m.id as msg_id, m.sender_id, m.message, m.sender_type, m.created_at as msg_created_at,
                       su.name as sender_name, su.email as sender_email
                FROM Conversations c
                LEFT JOIN Users u ON c.user_id = u.id
                LEFT JOIN Users a ON c.admin_id = a.id
                OUTER APPLY (
                    SELECT TOP 1 * FROM Messages
                    WHERE conversation_id = c.id
                    ORDER BY created_at DESC
                ) m
                LEFT JOIN Users su ON m.sender_id = su.id
                WHERE c.admin_id = @admin_id OR c.admin_id IS NULL
                ORDER BY c.updated_at DESC
            `);
        
        // Transform results to proper structure
        const conversations = result.recordset.map(row => ({
            id: row.id,
            user_id: row.user_id,
            admin_id: row.admin_id,
            subject: row.subject,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                avatar: row.user_avatar
            },
            admin: row.admin_id ? {
                id: row.admin_id,
                name: row.admin_name,
                email: row.admin_email,
                avatar: row.admin_avatar
            } : null,
            lastMessage: row.msg_id ? {
                id: row.msg_id,
                sender_id: row.sender_id,
                message: row.message,
                sender_type: row.sender_type,
                created_at: row.msg_created_at,
                sender: {
                    id: row.sender_id,
                    name: row.sender_name,
                    email: row.sender_email
                }
            } : null
        }));
        
        return conversations;
    } catch (err) {
        console.error("Error getting conversations for admin:", err);
        throw err;
    }
}

// Function to get a conversation by ID
export async function getConversationById(conversationId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('conversation_id', sql.Int, conversationId)
            .query(`
                SELECT c.*, 
                       u.id as user_id, u.name as user_name, u.email as user_email, u.avatar as user_avatar,
                       a.id as admin_id, a.name as admin_name, a.email as admin_email, a.avatar as admin_avatar
                FROM Conversations c
                LEFT JOIN Users u ON c.user_id = u.id
                LEFT JOIN Users a ON c.admin_id = a.id
                WHERE c.id = @conversation_id
            `);
        
        if (!result.recordset[0]) return null;
        
        const row = result.recordset[0];
        return {
            id: row.id,
            user_id: row.user_id,
            admin_id: row.admin_id,
            subject: row.subject,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                avatar: row.user_avatar
            },
            admin: row.admin_id ? {
                id: row.admin_id,
                name: row.admin_name,
                email: row.admin_email,
                avatar: row.admin_avatar
            } : null
        };
    } catch (err) {
        console.error("Error getting conversation by ID:", err);
        throw err;
    }
}

// Function to get active conversation for a user
export async function getActiveConversationByUserId(userId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        const result = await request
            .input('user_id', sql.Int, userId)
            .input('status', sql.NVarChar, 'active')
            .query(`
                SELECT TOP 1 c.*, 
                       u.id as user_id, u.name as user_name, u.email as user_email, u.avatar as user_avatar,
                       a.id as admin_id, a.name as admin_name, a.email as admin_email, a.avatar as admin_avatar
                FROM Conversations c
                LEFT JOIN Users u ON c.user_id = u.id
                LEFT JOIN Users a ON c.admin_id = a.id
                WHERE c.user_id = @user_id AND c.status = @status
                ORDER BY c.created_at DESC
            `);
        
        if (!result.recordset[0]) return null;
        
        const row = result.recordset[0];
        return {
            id: row.id,
            user_id: row.user_id,
            admin_id: row.admin_id,
            subject: row.subject,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email,
                avatar: row.user_avatar
            },
            admin: row.admin_id ? {
                id: row.admin_id,
                name: row.admin_name,
                email: row.admin_email,
                avatar: row.admin_avatar
            } : null
        };
    } catch (err) {
        console.error("Error getting active conversation by user ID:", err);
        throw err;
    }
}

// Function to update conversation
export async function updateConversation(conversationId, updateData) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        
        const updates = [];
        if (updateData.admin_id !== undefined) {
            request.input('admin_id', sql.Int, updateData.admin_id);
            updates.push('admin_id = @admin_id');
        }
        if (updateData.status !== undefined) {
            request.input('status', sql.NVarChar, updateData.status);
            updates.push('status = @status');
        }
        
        if (updates.length === 0) return false;
        
        updates.push('updated_at = GETDATE()');
        
        await request
            .input('conversation_id', sql.Int, conversationId)
            .query(`UPDATE Conversations SET ${updates.join(', ')} WHERE id = @conversation_id`);
        
        return true;
    } catch (err) {
        console.error("Error updating conversation:", err);
        throw err;
    }
}

// Function to close a conversation
export async function closeConversation(conversationId) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request();
        
        await request
            .input('conversation_id', sql.Int, conversationId)
            .query(`UPDATE Conversations SET status = 'closed', updated_at = GETDATE() WHERE id = @conversation_id`);
        
        return true;
    } catch (err) {
        console.error("Error closing conversation:", err);
        throw err;
    }
}

// Function to verify whether a user/admin can access a conversation
export async function canAccessConversation(conversationId, userId, isAdmin = false) {
    try {
        const pool = await connectMssqlDB();
        const request = pool.request()
            .input('conversation_id', sql.Int, Number(conversationId))
            .input('user_id', sql.Int, Number(userId));

        let result;

        if (isAdmin) {
            result = await request.query(`
                SELECT TOP 1 id
                FROM Conversations
                WHERE id = @conversation_id
                  AND (admin_id IS NULL OR admin_id = @user_id)
            `);
        } else {
            result = await request.query(`
                SELECT TOP 1 id
                FROM Conversations
                WHERE id = @conversation_id
                  AND user_id = @user_id
            `);
        }

        return !!result.recordset[0];
    } catch (err) {
        console.error('Error verifying conversation access:', err);
        throw err;
    }
}
