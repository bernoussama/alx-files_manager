import { MongoClient, ObjectId } from "mongodb";

/**
 * DBClient class to interact with MongoDB.
 */
class DBClient {
  /**
   * Creates an instance of DBClient.
   * Initializes the MongoDB client and connects to the database.
   */
  constructor() {
    this.host = process.env.DB_HOST || "localhost";
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_PORT || "files_manager";
    const url = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect();
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} True if the client is connected, false otherwise.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Gets the number of users in the database.
   * @returns {Promise<number>} The number of users.
   */
  async nbUsers() {
    return this.client.db().collection("users").countDocuments();
  }

  /**
   * Gets the number of files in the database.
   * @returns {Promise<number>} The number of files.
   */
  async nbFiles() {
    return this.client.db().collection("files").countDocuments();
  }

  /**
   * Adds a new user to the database.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object|null>} The inserted user document or null if the user already exists.
   */
  async newUser(email, password) {
    const query = { email };
    const mail = await this.client.db().collection("users").findOne(query);
    if (mail) {
      return null;
    }
    const user = {
      email,
      password,
    };
    return this.client.db().collection("users").insertOne(user);
  }

  /**
   * Retrieves a user from the database by email.
   * @param {string} email - The email of the user.
   * @returns {Promise<Object|null>} The user document or null if the user does not exist.
   */
  async getUser(email) {
    const query = { email };
    return this.client.db().collection("users").findOne(query);
  }

  async getUserById(id) {
    const oId = new ObjectId(id);
    const query = { _id: oId };
    const options = {
      projection: { password: 0, _id: 1 },
    };
    return this.client.db().collection("users").findOne(query, options);
  }
}

const dbClient = new DBClient();
export default dbClient;
