/* eslint-disable import/no-named-as-default */
import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import { hashPassword } from "../utils/auth";

export default class UsersController {
  static getStatus(req, res) {
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  /**
   * Creates a new user.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;
    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }
    if (!password) {
      res.status(400).json({ error: "Missing password" });
      return;
    }
    const hashedPassword = hashPassword(password);
    const inserted = await dbClient.newUser(email, hashedPassword);
    if (!inserted) {
      res.status(400).json({ error: "Already exist" });
      return;
    }
    console.log(inserted);
    const response = { id: inserted.insertedId, email: inserted.ops[0].email };
    res.status(201).json(response);
  }

  static async getMe(req, res) {
    const token = req.headers["x-token"];
    const id = await redisClient.get(`auth_${token}`);
    console.log(id);
    const user = await dbClient.getUserById(id);
    console.log(user);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}
