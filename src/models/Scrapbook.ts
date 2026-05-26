import mongoose from "mongoose";

const scrapbookSchema = new mongoose.Schema(
  {
    id: String,

    title: String,
    recipient: String,
    creator: String,
    theme: String,
    type: String,
    createdAt: String,

    photos: [
      {
        id: String,
        src: String,
        caption: String,
        creator: String,
        scratched: Boolean
      }
    ],

    notes: [
      {
        id: String,
        text: String,
        creator: String,
        font: String,
        paperType: String
      }
    ],
     bouquets: [Object],

    musics: [Object],

    calendarEvents: [
      {
        id: String,
        title: String,
        date: String,
        description: String
      }
    ]
  },
  {
    timestamps: true
  }
);
export default mongoose.model("Scrapbook", scrapbookSchema);