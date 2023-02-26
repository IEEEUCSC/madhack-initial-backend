import express, {Express, NextFunction, Request, Response} from 'express';
import logger from 'morgan';
import cors from "cors";
// swagger
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

// database connection
import db from "./db";

// routes
import apiRouter from "./routes/apiRoutes";

// middleware
import {errorHandler} from "./middleware/errorHandler";
import {verifyTeamId} from "./middleware/teamIdChecker";
import {limitRequests} from "./middleware/rateLimiter";
import {fetchTeamIdsFromDB} from "./shared/helper";
import * as fs from "fs";

const app: Express = express();

app.use(cors())
logger.token('key', (req: Request) => req.get('X-API-Key'));
app.use(logger('api-key - :key remote-addr - :remote-user [:date] “:method :url HTTP/:http-version” :status :res[content-length]', {
  stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));
// app.use(logger('dev'), options({exposedHeaders: ['X-API-Key']}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api", verifyTeamId, limitRequests, apiRouter);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// database connection
if (process.env.NODE_ENV !== "test") {
  db.connect()
    .then(() => {
      console.log("Database connected");
    })
    .then(fetchTeamIdsFromDB)
    .then(() => {
      console.log("Team access tokens fetched");
    })
    .catch((err: Error) => {
      console.log(err);
    });
}

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next({status: 404, message: "Not Found"});
});

app.use(errorHandler);

export default app;
