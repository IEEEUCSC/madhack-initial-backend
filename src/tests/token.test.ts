import db from "../db";
import {fetchTeamIdsFromDB} from "../shared/helper";
import {tokensList} from "../shared/variables";
import request from "supertest";
import app from "../app";

beforeAll(async () => {
  try {
    await db.connect();
    console.log("Database connected");
    await fetchTeamIdsFromDB();
    console.log("Team access tokens fetched");
  } catch (err) {
    console.log(err);
  }
});

describe("Token list", () => {
  it("should return 200", async () => {
    try {
      let count = 0;
      let total = tokensList.length;
      const promises = tokensList.map((token) => {
        return request(app)
          .get("/api")
          .set("X-API-Key", token);
      });
      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message");
        count += 1;
      });

      expect(count).toBe(total);
    } catch (err) {
      console.log(err);
    }
  });
});

afterAll(
  async () => {
    try {
      await db.end();
      console.log("Database disconnected");
    } catch (err) {
      console.log(err);
    }
  }
)
