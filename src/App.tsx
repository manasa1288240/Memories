import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Sparkles,
  Share2,
  ChevronRight,
  Check,
  Trash2,
} from "lucide-react";

import { Scrapbook, PhotoItem, NoteItem, BouquetItem, MusicItem, CalendarEvent } from "./types";
import ScratchCard from "./components/ScratchCard";
import NoteCard from "./components/NoteCard";
import BouquetMaker from "./components/BouquetMaker";
import MusicRoom from "./components/MusicRoom";
import MemoryCalendar from "./components/MemoryCalendar";

// ─── Theme config ────────────────────────────────────────────────────────────
// All class strings must be written in full so Tailwind's scanner keeps them.
const THEME_CONFIG: Record<
  Scrapbook["theme"],
  { 
    bg: string; 
    text: string; 
    border: string; 
    button: string; 
    ring: string; 
    activeToggle: string;
    textLight: string;
    textDark: string;
    bgLight: string;
    bgLighter: string;
    borderLight: string;
    hoverBg: string;
    hoverText: string;
    accent: string;
  }
> = {
  "Cherry Blossom": {
    bg: "bg-pink-50",
    text: "text-pink-600",
    textLight: "text-pink-400",
    textDark: "text-pink-950",
    border: "border-pink-200",
    borderLight: "border-pink-100",
    bgLight: "bg-pink-100",
    bgLighter: "bg-pink-50/50",
    button: "bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white shadow-md shadow-pink-200",
    ring: "focus:ring-pink-300",
    activeToggle: "bg-pink-500 text-white shadow-xs",
    hoverBg: "hover:bg-pink-100/30",
    hoverText: "hover:text-pink-900",
    accent: "text-pink-700",
  },
  "Ocean Breeze": {
    bg: "bg-sky-50",
    text: "text-cyan-700",
    textLight: "text-cyan-400",
    textDark: "text-cyan-950",
    border: "border-cyan-200",
    borderLight: "border-cyan-100",
    bgLight: "bg-cyan-100",
    bgLighter: "bg-cyan-50/50",
    button: "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white shadow-md shadow-cyan-200",
    ring: "focus:ring-cyan-300",
    activeToggle: "bg-cyan-600 text-white shadow-xs",
    hoverBg: "hover:bg-cyan-100/30",
    hoverText: "hover:text-cyan-900",
    accent: "text-cyan-600",
  },
  "Lavender Dreams": {
    bg: "bg-violet-50",
    text: "text-violet-600",
    textLight: "text-violet-400",
    textDark: "text-violet-950",
    border: "border-violet-200",
    borderLight: "border-violet-100",
    bgLight: "bg-violet-100",
    bgLighter: "bg-violet-50/50",
    button: "bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white shadow-md shadow-violet-200",
    ring: "focus:ring-violet-300",
    activeToggle: "bg-violet-500 text-white shadow-xs",
    hoverBg: "hover:bg-violet-100/30",
    hoverText: "hover:text-violet-900",
    accent: "text-violet-700",
  },
  "Sage Serenity": {
    bg: "bg-green-50",
    text: "text-emerald-800",
    textLight: "text-emerald-500",
    textDark: "text-emerald-950",
    border: "border-green-200",
    borderLight: "border-green-100",
    bgLight: "bg-green-100",
    bgLighter: "bg-green-50/50",
    button: "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-md shadow-emerald-200",
    ring: "focus:ring-emerald-300",
    activeToggle: "bg-emerald-700 text-white shadow-xs",
    hoverBg: "hover:bg-green-100/30",
    hoverText: "hover:text-emerald-900",
    accent: "text-emerald-700",
  },
  "Golden Sunflower": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    textLight: "text-yellow-500",
    textDark: "text-yellow-950",
    border: "border-yellow-300",
    borderLight: "border-yellow-100",
    bgLight: "bg-yellow-100",
    bgLighter: "bg-yellow-50/50",
    button: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white shadow-md shadow-yellow-200",
    ring: "focus:ring-yellow-300",
    activeToggle: "bg-yellow-500 text-white shadow-xs",
    hoverBg: "hover:bg-yellow-100/30",
    hoverText: "hover:text-yellow-900",
    accent: "text-yellow-600",
  },
  "Berry Romance": {
    bg: "bg-rose-50",
    text: "text-rose-600",
    textLight: "text-rose-400",
    textDark: "text-rose-950",
    border: "border-rose-200",
    borderLight: "border-rose-100",
    bgLight: "bg-rose-100",
    bgLighter: "bg-rose-50/50",
    button: "bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-md shadow-rose-200",
    ring: "focus:ring-rose-300",
    activeToggle: "bg-rose-500 text-white shadow-xs",
    hoverBg: "hover:bg-rose-100/30",
    hoverText: "hover:text-rose-900",
    accent: "text-rose-700",
  },
};

const DEFAULT_THEME = THEME_CONFIG["Cherry Blossom"];

