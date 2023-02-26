// Fetch all the team tokens from the database
import Team from "../models/Team";
import db from "../db";

import {tokensList} from "./variables";
import AppUser from "../models/AppUser";
import bcrypt from "bcrypt";
import {QueryResult} from "pg";

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

interface memberDetails {
  name: string;
  email: string;
  contact: string;
  discord: string;
}

interface teamDetails {
  uuid: string;
  team_name: string;
  memberDetails: {
    leader: memberDetails;
    member2: memberDetails;
    member3: memberDetails;
    member4: memberDetails;
  }
}

export const addTeamTokens = async () => {
  try {
    const teamDetails = await fetch("https://saliya.ml/madhack/api/get_uuid", {
      method: "GET",
      headers: {
        "X-API-Key": "MADAPI-266a-42dd-be51-3c0347ef8eb5",
      }
    })
    const teamDetailsJSON = await teamDetails.json();
    const teamDetailsArray = teamDetailsJSON.data;
    const promises: Promise<QueryResult>[] = teamDetailsArray.map((team: teamDetails) => {
      const params = [team.uuid, team.team_name];
      return db.query('INSERT INTO team (team_id, team_name) VALUES ($1, $2)', params);
    });

    await Promise.all(promises);

  } catch (error) {
    console.log(error);
  }
}