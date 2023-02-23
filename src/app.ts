import express, {Express, NextFunction, Request, Response} from 'express';
import logger from 'morgan';
import sql, {config} from 'mssql';
import env from 'dotenv';
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
// routes
import apiRouter from "./routes/apiRoutes";

// middleware
import {errorHandler} from "./middleware/errorHandler";
import {verifyTeamId} from "./middleware/teamIdChecker";
import {fetchTeamIdsFromDB} from "./shared/helper";
import {limitRequests} from "./middleware/rateLimiter";
import Team from "./models/Team";
import {tokensList} from "./shared/variables";

const db = require('../db')

env.config();

const app: Express = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api", verifyTeamId, limitRequests, apiRouter);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// database connection
// const dbConfig: config = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: "madhack.database.windows.net",
//   database: process.env.DB_NAME,
//   options: {
//     encrypt: true
//   }
// }

db.query('SELECT * from team').then((res: any) => {
  res.rows.forEach((team: Team) => {
    tokensList.push(team.team_id.toUpperCase());
  });
});

// connect to database
// sql.connect(dbConfig)
//   .then(() => console.log('Database connected'))
//   // .then(() => {
//   // create tables from schema file if they do not exist
//   // const sqlFile = fs.readFileSync(path.resolve(__dirname, '../scripts/schema.sql')).toString();
//   // return sql.query(sqlFile);
//   // })
//   // .then(() => console.log('Tables created'))
//   .then(() => fetchTeamIdsFromDB())
//   .catch(err => console.log(err));

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next({status: 404, message: "Not Found"});
});

app.use(errorHandler);

export default app;
