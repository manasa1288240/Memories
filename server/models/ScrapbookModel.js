import mongoose from "mongoose";

const scrapbookSchema = new mongoose.Schema(
  {
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
    calendarEvents: Array,

    showCalendar: Boolean
  },
  {
    timestamps: true
  }
);

const Scrapbook = mongoose.model("Scrapbook", scrapbookSchema);

export default Scrapbook;