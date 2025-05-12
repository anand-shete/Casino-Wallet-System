import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

export const signJwt = (user) => {
  const payload = {
    _id: user._id,
    username: user.username,
    address: user.address,
  };
  return jwt.sign(payload, JWT_SECRET);
};

export const verfifyJwt = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
