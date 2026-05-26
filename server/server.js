import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import scrapbookRoutes from "./routes/scrapbookRoutes.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api", scrapbookRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});