import { Router } from "express";
import { User } from "../models/user.model.js";
import { signJwt } from "../utils/jwt.js";
import { userAuth } from "../middlewares/auth.js";
import { Transaction } from "../models/transaction.model.js";
import {
  generateBtcAddress,
  generateDogeAddresses,
  generateEthAddress,
  generateSolAddresss,
} from "../utils/generateAddresses.js";

const router = Router();

const casinoBalance = {
  balance: { BTC: 1, ETH: 10, SOL: 100, DOGE: 1000 },
  address: {
    BTC: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN",
    ETH: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    SOL: "7Z2W3G9Vq1e6m5vK1bX4k2J3Q4L5M6N7P8Q9R",
    DOGE: "D6oQeY8m5vK1bX4k2J3Q4L5M6N7P8Q9R",
  },
};

router.get("/", (req, res) => {
  return res.status(200).json({ message: "API HealthCheck Passed" });
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "All fields are required" });

    const check = await User.countDocuments({ username }).lean();
    if (!check)
      await User.create({
        username,
        password,
        address: {
          BTC: generateBtcAddress(),
          ETH: generateEthAddress(),
          SOL: generateSolAddresss(),
          DOGE: generateDogeAddresses(),
        },
      });

    const user = await User.findOne({ username });
    const checkPassword = await user.comparePassword(password);
    if (!checkPassword) return res.status(403).json({ message: "Wrong Password" });

    const token = signJwt(user);
    if (!token) return res.status(500).json({ message: "Error creating Token" });

    return res.cookie("token", token, { httpOnly: true }).status(200).json({
      message: "User Registered successsfully",
      username: user.username,
    });
  } catch (error) {
    console.log("Error Creating User", error.message);
    return res.status(500).json({ message: "Error Creating User" });
  }
});

router.post("/deposit", userAuth, async (req, res) => {
  try {
    const { amount, address, cryptocurrency } = req.body;
    if (!amount || !address) return res.status(400).json({ message: "All fields are required" });

    if (amount <= 0) return res.status(400).json({ message: "Enter valid Amount" });

    if (!["BTC", "ETH", "SOL", "DOGE"].includes(cryptocurrency))
      return res.status(400).json({ message: "Invalid cryptocurrency" });

    await User.updateOne(
      {
        $or: [
          { "address.BTC": address },
          { "address.ETH": address },
          { "address.SOL": address },
          { "address.DOGE": address },
        ],
      },
      {
        $inc: { [`balance.${cryptocurrency}`]: amount },
      }
    );
    const user = await User.findOne({ _id: req.user?._id });
    if (!user) return res.status(404).json({ message: "User not Found" });

    await Transaction.create({
      username: req.user?.username,
      address: address,
      type: "deposit",
      amount: amount,
    });

    return res.status(200).json({
      message: `Deposited ${amount} ${cryptocurrency} in Account`,
      balance: user.balance,
    });
  } catch (error) {
    console.log("Error Depositing Money", error);
    return res.status(500).json({ message: "Error Depositing Money" });
  }
});

router.post("/play", userAuth, async (req, res) => {
  try {
    const { wager, cryptocurrency } = req.body;
    if (wager <= 0) return res.status(400).json({ message: "Invalid Bet Amount" });

    if (!wager || !cryptocurrency)
      return res.status(400).json({ message: "All fields are required" });

    if (!["BTC", "ETH", "SOL", "DOGE"].includes(cryptocurrency))
      return res.status(400).json({ message: "Invalid cryptocurrency" });

    const before = await User.findOne({ _id: req.user?._id });
    if (wager > before.balance[cryptocurrency])
      return res.status(400).json({ message: "Insufficient Balance" });

    const number = Math.floor(Math.random() * 100);
    let amount;

    number >= 50 ? (amount = wager) : (amount = -wager);

    await Transaction.create({
      username: req.user?.username,
      address: req.user?.address[cryptocurrency],
      type: "result",
      result: amount > 0 ? "won" : "lost",
      amount: wager,
    });

    await User.updateOne(
      { _id: req.user?._id },
      { $inc: { [`balance.${cryptocurrency}`]: amount } }
    );

    const user = await User.findOne({ _id: req.user._id }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: amount > 0 ? "You Won this Round!" : "You Lost this Round!",
      balance: user.balance,
    });
  } catch (error) {
    console.log("Error playing game", error.message);
    return res.status(500).json({ message: "Result couldn't be determined" });
  }
});

router.post("/withdraw", userAuth, async (req, res) => {
  try {
    const { amount, cryptocurrency, address } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid Amount" });

    if (!amount || !cryptocurrency || !address)
      return res.status(400).json({ message: "All fields are required" });

    if (!["BTC", "ETH", "SOL", "DOGE"].includes(cryptocurrency))
      return res.status(400).json({ message: "Invalid cryptocurrency" });

    const before = await User.findOne({ _id: req.user._id }).select("balance").lean();

    if (amount <= before.balance[cryptocurrency]) {
      await Transaction.create({
        username: req.user?.username,
        address,
        type: "withdrawal",
        amount: amount,
      });

      await User.updateOne(
        { _id: req.user._id },
        { $inc: { [`balance.${cryptocurrency}`]: -amount } }
      );
    } else if (
      amount > before.balance[cryptocurrency] &&
      amount - before.balance[cryptocurrency] <= casinoBalance.balance[cryptocurrency]
    ) {
      await Transaction.create({
        username: req.user?.username,
        address,
        type: "withdrawal",
        amount: before.balance[cryptocurrency],
      });

      await User.updateOne({ _id: req.user._id }, { $set: { [`balance.${cryptocurrency}`]: 0 } });
      casinoBalance.balance[cryptocurrency] -= amount - before.balance[cryptocurrency];
      casinoBalance.balance[cryptocurrency] ?? 0;
    } else {
      const user = await User.findOne({ _id: req.user._id }).lean();
      return res.status(404).json({
        message: "Insufficient balance",
        balance: user.balance,
        casinoBal: casinoBalance.balance,
      });
    }

    const user = await User.findOne({ _id: req.user._id }).lean();
    return res.status(200).json({
      message: "Withdrawal successsful",
      balance: user.balance,
      casinoBal: casinoBalance.balance,
    });
  } catch (error) {
    console.log("Error Withdrawing Amount", error);
    return res.status(500).json({ message: "Error withdrawing Amount" });
  }
});

router.get("/balance", userAuth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = signJwt(user);
    return res.status(200).json({
      message: "Balance fetched successsfully",
      balance: user.balance,
      address: user.address,
    });
  } catch (error) {
    console.log("Error fetching user balance", error);
    return res.status(500).json({ message: "Error fetching user balance" });
  }
});

router.get("/balance/casino", async (req, res) => {
  return res.status(200).json({ balance: casinoBalance.balance, address: casinoBalance.address });
});
export default router;
