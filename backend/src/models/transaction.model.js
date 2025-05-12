import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: { type: Array, requied: true },
});

export const Transaction = mongoose.model("transaction", transactionSchema);