export default function App() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<Scrapbook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoverFlipped, setIsCoverFlipped] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [previewToggleCount, setPreviewToggleCount] = useState(0);

  // Create board form state
  const [newTitle, setNewTitle] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newCreator, setNewCreator] = useState("");
  const [newType, setNewType] = useState<"birthday" | "anniversary" | "other">("birthday");
  const [newTheme, setNewTheme] = useState<Scrapbook["theme"]>("Cherry Blossom");
  const [newIncludeCalendar, setNewIncludeCalendar] = useState(false);

  // Add item states
  const [photoSrc, setPhotoSrc] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCreator, setPhotoCreator] = useState("");
  const [photoUploadType, setPhotoUploadType] = useState<"url" | "file">("url");

  const [noteText, setNoteText] = useState("");
  const [noteCreator, setNoteCreator] = useState("");
  const [noteFont, setNoteFont] = useState<"cursive" | "sans" | "serif" | "handwriting">("cursive");
  const [notePaper, setNotePaper] = useState<"ruled" | "plain" | "floral" | "grid">("ruled");

  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCraftTab, setActiveCraftTab] = useState<"photo" | "note" | "bouquet" | "music" | "calendar" | null>(null);

  // Derive theme colors from active board (live — updates when board.theme changes)
  const tc = activeBoard ? THEME_CONFIG[activeBoard.theme] : DEFAULT_THEME;

  const switchToPreview = () => {
    setIsPreviewMode(true);
    setPreviewToggleCount((c) => c + 1);
  };

  const switchToEdit = () => {
    setIsPreviewMode(false);
    setPreviewToggleCount((c) => c + 1);
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const scrapbookIndex = pathParts.indexOf("scrapbook");
    if (scrapbookIndex !== -1 && pathParts[scrapbookIndex + 1]) {
      const id = pathParts[scrapbookIndex + 1];
      setBoardId(id);
      setIsSharedView(true);
      setIsPreviewMode(true);
      fetchBoardData(id).finally(() => setBootstrapped(true));
      setIsCoverFlipped(true);
    } else {
      setBootstrapped(true);
    }
  }, []);

  const fetchBoardData = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/scrapbooks/${id}`);
      setActiveBoard(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScrapbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRecipient.trim() || !newCreator.trim()) {
      alert("Please fill in all fields!");
      return;
    }
    const freshScrapbook: Scrapbook = {
      title: newTitle.trim(),
      recipient: newRecipient.trim(),
      creator: newCreator.trim(),
      theme: newTheme,
      type: newType,
      createdAt: new Date().toISOString(),
      photos: [],
      notes: [],
      bouquets: [],
      musics: [],
      calendarEvents: [],
      showCalendar: newIncludeCalendar,
    };
    setActiveBoard(freshScrapbook);
    setIsCoverFlipped(true);
    setIsSharedView(false);
  };

  const handleToggleCalendar = () => {
    if (!activeBoard) return;
    setActiveBoard({ ...activeBoard, showCalendar: !(activeBoard.showCalendar ?? false) });
  };

  const handleExitAlbum = () => {
    if (confirm("Are you sure you want to go back to the cover generator? Your board will remain openable using its share link.")) {
      setBoardId(null);
      setActiveBoard(null);
      setIsCoverFlipped(false);
      setIsSharedView(false);
      localStorage.removeItem("last_active_scrapbook_id");
      window.history.pushState({ path: `${window.location.origin}/` }, "", `${window.location.origin}/`);
    }
  };

  const loadDemoBoard = () => {
    setBoardId("demo-scrapbook");
    fetchBoardData("demo-scrapbook");
    window.history.pushState({}, "", `${window.location.origin}/scrapbook/demo-scrapbook`);
    setIsCoverFlipped(true);
    setIsSharedView(true);
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoSrc.trim() || !photoCaption.trim()) { alert("Please specify a valid photo source and caption!"); return; }
    if (!activeBoard) return;
    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      src: photoSrc,
      caption: photoCaption.trim(),
      creator: photoCreator.trim() || "Admirer",
      scratched: false,
    };
    setActiveBoard({ ...activeBoard, photos: [newPhoto, ...activeBoard.photos] });
    setPhotoSrc(""); setPhotoCaption(""); setPhotoCreator("");
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleScratchComplete = (pId: string) => {
    if (!activeBoard) return;
    setActiveBoard({
      ...activeBoard,
      photos: activeBoard.photos.map((ph) => ph.id === pId ? { ...ph, scratched: true } : ph),
    });
  };

  const handleDeletePhoto = (pId: string) => {
    if (!activeBoard || !confirm("Delete this polaroid photo permanently?")) return;
    setActiveBoard({ ...activeBoard, photos: activeBoard.photos.filter((ph) => ph.id !== pId) });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) { alert("Note text cannot be empty!"); return; }
    if (!activeBoard) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      creator: noteCreator.trim() || "Secret Helper",
      font: noteFont,
      paperType: notePaper,
    };
    setActiveBoard({ ...activeBoard, notes: [newNote, ...activeBoard.notes] });
    setNoteText(""); setNoteCreator("");
  };

  const handleDeleteNote = (nId: string) => {
    if (!activeBoard || !confirm("Remove this note card?")) return;
    setActiveBoard({ ...activeBoard, notes: activeBoard.notes.filter((nt) => nt.id !== nId) });
  };

  const handleAddBouquet = (b: Omit<BouquetItem, "id">) => {
    if (!activeBoard) return;
    const newBouquet: BouquetItem = { id: `bouquet-${Date.now()}`, ...b };
    setActiveBoard({ ...activeBoard, bouquets: [newBouquet, ...activeBoard.bouquets] });
  };

  const handleDeleteBouquet = (bId: string) => {
    if (!activeBoard || !confirm("Remove this bouquet?")) return;
    setActiveBoard({ ...activeBoard, bouquets: activeBoard.bouquets.filter((bq) => bq.id !== bId) });
  };

  const handleAddMusic = (m: Omit<MusicItem, "id"> & { youtubeUrl?: string; title?: string }) => {
    if (!activeBoard) return;
    const newMusic: MusicItem = {
      id: `music-${Date.now()}`,
      trackId: m.trackId,
      creator: m.creator,
      message: m.message,
      youtubeUrl: m.youtubeUrl,
      title: m.title,
    };
    setActiveBoard({ ...activeBoard, musics: [newMusic, ...activeBoard.musics] });
  };

  const handleDeleteMusic = (mId: string) => {
    if (!activeBoard || !confirm("Remove this audio dedication?")) return;
    setActiveBoard({ ...activeBoard, musics: activeBoard.musics.filter((ms) => ms.id !== mId) });
  };

  const handleAddCalendarEvent = (e: Omit<CalendarEvent, "id">) => {
    if (!activeBoard) return;
    const newEvent: CalendarEvent = { id: `event-${Date.now()}`, ...e };
    setActiveBoard({ ...activeBoard, calendarEvents: [newEvent, ...activeBoard.calendarEvents] });
  };

  const handleDeleteCalendarEvent = (eId: string) => {
    if (!activeBoard || !confirm("Erase this calendar memory permanently?")) return;
    setActiveBoard({ ...activeBoard, calendarEvents: activeBoard.calendarEvents.filter((ev) => ev.id !== eId) });
  };

  const copyShareLink = async () => {
    try {
      if (!activeBoard) return;
      const response = await axios.post("http://localhost:5000/api/scrapbooks", activeBoard);
      const generatedLink = response.data.link;
      if (!generatedLink) { alert("Link generation failed"); return; }
      await navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.log(error);
      alert("Failed to save scrapbook");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen ${tc.bg} ${tc.text} flex flex-col font-sans`} style={{ WebkitTextFillColor: 'inherit' }}>

      {/* Header */}
      <header className={`bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b ${tc.border} px-6 py-4 shadow-[0_4px_24px_rgba(244,63,94,0.04)]`}>
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <h1 className={`text-2xl md:text-3xl font-serif italic font-bold ${tc.text} leading-tight`}>
              {activeBoard ? activeBoard.title : "Our Eternal Scrapbook"}
            </h1>
            <p className={`${tc.textLight} text-[10px] md:text-xs tracking-widest uppercase mt-0.5 font-sans font-semibold`}>
              {activeBoard ? `Celebrating with ${activeBoard.recipient}` : "Celebrating the joy of knowing each other"}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 flex-wrap md:flex-nowrap justify-end">
            {activeBoard && !isSharedView && (
              <>
                {/* Edit / Preview toggle */}
                <div className={`${tc.bgLight} p-1 rounded-full flex items-center border ${tc.border} mr-1 shadow-inner`}>
                  <button
                    id="toggle-mode-edit"
                    onClick={switchToEdit}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                      !isPreviewMode ? tc.activeToggle : `${tc.accent} hover:${tc.textDark} ${tc.hoverBg}`
                    }`}
                  >
                    ✍️ Edit Mode
                  </button>
                  <button
                    id="toggle-mode-preview"
                    onClick={switchToPreview}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                      isPreviewMode ? tc.activeToggle : `${tc.accent} hover:${tc.textDark} ${tc.hoverBg}`
                    }`}
                  >
                    🎁 Preview Mode
                  </button>
                </div>

                {!isPreviewMode && (
                  <button
                    id="toggle-calendar-btn-header"
                    onClick={handleToggleCalendar}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none border ${
                      activeBoard.showCalendar
                        ? "bg-teal-600 border-teal-600 text-white shadow-xs"
                        : `bg-white hover:bg-teal-50 ${tc.border} text-teal-800 font-semibold`
                    }`}
                  >
                    📅 {activeBoard.showCalendar ? "Calendar Active" : "Add Calendar"}
                  </button>
                )}

                <button
                  id="header-copy-share-btn"
                  onClick={copyShareLink}
                  className={`flex items-center gap-1 px-3 py-1.5 md:px-5 md:py-2 ${tc.button} text-[10px] md:text-xs font-semibold rounded-full duration-150 cursor-pointer`}
                >
                  {copiedLink ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                  {copiedLink ? "Copied! 💖" : "Copy Surprise Link 🔗"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">

        {isLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-2">
            <span className={`text-4xl animate-spin ${tc.textLight}`}>🌸</span>
            <p className={`font-mono text-xs ${tc.text}`}>Flipping physical parchment pages...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isCoverFlipped || !activeBoard ? (

            // ── Screen A: Cover Creator ──────────────────────────────────────
            <motion.div
              key="cover-maker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-[40px] p-8 md:p-12 border ${tc.borderLight} shadow-2xl`}
              style={{ display: bootstrapped ? undefined : "none" }}
            >
              {/* Left column — cover preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-3">
                <div className="relative w-56 h-72 rounded-r-2xl shadow-2xl border-l-[12px] bg-rose-600 border-rose-800 flex flex-col justify-between p-5 text-white overflow-hidden group">
                  <div className="absolute left-[-12px] top-6 bottom-6 w-[12px] flex flex-col justify-between py-2 z-10">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />
                    ))}
                  </div>
                  <div className="text-left">
                    <span className="text-3xl block drop-shadow-md">📖</span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-pink-200 block mt-1.5">Aesthetic Diary</span>
                  </div>
                  <div className="text-center my-auto px-1 flex flex-col justify-center">
                    <p className="font-serif text-lg font-bold italic text-yellow-100 leading-snug drop-shadow-md">
                      Celebrate Love & Nostalgia
                    </p>
                  </div>
                  <div className="text-right pt-2 border-t border-rose-500">
                    <p className="text-[8px] font-serif tracking-widest text-pink-200">EST. 2026</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <h2 className="font-serif text-xl font-bold text-pink-900">Surprise Your Loved Ones</h2>
                  <p className="text-xs text-pink-700 leading-relaxed max-w-xs">
                    Synthesize personalized memory journals. Multiple friends can insert beautiful scratch polaroids, notes, custom florist bouquets, and nostalgic vinyl records with a mutual link.
                  </p>
                </div>
              </div>

              {/* Right column — form */}
              <div className="lg:col-span-7">
                <div className={`${tc.bgLight} rounded-3xl p-6 md:p-8 border ${tc.borderLight} shadow-inner`}>
                  <h3 className={`font-serif text-lg font-bold ${tc.textDark} mb-4 flex items-center gap-2`}>
                    <Sparkles className={`w-4 h-4 ${tc.textLight} animate-pulse`} />
                    Stitch a New Scrapbook
                  </h3>

                  <form onSubmit={handleCreateScrapbook} className="space-y-4">
                    <div>
                      <label className={`block text-[11px] font-mono font-bold ${tc.text} uppercase mb-1`}>Scrapbook Title</label>
                      <input
                        id="input-new-board-title"
                        type="text"
                        placeholder="John's 30th Birthday Wishes!"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-3 ${tc.textDark} outline-none ${tc.ring}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[11px] font-mono font-bold ${tc.text} uppercase mb-1`}>Recipient Name</label>
                        <input
                          id="input-new-board-recipient"
                          type="text"
                          placeholder="John Doe"
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          required
                          className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-3 ${tc.textDark} outline-none ${tc.ring}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] font-mono font-bold ${tc.text} uppercase mb-1`}>Sender Name</label>
                        <input
                          id="input-new-board-creator"
                          type="text"
                          placeholder="The College Crew"
                          value={newCreator}
                          onChange={(e) => setNewCreator(e.target.value)}
                          required
                          className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-3 ${tc.textDark} outline-none ${tc.ring}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[11px] font-mono font-bold ${tc.text} uppercase mb-1`}>Occasion Type</label>
                        <select
                          id="select-new-board-ocassion"
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as any)}
                          className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-3 ${tc.textDark} ${tc.ring}`}
                        >
                          <option value="birthday">Birthday</option>
                          <option value="anniversary">Anniversary</option>
                          <option value="other">General Love & Admiration</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-[11px] font-mono font-bold ${tc.text} uppercase mb-1`}>Theme</label>
                        <select
                          id="select-new-board-theme"
                          value={newTheme}
                          onChange={(e) => setNewTheme(e.target.value as Scrapbook["theme"])}
                          className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-3 ${tc.textDark} ${tc.ring}`}
                        >
                          <option value="Cherry Blossom">🌸 Cherry Blossom</option>
                          <option value="Ocean Breeze">🌊 Ocean Breeze</option>
                          <option value="Golden Sunflower">🌻 Golden Sunflower</option>
                          <option value="Lavender Dreams">🌙 Lavender Dreams</option>
                          <option value="Berry Romance">🍓 Berry Romance</option>
                          <option value="Sage Serenity">🍃 Sage Serenity</option>
                        </select>
                      </div>
                    </div>

                    <div className={`flex items-center gap-3.5 ${tc.bgLighter} p-3 rounded-xl border ${tc.borderLight} mt-1`}>
                      <input
                        id="checkbox-new-board-include-calendar"
                        type="checkbox"
                        checked={newIncludeCalendar}
                        onChange={(e) => setNewIncludeCalendar(e.target.checked)}
                        className={`w-4 h-4 accent-current bg-white rounded outline-none focus:ring-1`}
                        style={{ accentColor: tc.activeToggle.includes('bg-') ? undefined : 'inherit' }}
                      />
                      <label htmlFor="checkbox-new-board-include-calendar" className={`text-xs font-semibold ${tc.textDark} cursor-pointer select-none leading-relaxed`}>
                        📅 Include Milestone Diary Calendar tracker on the collage card?
                        <span className={`block text-[10px] ${tc.text} font-normal mt-0.5`}>Let's you and contributors write dates & event milestones. Defaults to off.</span>
                      </label>
                    </div>

                    <button
                      id="create-board-btn"
                      type="submit"
                      className={`w-full py-3.5 ${tc.button} font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      <span>Sew Book Covers & Open Album</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

          ) : (

            // ── Screen B: Open Board ─────────────────────────────────────────
            <motion.div
              key="scrapbook-opened"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-6xl flex flex-col"
            >
              {/* Cover banner */}
              <div className={`bg-white rounded-[40px] shadow-xl p-8 border ${tc.border} mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none select-none text-7xl rotate-[20deg]">🌸</div>

                {!isPreviewMode ? (
                  <div className={`space-y-3 ${tc.bgLighter} p-5 rounded-3xl border ${tc.borderLight} w-full md:max-w-2xl relative z-10`}>
                    <p className={`text-[10px] font-mono font-extrabold uppercase ${tc.text} flex items-center gap-1.5`}>
                      <span>✏️</span> Edit Coversheet Details
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-[10px] font-mono ${tc.text} font-bold uppercase mb-0.5`}>Scrapbook Title</label>
                        <input
                          type="text"
                          value={activeBoard.title}
                          onChange={(e) => setActiveBoard({ ...activeBoard, title: e.target.value })}
                          className={`w-full text-sm font-serif font-extrabold ${tc.textDark} bg-white border ${tc.border} rounded-lg px-3 py-2 outline-none ${tc.ring}`}
                          placeholder="My Surprise Scrapbook"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[10px] font-mono ${tc.text} font-bold uppercase mb-0.5`}>Recipient Name</label>
                          <input
                            type="text"
                            value={activeBoard.recipient}
                            onChange={(e) => setActiveBoard({ ...activeBoard, recipient: e.target.value })}
                            className={`w-full text-xs font-serif font-black ${tc.textDark} bg-white border ${tc.border} rounded-lg px-3 py-2 outline-none ${tc.ring}`}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-mono ${tc.text} font-bold uppercase mb-0.5`}>Creator Name</label>
                          <input
                            type="text"
                            value={activeBoard.creator}
                            onChange={(e) => setActiveBoard({ ...activeBoard, creator: e.target.value })}
                            className={`w-full text-xs font-serif font-black ${tc.textDark} bg-white border ${tc.border} rounded-lg px-3 py-2 outline-none ${tc.ring}`}
                            placeholder="The College Crew"
                          />
                        </div>
                      </div>
                      {/* Theme selector inside editor */}
                      <div>
                        <label className={`block text-[10px] font-mono ${tc.text} font-bold uppercase mb-0.5`}>Theme</label>
                        <select
                          value={activeBoard.theme}
                          onChange={(e) => setActiveBoard({ ...activeBoard, theme: e.target.value as Scrapbook["theme"] })}
                          className={`w-full text-xs bg-white border ${tc.border} rounded-lg px-3 py-2 outline-none ${tc.ring} ${tc.textDark}`}
                        >
                          <option value="Cherry Blossom">🌸 Cherry Blossom</option>
                          <option value="Ocean Breeze">🌊 Ocean Breeze</option>
                          <option value="Golden Sunflower">🌻 Golden Sunflower</option>
                          <option value="Lavender Dreams">🌙 Lavender Dreams</option>
                          <option value="Berry Romance">🍓 Berry Romance</option>
                          <option value="Sage Serenity">🍃 Sage Serenity</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 ${tc.bgLight} ${tc.text} text-[10px] font-mono font-bold rounded-full uppercase tracking-wider`}>
                        {activeBoard.type} scrapbook 🌸
                      </span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                        {activeBoard.theme}
                      </span>
                    </div>
                    <h2 className={`font-serif text-2xl md:text-3xl font-extrabold ${tc.textDark} tracking-tight leading-tight`}>
                      {activeBoard.title}
                    </h2>
                    <p className={`text-sm ${tc.text} font-mono`}>
                      Stitched by <span className={`font-bold ${tc.text}`}>{activeBoard.creator}</span> for our absolute favorite:{" "}
                      <span className={`font-extrabold ${tc.accent} font-serif underline decoration-dotted`}>{activeBoard.recipient}</span> ❤️
                    </p>
                  </div>
                )}

                <div className={`${tc.bgLight} p-4 rounded-3xl border ${tc.border} ring-4 ring-white text-center min-w-[200px] self-stretch md:self-auto flex flex-col justify-center`}>
                  <p className={`text-[10px] font-mono font-bold uppercase ${tc.text}`}>Milestone Surprise Board</p>
                  <p className={`text-[10px] ${tc.textDark} mt-1 leading-snug`}>All wishes and additions are synced live instantly.</p>
                </div>
              </div>

              {/* Preview banner */}
              {isPreviewMode && !isSharedView && (
                <div className={`mb-8 text-white p-5 rounded-[30px] border border-current/10 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between select-none`} style={{ 
                  background: tc.button.includes('bg-') ? `linear-gradient(to right, var(--tw-gradient-stops))` : undefined
                }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">🎁</span>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">Recipient Preview Mode Active</h4>
                      <p className="text-xs opacity-90 mt-0.5">This is exactly how {activeBoard.recipient} will view your dedicated surprise scrapbook!</p>
                    </div>
                  </div>
                  <button
                    id="exit-preview-banner-btn"
                    onClick={switchToEdit}
                    className={`px-5 py-2.5 bg-white ${tc.text} ${tc.hoverBg} active:scale-95 duration-100 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm`}
                  >
                    ✍️ Return to Editor Mode
                  </button>
                </div>
              )}

              {/* Scrapbook canvas */}
              <div
                id="scrapbook-unified-canvas-page"
                className="w-full bg-[#fefdf9] rounded-[40px] shadow-2xl border-2 border-pink-200/60 p-6 md:p-10 relative overflow-hidden flex flex-col gap-10 min-h-[600px] mb-12"
              >
                {/* Binder rings */}
                <div className="absolute left-2.5 md:left-4.5 top-10 bottom-10 w-6 flex flex-col justify-between pointer-events-none select-none z-10 opacity-70">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="w-4.5 h-4.5 rounded-full bg-[#eadecb] border border-pink-900/10 shadow-[inset_0_2px_3px_rgba(0,0,0,0.15)] flex items-center justify-center">
                      <div className="w-2.5 h-10 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 rounded-full rotate-[15deg] -translate-x-2.5 -translate-y-0.5 opacity-60 shadow-xs" />
                    </div>
                  ))}
                </div>

                <div className="pl-12 md:pl-16 space-y-10">
                  {/* Ledger header */}
                  <div className="border-b border-pink-200/60 pb-5 flex justify-between items-center flex-wrap gap-4 relative">
                    <div>
                      <h3 className="font-serif italic text-xl md:text-3xl font-black text-pink-950 flex items-center gap-2">
                        <span>📖</span> {activeBoard.recipient}'s Surprises & Memories Collage
                      </h3>
                      <p className={`text-xs ${tc.textLight} mt-1`}>A collaborative physical canvas where letters, scratch polaroids, music vinyl and fresh florist bouquets live together.</p>
                    </div>
                  </div>

                  {/* Music + Calendar row */}
                  <div className={activeBoard.showCalendar ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "max-w-2xl mx-auto w-full"}>
                    {activeBoard.musics && activeBoard.musics.length > 0 && (
                      <div className="bg-[#fdf9fc] border border-[#f5ebf4] p-5 rounded-[2.5rem] shadow-xs relative overflow-hidden">
                        <div className="absolute top-2 right-4 px-2.5 py-0.5 bg-pink-100/60 text-[9px] font-mono font-black text-pink-500 rounded uppercase tracking-wider">Vinyl Jukebox</div>
                        <MusicRoom
                          musics={activeBoard.musics}
                          onAddMusic={handleAddMusic}
                          onDeleteMusic={handleDeleteMusic}
                          readOnly={true}
                          buttonClass={tc.button}
                        />
                      </div>
                    )}
                    {activeBoard.showCalendar && (
                      <div className="bg-[#fafbfd] border border-teal-100/70 p-5 rounded-[2.5rem] shadow-xs relative overflow-hidden">
                        <div className="absolute top-2 right-4 px-2.5 py-0.5 bg-teal-50 text-[9px] font-mono font-black text-teal-500 rounded uppercase tracking-wider">Diary Tracker</div>
                        <MemoryCalendar
                          events={activeBoard.calendarEvents}
                          onAddEvent={handleAddCalendarEvent}
                          onDeleteEvent={handleDeleteCalendarEvent}
                          readOnly={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Polaroids + Notes + Bouquets */}
                  {(activeBoard.photos.length > 0 || activeBoard.notes.length > 0 || activeBoard.bouquets.length > 0) && (
                    <div className="space-y-6">
                      <h4 className="font-serif text-base md:text-lg font-black text-pink-950 flex items-center gap-2 border-b border-pink-100 pb-2">
                        <span>📸</span> Polaroid Photos & Delivered Kept Elements
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                        {activeBoard.photos.map((ph) => (
                          <ScratchCard
                            key={`${ph.id}-${previewToggleCount}`}
                            id={ph.id}
                            src={ph.src}
                            caption={ph.caption}
                            creator={ph.creator}
                            scratched={false}
                            onScratchComplete={handleScratchComplete}
                            onDelete={isPreviewMode ? undefined : handleDeletePhoto}
                          />
                        ))}
                        {activeBoard.notes.map((nt) => (
                          <NoteCard
                            key={nt.id}
                            id={nt.id}
                            text={nt.text}
                            creator={nt.creator}
                            font={nt.font}
                            paperType={nt.paperType}
                            onDelete={isPreviewMode ? undefined : handleDeleteNote}
                          />
                        ))}
                        {activeBoard.bouquets.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white p-6 rounded-3xl border border-pink-100 shadow-md relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-250"
                          >
                            {!isPreviewMode && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBouquet(b.id)}
                                className="absolute top-3.5 right-3.5 text-pink-300 hover:text-red-500 transition-colors duration-150 p-1 rounded-full hover:bg-rose-50 cursor-pointer z-10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className="relative h-28 flex items-center justify-center bg-pink-50/30 rounded-2xl mb-4 overflow-hidden">
                              <div className={`absolute bottom-0 w-20 h-14 z-10 origin-bottom rounded-b-xl transition-all duration-300 ${
                                b.wrap === "vintage" ? "bg-amber-100 border border-amber-300 rotate-[4deg] bg-[radial-gradient(#b45309_0.5px,_transparent_0.5px)] bg-[size:8px_8px]"
                                  : b.wrap === "brown" ? "bg-amber-700/80 border border-amber-800 rotate-[-24deg] rounded-t-md"
                                  : b.wrap === "pink-lace" ? "bg-pink-100/90 border-2 border-pink-300/40 rotate-[10deg] rounded-t-lg"
                                  : "bg-white border-2 border-slate-100 rotate-[-5deg] rounded-t-md"
                              }`} />
                              {b.ribbon !== "none" && (
                                <div className={`absolute bottom-2 w-7 h-7 rounded-full flex items-center justify-center z-20 text-[9px] ${
                                  b.ribbon === "pink" ? "bg-pink-400 text-white"
                                    : b.ribbon === "red" ? "bg-red-500 text-white"
                                    : "bg-yellow-400 text-slate-900"
                                }`}>🎗️</div>
                              )}
                              {b.flowers.map((name, idx) => {
                                const emoji = name.includes("🌹") ? "🌹" : name.includes("🌷") ? "🌷" : name.includes("🌸") ? "🌸" : name.includes("🌺") ? "🌺" : "✨";
                                const angle = (idx - (b.flowers.length - 1) / 2) * (70 / Math.max(b.flowers.length, 1));
                                const distance = 25 - Math.abs(idx - (b.flowers.length - 1) / 2) * 2;
                                return (
                                  <div key={idx} style={{ transform: `translate(${Math.sin((angle * Math.PI) / 180) * distance}px, ${-Math.cos((angle * Math.PI) / 180) * distance - 10}px) rotate(${angle}deg)` }} className="absolute text-2xl z-5 select-none">
                                    {emoji}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <h5 className="font-semibold text-pink-900 text-[11px] tracking-wide uppercase font-mono text-center">💐 Gilded Bouquet</h5>
                                <p className="font-serif text-pink-700 text-md leading-snug mt-2 text-center pb-2">"{b.message}"</p>
                              </div>
                              <div className="pt-2 border-t border-pink-50 text-right mt-2">
                                <p className="text-[10px] font-mono text-pink-400">Gently gifted by <span className="font-bold text-pink-600">{b.creator}</span></p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contribution corner — edit mode only */}
              {!isPreviewMode && (
                <div className={`mt-2 mb-12 bg-white border ${tc.borderLight} rounded-[35px] shadow-xl p-6 md:p-8 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none`} style={{ background: `${tc.bgLight}30` }} />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${tc.borderLight} pb-4 mb-6">
                    <div>
                      <h3 className={`font-serif italic text-lg md:text-xl font-bold ${tc.textDark} flex items-center gap-2`}>
                        <span>✨</span> Cozy Contribution Corner
                      </h3>
                      <p className={`text-xs ${tc.text} mt-0.5`}>Select a keepsake category to craft and add your digital surprise onto the live collage above!</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {(["photo", "note", "bouquet", "music"] as const).map((tab) => {
                        const labels: Record<string, string> = { photo: "📸 Polaroid", note: "📝 Note Card", bouquet: "💐 Flower Bouquet", music: "📻 Jukebox Song" };
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveCraftTab(activeCraftTab === tab ? null : tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                              activeCraftTab === tab ? `${tc.activeToggle} shadow` : `${tc.bgLight} ${tc.text} hover:${tc.bgLight}`
                            }`}
                          >
                            {labels[tab]}
                          </button>
                        );
                      })}
                      {activeBoard.showCalendar && (
                        <button
                          type="button"
                          onClick={() => setActiveCraftTab(activeCraftTab === "calendar" ? null : "calendar")}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                            activeCraftTab === "calendar" ? `${tc.activeToggle} shadow` : `${tc.bgLight} ${tc.text} hover:${tc.bgLight}`
                          }`}
                        >
                          📅 Calendar Entry
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeCraftTab === null ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-center py-6 border border-dashed rounded-2xl`}
                        style={{ borderColor: tc.borderLight.split('-').slice(1).join('-'), backgroundColor: `${tc.bg}10` }}
                      >
                        <p className={`text-xs ${tc.text} font-mono`}>💡 Select any keepsake above to expand its crafting toolbox form!</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activeCraftTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-2xl border ${tc.borderLight}/50`}
                        style={{ backgroundColor: `${tc.bg}` }}
                      >
                        {activeCraftTab === "photo" && (
                          <form onSubmit={handleAddPhoto} className="space-y-4">
                            <h4 className={`font-serif text-sm font-bold ${tc.textDark} border-b ${tc.borderLight} pb-1 flex items-center gap-1.5`}>
                              <span>📸</span> Design Custom Scratch Polaroid
                            </h4>
                            <div className={`flex gap-3 border-b ${tc.borderLight}/40 pb-2 mb-2`}>
                              {(["url", "file"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setPhotoUploadType(t)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${photoUploadType === t ? `${tc.activeToggle}` : `bg-white ${tc.text} border ${tc.borderLight}`}`}
                                >
                                  {t === "url" ? "Paste Photo Link 🔗" : "Upload Device Image 📁"}
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {photoUploadType === "url" ? (
                                <div>
                                  <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Image Link URL</label>
                                  <input type="url" placeholder="https://images.unsplash.com/..." value={photoSrc} onChange={(e) => setPhotoSrc(e.target.value)} required className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2.5 outline-none ${tc.ring} ${tc.textDark}`} />
                                </div>
                              ) : (
                                <div>
                                  <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Select Local Image File</label>
                                  <input type="file" accept="image/*" onChange={handlePhotoFileChange} required={photoUploadType === "file" && !photoSrc} className={`w-full text-[11px] ${tc.text}`} />
                                </div>
                              )}
                              <div>
                                <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Your Signature / Name</label>
                                <input type="text" placeholder="E.g. Sister Jasmine" value={photoCreator} onChange={(e) => setPhotoCreator(e.target.value)} className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2.5 outline-none ${tc.ring} ${tc.textDark}`} />
                              </div>
                            </div>
                            <div>
                              <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Polaroid Caption Text</label>
                              <input type="text" placeholder="E.g. Remember our beach roadtrip? 🏖️" value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} required className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2.5 outline-none ${tc.ring} ${tc.textDark}`} />
                            </div>
                            {photoSrc && (
                              <div className={`mt-2.5 flex items-center gap-3 bg-white p-2 rounded-xl border ${tc.borderLight} w-fit`}>
                                <img src={photoSrc} alt="Preview" className={`w-16 h-16 object-cover rounded-lg border ${tc.borderLight}`} referrerPolicy="no-referrer" />
                                <span className={`text-[10px] ${tc.text} font-mono`}>Image loaded successfully!</span>
                              </div>
                            )}
                            <div className={`flex justify-end pt-2 border-t ${tc.borderLight}`}>
                              <button type="submit" className={`px-5 py-2 ${tc.button} font-bold text-xs rounded-xl cursor-pointer`}>
                                Stash Polaroid into Collage 🖼️
                              </button>
                            </div>
                          </form>
                        )}

                        {activeCraftTab === "note" && (
                          <form onSubmit={handleAddNote} className="space-y-4">
                            <h4 className={`font-serif text-sm font-bold ${tc.textDark} border-b ${tc.borderLight} pb-1 flex items-center gap-1.5`}>
                              <span>📝</span> Write Lovely Sticky Blessing Card
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Aesthetic Paper Background</label>
                                <select value={notePaper} onChange={(e) => setNotePaper(e.target.value as any)} className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2 outline-none ${tc.ring} ${tc.textDark}`}>
                                  <option value="ruled">Ruled Margin Notebook 📜</option>
                                  <option value="floral">Vintage Pink Blossom Petals 🌸</option>
                                  <option value="grid">Cozy Memo Planner Grid 🗒️</option>
                                  <option value="plain">Elegant Peach Plain Card 📄</option>
                                </select>
                              </div>
                              <div>
                                <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Handwriting Font Style</label>
                                <select value={noteFont} onChange={(e) => setNoteFont(e.target.value as any)} className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2 outline-none ${tc.ring} ${tc.textDark}`}>
                                  <option value="cursive">Classic Script Calligraphy 🖋️</option>
                                  <option value="handwriting">Nostalgic Playful Scribble ✏️</option>
                                  <option value="serif">Formal Vintage Book Serif 📚</option>
                                  <option value="sans">Minimalist Flat Clean Modern 💻</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-8">
                                <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Message to Loved One</label>
                                <input type="text" placeholder="I wish you a breathtaking year..." value={noteText} onChange={(e) => setNoteText(e.target.value)} required className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2.5 outline-none ${tc.ring} ${tc.textDark}`} />
                              </div>
                              <div className="md:col-span-4">
                                <label className={`block text-[10px] font-mono font-bold ${tc.text} uppercase mb-1`}>Your Signature Name</label>
                                <input type="text" placeholder="Aunt May" value={noteCreator} onChange={(e) => setNoteCreator(e.target.value)} className={`w-full text-xs bg-white border ${tc.border} rounded-lg p-2.5 outline-none ${tc.ring} ${tc.textDark}`} />
                              </div>
                            </div>
                            <div className={`flex justify-end pt-2 border-t ${tc.borderLight}`}>
                              <button type="submit" className={`px-5 py-2 ${tc.button} font-bold text-xs rounded-xl cursor-pointer`}>
                                Stick Note onto Collage 📝
                              </button>
                            </div>
                          </form>
                        )}

                        {activeCraftTab === "bouquet" && (
                          <div className="bg-white rounded-2xl p-2 border border-pink-100 overflow-hidden">
                            <BouquetMaker bouquets={activeBoard.bouquets} onAddBouquet={handleAddBouquet} onDeleteBouquet={undefined} readOnly={false} buttonClass={tc.button} />
                          </div>
                        )}

                        {activeCraftTab === "music" && (
                          <div className="bg-white rounded-2xl p-2 border border-pink-100 overflow-hidden">
                            <MusicRoom musics={activeBoard.musics} onAddMusic={handleAddMusic} onDeleteMusic={undefined} readOnly={false} buttonClass={tc.button} />
                          </div>
                        )}

                        {activeCraftTab === "calendar" && (
                          <div className="bg-white rounded-2xl p-2 border border-pink-100 overflow-hidden">
                            <MemoryCalendar events={activeBoard.calendarEvents} onAddEvent={handleAddCalendarEvent} onDeleteEvent={undefined} readOnly={false} />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className={`border-t ${tc.borderLight} mt-12 py-8 px-4 text-center`}>
        <div className="max-w-4xl mx-auto space-y-1 text-slate-500 text-xs">
          <p className={`font-semibold ${tc.textDark}`}>Our Eternal Scrapbook • Elegant, Collaborative and Secure</p>
          <p className={`text-[10px] ${tc.textLight}`}>Made with sweet shades of rose and cherry blossom pink for your special milestones. ❤️</p>
        </div>
      </footer>
    </div>
  );
}