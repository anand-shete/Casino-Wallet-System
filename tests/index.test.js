import axios from "axios";
import { beforeAll, describe, expect, test } from "vitest";
import jwt from "jsonwebtoken";
import "dotenv/config";

const BACKEND_URL = "http://localhost:3000";

const verfifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

describe("Authentication", () => {
  test("Register a user and ensure JWT is created", async () => {
    const username = "Anand";
    const password = "123";

    const res = await axios.post(`${BACKEND_URL}/register`, {
      username,
      password,
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toBe("User Registered successsfully");
    expect(res.data.username).toBeDefined();
    expect(res.headers["set-cookie"][0].startsWith("token")).toBe(true);
  });
});

describe("Core functionality", () => {
  let token, address;

  beforeAll(async () => {
    const username = "Anand";
    const password = "123";

    const res = await axios.post(`${BACKEND_URL}/register`, {
      username,
      password,
    });

    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
    address = verfifyJwt(token).address;
  });

  test("Get the balance of logged in user", async () => {
    const res = await axios.get(`${BACKEND_URL}/balance`, {
      headers: { Cookie: `token=${token}` },
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toBe("Balance fetched successsfully");
    expect(res.data.balance).toBeDefined();
    expect(res.data.address).toBeDefined();
  });

  test("User can deposit cryptocurrency using their wallet addresses", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/deposit`,
      {
        amount: 10,
        cryptocurrency: "ETH",
        address: address.ETH,
      },
      { headers: { Cookie: `token=${token}` } }
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBeDefined();
    expect(res.data.balance).toBeDefined();
    expect(res.data.virtual_balance).toBeDefined();
    expect(res.data.transaction).toBeDefined();
  });

  test("Game function produces a 50/50 win-lose probability", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/play`,
      {
        wager: 5,
        cryptocurrency: "ETH",
      },
      { headers: { Cookie: `token=${token}` } }
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBeDefined();
    expect(res.data.virtual_balance).toBeDefined();
    expect(res.data.transaction).toBeDefined();
  });

  test("Users can withdraw if amount is less than virtual balance and true deposit balance", async () => {
    await axios.post(
      `${BACKEND_URL}/deposit`,
      {
        amount: 40,
        cryptocurrency: "BTC",
        address: address.BTC,
      },
      { headers: { Cookie: `token=${token}` } }
    );

    const res = await axios.post(
      `${BACKEND_URL}/withdraw`,
      {
        amount: 10,
        cryptocurrency: "BTC",
        address: address.BTC,
      },
      { headers: { Cookie: `token=${token}` } }
    );
    expect(res.data.message).toBe("Withdrawal Successful!");
    expect(res.data.balance).toBeDefined();
    expect(res.data.virtual_balance).toBeDefined();
    expect(res.data.casinoBal).toBeDefined();
    expect(res.data.transaction).toBeDefined();
  });

  test("User cannot withdraw if amount is greater than his virtual balance", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/withdraw`,
      {
        amount: 1000,
        cryptocurrency: "BTC",
        address: address.BTC,
      },
      { headers: { Cookie: `token=${token}` }, validateStatus: () => true }
    );
    expect(res.status).toBe(400);
    expect(res.data.message).toBe("Insufficient balance");
    expect(res.data.balance).toBeDefined();
    expect(res.data.virtual_balance).toBeDefined();
    expect(res.data.casinoBal).toBeDefined();
  });
});
