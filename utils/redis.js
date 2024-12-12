import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * RedisClient class to interact with Redis.
 */
class RedisClient {
  /**
   * Creates an instance of RedisClient.
   */
  constructor() {
    this.client = createClient();
    this.alive = true;
    this.client.on('error', (err) => {
      console.error('Redis Client Error: ', err.message || err.toString());
      this.alive = false;
    });
    this.client.on('connect', () => {
      this.alive = true;
    });
  }

  /**
   * Checks if the Redis client is alive.
   * @returns {boolean} True if the client is alive, false otherwise.
   */
  isAlive() {
    return this.alive;
  }

  /**
   * Gets the value of a key from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string>} The value of the key.
   */
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to set.
   * @param {number} exp - The expiration time in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, exp) {
    await promisify(this.client.SETEX).bind(this.client)(key, exp, value);
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} The number of keys that were removed.
   */
  async del(key) {
    return promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
