import sql from "mssql";
import createError from "http-errors";

let tokensList = null;

export const fetchTokensFromDB = () => {
  let request = new sql.Request();
  request.query('SELECT team_id from team', (err, recordset) => {
    if (err) console.log(err);
    tokensList = recordset;
  });
}

export const verifyToken = (req, res, next) => {
  if (!tokensList) {
    console.error("Team tokens list is empty");
    throw createError();
  }

  let token = req.get("Team-Token");
  if (token) {
    if (tokensList.includes(token)) {
      next();
    } else {
      next(createError(403, "Invalid team access token"));
    }

  } else {
    next(createError(401, "Access denied! Team access token not provided"));
  }
}
