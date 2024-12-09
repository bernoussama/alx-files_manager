import express from "express";
import loadRoutes from "./routes/index";

const bodyParser = require("body-parser");
const multer = require("multer");
// v1.0.5
const upload = multer(); // for parsing multipart/form-data

const server = express();
server.use(bodyParser.json()); // for parsing application/json
server.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

loadRoutes(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});

export default server;
