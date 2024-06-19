# chats
Sure, here's a `README.md` file for your project:

```markdown
# Chat Service

## Overview

The Chat Service is a Node.js application designed to handle real-time messaging functionalities, including private messages, group messages, and global messages. It leverages PostgreSQL for data storage, Redis for caching, and AWS SQS for notifications. The server uses Restify for handling HTTP requests and Socket.io for real-time communication.

## Features

- **Create Group**: Create a group with a name, avatar, invite members, and join groups on invitation.
- **Leave Group**: Leave a group.
- **Send/Receive Private Messages**: Between two users.
- **Send/Receive Group Messages**: Inside groups.
- **Send/Receive Global Messages**: A global group where all users are by default members.
- **Chat Unread Message Count API**: Using Redis for caching.
- **Chat History**: For all personal, group, and global chats.

## Architecture

The project architecture consists of:
1. **Server**: Built with Node.js using Restify.
2. **Real-time Communication**: Using Socket.io.
3. **Database**: PostgreSQL.
4. **Caching**: Redis.
5. **Notifications**: AWS SQS.
6. **Environment Configuration**: Using dotenv.

## Prerequisites

- **Node.js** and **npm** installed.
- **PostgreSQL** installed and running.
- **Redis** installed and running.
- **AWS Account** with SQS set up.

## Setup Steps

### Clone the Repository

```bash
git clone <repository-url>
cd chat-service
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```plaintext
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_NAME=chats
DB_PORT=5432
AWS_REGION=us-east-1
SQS_QUEUE_URL=YOUR_SQS_QUEUE_URL
```

### Database Migration

Create the initial migration file:

```bash
npx db-migrate create init-chats-schema --sql-file
```

Then run the migration:

```bash
npm run migrate
```

### Start the Server

```bash
npm run dev
```

## Directory Structure

```
chat-service/
├── migrations/
├── src/
│   ├── controllers/
│   │   ├── chatController.ts
│   │   ├── groupController.ts
│   ├── models/
│   │   ├── chatModel.ts
│   │   ├── groupModel.ts
│   ├── services/
│   │   ├── notificationService.ts
│   │   ├── redisService.ts
│   ├── tests/
│   │   ├── chatService.test.ts
│   ├── index.ts
│   ├── server.ts
├── .env
├── package.json
├── tsconfig.json
├── database.json
├── run-migrations.js
```

## Additional Notes

- **Environment Variables**: Ensure all environment variables in the `.env` file are correctly set up for both local development and cloud deployment.
- **Database Migrations**: Use `npm run migrate` to apply migrations and `npx db-migrate create <migration-name> --sql-file` to create new migrations.
- **Testing**: Run tests using `npm test`.
- **Deployment**: Set the environment variables on the cloud provider (e.g., AWS, Heroku) and deploy the application.

## Running Tests

Run the following command to execute tests:

```bash
npm test
```

## Code Explanation

### Server Setup (`src/server.ts`)

The server setup involves configuring Restify for handling HTTP requests, Socket.io for real-time communication, connecting to PostgreSQL and Redis, and initializing services.

### Chat Controller (`src/controllers/chatController.ts`)

Handles endpoints for sending and receiving private messages, retrieving chat history, and fetching unread message counts.

### Group Controller (`src/controllers/groupController.ts`)

Handles endpoints for creating groups and managing group memberships.

### Notification Service (`src/services/notificationService.ts`)

Uses AWS SQS to handle notifications for messages.

### Redis Service (`src/services/redisService.ts`)

Manages Redis connections and error handling.

### Migrations

The migrations directory contains SQL files to manage database schema changes. Use `db-migrate` commands to create and run migrations.

### Postman Collection and Environment
Import Postman Collection
Open Postman.
Click on the "Import" button in the upper-left corner of the Postman interface.
Select the "Raw Text" tab.
Copy and paste the contents of postman/collections/chat-service.postman_collection.json into the text field.
Click on the "Import" button.
Import Postman Environment
Open Postman.
Click on the gear icon (⚙️) in the upper-right corner of the Postman interface and select "Manage Environments".
Click on the "Import" button.
Select the "Raw Text" tab.
Copy and paste the contents of postman/environments/chat-service.postman_environment.json into the text field.
Click on the "Import" button.
Set the Active Environment
After importing the environment, select it from the environment dropdown in the upper-right corner of the Postman interface.
