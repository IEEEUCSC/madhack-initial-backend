import express, {Express, NextFunction, Request, Response} from 'express';
import logger from 'morgan';
import cors from "cors";
import fs from "fs";
import path from "path";
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

const app: Express = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api", verifyTeamId, limitRequests, apiRouter);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// database connection
db.connect()
  .then(() => {
    console.log("Database connected");
    // Read sql file and execute it
    const sqlFile = fs.readFileSync(path.resolve(__dirname, '../scripts/schema.sql')).toString();
    return db.query(sqlFile, [])
  })
  .then(() => {
    console.log("Database schema created");
  })
  .then(fetchTeamIdsFromDB)
  .then(() => {
    console.log("Team access tokens fetched");
  })
  .catch((err: Error) => {
    console.log(err);
  });

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next({status: 404, message: "Not Found"});
});

app.use(errorHandler);

export default app;
