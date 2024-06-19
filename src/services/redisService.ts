import * as redis from 'redis';

// Initialize Redis service
export function initRedisService(redisClient: any) {
    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    redisClient.on('error', (err:any) => {
        console.log('Redis error: ', err);
    });
}
