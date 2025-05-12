import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: ["deposit", "withdrawal", "result"], required: true },
  amount: { type: Number },
  result: { type: String, enum: ["won", "lost"] },
});

export const Transaction = mongoose.model("transaction", transactionSchema);
