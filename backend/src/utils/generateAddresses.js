import crypto from "crypto";

export const generateBtcAddress = () => {
  const string = crypto.randomBytes(17).toString("hex");

  const btc = Math.random().toFixed(2);

  let prefix;
  if (btc <= 0.33) prefix = "1";
  else if (btc > 0.33 && btc <= 0.66) prefix = "3";
  else prefix = "bc1";

  return prefix + string;
};

export const generateEthAddress = () => {
  const string = crypto.randomBytes(20).toString("hex");
  return "0x" + string;
};

export const generateSolAddresss = () => {
  const string = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");
  const arr = [];
  for (let i = 1; i < 44; i++) {
    arr.push(string[Math.floor(Math.random() * 44)]);
  }
  return arr.join("");
};

export const generateDogeAddresses = () => {
  const string = crypto.randomBytes(15).toString("hex");
  return "D" + string;
};
