import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import sql from 'mssql';
import env from 'dotenv';
import router from "./routes/index.js";
import fs from 'fs';
env.config();

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.send("Hello world! Welcome to MADHack");
});

app.use("/api", router);

// database connection
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true
  }
}

// connect to database
sql.connect(config)
  .then(() => console.log('Database connected'))
  .then(() => {
    // create tables from schema file if they do not exist
    const sqlFile = fs.readFileSync('scripts/schema.sql').toString();
    return sql.query(sqlFile);
  })
  .then(() => console.log('Tables created'))
  .catch(err => console.log(err));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

export default app;
