import express from "express";
import Scrapbook from "../models/ScrapbookModel.js";

const router = express.Router();

// SAVE SCRAPBOOK
router.post("/scrapbooks", async (req, res) => {
  try {
    const scrapbook = new Scrapbook(req.body);

    await scrapbook.save();

    res.status(201).json({
      success: true,
      scrapbook,
      link: `http://localhost:5173/scrapbook/${scrapbook._id}`
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to save scrapbook"
    });
  }
});

// GET SCRAPBOOK
router.get("/scrapbooks/:id", async (req, res) => {
  try {
    const scrapbook = await Scrapbook.findById(req.params.id);

    if (!scrapbook) {
      return res.status(404).json({
        message: "Scrapbook not found"
      });
    }

    res.json(scrapbook);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

export default router;