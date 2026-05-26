import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { MusicItem } from "../types";
import { Play, Pause, Music, Upload, Trash2, Heart, CheckCircle2 } from "lucide-react";

interface MusicRoomProps {
  musics: MusicItem[];
  onAddMusic: (music: Omit<MusicItem, "id"> & { customFile?: string, title?: string }) => void;
  onDeleteMusic?: (id: string) => void;
  readOnly?: boolean;
}

export default function MusicRoom({
  musics,
  onAddMusic,
  onDeleteMusic,
  readOnly = false,
}: MusicRoomProps) {
  // Try to use the first dedicated song as the initial loop if one exists
  const hasMusics = musics.length > 0;
  const firstMusic = hasMusics ? musics[0] : null;

  const [selectedTrackId, setSelectedTrackId] = useState<string>(firstMusic ? firstMusic.id : "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>(firstMusic ? (firstMusic.customFile || "") : "");
  const [currentTitle, setCurrentTitle] = useState<string>(
    firstMusic ? (firstMusic.title || `Dedicated Song by ${firstMusic.creator} 🎵`) : "No Song Dedicated Yet 🎧"
  );

  // Form states
  const [songTitle, setSongTitle] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [creator, setCreator] = useState("");
  const [message, setMessage] = useState("");
  const [customAudioBase64, setCustomAudioBase64] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-select first track when the list becomes populated and nothing was selected before
  useEffect(() => {
    if (musics.length > 0 && !currentAudioUrl) {
      const first = musics[0];
      setSelectedTrackId(first.id);
      setCurrentAudioUrl(first.customFile || "");
      setCurrentTitle(first.title || `Dedicated Song by ${first.creator} 🎵`);
    }
  }, [musics, currentAudioUrl]);

  // Manage playing states
  useEffect(() => {
    if (!currentAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(currentAudioUrl);
      audioRef.current.loop = true;
    } else {
      audioRef.current.pause();
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log("Audio play blocked", err));
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentAudioUrl]);

  const togglePlayback = () => {
    if (!currentAudioUrl) {
      alert("Please dedicate or select a song loop first!");
      return;
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn("Audio constraints prevent direct play until user interaction", err);
          setIsPlaying(true);
        });
    }
  };

  const playMusicItem = (m: MusicItem) => {
    setSelectedTrackId(m.id);
    setCurrentAudioUrl(m.customFile || "");
    setCurrentTitle(m.title || `Dedicated Song by ${m.creator} 🎵`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("Please upload a valid audio (MP3/WAV/AAC) file!");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("This file is a bit large. Please select an audio file under 8MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomAudioBase64(base64);
      setCustomFileName(file.name);
      setSongUrl(""); // clear link if uploaded
      if (!songTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
        setSongTitle(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) {
      alert("Please enter a Song Title details!");
      return;
    }
    if (!creator.trim()) {
      alert("Please enter your name to sign the music loop dedication!");
      return;
    }

    const finalAudioSource = customAudioBase64 || songUrl.trim();
    if (!finalAudioSource) {
      alert("Please provide an audio link/source URL or upload a device file!");
      return;
    }

    onAddMusic({
      trackId: "custom",
      creator: creator.trim(),
      message: message.trim() || "Dedicated a beautiful cozy music loop",
      customFile: finalAudioSource,
      title: songTitle.trim()
    });

    // Clear fields
    setSongTitle("");
    setSongUrl("");
    setCreator("");
    setMessage("");
    setCustomAudioBase64(null);
    setCustomFileName(null);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4500);
  };

  if (readOnly) {
    return (
      <div id="music-room" className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-pink-100">
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-900 flex items-center gap-2">
              <span>📻</span> Vintage Music Jukebox
            </h3>
            <p className="text-xs text-pink-500">Listen to custom tracks dedicated by friends and loved ones!</p>
          </div>
        </div>

        {/* Vintage Record Player */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Vinyl Disc Spin Graphic */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-full border border-pink-50 p-1 shadow-xs">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="w-28 h-28 rounded-full bg-slate-900 border-[6px] border-slate-800 shadow-md flex items-center justify-center relative overflow-hidden"
            >
              <div className="w-24 h-24 rounded-full border border-slate-700/60 flex items-center justify-center">
                <div className="w-18 h-18 rounded-full border border-slate-700/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-pink-300 border-[3px] border-pink-400 flex items-center justify-center text-[10px]" />
                </div>
              </div>
            </motion.div>
            <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-100 border-2 border-slate-400 z-10 shadow-xs" />
          </div>

          {/* Controls & Track Details */}
          <div className="flex-grow text-center sm:text-left space-y-3 w-full">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-wider uppercase bg-pink-50 px-2 py-0.5 rounded text-pink-500 border border-pink-100">
                Playing Track
              </span>
              <h4 className="font-serif text-sm md:text-base font-bold text-pink-950 mt-1.5 line-clamp-2 min-h-[1.5rem]">{currentTitle}</h4>
              <p className="text-[10px] font-mono text-pink-400/90 font-semibold font-bold">
                {isPlaying ? "⚡ Record Spinning..." : "⏸ Paused"}
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                id="vinyl-play-toggle-btn-readonly"
                onClick={togglePlayback}
                disabled={!currentAudioUrl}
                className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md duration-150 cursor-pointer ${
                  !currentAudioUrl 
                    ? "bg-stone-300 cursor-not-allowed text-stone-500 shadow-none" 
                    : "bg-pink-600 hover:bg-pink-700 active:bg-pink-800"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white ml-0.5" /> Play
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Unified Custom Track List Selection */}
        <div className="w-full">
          <div className="bg-white/90 p-5 rounded-3xl border border-pink-100/70 shadow-2xs">
            <h4 className="text-[10px] font-mono font-black text-pink-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-pink-50 flex items-center gap-1.5 justify-between">
              <span>📻 SELECT SOUNDTRACK LOOP</span>
              <span className="bg-pink-100/60 px-2 py-0.5 text-[9px] tracking-normal font-bold rounded-full text-pink-700">
                {musics.length} Active Tracks
              </span>
            </h4>

            {musics.length === 0 ? (
              <div className="py-12 text-center bg-pink-50/10 rounded-2xl border border-dashed border-pink-100/50">
                <p className="text-xs italic text-pink-400">Jukebox lacks custom music loops</p>
                <p className="text-[9px] text-pink-300 mt-1 font-mono">Use the contribution corner below to upload or paste a song!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[280px] overflow-y-auto pr-1">
                {musics.map((m) => {
                  const isCurrent = selectedTrackId === m.id;
                  return (
                    <button
                      id={`preset-track-${m.id}`}
                      key={m.id}
                      onClick={() => playMusicItem(m)}
                      className={`w-full text-left p-3.5 rounded-2xl text-xs duration-150 flex flex-col justify-between hover:shadow-2xs cursor-pointer border relative overflow-hidden group ${
                        isCurrent
                          ? "bg-pink-50/80 border-pink-200 text-pink-950 font-bold shadow-3xs ring-1 ring-pink-100"
                          : "bg-white hover:bg-pink-50/10 border-pink-100/40 text-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full gap-2">
                        <span className="font-bold text-pink-900 group-hover:text-pink-950 truncate max-w-[80%]">
                          {m.title || "Custom Dedication 🎵"}
                        </span>
                        <span className="bg-white border border-pink-100/70 px-1.5 py-0.5 rounded text-[9px] text-pink-500 font-bold tracking-tight">
                          by {m.creator}
                        </span>
                      </div>
                      
                      {m.message && (
                        <p className="italic text-pink-700 font-serif mt-1.5 text-[11px] leading-snug line-clamp-1">
                          "{m.message}"
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="music-room" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Dedication and Upload Form */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-pink-100 shadow-sm space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 rounded-xl text-pink-600">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-900">Custom Song Dedicator</h3>
            <p className="text-xs text-pink-500">Share a custom audio URL or upload an audio file from your device!</p>
          </div>
        </div>

        {/* Input Details */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                Song Title
              </label>
              <input
                id="input-music-title"
                type="text"
                placeholder="E.g. Sweet Sweet Melodies 🎻"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                required
                className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                  Audio URL (Direct MP3 link)
                </label>
                <input
                  id="input-music-url"
                  type="url"
                  placeholder="https://example.com/song.mp3"
                  value={songUrl}
                  disabled={!!customAudioBase64}
                  onChange={(e) => setSongUrl(e.target.value)}
                  className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                  Or Upload MP3 File
                </label>
                <div className="relative">
                  <label className="flex items-center justify-center gap-1.5 w-full p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-lg cursor-pointer transition-all border border-pink-200">
                    <Upload className="w-3.5 h-3.5" />
                    {customFileName ? "Change File" : "Select Audio File"}
                    <input
                      id="music-file-upload-input"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {customFileName && (
                  <div className="mt-1 flex items-center justify-between text-[10px] text-green-700 font-mono">
                    <span>✓ {customFileName} ready!</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAudioBase64(null);
                        setCustomFileName(null);
                      }}
                      className="text-pink-400 hover:text-red-500 font-semibold"
                    >
                      Clear File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
              <div className="md:col-span-8">
                <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                  Dedication Message
                </label>
                <input
                  id="input-music-dedication-msg"
                  type="text"
                  placeholder="Reminds me of our warm drives and coffees!..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                  Your Name
                </label>
                <input
                  id="input-music-creator"
                  type="text"
                  placeholder="Your Name"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  required
                  className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="submit-music-dedication-btn"
              type="submit"
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer duration-150"
            >
              <Heart className="w-4 h-4 fill-white animate-pulse" />
              Dedicate Song 🎧
            </button>
          </div>
        </form>

        {showSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-green-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Dedicated song saved! Check the active playlist for your track.</span>
          </div>
        )}
      </div>

      {/* Record player Vinyl Visuals */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center">
          <p className="text-[10px] font-mono tracking-widest uppercase text-pink-400 font-bold mb-4">
            Live Jukebox Player
          </p>

          <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-slate-900/95 border-[8px] border-slate-800 shadow-lg flex items-center justify-center"
            >
              <div className="w-40 h-40 rounded-full border border-slate-700/60 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-slate-700/60 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-slate-700/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-pink-300 border-4 border-pink-400 flex items-center justify-center text-[10px]" />
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-400 z-10 shadow-xs" />
          </div>

          <div className="text-center space-y-1 px-4 mb-4 w-full">
            <h4 className="font-serif text-sm font-semibold text-pink-900 line-clamp-1">{currentTitle}</h4>
            <p className="text-[10px] font-mono text-pink-400">
              {isPlaying ? "📻 Record Spinning..." : "⏸ Paused"}
            </p>
          </div>

          <button
            id="vinyl-play-toggle-btn"
            onClick={togglePlayback}
            disabled={!currentAudioUrl}
            className={`p-4 text-white rounded-full shadow-md hover:shadow-lg duration-150 transform hover:scale-105 cursor-pointer ${
              !currentAudioUrl
                ? "bg-stone-300 cursor-not-allowed text-stone-500 hover:scale-100 shadow-none"
                : "bg-pink-500 hover:bg-pink-600 active:bg-pink-700 hover:shadow-pink-400"
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>
        </div>

        {/* Existing Dedications Feed */}
        <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-xs max-h-[180px] overflow-y-auto">
          <h4 className="text-xs font-mono font-bold text-pink-500 uppercase mb-3 flex items-center gap-1.5 pb-2 border-b border-pink-100">
            🎶 dedications ({musics.length})
          </h4>

          {musics.length === 0 ? (
            <p className="text-xs italic text-pink-400 py-3 text-center">No songs dedicated yet.</p>
          ) : (
            <div className="space-y-3">
              {musics.map((m) => (
                <div key={m.id} className="text-xs bg-pink-50/30 p-2.5 border border-pink-100/50 rounded-lg flex justify-between items-start">
                  <div className="max-w-[85%]">
                    <button
                      onClick={() => playMusicItem(m)}
                      className="font-bold text-pink-900 hover:underline text-left cursor-pointer"
                    >
                      🎵 {m.title || "Custom Dedication"}
                    </button>
                    {m.message && <p className="italic text-pink-600 font-serif mt-1">"{m.message}"</p>}
                    <p className="text-[9px] font-mono text-pink-400 mt-1">
                      by <span className="font-semibold text-pink-500">{m.creator}</span>
                    </p>
                  </div>
                  {onDeleteMusic && (
                    <button
                      id={`delete-music-${m.id}`}
                      onClick={() => onDeleteMusic(m.id)}
                      className="text-pink-300 hover:text-red-500 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
