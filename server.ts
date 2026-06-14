import express from "express";
import path from "path";
import os from "os";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Scrapbook Schema
const scrapbookSchema = new mongoose.Schema({
  id: String,
  title: String,
  recipient: String,
  creator: String,
  theme: String,
  type: String,
  createdAt: String,
  photos: Array,
  notes: Array,
  bouquets: Array,
  musics: Array,
  calendarEvents: Array
});

const Scrapbook = mongoose.model("Scrapbook", scrapbookSchema);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Set correct MIME types for static files
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.type("application/javascript");
  } else if (req.url.endsWith(".css")) {
    res.type("text/css");
  }
  next();
});

// GET Latest Scrapbook
app.get("/api/latest-scrapbook", async (req, res) => {
  try {
    const scrapbook = await Scrapbook.findOne()
      .sort({ createdAt: -1 });

    res.json(scrapbook);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET Scrapbook by ID
app.get("/api/scrapbooks/:id", async (req, res) => {
  try {
    const item = await Scrapbook.findOne({ id: req.params.id });

    if (!item) {
      return res.status(404).json({ error: "Scrapbook not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE Scrapbook
app.post("/api/scrapbooks", async (req, res) => {
  try {
    const item = req.body;

    if (!item || !item.id) {
      return res.status(400).json({
        error: "Invalid scrapbook data"
      });
    }

    const scrapbook = await Scrapbook.create(item);

    res.json({
      success: true,
      scrapbook
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to save scrapbook"
    });
  }
});

// Utility: Generate random scrapbook share ID
function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// SHARE endpoint: persist scrapbook with random share ID and return its id for sharing
app.post("/api/share", async (req, res) => {
  try {
    const board = req.body;
    if (!board || !board.id) {
      return res.status(400).json({ error: "Invalid board payload" });
    }

    // Create a fresh share with metadata but empty content (ready for recipients to fill)
    const shareId = generateShareId();
    const shareBoard = {
      id: shareId,
      title: board.title || "Surprise Scrapbook",
      recipient: board.recipient || "",
      creator: board.creator || "",
      theme: board.theme || "Cherry Blossom",
      type: board.type || "birthday",
      createdAt: new Date().toISOString(),
      photos: [],
      notes: [],
      bouquets: [],
      musics: [],
      calendarEvents: [],
      showCalendar: board.showCalendar || false
    };

    const doc = await Scrapbook.findOneAndUpdate({ id: shareId }, shareBoard, { upsert: true, new: true });

    console.log(`📤 SHARE CREATED: ${shareId} - Title: "${shareBoard.title}" - Recipient: "${shareBoard.recipient}" - Content: ${shareBoard.photos.length} photos, ${shareBoard.notes.length} notes`);
    return res.json({ id: doc.id });
  } catch (err) {
    console.error("Failed to persist shared board", err);
    return res.status(500).json({ error: "Failed to create share" });
  }
});

// Start Server
async function startServer() {

  if (process.env.NODE_ENV !== "production") {

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
    
    // SPA catch-all route for /scrapbook/:id
    app.get("/scrapbook/:id", (req, res, next) => {
      // Let vite handle this
      req.url = "/";
      vite.middlewares(req, res, next);
    });

    // Global catch-all for SPA routing
    app.get("*", (req, res, next) => {
      res.type("text/html");
      next();
    });

  } else {

    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    
    // SPA catch-all route for /scrapbook/:id
    app.get("/scrapbook/:id", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start listening with retry logic when port is in use
  let currentPort = Number(PORT) || 3000;
  const host = "0.0.0.0";
  let attempts = 0;
  const maxAttempts = 10;

  const startListening = () => {
    const server = app.listen(currentPort, host, () => {
      console.log(`Server running on port ${currentPort}`);

      try {
        const nets = os.networkInterfaces();
        const addresses: string[] = [];

        for (const name of Object.keys(nets)) {
          for (const net of nets[name] || []) {
            if ((net as any).family === "IPv4" && !(net as any).internal) {
              addresses.push((net as any).address);
            }
          }
        }

        console.log(`Local: http://localhost:${currentPort}/`);
        if (addresses.length > 0) {
          for (const a of addresses) {
            console.log(`Network: http://${a}:${currentPort}/`);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });

    server.on("error", (err: any) => {
      if (err && err.code === "EADDRINUSE") {
        if (attempts < maxAttempts) {
          console.warn(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
          attempts++;
          currentPort += 1;
          setTimeout(startListening, 500);
          return;
        }
        console.error(`Port ${PORT} is in use and max retries reached. Exiting.`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  };

  startListening();
}

startServer();