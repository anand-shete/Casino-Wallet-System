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
  let token, address, balance;

  beforeAll(async () => {
    const username = "Anand";
    const password = "123";

    const res = await axios.post(`${BACKEND_URL}/register`, {
      username,
      password,
    });

    token = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
    address = verfifyJwt(token).address;
    balance = verfifyJwt(token).balance;
  });

  test("User can deposit cryptocurrency using their wallet addresses", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/deposit`,
      {
        amount: 40,
        cryptocurrency: "ETH",
        address: address.ETH,
      },
      { headers: { Cookie: `token=${token}` } }
    );

    expect(res.status).toBe(200);
    expect(res.data.balance).toBeDefined();
    expect(res.data.message).toBeDefined();
  });

  test("Game function is working as expected", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/play`,
      {
        wager: 20,
        cryptocurrency: "ETH",
      },
      { headers: { Cookie: `token=${token}` } }
    );

    expect(res.status).toBe(200);
    expect(res.data.balance).toBeDefined();
    expect(["You Won this Round!", "You Lost this Round!"]).toContain(res.data.message);
  });

  test("Users can withdraw form wallet according to the predefined logic", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/withdraw`,
      {
        amount: 10,
        cryptocurrency: "ETH",
        address: address.ETH,
      },
      { headers: { Cookie: `token=${token}` } }
    );

    if (res.status === 200) {
      expect(res.data.message).toBe("Withdrawal successsful");
      expect(res.data.balance).toBeDefined();
      expect(res.data.casinoBal).toBeDefined();
    } else if (res.status === 404) {
      expect(res.data.message).toBe("Insufficient balance");
      expect(res.data.balance).toBeDefined();
      expect(res.data.casinoBal).toBeDefined();
    }
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

  test("Get the balance of Casino", async () => {
    const res = await axios.get(`${BACKEND_URL}/balance/casino`, {
      headers: { Cookie: `token=${token}` },
    });

    expect(res.status).toBe(200);
    expect(res.data.balance).toBeDefined();
    expect(res.data.address).toBeDefined();
  });
});
