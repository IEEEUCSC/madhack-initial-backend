// Fetch all the team tokens from the database
import sql, {IResult} from "mssql";
import Team from "../models/Team";

import {tokensList} from "./variables";
import AppUser from "../models/AppUser";
import bcrypt from "bcrypt";

export const fetchTeamIdsFromDB = () => {
  let request = new sql.Request();

  request.query('SELECT * from team', (err: Error | undefined, recordset: IResult<Team> | undefined) => {
    if (err || !recordset) {
      console.log(err);
    } else {
      recordset.recordsets[0].forEach((team: Team) => {
        tokensList.push(team.team_id.toUpperCase());
      });
    }
  });
}

export const addUserToDB = async (user: AppUser): Promise<boolean> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  let request = new sql.Request();
  request.input("user_id", user.user_id);
  request.input("first_name", user.first_name);
  request.input("last_name", user.last_name);
  request.input("email", user.email);
  request.input("password", hashedPassword);
  request.input("contact_no", user.contact_no);
  request.input("team_id", user.team_id);

  // TODO add profile picture
  try {
    const result = await request.query('INSERT INTO app_user (user_id, first_name, last_name, email, password, contact_no, team_id) VALUES (@user_id, @first_name, @last_name, @email, @password, @contact_no, @team_id)');
    return result?.rowsAffected[0] === 1;
  } catch (error) {
    // Raises an error when the user submits a UUID that's already in the database
    console.log(error);
    return false;
  }
}
