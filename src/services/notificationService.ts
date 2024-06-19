import { Server, Socket } from 'socket.io';
import * as AWS from 'aws-sdk';

// Initialize AWS configuration
AWS.config.update({ region: process.env.AWS_REGION });

const sqs = new AWS.SQS();

// Initialize notification service
export function initNotificationService(io: Server) {
    io.on('connection', (socket: Socket) => {
        socket.on('private_message', async (msg) => {
            await sendNotification(msg);
        });
        socket.on('group_message', async (msg) => {
            await sendNotification(msg);
        });
        socket.on('global_message', async (msg) => {
            await sendNotification(msg);
        });
    });
}

// Send notification using AWS SQS
const sendNotification = async (message: any) => {
    const params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: process.env.SQS_QUEUE_URL
    };
   //  await sqs.sendMessage(params).promise();
};
