import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  Share2, 
  Image as ImageIcon, 
  BookOpen, 
  ChevronRight, 
  Music as MusicIcon, 
  Gift as GiftIcon, 
  Calendar as CalendarIcon, 
  FileText as FileTextIcon, 
  Plus, 
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  HelpCircle,
  ExternalLink
} from "lucide-react";

import { Scrapbook, PhotoItem, NoteItem, BouquetItem, MusicItem, CalendarEvent } from "./types";
import ScratchCard from "./components/ScratchCard";
import NoteCard from "./components/NoteCard";
import BouquetMaker from "./components/BouquetMaker";
import MusicRoom from "./components/MusicRoom";
import MemoryCalendar from "./components/MemoryCalendar";

export default function App() {
  // Navigation & board query parameters hydration
  const [boardId, setBoardId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<Scrapbook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoverFlipped, setIsCoverFlipped] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  
  // Create board form state
  const [newTitle, setNewTitle] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newCreator, setNewCreator] = useState("");
  const [newType, setNewType] = useState<"birthday" | "anniversary" | "other">("birthday");
  const [newTheme, setNewTheme] = useState<"Blush Whisper" | "Vintage Rose" | "Cherry Blossom" | "Berry Romance">("Cherry Blossom");
  const [newIncludeCalendar, setNewIncludeCalendar] = useState(false);

  // Add Item States inside board
  const [photoSrc, setPhotoSrc] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCreator, setPhotoCreator] = useState("");
  const [photoUploadType, setPhotoUploadType] = useState<"url" | "file">("url");
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [noteCreator, setNoteCreator] = useState("");
  const [noteFont, setNoteFont] = useState<"cursive" | "sans" | "serif" | "handwriting">("cursive");
  const [notePaper, setNotePaper] = useState<"ruled" | "plain" | "floral" | "grid">("ruled");
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);

  // Link copy visual feedback state
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCraftTab, setActiveCraftTab] = useState<"photo" | "note" | "bouquet" | "music" | "calendar" | null>(null);

  // Parse URL path and load scrapbook on mount
  useEffect(() => {
    // Check if URL is /scrapbook/:id format
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const scrapbookIndex = pathParts.indexOf("scrapbook");
    
    if (scrapbookIndex !== -1 && pathParts[scrapbookIndex + 1]) {
      // URL format: /scrapbook/:id
      const id = pathParts[scrapbookIndex + 1];
      setBoardId(id);
      setIsSharedView(true); // Shared links are read-only by default
      setIsPreviewMode(true);
      // wait for board data to load before allowing UI to show
      fetchBoardData(id).finally(() => setBootstrapped(true));
      setIsCoverFlipped(true); // Autoflip cover to browse the content
    } else {
      // Landing page: show cover creator
      setBootstrapped(true);
    }
    // NOTE: `bootstrapped` is set above once initial data loading finishes
  }, []);

  // Fetch Scrapbook representation from back-end REST API
  const fetchBoardData = async (id: string) => {
  try {
    setIsLoading(true);

    const response = await axios.get(
      `http://localhost:5000/api/scrapbooks/${id}`
    );

    setActiveBoard(response.data);

  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};

  // Create Scrapbook Action
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
    showCalendar: newIncludeCalendar
  };

  setActiveBoard(freshScrapbook);
  setIsCoverFlipped(true);
  setIsSharedView(false);
};

  const handleToggleCalendar = () => {
    if (!activeBoard) return;
    const nextVal = !(activeBoard.showCalendar ?? false);
    const updated = {
      ...activeBoard,
      showCalendar: nextVal
    };
    setActiveBoard(updated);
  };

  // Exit back to Cover Creator / Reset
  const handleExitAlbum = () => {
    if (confirm("Are you sure you want to go back to the cover generator? Your board will remain openable using its share link.")) {
      setBoardId(null);
      setActiveBoard(null);
      setIsCoverFlipped(false);
      setIsSharedView(false);
      localStorage.removeItem("last_active_scrapbook_id");
      // Navigate to clean root path
      const cleanUrl = `${window.location.origin}/`;
      window.history.pushState({ path: cleanUrl }, "", cleanUrl);
    }
  };

  // Trigger Demo board directly
  const loadDemoBoard = () => {
    setBoardId("demo-scrapbook");
    fetchBoardData("demo-scrapbook");
    const newUrl = `${window.location.origin}/scrapbook/demo-scrapbook`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    setIsCoverFlipped(true);
    setIsSharedView(true); // Demo is shared/read-only for demo purposes
  };

  // MUTATION: 1. Add Photo Polaroid
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoSrc.trim() || !photoCaption.trim()) {
      alert("Please specify a valid photo source and label caption!");
      return;
    }
    if (!activeBoard) return;

    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      src: photoSrc,
      caption: photoCaption.trim(),
      creator: photoCreator.trim() ||"Admirer",
      scratched: false,
    };

    const updated = {
      ...activeBoard,
      photos: [newPhoto, ...activeBoard.photos],
    };

    setActiveBoard(updated);

    // reset fields
    setPhotoSrc("");
    setPhotoCaption("");
    setPhotoCreator("");
    setIsPhotoFormOpen(false);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Set individual photo scratched complete status
  const handleScratchComplete = (pId: string) => {
    if (!activeBoard) return;
    const updatedPhotos = activeBoard.photos.map((ph) => {
      if (ph.id === pId) {
        return { ...ph, scratched: true };
      }
      return ph;
    });

    const updated = {
      ...activeBoard,
      photos: updatedPhotos,
    };
    setActiveBoard(updated);
  
  };

  const handleDeletePhoto = (pId: string) => {
    if (!activeBoard || !confirm("Delete this polaroid photo permanently?")) return;
    const updated = {
      ...activeBoard,
      photos: activeBoard.photos.filter((ph) => ph.id !== pId),
    };
    setActiveBoard(updated);
  };

  // MUTATION: 2. Add Note sticky card
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      alert("Note text cannot remain empty!");
      return;
    }
    if (!activeBoard) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      creator: noteCreator.trim() || "Secret Helper",
      font: noteFont,
      paperType: notePaper,
    };

    const updated = {
      ...activeBoard,
      notes: [newNote, ...activeBoard.notes],
    };
    setActiveBoard(updated);

    // reset note controls
    setNoteText("");
    setNoteCreator("");
    setIsNoteFormOpen(false);
  };

  const handleDeleteNote = (nId: string) => {
    if (!activeBoard || !confirm("Pry off this note card?")) return;
    const updated = {
      ...activeBoard,
      notes: activeBoard.notes.filter((nt) => nt.id !== nId),
    };
    setActiveBoard(updated);
  };

  // MUTATION: 3. Bouquet Maker delivery
  const handleAddBouquet = (b: Omit<BouquetItem, "id">) => {
    if (!activeBoard) return;
    const newBouquet: BouquetItem = {
      id: `bouquet-${Date.now()}`,
      ...b,
    };

    const updated = {
      ...activeBoard,
      bouquets: [newBouquet, ...activeBoard.bouquets],
    };

    setActiveBoard(updated);
  };

  const handleDeleteBouquet = (bId: string) => {
    if (!activeBoard || !confirm("Remove this bouquet?")) return;
    const updated = {
      ...activeBoard,
      bouquets: activeBoard.bouquets.filter((bq) => bq.id !== bId),
    };
    setActiveBoard(updated);
  };

  // MUTATION: 4. Dedicate Music tune
  const handleAddMusic = (m: Omit<MusicItem, "id"> & { customFile?: string, title?: string }) => {
    if (!activeBoard) return;
    const newMusic: MusicItem = {
      id: `music-${Date.now()}`,
      trackId: m.trackId,
      creator: m.creator,
      message: m.message,
      customFile: m.customFile,
      title: m.title,
    };

    const updated = {
      ...activeBoard,
      musics: [newMusic, ...activeBoard.musics],
    };

    setActiveBoard(updated);
  };

  const handleDeleteMusic = (mId: string) => {
    if (!activeBoard || !confirm("Remove this audio dedication song?")) return;
    const updated = {
      ...activeBoard,
      musics: activeBoard.musics.filter((ms) => ms.id !== mId),
    };
    setActiveBoard(updated);
  };

  // MUTATION: 5. Diary Event calendar capture
  const handleAddCalendarEvent = (e: Omit<CalendarEvent, "id">) => {
    if (!activeBoard) return;
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...e,
    };

    const updated = {
      ...activeBoard,
      calendarEvents: [newEvent, ...activeBoard.calendarEvents],
    };

    setActiveBoard(updated);
  };

  const handleDeleteCalendarEvent = (eId: string) => {
    if (!activeBoard || !confirm("Erase this calendar diary memory permanently?")) return;
    const updated = {
      ...activeBoard,
      calendarEvents: activeBoard.calendarEvents.filter((ev) => ev.id !== eId),
    };
    setActiveBoard(updated);
  };

  // Copy shareable link triggers helper
  const copyShareLink = async () => {
  try {
    if (!activeBoard) return;

    const response = await axios.post(
      "http://localhost:5000/api/scrapbooks",
      activeBoard
    );

    console.log(response.data);

    const generatedLink = response.data.link;

    if (!generatedLink) {
      alert("Link generation failed");
      return;
    }

    await navigator.clipboard.writeText(generatedLink);

    setCopiedLink(true);

    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);

  } catch (error) {
    console.log(error);
    alert("Failed to save scrapbook");
  }
};

  // Render Theme Nuance classes
  const getThemeBackgroundClass = () => {
    if (!activeBoard) return "bg-pink-50";
    switch (activeBoard.theme) {
      case "Blush Whisper":
        return "bg-amber-50/20";
      case "Vintage Rose":
        return "bg-rose-50/30";
      case "Berry Romance":
        return "bg-rose-100/20";
      case "Cherry Blossom":
      default:
        return "bg-pink-50/25";
    }
  };

  return (
    <div className="min-h-screen scrapbook-bg text-[#831843] flex flex-col font-sans selection:bg-pink-200">
      
      {/* Dynamic Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-pink-200/65 px-6 py-4 shadow-[0_4px_24px_rgba(244,63,94,0.04)]">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3.5xl font-serif italic font-bold text-pink-600 leading-tight">
              {activeBoard ? activeBoard.title : "Our Eternal Scrapbook"}
            </h1>
            <p className="text-pink-400 text-[10px] md:text-xs tracking-widest uppercase mt-0.5 font-sans font-semibold">
              {activeBoard ? `Celebrating with ${activeBoard.recipient}` : "Celebrating 5 Years of Magic"}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 flex-wrap md:flex-nowrap justify-end">
            {activeBoard && (
              <>
                {!isSharedView && (
                  <>
                    {/* Mode Selector Toggle */}
                    <div className="bg-pink-50 p-1 rounded-full flex items-center border border-pink-200 mr-1 shadow-inner">
                      <button
                        id="toggle-mode-edit"
                        onClick={() => {
                          setIsPreviewMode(false);
                          // Turn on forms
                          setIsPhotoFormOpen(false);
                          setIsNoteFormOpen(false);
                        }}
                        className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                          !isPreviewMode 
                            ? "bg-pink-500 text-white shadow-xs" 
                            : "text-pink-700 hover:text-pink-900 hover:bg-pink-100/30"
                        }`}
                      >
                        ✍️ Edit Mode
                      </button>
                      <button
                        id="toggle-mode-preview"
                        onClick={() => {
                          setIsPreviewMode(true);
                          // Close form dialogs
                          setIsPhotoFormOpen(false);
                          setIsNoteFormOpen(false);
                        }}
                        className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                          isPreviewMode 
                            ? "bg-pink-500 text-white shadow-xs" 
                            : "text-pink-700 hover:text-pink-900 hover:bg-pink-100/30"
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
                            : "bg-white hover:bg-teal-50 border-pink-100 text-teal-800 font-semibold"
                        }`}
                        title={activeBoard.showCalendar ? "Remove Milestone Diary Calendar tracker" : "Include diary calendar tracker timeline"}
                      >
                        📅 {activeBoard.showCalendar ? "Calendar Active" : "Add Calendar"}
                      </button>
                    )}

                    {/* Board Share panel */}
                    <button
                      id="header-copy-share-btn"
                      onClick={copyShareLink}
                      className="flex items-center gap-1 px-3 py-1.5 md:px-5 md:py-2 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-[10px] md:text-xs font-semibold rounded-full duration-150 cursor-pointer shadow-md shadow-pink-200"
                    >
                      {copiedLink ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                      {copiedLink ? "Copied! 💖" : "Copy Surprise Link 🔗"}
                    </button>
                  </>
                )}
              </>
            )}
            
            {!activeBoard && (
              <button
                id="header-try-demo-btn"
                onClick={loadDemoBoard}
                className="px-5 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm"
              >
                Try Live Sample Account 📚
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl animate-spin text-pink-500">🌸</span>
            <p className="font-mono text-xs text-pink-600">Flipping physical parchment pages...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isCoverFlipped || !activeBoard ? (
            
            // SCREEN A: Creative Cover Maker Page (or cover flip)
            <motion.div
              key="cover-maker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-[40px] p-8 md:p-12 border border-pink-100 shadow-2xl"
              style={{ display: bootstrapped ? undefined : "none" }}
            >
              
              {/* Left Column info / nostalgic cover preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-3">
                <div className="relative w-56 h-72 rounded-r-2xl shadow-2xl border-l-[12px] bg-rose-600 border-rose-800 flex flex-col justify-between p-5 text-white overflow-hidden group">
                  {/* Spine brass bindings */}
                  <div className="absolute left-[-12px] top-6 bottom-6 w-[12px] flex flex-col justify-between py-2 z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />
                  </div>

                  <div className="text-left">
                    <span className="text-3xl block drop-shadow-md">📖</span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-pink-200 block mt-1.5">Aesthetic Diary</span>
                  </div>

                  <div className="text-center my-auto px-1 flex flex-col justify-center">
                    <p className="font-serif text-lg font-bold italic text-yellow-100 leading-snug drop-shadow-md">
                      Celebrate Love & Nostalgia
                    </p>
                    <p className="text-[10px] text-pink-100/90 font-mono mt-2 italic">
                      Shades of Pink Theme
                    </p>
                  </div>

                  <div className="text-right pt-2 border-t border-rose-450">
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

              {/* Right Column Custom Generation form */}
              <div className="lg:col-span-7">
                <div className="bg-pink-50 rounded-3xl p-6 md:p-8 border border-pink-100 shadow-inner">
                  <h3 className="font-serif text-lg font-bold text-pink-950 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                    Stitch a New Scrapbook
                  </h3>

                  <form onSubmit={handleCreateScrapbook} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-pink-600 uppercase mb-1">
                        Scrapbook Header Action Title
                      </label>
                      <input
                        id="input-new-board-title"
                        type="text"
                        placeholder="John's 30th Birthday Wishes! 🎂"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="w-full text-xs bg-white border border-pink-200 rounded-lg p-3 text-pink-900 outline-none focus:ring-1 focus:ring-pink-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-pink-600 uppercase mb-1">
                          Loved One / Recipient Name
                        </label>
                        <input
                          id="input-new-board-recipient"
                          type="text"
                          placeholder="John Doe"
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          required
                          className="w-full text-xs bg-white border border-pink-200 rounded-lg p-3 text-pink-900 outline-none focus:ring-1 focus:ring-pink-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-pink-600 uppercase mb-1">
                          Organizer / Group Name
                        </label>
                        <input
                          id="input-new-board-creator"
                          type="text"
                          placeholder="The College Crew"
                          value={newCreator}
                          onChange={(e) => setNewCreator(e.target.value)}
                          required
                          className="w-full text-xs bg-white border border-pink-200 rounded-lg p-3 text-pink-900 outline-none focus:ring-1 focus:ring-pink-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-pink-600 uppercase mb-1">
                          Occasion Type
                        </label>
                        <select
                          id="select-new-board-ocassion"
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as any)}
                          className="w-full text-xs bg-white border border-pink-200 rounded-lg p-3 text-pink-[#831843] focus:ring-1 focus:ring-pink-300"
                        >
                          <option value="birthday">Birthday Cake Surprise 🧁</option>
                          <option value="anniversary">Love anniversary 🌸</option>
                          <option value="other">General Love & Admiration 💕</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-pink-600 uppercase mb-1">
                          Pink Shade Sub-Theme
                        </label>
                        <select
                          id="select-new-board-theme"
                          value={newTheme}
                          onChange={(e) => setNewTheme(e.target.value as any)}
                          className="w-full text-xs bg-white border border-pink-200 rounded-lg p-3 text-pink-[#831843] focus:ring-1 focus:ring-pink-300"
                        >
                          <option value="Cherry Blossom">Cherry Blossom (Rich Pink + Gold) 🌸</option>
                          <option value="Blush Whisper">Blush Whisper (Pastel Pinks + Cream) 🩰</option>
                          <option value="Vintage Rose">Vintage Rose (Dusty pinks + Sepia) 🥀</option>
                          <option value="Berry Romance">Berry Romance (Bright Magenta + Raspberry) 🍓</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 bg-pink-100/35 p-3 rounded-xl border border-pink-200/50 mt-1">
                      <input
                        id="checkbox-new-board-include-calendar"
                        type="checkbox"
                        checked={newIncludeCalendar}
                        onChange={(e) => setNewIncludeCalendar(e.target.checked)}
                        className="w-4.5 h-4.5 text-pink-500 bg-white border-pink-300 rounded-md focus:ring-1 focus:ring-pink-300 cursor-pointer accent-pink-600"
                      />
                      <label 
                        htmlFor="checkbox-new-board-include-calendar" 
                        className="text-xs font-semibold text-pink-900 cursor-pointer select-none leading-relaxed"
                      >
                        📅 Include Milestone Diary Calendar tracker on the collage card?
                        <span className="block text-[10px] text-pink-500 font-normal mt-0.5">Let's you and contributors write dates & event milestones. Defaults to off.</span>
                      </label>
                    </div>

                    <button
                      id="create-board-btn"
                      type="submit"
                      className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm rounded-full transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Sew Book Covers & Open Album</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

          ) : (

            // SCREEN B: Open Collaborative Journal Board View
            <motion.div
              key="scrapbook-opened"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-6xl flex flex-col animate-fadeIn"
            >
              
              {/* Dynamic Cover Banner with Heart Sparkles */}
              <div className="bg-white rounded-[40px] shadow-xl p-8 border border-pink-150 mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Washi background graphics */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none select-none text-7xl rotate-[20deg]">
                  🌸
                </div>
                
                {!isPreviewMode ? (
                  <div className="space-y-3 bg-pink-50/50 p-5 rounded-3xl border border-pink-100 w-full md:max-w-2xl relative z-10">
                    <p className="text-[10px] font-mono font-extrabold uppercase text-pink-600 flex items-center gap-1.5">
                      <span>✏️</span> Edit Coversheet Details (Changes Save Automatically!)
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-pink-500 font-bold uppercase mb-0.5">Scrapbook Title</label>
                        <input
                          type="text"
                          value={activeBoard.title}
                          onChange={(e) => {
                            const updated = { ...activeBoard, title: e.target.value };
                            setActiveBoard(updated);
                          }}
                          className="w-full text-sm font-serif font-extrabold text-[#5c0f2e] bg-white border border-pink-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="My Surprise Scrapbook"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-pink-500 font-bold uppercase mb-0.5">Loved One (Recipient Name)</label>
                          <input
                            type="text"
                            value={activeBoard.recipient}
                            onChange={(e) => {
                              const updated = { ...activeBoard, recipient: e.target.value };
                              setActiveBoard(updated);
                            }}
                            className="w-full text-xs font-serif font-black text-[#5c0f2e] bg-white border border-pink-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-pink-400 focus:border-transparent transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-pink-500 font-bold uppercase mb-0.5">Sender (Group / Creator Name)</label>
                          <input
                            type="text"
                            value={activeBoard.creator}
                            onChange={(e) => {
                              const updated = { ...activeBoard, creator: e.target.value };
                              setActiveBoard(updated);
                            }}
                            className="w-full text-xs font-serif font-black text-[#5c0f2e] bg-white border border-pink-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-pink-400 focus:border-transparent transition-all"
                            placeholder="The College Crew"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                        {activeBoard.type} scrapbook 🌸
                      </span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                        {activeBoard.theme}
                      </span>
                    </div>

                    <h2 className="font-serif text-2.5xl md:text-3.5xl font-extrabold text-pink-950 tracking-tight leading-tight">
                      {activeBoard.title}
                    </h2>

                    <p className="text-sm text-pink-500 font-mono">
                      Stitched by <span className="font-bold text-pink-600">{activeBoard.creator}</span> for our absolute favorite: {" "}
                      <span className="font-extrabold text-pink-700 font-serif underline decoration-dotted">{activeBoard.recipient}</span> ❤️
                    </p>
                  </div>
                )}

                <div className="bg-pink-50 p-4 rounded-3xl border border-pink-100 ring-4 ring-white text-center min-w-[200px] self-stretch md:self-auto flex flex-col justify-center">
                  <p className="text-[10px] font-mono font-bold uppercase text-pink-500">Milestone Surprise Board</p>
                  <p className="text-[10px] text-pink-900 mt-1 leading-snug">All wishes and additions are synced live instantly. Tap Preview in header to see how they will react!</p>
                </div>
              </div>

              {/* Conditional Recipient Preview Banner (hide for shared/guest links) */}
              {isPreviewMode && !isSharedView && (
                <div className="mb-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-5 rounded-[30px] border border-pink-400/30 shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between animate-fadeIn select-none">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">🎁</span>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">Recipient Preview Mode Active</h4>
                      <p className="text-xs text-pink-100 mt-0.5">This is exactly how {activeBoard.recipient} will view your dedicated surprise scrapbook! All creation tools, forms and delete buttons are fully hidden.</p>
                    </div>
                  </div>

                  <button
                    id="exit-preview-banner-btn"
                    onClick={() => setIsPreviewMode(false)}
                    className="px-5 py-2.5 bg-white text-pink-600 hover:bg-pink-50 active:scale-95 duration-100 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    ✍️ Return to Editor Mode
                  </button>
                </div>
              )}

              {/* 📖 THE SCRAPBOOK UNIFIED COLLAGE PAGE */}
              <div 
                id="scrapbook-unified-canvas-page" 
                className="w-full bg-[#fefdf9] rounded-[40px] shadow-2xl border-2 border-pink-200/60 p-6 md:p-10 relative overflow-hidden flex flex-col gap-10 min-h-[600px] mb-12"
              >
                {/* Vintage Left margin binder wire links to mimic a cohesive book */}
                <div className="absolute left-2.5 md:left-4.5 top-10 bottom-10 w-6 flex flex-col justify-between pointer-events-none select-none z-10 opacity-70">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="w-4.5 h-4.5 rounded-full bg-[#eadecb] border border-pink-900/10 shadow-[inset_0_2px_3px_rgba(0,0,0,0.15)] flex items-center justify-center">
                      {/* Spiral comb line wire connector */}
                      <div className="w-2.5 h-10 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 rounded-full rotate-[15deg] -translate-x-2.5 -translate-y-0.5 opacity-60 shadow-xs" />
                    </div>
                  ))}
                </div>

                <div className="pl-12 md:pl-16 space-y-10">
                  
                  {/* Ledger Header details inside paper */}
                  <div className="border-b border-pink-200/60 pb-5 flex justify-between items-center flex-wrap gap-4 relative">
                    {/* Washi tape topper visual */}
                    <div className="absolute -top-7.5 left-20 w-32 h-6 bg-[linear-gradient(45deg,_#fbcfe8_25%,_#f472b6_25%,_#f472b6_50%,_#fbcfe8_50%,_#fbcfe8_75%,_#f472b6_75%)] bg-[size:10px_10px] opacity-25 border border-pink-100 rotate-[-1deg] pointer-events-none" />
                    
                    <div>
                      <h3 className="font-serif italic text-xl md:text-3xl font-black text-pink-955 flex items-center gap-2">
                        <span>📖</span> {activeBoard.recipient}'s Surprises & Memories Collage
                      </h3>
                      <p className="text-xs text-pink-500/90 mt-1">A collaborative physical canvas where letters, scratch polaroids, music vinyl and fresh florist bouquets live together.</p>
                    </div>

                    <div className="text-[10px] font-mono font-black text-pink-400 select-none bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100/60">
                      💖 PHYSICAL COLLAGE SHEETS
                    </div>
                  </div>

                  {/* Top Layer desk: Vinyl Jukebox Player Center & Virtual Diary Calendar Side-By-Side */}
                  <div className={activeBoard.showCalendar ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "max-w-2xl mx-auto w-full"}>
                    
                    {/* Interactive Vinyl Room (only show when there are dedicated tracks) */}
                    {activeBoard.musics && activeBoard.musics.length > 0 && (
                      <div className="bg-[#fdf9fc] border border-[#f5ebf4] p-5 rounded-[2.5rem] shadow-xs relative overflow-hidden">
                        <div className="absolute top-2 right-4 px-2.5 py-0.5 bg-pink-100/60 text-[9px] font-mono font-black text-pink-500 rounded uppercase tracking-wider">
                          Vinyl Jukebox
                        </div>
                        <MusicRoom
                          musics={activeBoard.musics}
                          onAddMusic={handleAddMusic}
                          onDeleteMusic={handleDeleteMusic}
                          readOnly={true}
                        />
                      </div>
                    )}

                    {/* Interactive Memory Milestone Diary Calendar */}
                    {activeBoard.showCalendar && (
                      <div className="bg-[#fafbfd] border border-teal-100/70 p-5 rounded-[2.5rem] shadow-xs relative overflow-hidden animate-fadeIn">
                        <div className="absolute top-2 right-4 px-2.5 py-0.5 bg-teal-50 text-[9px] font-mono font-black text-teal-500 rounded uppercase tracking-wider">
                          Diary Tracker
                        </div>
                        <MemoryCalendar
                          events={activeBoard.calendarEvents}
                          onAddEvent={handleAddCalendarEvent}
                          onDeleteEvent={handleDeleteCalendarEvent}
                          readOnly={true}
                        />
                      </div>
                    )}

                  </div>

                  {/* Collage Grid: Scratch Polaroids + Sticky Notes + Florist Bouquets Mixed together */}
                  {(activeBoard.photos.length > 0 || activeBoard.notes.length > 0 || activeBoard.bouquets.length > 0) && (
                    <div className="space-y-6">
                      <h4 className="font-serif text-base md:text-lg font-black text-pink-950 flex items-center gap-2 border-b border-pink-100 pb-2">
                        <span>📸</span> Polaroid Photos & Delivered Kept Elements
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                        
                        {/* POLAROID SCRATCH CARDS */}
                        {activeBoard.photos.map((ph) => (
                          <ScratchCard
                            key={ph.id}
                            id={ph.id}
                            src={ph.src}
                            caption={ph.caption}
                            creator={ph.creator}
                            scratched={ph.scratched}
                            onScratchComplete={handleScratchComplete}
                            onDelete={isPreviewMode ? undefined : handleDeletePhoto}
                          />
                        ))}

                        {/* STICKY NOTES */}
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

                        {/* DELIVERED FLORIST BOUQUETS */}
                        {activeBoard.bouquets.map((b) => (
                          <div 
                            key={b.id} 
                            className="bg-white p-6 rounded-3xl border border-pink-100 shadow-md relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-250 animate-fadeIn"
                          >
                            {!isPreviewMode && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBouquet(b.id)}
                                className="absolute top-3.5 right-3.5 text-pink-300 hover:text-red-500 transition-colors duration-150 p-1 rounded-full hover:bg-rose-50 cursor-pointer z-10"
                                title="Trash Bouquet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Mini Bouquet rendering */}
                            <div className="relative h-28 flex items-center justify-center bg-pink-50/30 rounded-2xl mb-4 overflow-hidden">
                              <div
                                className={`absolute bottom-0 w-20 h-14 z-10 origin-bottom rounded-b-xl transition-all duration-300 ${
                                  b.wrap === "vintage"
                                    ? "bg-amber-100 border border-amber-300 rotate-[4deg] bg-[radial-gradient(#b45309_0.5px,_transparent_0.5px)] bg-[size:8px_8px]"
                                    : b.wrap === "brown"
                                      ? "bg-amber-700/80 border border-amber-800 rotate-[-24deg] rounded-t-md"
                                      : b.wrap === "pink-lace"
                                        ? "bg-pink-100/90 border-2 border-pink-300/40 rotate-[10deg] rounded-t-lg"
                                        : "bg-white border-2 border-slate-100 rotate-[-5deg] rounded-t-md"
                                }`}
                              />
                              
                              {b.ribbon !== "none" && (
                                <div
                                  className={`absolute bottom-2 w-7 h-7 rounded-full flex items-center justify-center z-20 text-[9px] ${
                                    b.ribbon === "pink"
                                      ? "bg-pink-400 text-white"
                                      : b.ribbon === "red"
                                        ? "bg-red-500 text-white"
                                        : "bg-yellow-400 text-slate-900"
                                  }`}
                                >
                                  🎗️
                                </div>
                              )}

                              {b.flowers.map((name, idx) => {
                                const getFlowerEmojiType = (fl: string) => {
                                  if (fl.includes("🌹")) return "🌹";
                                  if (fl.includes("🌷")) return "🌷";
                                  if (fl.includes("🌸")) return "🌸";
                                  if (fl.includes("🌺")) return "🌺";
                                  return "✨";
                                };
                                const emoji = getFlowerEmojiType(name);
                                const angle = (idx - (b.flowers.length - 1) / 2) * (70 / Math.max(b.flowers.length, 1));
                                const distance = 25 - Math.abs(idx - (b.flowers.length - 1) / 2) * 2;

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      transform: `translate(${Math.sin((angle * Math.PI) / 180) * distance}px, ${-Math.cos((angle * Math.PI) / 180) * distance - 10}px) rotate(${angle}deg)`,
                                    }}
                                    className="absolute text-2.5xl z-5 select-none"
                                  >
                                    {emoji}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <h5 className="font-semibold text-pink-905 text-[11px] tracking-wide uppercase font-mono text-center">
                                  💐 Gilded Bouquet
                                </h5>
                                <p className="font-handwriting text-pink-700 text-md leading-snug mt-2 text-center pb-2">
                                  "{b.message}"
                                </p>
                              </div>
                              <div className="pt-2 border-t border-pink-50 text-right mt-2">
                                <p className="text-[10px] font-mono text-pink-400">
                                  Gently gifted by <span className="font-bold text-pink-600">{b.creator}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Expandable Collaboration Craft Element Workshop (only in editor mode) */}
              {!isPreviewMode && (
                <div className="mt-2 mb-12 bg-white border border-pink-100 rounded-[35px] shadow-xl p-6 md:p-8 relative overflow-hidden animate-fadeIn">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100/30 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-100 pb-4 mb-6">
                    <div>
                      <h3 className="font-serif italic text-lg md:text-xl font-bold text-pink-900 flex items-center gap-2">
                        <span>✨</span> Cozy Contribution Corner
                      </h3>
                      <p className="text-xs text-pink-500 mt-0.5">Select a keepsake category to craft and add your digital surprise onto the live collage above!</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveCraftTab(activeCraftTab === "photo" ? null : "photo")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${activeCraftTab === "photo" ? "bg-pink-500 text-white shadow" : "bg-pink-50 text-pink-700 hover:bg-pink-100"}`}
                      >
                        📸 Polaroid
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCraftTab(activeCraftTab === "note" ? null : "note")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${activeCraftTab === "note" ? "bg-pink-500 text-white shadow" : "bg-pink-50 text-pink-700 hover:bg-pink-100"}`}
                      >
                        📝 Note Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCraftTab(activeCraftTab === "bouquet" ? null : "bouquet")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${activeCraftTab === "bouquet" ? "bg-pink-500 text-white shadow" : "bg-pink-50 text-pink-700 hover:bg-pink-100"}`}
                      >
                        💐 Flower Bouquet
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCraftTab(activeCraftTab === "music" ? null : "music")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${activeCraftTab === "music" ? "bg-pink-500 text-white shadow" : "bg-pink-50 text-pink-700 hover:bg-pink-100"}`}
                      >
                        📻 Jukebox Song
                      </button>
                      {activeBoard.showCalendar && (
                        <button
                          type="button"
                          onClick={() => setActiveCraftTab(activeCraftTab === "calendar" ? null : "calendar")}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${activeCraftTab === "calendar" ? "bg-pink-500 text-white shadow" : "bg-pink-50 text-pink-100 hover:bg-pink-150"}`}
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
                        className="text-center py-6 border border-dashed border-pink-150 rounded-2xl bg-pink-50/10"
                      >
                        <p className="text-xs text-pink-500 font-mono">💡 Select any keepsake above to expand its crafting toolbox form!</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activeCraftTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-pink-50/20 rounded-2xl border border-pink-200/50"
                      >
                        {/* Tab 1: Polaroid Form */}
                        {activeCraftTab === "photo" && (
                          <form onSubmit={handleAddPhoto} className="space-y-4">
                            <h4 className="font-serif text-sm font-bold text-pink-900 border-b border-pink-100 pb-1 flex items-center gap-1.5">
                              <span>📸</span> Design Custom Scratch Polaroid
                            </h4>

                            <div className="flex gap-3 border-b border-pink-100/40 pb-2 mb-2">
                              <button
                                type="button"
                                onClick={() => setPhotoUploadType("url")}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${photoUploadType === "url" ? "bg-pink-500 text-white" : "bg-white text-pink-600 border border-pink-100"}`}
                              >
                                Paste Photo Link 🔗
                              </button>
                              <button
                                type="button"
                                onClick={() => setPhotoUploadType("file")}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${photoUploadType === "file" ? "bg-pink-500 text-white" : "bg-white text-pink-600 border border-pink-100"}`}
                              >
                                Upload Device Image 📁
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {photoUploadType === "url" ? (
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Image Link URL</label>
                                  <input
                                    type="url"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={photoSrc}
                                    onChange={(e) => setPhotoSrc(e.target.value)}
                                    required={photoUploadType === "url"}
                                    className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Select Local Image File</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoFileChange}
                                    required={photoUploadType === "file" && !photoSrc}
                                    className="w-full text-[11px] text-pink-800"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Your Signature / Name</label>
                                <input
                                  type="text"
                                  placeholder="E.g. Sister Jasmine"
                                  value={photoCreator}
                                  onChange={(e) => setPhotoCreator(e.target.value)}
                                  className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Polaroid Caption Text</label>
                              <input
                                type="text"
                                placeholder="E.g. Remember our beach roadtrip? Unbelievable memory! 🏖️"
                                value={photoCaption}
                                onChange={(e) => setPhotoCaption(e.target.value)}
                                required
                                className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                              />
                            </div>

                            {photoSrc && (
                              <div className="mt-2.5 flex items-center gap-3 bg-white p-2 rounded-xl border border-pink-100 w-fit">
                                <img src={photoSrc} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-pink-100" referrerPolicy="no-referrer" />
                                <span className="text-[10px] text-pink-500 font-mono">Image loaded successfully!</span>
                              </div>
                            )}

                            <div className="flex justify-end pt-2 border-t border-pink-100">
                              <button
                                type="submit"
                                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                              >
                                Stash Polaroid into Collage 🖼️
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Tab 2: Note Form */}
                        {activeCraftTab === "note" && (
                          <form onSubmit={handleAddNote} className="space-y-4">
                            <h4 className="font-serif text-sm font-bold text-pink-900 border-b border-pink-100 pb-1 flex items-center gap-1.5">
                              <span>📝</span> Write Lovely Sticky Blessing Card
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Aesthetic Paper Background</label>
                                <select
                                  value={notePaper}
                                  onChange={(e) => setNotePaper(e.target.value as any)}
                                  className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                                >
                                  <option value="ruled">Ruled Margin Notebook 📜</option>
                                  <option value="floral">Vintage Pink Blossom Petals 🌸</option>
                                  <option value="grid">Cozy Memo Planner Grid 🗒️</option>
                                  <option value="plain">Elegant Peach Plain Card 📄</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Handwriting Font Style</label>
                                <select
                                  value={noteFont}
                                  onChange={(e) => setNoteFont(e.target.value as any)}
                                  className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                                >
                                  <option value="cursive">Classic Script Calligraphy 🖋️</option>
                                  <option value="handwriting">Nostalgic Playful Scribble ✏️</option>
                                  <option value="serif">Formal Vintage Book Serif 📚</option>
                                  <option value="sans">Minimalist Flat Clean Modern 💻</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-8">
                                <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Message to Loved One</label>
                                <input
                                  type="text"
                                  placeholder="I wish you a breathtaking year packed with hugs, warm cocoa, and endless laughters!..."
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  required
                                  className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                                />
                              </div>

                              <div className="md:col-span-4">
                                <label className="block text-[10px] font-mono font-bold text-pink-600 uppercase mb-1">Your Signature Name</label>
                                <input
                                  type="text"
                                  placeholder="Aunt May"
                                  value={noteCreator}
                                  onChange={(e) => setNoteCreator(e.target.value)}
                                  className="w-full text-xs bg-white border border-pink-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-pink-300 text-pink-900"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-pink-100">
                              <button
                                type="submit"
                                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                              >
                                Stick Note onto Collage 📝
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Tab 3: Flower Bouquet Maker */}
                        {activeCraftTab === "bouquet" && (
                          <div className="bg-white rounded-2xl p-2 border border-pink-100 overflow-hidden">
                            <BouquetMaker
                              bouquets={activeBoard.bouquets}
                              onAddBouquet={handleAddBouquet}
                              onDeleteBouquet={undefined} // handled below in collage
                              readOnly={false}
                            />
                          </div>
                        )}

                        {/* Tab 4: Jukebox Track Dedication */}
                        {activeCraftTab === "music" && (
                          <div className="bg-white rounded-2xl p-2 border border-pink-100 overflow-hidden">
                            <MusicRoom
                              musics={activeBoard.musics}
                              onAddMusic={handleAddMusic}
                              onDeleteMusic={undefined} // handled below in collage
                              readOnly={false}
                            />
                          </div>
                        )}

                        {/* Tab 5: Diary Memory Logger */}
                        {activeCraftTab === "calendar" && (
                          <div className="bg-white rounded-2xl p-2 border border-pink-100 overflow-hidden">
                            <MemoryCalendar
                              events={activeBoard.calendarEvents}
                              onAddEvent={handleAddCalendarEvent}
                              onDeleteEvent={undefined} // handled below in collage
                              readOnly={false}
                            />
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

      {/* Elegant minimalist footer */}
      <footer className="border-t border-pink-100/60 mt-12 py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-1 text-slate-500 text-xs">
          <p className="font-semibold text-pink-900">Our Eternal Scrapbook • Elegant, Collaborative and Secure</p>
          <p className="text-[10px] text-pink-400">Made with sweet shades of rose and cherry blossom pink for your special milestones. ❤️</p>
        </div>
      </footer>

    </div>
  );
}
