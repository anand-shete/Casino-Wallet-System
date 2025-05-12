import { verfifyJwt } from "../utils/jwt.js";

export const userAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(403).json({ message: "Token not Found" });
  
  const user = verfifyJwt(token); // not the updated user since React is SPA
  if (!user) return res.status(404).json({ message: "User not Found" });

  req.user = user;
  next();
};
