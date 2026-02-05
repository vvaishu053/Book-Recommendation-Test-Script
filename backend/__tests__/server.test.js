const request = require("supertest");


jest.mock("../config/db", () => ({
  db: {},
  dbRun: jest.fn().mockResolvedValue(true),
}));


jest.mock("fs", () => ({
  readFileSync: jest.fn(() => "CREATE TABLE test(id int);"),
}));


jest.mock("../routes/authRoutes", () => {
  const express = jest.requireActual("express");
  return express.Router();
});

jest.mock("../routes/bookRoutes", () => {
  const express = jest.requireActual("express");
  return express.Router();
});

jest.mock("../routes/recommendationRoutes", () => {
  const express = jest.requireActual("express");
  return express.Router();
});

describe("server.js", () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = "test";
    app = require("../server");
  });

  test("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Server is running" });
  });

  test("Unknown route returns 404", async () => {
    const res = await request(app).get("/api/unknown-route");
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Route not found" });
  });
});
