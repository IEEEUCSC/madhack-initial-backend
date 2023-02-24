import request from "supertest";
import dotenv from "dotenv";
import {v4 as uuid_v4} from "uuid";
import * as fs from "fs";
import * as path from "path";
import db from "../db";

dotenv.config();

const url = process.env.BASE_URL || "http://localhost";
const port = process.env.PORT || 3001;
const baseUrl = `${url}:${port}`;

const apiUrl = baseUrl + "/api";

// Test Team Token
const teamToken = "e3462731-3379-4f86-bb4a-f4a2aa1c611b";
let bearerToken = "";

// Categories
let categories: { categoryId: string; categoryName: string }[] = [];

// Todos
let todos: { todoId: string; title: string; notes: string; dueDt: string; isReminderEnabled: boolean; isCompleted: boolean; categoryId: string }[] = [];

beforeAll(async () => {
  try {
    const sqlFile = fs.readFileSync(path.resolve(__dirname, '../../scripts/reset_team.sql')).toString();
    await db.query(sqlFile, [])
  } catch (err) {
    console.log(err);
  }
});

describe("Default Route", () => {
  it("should return 200", async () => {
    const res = await request(apiUrl)
      .get("/")
      .set("X-API-Key", teamToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  })

  it("should return 401", async () => {
    const res = await request(apiUrl)
      .get("/");
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
  })

  it("should return 403", async () => {
    const res = await request(apiUrl)
      .get("/")
      .set("X-API-Key", "invalid");
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
})

let user = {
  "userId": uuid_v4().toString(),
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "password": "123456",
  "contactNo": "0712345678",
  "avatarUrl": null
}

describe("User Registration", () => {
  it("should return 201", async () => {
    const res = await request(apiUrl)
      .post("/auth/register")
      .set("X-API-Key", teamToken)
      .send(user)
    expect(res.statusCode).toEqual(201);
  });

  it("should return 409", async () => {
    const res = await request(apiUrl)
      .post(`/auth/register`)
      .set("X-API-Key", teamToken)
      .send(user)
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400", async () => {
    const res = await request(apiUrl)
      .post(`/auth/register`)
      .set("X-API-Key", teamToken)
      .send({
        "userId": uuid_v4().toString(),
        "firstName": "John",
        "lastName": "Doe",
        "email": "johndoe2@example.com"
      })
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });
})

describe("User Login", () => {
  it("should return 200", async () => {
    const res = await request(apiUrl)
      .post(`/auth/login`)
      .set("X-API-Key", teamToken)
      .send({
        "email": user.email,
        "password": user.password
      })
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    bearerToken = res.body.token;
  });

  it("should return 401", async () => {
    const res = await request(apiUrl)
      .post(`/auth/login`)
      .set("X-API-Key", teamToken)
      .send({
        "email": user.email,
        "password": "invalid"
      })
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400", async () => {
    const res = await request(apiUrl)
      .post(`/auth/login`)
      .set("X-API-Key", teamToken)
      .send({
        "email": user.email
      })
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("User Profile", () => {
  it("should return 200", async () => {
    const res = await request(apiUrl)
      .get(`/user`)
      .set("X-API-Key", teamToken)
      .set("Authorization", `Bearer ${bearerToken}`)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("firstName");
    expect(res.body).toHaveProperty("lastName");
    expect(res.body).toHaveProperty("email");
    expect(res.body).toHaveProperty("contactNo");
    expect(res.body).toHaveProperty("avatarUrl");
  });

  it("should return 200", async () => {
    const res = await request(apiUrl)
      .put(`/user`)
      .set("X-API-Key", teamToken)
      .set("Authorization", `Bearer ${bearerToken}`)
      .send({
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "janedoe@example.com",
        "contactNo": "0712345678",
        "avatarUrl": null
      });
  });
});
describe("Categories", () => {
  it("should return 200", async () => {
    const res = await request(apiUrl)
      .get(`/category`)
      .set("X-API-Key", teamToken)
      .set("Authorization", `Bearer ${bearerToken}`)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("categoryId");
      expect(res.body[0]).toHaveProperty("categoryName");
    }
    categories = res.body;
  });
});

describe("Todos", () => {

  describe("Fetch Empty Array", () => {
    it("should return 200", async () => {
      const res = await request(apiUrl)
        .get(`/todo`)
        .set("X-API-Key", teamToken)
        .set("Authorization", `Bearer ${bearerToken}`)
      expect(res.statusCode).toEqual(200)
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toEqual(0);
    });
  });

  describe("Create Two Todos", () => {
    it("should return 201", async () => {
      const res = await request(apiUrl)
        .post(`/todo`)
        .set("X-API-Key", teamToken)
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          "todoId": uuid_v4().toString(),
          "categoryId": categories[0].categoryId,
          "title": "Test Todo",
          "notes": "Test Notes",
          "createdDt": "2021-01-01T00:00:00.000Z",
          "dueDt": "2021-01-01T00:00:00.000Z",
          "lastModifiedDt": "2021-01-01T00:00:00.000Z",
          "isCompleted": false,
          "isReminderEnabled": true
        });
      expect(res.statusCode).toEqual(201);
    });

    it("should return 201", async () => {
      const res = await request(apiUrl)
        .post(`/todo`)
        .set("X-API-Key", teamToken)
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          "todoId": uuid_v4().toString(),
          "categoryId": categories[0].categoryId,
          "title": "Test Todo 2",
          "notes": "Test Notes 2",
          "createdDt": "2021-01-01T00:00:00.000Z",
          "dueDt": "2021-01-01T00:00:00.000Z",
          "lastModifiedDt": "2021-01-01T00:00:00.000Z",
          "isCompleted": false,
          "isReminderEnabled": true
        });
      expect(res.statusCode).toEqual(201);
    });
  });

  describe("Fetch Todos", () => {
    it("should return 200", async () => {
      const res = await request(apiUrl)
        .get(`/todo`)
        .set("X-API-Key", teamToken)
        .set("Authorization", `Bearer ${bearerToken}`)
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("todoId");
        expect(res.body[0]).toHaveProperty("categoryId");
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("notes");
        expect(res.body[0]).toHaveProperty("dueDt");
        expect(res.body[0]).toHaveProperty("isReminderEnabled");
        expect(res.body[0]).toHaveProperty("isCompleted");
        expect(res.body[0]).toHaveProperty("createdDt");
        expect(res.body[0]).toHaveProperty("lastModifiedDt");
      }
      todos = res.body;
    });
  });

  // TODO fix timestamp mismatch
  describe("Update Todo", () => {
    it("should return 200", async () => {
      const res = await request(apiUrl)
        .put(`/todo/${todos[0].todoId}`)
        .set("X-API-Key", teamToken)
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          "categoryId": categories[0].categoryId,
          "title": "Test Todo",
          "notes": "Test Notes",
          "createdDt": "2021-01-01T00:00:00.000Z",
          "dueDt": "2021-01-01T00:00:00.000Z",
          "lastModifiedDt": "2021-01-01T00:00:00.000Z",
          "isCompleted": true,
          "isReminderEnabled": true
        });
      expect(res.statusCode).toEqual(200);
    });

    it("should return 200", async () => {
      const res = await request(apiUrl)
        .get(`/todo/${todos[0].todoId}`)
        .set("X-API-Key", teamToken)
        .set("Authorization", `Bearer ${bearerToken}`)
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("todoId");
      expect(res.body).toHaveProperty("categoryId");
      expect(res.body).toHaveProperty("title");
      expect(res.body).toHaveProperty("notes");
      expect(res.body).toHaveProperty("dueDt");
      expect(res.body).toHaveProperty("isReminderEnabled");
      expect(res.body).toHaveProperty("isCompleted");
      expect(res.body).toHaveProperty("createdDt");
      expect(res.body).toHaveProperty("lastModifiedDt");
      expect(res.body).toEqual({
        "todoId": todos[0].todoId,
        "categoryId": categories[0].categoryId,
        "title": "Test Todo",
        "notes": "Test Notes",
        "createdDt": "2021-01-01T00:00:00.000Z",
        "dueDt": "2021-01-01T00:00:00.000Z",
        "lastModifiedDt": "2021-01-01T00:00:00.000Z",
        "isCompleted": true,
        "isReminderEnabled": true
      });
    });
  });
});

afterAll(async () => {
  await db.close();
});