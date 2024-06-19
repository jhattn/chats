import { Server } from 'restify';
import { Client } from 'pg';

// Define and export the chat controller function
export function createChatController(server: Server, pgClient: Client, redisClient: any) {
    // Endpoint to send a private message
    server.post('/messages/private', async (req, res, next) => {
        const { senderId, receiverId, content } = req.body;
        try {
            await pgClient.query('INSERT INTO private_messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)', [senderId, receiverId, content]);
            redisClient.incr(`unread_messages:${receiverId}`);
            res.send(201);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to send a group message
    server.post('/messages/group', async (req, res, next) => {
        const { senderId, groupId, content } = req.body;
        try {
            await pgClient.query('INSERT INTO messages (sender_id, group_id, content) VALUES ($1, $2, $3)', [senderId, groupId, content]);
            // Notify group members (not implemented)
            res.send(201);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to send a global message
    server.post('/messages/global', async (req, res, next) => {
        const { senderId, content } = req.body;
        try {
            await pgClient.query('INSERT INTO messages (sender_id, group_id, content) VALUES ($1, NULL, $2)', [senderId, content]);
            // Notify all users (not implemented)
            res.send(201);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to get private message history
    server.get('/messages/history/private/:userId/:otherUserId', async (req, res, next) => {
        const { userId, otherUserId } = req.params;
        try {
            const result = await pgClient.query('SELECT * FROM private_messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at', [userId, otherUserId]);
            res.send(200, result.rows);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to get group message history
    server.get('/messages/history/group/:groupId', async (req, res, next) => {
        const { groupId } = req.params;
        try {
            const result = await pgClient.query('SELECT * FROM messages WHERE group_id = $1 ORDER BY created_at', [groupId]);
            res.send(200, result.rows);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to get global message history
    server.get('/messages/history/global', async (req, res, next) => {
        try {
            const result = await pgClient.query('SELECT * FROM messages WHERE group_id IS NULL ORDER BY created_at');
            res.send(200, result.rows);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to get unread message count
    server.get('/messages/unread/:userId', async (req, res, next) => {
        const { userId } = req.params;
        redisClient.get(`unread_messages:${userId}`, (err: any, reply: any) => {
            if (err) res.send(500, err);
            else res.send(200, { unreadCount: reply || 0 });
            return next();
        });
    });
}
