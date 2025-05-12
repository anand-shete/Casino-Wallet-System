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
    if (!check) {
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
      await Transaction.create({
        username,
        log: `User ${username} Registered `,
      });
    }
    const user = await User.findOne({ username });
    const checkPassword = await user.comparePassword(password);
    if (!checkPassword) return res.status(403).json({ message: "Wrong Password" });

    const token = signJwt(user);
    if (!token) return res.status(500).json({ message: "Error creating Token" });

    const transaction = await Transaction.findOne({ username });

    return res.cookie("token", token, { httpOnly: true }).status(200).json({
      message: "User Registered successsfully",
      username: user.username,
      transaction: transaction.log,
    });
  } catch (error) {
    console.log("Error Creating User", error.message);
    return res.status(500).json({ message: "Error Creating User" });
  }
});

router.post("/deposit", userAuth, async (req, res) => {
  try {
    const { amount, address, cryptocurrency } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Enter valid Amount" });

    if (!amount || !address) return res.status(400).json({ message: "All fields are required" });

    if (!["BTC", "ETH", "SOL", "DOGE"].includes(cryptocurrency))
      return res.status(400).json({ message: "Invalid cryptocurrency" });

    // update user's balance using his wallet address for that cryptocurrency
    await User.updateOne(
      { [`address.${cryptocurrency}`]: address },
      {
        $inc: {
          [`balance.${cryptocurrency}`]: amount,
          [`virtual_balance.${cryptocurrency}`]: amount,
        },
      }
    );

    const user = await User.findOne({ _id: req.user?._id });
    if (!user) return res.status(404).json({ message: "User not Found" });

    await Transaction.updateOne(
      { username: req.user?.username },
      {
        $push: { log: `${req.user.username} deposited ${amount} ${cryptocurrency}` },
      }
    );
    const transaction = await Transaction.findOne({ username: req.user.username });

    return res.status(200).json({
      message: `Deposited ${amount} ${cryptocurrency} in Account`,
      balance: user.balance,
      virtual_balance: user.virtual_balance,
      transaction: transaction.log,
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
    if (wager > before.virtual_balance[cryptocurrency])
      return res.status(400).json({ message: "Insufficient Balance" });

    const number = Math.floor(Math.random() * 100);
    let amount;

    number >= 50 ? (amount = wager) : (amount = -wager);

    await Transaction.updateOne(
      { username: req.user?.username },
      {
        $push: {
          log: `${req.user.username} ${amount > 0 ? "won" : "lost"} ${wager} ${cryptocurrency}`,
        },
      }
    );
    const transaction = await Transaction.findOne({ username: req.user.username });

    // update users's virtual_balance
    await User.updateOne(
      { _id: req.user?._id },
      { $inc: { [`virtual_balance.${cryptocurrency}`]: amount } }
    );

    const user = await User.findOne({ _id: req.user._id }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: amount > 0 ? "You Won this Round!" : "You Lost this Round!",
      virtual_balance: user.virtual_balance,
      transaction: transaction.log,
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

    const before = await User.findOne({ _id: req.user._id })
      .select("virtual_balance balance")
      .lean();

    // console.log("amount", amount);
    // console.log("before vb", before.virtual_balance[cryptocurrency]);
    // console.log("before balance", before.balance[cryptocurrency]);
    // console.log("before casinoBal", casinoBalance.balance[cryptocurrency]);
    // console.log("\n");
    let transaction = "Failed Transaction";
    if (
      amount <= before.virtual_balance[cryptocurrency] &&
      amount <= before.balance[cryptocurrency]
    ) {
      // console.log("first condition");

      await User.updateOne(
        { _id: req.user._id },
        {
          $inc: {
            [`balance.${cryptocurrency}`]: -amount,
            [`virtual_balance.${cryptocurrency}`]: -amount,
          },
        }
      );

      await Transaction.updateOne(
        { username: req.user?.username },
        { $push: { log: `${req.user.username} did a withdrawal of ${amount} ${cryptocurrency}` } }
      );
      transaction = await Transaction.findOne({ username: req.user.username });
    } else if (
      amount <= before.virtual_balance[cryptocurrency] &&
      amount - before.balance[cryptocurrency] <= casinoBalance.balance[cryptocurrency]
    ) {
      // console.log("2nd condition");

      await User.updateOne(
        { _id: req.user._id },
        {
          $inc: {
            [`virtual_balance.${cryptocurrency}`]: -amount,
          },
          $set: {
            [`balance.${cryptocurrency}`]: 0,
          },
        }
      );
      casinoBalance.balance[cryptocurrency] -= amount - before.balance[cryptocurrency];
      await Transaction.updateOne(
        { username: req.user?.username },
        { $push: { log: `${req.user._id} withdrew ${amount}` } }
      );
      transaction = await Transaction.findOne({ username: req.user.username });
    } else {
      // console.log("3rd condition");
      const user = await User.findOne({ _id: req.user._id }).lean();
      return res.status(404).json({
        message: "Insufficient balance",
        balance: user.balance,
        virtual_balance: user.virtual_balance,
        casinoBal: casinoBalance.balance,
      });
    }

    const user = await User.findOne({ _id: req.user._id }).lean();

    return res.status(200).json({
      message: "Withdrawal Successful!",
      balance: user.balance,
      virtual_balance: user.virtual_balance,
      casinoBal: casinoBalance.balance,
      transaction: transaction.log,
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
    const transaction = await Transaction.findOne({ username: req.user.username });
    console.log(transaction.log);

    return res.status(200).json({
      message: "Balance fetched successsfully",
      balance: user.balance,
      virtual_balance: user.virtual_balance,
      address: user.address,
      casinoBal: casinoBalance.balance,
      transaction: transaction.log,
    });
  } catch (error) {
    console.log("Error fetching user balance", error);
    return res.status(500).json({ message: "Error fetching user balance" });
  }
});

export default router;
