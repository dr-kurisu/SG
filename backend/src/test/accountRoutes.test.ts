import request from "supertest";
import express from "express";
import accountRouter from "../routes/accountRoutes";

jest.mock("../services/userModel", () => ({
    UserHandler: {
        checkUser: jest.fn(),
        verifyUser: jest.fn(),
        insertUser: jest.fn()
    },
}));

import { UserHandler } from "../services/userModel";

const app = express();
app.use(express.json());

app.use("/api/account", accountRouter);

describe("Test account router", () => {
    describe("POST /api/account/login", () => {
        test("Should return token when successfully login", async () => {
            (UserHandler.checkUser as jest.Mock).mockResolvedValue("test_user_id");
            (UserHandler.verifyUser as jest.Mock).mockResolvedValue(true);

            const res = await request(app)
                .post("/api/account/login")
                .send({username: "test", password: "123"});
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined;
            expect(res.body.user).toEqual({ id: "test_user_id", username: "test"});
        });

        test("Should return 401 when user ont exist", async () => {
            (UserHandler.checkUser as jest.Mock).mockResolvedValue(null);
            const res = await request(app)
                .post("/api/account/login")
                .send({ username: "test", password: "123"});
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("User does not exist");
        });

        test("Should return 400 when missing required field", async () => {
            const res = await request(app)
                .post("/api/account/login")
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Required field username or password is empty");
        });
    });
describe("POST /api/account/register", () => {
    test("Should return 201 when successfully register", async () => {
      (UserHandler.checkUser as jest.Mock).mockResolvedValue(null);
      (UserHandler.insertUser as jest.Mock).mockResolvedValue("new_user_id");

      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "newuser", password: "newpass" });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Successfully registered user");
    });

    test("Should return 401 when user already exists", async () => {
      (UserHandler.checkUser as jest.Mock).mockResolvedValue("existing_id");

      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "existing", password: "123" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("User already exist");
    });

    test("Should return 400 when missing username or password", async () => {
      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "onlyusername" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username and password are required");
    });

    test("Should return 500 when insertUser fails", async () => {
      (UserHandler.checkUser as jest.Mock).mockResolvedValue(null);
      (UserHandler.insertUser as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/account/register")
        .send({ username: "failuser", password: "failpass" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Database error: Cannot insert user info");
    });
  });
});