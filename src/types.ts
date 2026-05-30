export interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  creator: string;
  scratched: boolean;
}

export interface NoteItem {
  id: string;
  text: string;
  creator: string;
  font: "cursive" | "sans" | "serif" | "handwriting";
  paperType: "ruled" | "plain" | "floral" | "grid";
}

export interface BouquetItem {
  id: string;
  flowers: string[];
  wrap: "vintage" | "brown" | "pink-lace" | "white-silk";
  ribbon: "pink" | "red" | "gold" | "none";
  message: string;
  creator: string;
}

export interface MusicItem {
  id: string;
  trackId: string;
  creator: string;
  message: string;
  youtubeUrl?: string;
  title?: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  emoji: string;
}

export interface Scrapbook {
  id?: string;
  title: string;
  recipient: string;
  creator: string;
  theme: "Blush Whisper" | "Vintage Rose" | "Cherry Blossom" | "Berry Romance";
  type: "birthday" | "anniversary" | "other";
  createdAt: string;
  photos: PhotoItem[];
  notes: NoteItem[];
  bouquets: BouquetItem[];
  musics: MusicItem[];
  calendarEvents: CalendarEvent[];
  showCalendar?: boolean;
}
