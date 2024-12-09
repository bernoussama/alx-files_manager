/* eslint-disable import/no-named-as-default */
import { v4 as uuidv4 } from "uuid";
import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import { hashPassword, parseAuthHeader, verifyPassword } from "../utils/auth";

export default class UsersController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    const { email, password } = parseAuthHeader(authHeader);
    const user = await dbClient.getUser(email);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      console.log("Invalid email");
      return;
    }
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Unauthorized" });
      console.log("Invalid password");
      return;
    }
    const token = uuidv4();
    const key = `auth_${token}`;
    redisClient.set(key, user._id.toString(), 1440);
    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers["x-token"];
    const id = await redisClient.get(`auth_${token}`);
    console.log(id);
    const user = await dbClient.getUserById(id);
    console.log(user);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    redisClient.del(`auth_${token}`);
    console.log(token);
    res.sendStatus(204);
  }
}
