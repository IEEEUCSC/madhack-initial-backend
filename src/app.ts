import express, {ErrorRequestHandler, Express, NextFunction, Request, Response} from 'express';
import logger from 'morgan';
import sql, {config} from 'mssql';
import env from 'dotenv';
import cors from "cors";
import {fetchTokensFromDB, verifyToken} from "./middleware/checkTeamToken";
// routes
import apiRouter from "./routes/apiRoutes";
import indexRouter from "./routes/indexRoutes";

env.config();

const app: Express = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/", indexRouter);
app.use("/api", verifyToken, apiRouter);

// database connection
const dbConfig: config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: "madhack.database.windows.net",
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
}

// connect to database
sql.connect(dbConfig)
    .then(() => console.log('Database connected'))
    // .then(() => {
    // create tables from schema file if they do not exist
    // const sqlFile = fs.readFileSync(path.resolve(__dirname, '../scripts/schema.sql')).toString();
    // return sql.query(sqlFile);
    // })
    // .then(() => console.log('Tables created'))
    .then(() => fetchTokensFromDB())
    .catch(err => console.log(err));

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next({status: 404, message: "Not Found"});
});

// error handler
const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({"error": err.message});
};
app.use(errorHandler);

export default app;
