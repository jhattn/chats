import { createServer } from './server';

// Load port from environment variables or default to 8080
const port = parseInt(process.env.PORT ?? "8080", 10);
const server = createServer();

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
