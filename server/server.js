import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

import scrapbookRoutes from "./routes/scrapbookRoutes.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

// Serve root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Serve static files
app.use(express.static(path.join(__dirname, "../")));

app.use("/api", scrapbookRoutes);

// SPA catch-all route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

let currentPort = 5000;
const maxAttempts = 10;
let attempts = 0;

const startListening = () => {
  const server = app.listen(currentPort, () => {
    console.log(`Server running on port ${currentPort}`);
    console.log(`Local: http://localhost:${currentPort}/`);
    
    const nets = os.networkInterfaces();
    const addresses = [];
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
    
    if (addresses.length > 0) {
      console.log(`Network: http://${addresses[0]}:${currentPort}/`);
    }
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && attempts < maxAttempts) {
      attempts++;
      currentPort++;
      console.log(`Port ${currentPort - 1} in use, trying ${currentPort}...`);
      startListening();
    } else {
      console.error(err);
      process.exit(1);
    }
  });
};

startListening();