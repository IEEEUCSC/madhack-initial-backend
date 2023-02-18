// Fetch all the team tokens from the database
import sql, {IResult} from "mssql";
import Team from "../models/Team";

import {tokensList} from "./variables";

export const fetchTokensFromDB = () => {
    let request = new sql.Request();

    request.query('SELECT * from team', (err: Error | undefined, recordset: IResult<Team> | undefined) => {
        if (err || !recordset) {
            console.log(err);
        } else {
            recordset.recordsets[0].forEach((team: Team) => {
                tokensList.push(team.team_token.toUpperCase());
            });
        }
    });
}
