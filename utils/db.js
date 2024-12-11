import { MongoClient, ObjectId } from 'mongodb';

/**
 * DBClient class to interact with MongoDB.
 */
class DBClient {
  /**
   * Creates an instance of DBClient.
   * Initializes the MongoDB client and connects to the database.
   */
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_PORT || 'files_manager';
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
    return this.client.db().collection('users').countDocuments();
  }

  /**
   * Gets the number of files in the database.
   * @returns {Promise<number>} The number of files.
   */
  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  /**
   * Adds a new user to the database.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object|null>} The inserted user document or null if the user already exists.
   */
  async newUser(email, password) {
    const query = { email };
    const mail = await this.client.db().collection('users').findOne(query);
    if (mail) {
      return null;
    }
    const user = {
      email,
      password,
    };
    return this.client.db().collection('users').insertOne(user);
  }

  /**
   * Retrieves a user from the database by email.
   * @param {string} email - The email of the user.
   * @returns {Promise<Object|null>} The user document or null if the user does not exist.
   */
  async getUser(email) {
    const query = { email };
    return this.client.db().collection('users').findOne(query);
  }

  async getUserById(id) {
    const oId = new ObjectId(id);
    const query = { _id: oId };
    const options = {
      projection: { password: 0, _id: 1 },
    };
    return this.client.db().collection('users').findOne(query, options);
  }

  /**
   * Adds a new file to the database.
   * @param {Object} file - The file document to add.
   * @returns {Promise<Object>} The inserted file document.
   */
  async addFile(file) {
    return this.client.db().collection('files').insertOne(file);
  }

  /**
   * Performs the initial migration to set up the database schema.
   * Creates the necessary collections and indexes.
   * @returns {Promise<void>}
   */
  async initialMigration() {
    const db = this.client.db();

    // Create users collection with unique index on email
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Create files collection with indexes on userId and parentId
    await db.createCollection('files');
    await db.collection('files').createIndex({ userId: 1 });
    await db.collection('files').createIndex({ parentId: 1 });
  }

  async getFileById(id) {
    const oId = new ObjectId(id);
    const query = { _id: oId };
    return this.client.db().collection('files').findOne(query);
  }

  /**
   * Retrieves files by parentId with pagination.
   * @param {string} userId - The ID of the user.
   * @param {string|number} parentId - The ID of the parent folder.
   * @param {number} skip - The number of documents to skip.
   * @param {number} limit - The maximum number of documents to return.
   * @returns {Promise<Array>} The list of file documents.
   */
  async getFilesByParentId(userId, parentId, skip, limit) {
    const query = { userId, parentId };
    return this.client
      .db()
      .collection('files')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Updates a file document in the database.
   * @param {string} id - The ID of the file.
   * @param {Object} update - The update object.
   * @returns {Promise<Object>} The updated file document.
   */
  async updateFile(id, update) {
    const oId = new ObjectId(id);
    await this.client
      .db()
      .collection('files')
      .updateOne({ _id: oId }, { $set: update });
    return this.getFileById(id);
  }
}

const dbClient = new DBClient();
export default dbClient;
