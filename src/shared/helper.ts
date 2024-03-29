// Fetch all the team tokens from the database
import Team from "../models/Team";
import db from "../db";

import {tokensList} from "./variables";
import AppUser from "../models/AppUser";
import bcrypt from "bcrypt";

export const fetchTeamIdsFromDB = async () => {
  try {
    const result = await db.query('SELECT * from team', []);
    if (result.rowCount == 0 || result.rows.length == 0)
      new Error("No teams found");
    result.rows.forEach((team: Team) => {
      tokensList.push(team.team_id.toLowerCase());
    });
  } catch (error) {
    console.log(error);
  }
}

export const addUserToDB = async (user: AppUser): Promise<boolean> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const params = [user.user_id, user.first_name, user.last_name, user.email, hashedPassword, user.contact_no, user.avatar_url, user.team_id];
  try {
    const result = await db.query('INSERT INTO app_user (user_id, first_name, last_name, email, password, contact_no, avatar_url, team_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', params);
    if (result.rowCount > 0) {
      return true;
    }
  } catch (error) {
    return false
  }
  return false;
}
