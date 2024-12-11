import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    console.log(id);
    const user = await dbClient.getUserById(id);
    console.log(user);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    if (type !== 'folder' && !data) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.getFileById(parentId);
      if (!parentFile) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (parentFile.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    const userId = id;
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      const insertedFile = await dbClient.addFile(newFile);
      res.status(201).json(insertedFile);
      return;
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPath = path.join(folderPath, uuidv4());
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    newFile.localPath = localPath;
    const insertedFile = await dbClient.addFile(newFile);
    res.status(201).json(insertedFile);
  }

  /**
   * Retrieves a file document based on the ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUserById(id);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const file = await dbClient.getFileById(fileId);

    if (!file || file.userId !== id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(200).json(file);
  }

  /**
   * Retrieves all user file documents for a specific parentId with pagination.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUserById(id);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    const files = await dbClient.getFilesByParentId(
      id,
      parentId,
      skip,
      pageSize,
    );

    res.status(200).json(files);
  }

  /**
   * Sets isPublic to true on the file document based on the ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUserById(id);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const file = await dbClient.getFileById(fileId);

    if (!file || file.userId !== id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    file.isPublic = true;
    await dbClient.updateFile(fileId, { isPublic: true });

    res.status(200).json(file);
  }

  /**
   * Sets isPublic to false on the file document based on the ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUserById(id);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.id;
    const file = await dbClient.getFileById(fileId);

    if (!file || file.userId !== id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    file.isPublic = false;
    await dbClient.updateFile(fileId, { isPublic: false });

    res.status(200).json(file);
  }
}
