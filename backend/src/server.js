import express from "express";
import cookieParser from "cookie-parser";
import baseRouter from "./routes/baseRouter.js";
import { connectDB } from "./config/db.js";
import "dotenv/config";
import cors from "cors";

(async () => {
  const app = express();
  const PORT = 3000;
  await connectDB();

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  app.use("/", baseRouter);

  app.listen(PORT, () => console.log("Server listening on PORT" + PORT));
})();
