import { Server } from 'restify';
import { Client } from 'pg';

// Define and export the group controller function
export function createGroupController(server: Server, pgClient: Client) {
    // Endpoint to create a group
    server.post('/groups', async (req, res, next) => {
        const { name, avatar, members } = req.body;
        try {
            const result = await pgClient.query('INSERT INTO groups (name, avatar) VALUES ($1, $2) RETURNING id', [name, avatar]);
            const groupId = result.rows[0].id;

            for (const memberId of members) {
                await pgClient.query('INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)', [groupId, memberId]);
            }

            res.send(201, { groupId });
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to leave a group
    server.del('/groups/:groupId/members/:userId', async (req, res, next) => {
        const { groupId, userId } = req.params;
        try {
            await pgClient.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, userId]);
            res.send(204);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to get list of groups
    server.get('/groups', async (req, res, next) => {
        try {
            const result = await pgClient.query('SELECT * FROM groups');
            res.send(200, result.rows);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });

    // Endpoint to get members of a group
    server.get('/groups/:groupId/members', async (req, res, next) => {
        const { groupId } = req.params;
        try {
            const result = await pgClient.query('SELECT user_id FROM group_members WHERE group_id = $1', [groupId]);
            res.send(200, result.rows);
        } catch (error) {
            res.send(500, error);
        }
        return next();
    });
}
