import express from 'express';

import bodyParser from 'body-parser';
import loadRoutes from './routes/index';
// v1.0.5

const server = express();
server.use(bodyParser.json()); // for parsing application/json
server.use(bodyParser.urlencoded({ extended: true }));

loadRoutes(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});

export default server;
