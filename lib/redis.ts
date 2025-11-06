import Redis from 'ioredis';

let redisClient: Redis | null = null;

// Initialize Redis client from connection string
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  // Check for Redis connection string
  const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL;
  
  if (!redisUrl) {
    return null;
  }

  try {
    // Parse Redis connection string
    // Format: redis://default:password@host:port
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisClient = null;
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

// Connect to Redis
export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (client && client.status !== 'ready') {
    try {
      await client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }
}

