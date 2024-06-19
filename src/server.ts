import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import * as restify from 'restify';
import { Server, Socket } from 'socket.io';
import * as redis from 'redis';
import { Client } from 'pg';
import { createChatController } from './controllers/chatController';
import { createGroupController } from './controllers/groupController';
import { initNotificationService } from './services/notificationService';
import { initRedisService } from './services/redisService';

export function createServer() {

    const server = restify.createServer();
    const io = new Server(server.server);
    const redisClient = redis.createClient();
    const pgClient = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT ?? "5432", 10), // Ensure DB_PORT is parsed as an integer
    });

    // Connect to PostgreSQL database
    pgClient.connect();

    // Middleware to parse request body
    server.use(restify.plugins.bodyParser());

    // Initialize services
    initNotificationService(io);
    initRedisService(redisClient);

    // Register controllers
    createChatController(server, pgClient, redisClient);
    createGroupController(server, pgClient);

    // Handle Socket.io connections
    io.on('connection', (socket: Socket) => {
        console.log('a user connected');

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    return server;
}
