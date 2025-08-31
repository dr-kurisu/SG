import request from "supertest";
import express from "express";
import accountRouter from "../routes/accountRoutes";
import { v4 as uuidv4 } from 'uuid';

jest.mock("../services/db_handler", () => ({
    UserHandler: {
        getUserByUsername: jest.fn(),
        verifyUser: jest.fn(),
        insert: jest.fn()
    },
}));

const testUserRecord: UserRecord = {
  user_id: uuidv4(),
  username: "testRoute",
  password: "123456",
  permission: 1
}


import { UserHandler } from "../services/db_handler";
import { UserRecord } from "../services/types";

const app = express();
app.use(express.json());

app.use("/api/account", accountRouter);

describe("Test account router", () => {
    describe("POST /api/account/login", () => {
        test("should return token when successfully login", async () => {
            (UserHandler.getUserByUsername as jest.Mock).mockResolvedValue(testUserRecord);
            (UserHandler.verifyUser as jest.Mock).mockResolvedValue(true);

            const res = await request(app)
                .post("/api/account/login")
                .send({username: testUserRecord.username, password: testUserRecord.password});
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined;
            expect(res.body.user).toEqual({ user_id: testUserRecord.user_id, username: testUserRecord.username});
        });

        test("should return 401 when user ont exist", async () => {
            (UserHandler.getUserByUsername as jest.Mock).mockResolvedValue(null);
            const res = await request(app)
                .post("/api/account/login")
                .send({ username: testUserRecord.username, password: testUserRecord.password});
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("User does not exist");
        });

        test("should return 400 when missing required field", async () => {
            const res = await request(app)
                .post("/api/account/login")
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Required field username or password is empty");
        });
    });
describe("POST /api/account/register", () => {
    test("should return 201 when successfully register", async () => {
      (UserHandler.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (UserHandler.insert as jest.Mock).mockResolvedValue(10);

      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "newuser", password: "newpass" });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully registered user");
    });

    test("should return 401 when user already exists", async () => {
      (UserHandler.getUserByUsername as jest.Mock).mockResolvedValue("existing_id");

      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "existing", password: "123" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("User already exist");
    });

    test("should return 400 when missing username or password", async () => {
      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "onlyusername" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username and password are required");
    });

    test("should return 500 when insertUser fails", async () => {
      (UserHandler.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (UserHandler.insert as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "failuser", password: "failpass" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Database error: Cannot insert user info");
    });
  });
});