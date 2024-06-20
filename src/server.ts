import * as dotenv from 'dotenv';
dotenv.config();

import * as restify from 'restify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createClient } from 'redis';
import { Client } from 'pg';
import { createChatController } from './controllers/chatController';
import { createGroupController } from './controllers/groupController';
import * as path from 'path';

export function createServer() {
    const server = restify.createServer();
    const io = new SocketIOServer(server.server);

    const redisClient = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    redisClient.on('error', (err) => {
        console.log('Redis error: ', err);
    });

    redisClient.connect();

    const redisPubClient = redisClient.duplicate();
    redisPubClient.connect();

    const redisSubClient = redisClient.duplicate();
    redisSubClient.connect();

    const pgClient = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT ?? "5432", 10),
    });

    pgClient.connect();

    server.use(restify.plugins.bodyParser());

    server.get('/test', restify.plugins.serveStatic({
        directory: path.join(__dirname, '../public'),
        file: 'index.html'
    }));

    createChatController(server, pgClient, redisClient, io, redisPubClient);

    createGroupController(server, pgClient);

    redisSubClient.subscribe('chat_channel', (message) => {
        const parsedMessage = JSON.parse(message);
        io.to(parsedMessage.groupId.toString()).emit('group_message', parsedMessage);
    });

    // Custom Rate Limiter
    const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

    const rateLimit = (socket: Socket, limit: number, windowMs: number) => {
        const ip = socket.handshake.address;
        const currentTime = Date.now();

        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, { count: 1, timestamp: currentTime });
            return true;
        } else {
            const rateData = rateLimitMap.get(ip);
            if (rateData) {
                if (currentTime - rateData.timestamp > windowMs) {
                    rateData.count = 1;
                    rateData.timestamp = currentTime;
                    return true;
                } else {
                    rateData.count++;
                    if (rateData.count > limit) {
                        return false;
                    }
                    return true;
                }
            }
        }
    };

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');

        const interval = setInterval(() => {
            socket.emit('ping', { beat: 1 });
        }, 30000); // Send a ping every 30 seconds

        socket.on('pong', (data) => {
            console.log('Pong received', data);
        });

        socket.use((packet, next) => {
            const isAllowed = rateLimit(socket, 30, 60000); // 30 messages per 60 seconds
            if (!isAllowed) {
                return socket.emit('error', 'Rate limit exceeded. Please try again later.');
            }
            next();
        });

        socket.on('join', ({ groupId }) => {
            socket.join(groupId.toString());
            console.log(`User joined group ${groupId}`);
        });

        socket.on('leave', ({ groupId }) => {
            socket.leave(groupId.toString());
            console.log(`User left group ${groupId}`);
        });

        socket.on('message', ({ groupId, content }) => {
            io.to(groupId.toString()).emit('group_message', { content });
            console.log(`Message sent to group ${groupId}: ${content}`);
        });

        socket.on('disconnect', () => {
            clearInterval(interval);
            console.log('user disconnected');
        });

        socket.on('reconnect', () => {
            console.log('user reconnected');
        });
    });

    return server;
}
