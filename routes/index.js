import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";

const loadRoutes = (server) => {
  server.get("/status", AppController.getStatus);
  server.get("/stats", AppController.getStats);

  server.post("/users", UsersController.postNew);
  server.get("/connect", AuthController.getConnect);
  server.get("/disconnect", AuthController.getDisconnect);
  server.get("/users/me", UsersController.getMe);
};
export default loadRoutes;
