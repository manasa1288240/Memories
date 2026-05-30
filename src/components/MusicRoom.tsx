import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { MusicItem } from "../types";
import { Music, Trash2, Heart, CheckCircle2, Play, Pause } from "lucide-react";
import YouTube from "react-youtube";

const getYoutubeId = (url: string) => {
  const regExp =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : "";
};

interface MusicRoomProps {
  musics: MusicItem[];
  onAddMusic: (music: Omit<MusicItem, "id"> & { youtubeUrl?: string; title?: string }) => void;
  onDeleteMusic?: (id: string) => void;
  readOnly?: boolean;
}

export default function MusicRoom({
  musics,
  onAddMusic,
  onDeleteMusic,
  readOnly = false,
}: MusicRoomProps) {
  const hasMusics = musics.length > 0;
  const firstMusic = hasMusics ? musics[0] : null;

  const [selectedTrackId, setSelectedTrackId] = useState<string>(firstMusic ? firstMusic.id : "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState<string>(
    firstMusic?.youtubeUrl || ""
  );
  const [currentTitle, setCurrentTitle] = useState<string>(
    firstMusic
      ? firstMusic.title || `Dedicated Song by ${firstMusic.creator} 🎵`
      : "No Song Dedicated Yet 🎧"
  );

  // Form states
  const [songTitle, setSongTitle] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [creator, setCreator] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const ytPlayerRef = useRef<any>(null);

  const togglePlayback = () => {
    if (!ytPlayerRef.current) return;
    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
    } else {
      ytPlayerRef.current.playVideo();
    }
  };

  const playMusicItem = (m: MusicItem) => {
    setSelectedTrackId(m.id);
    setCurrentYoutubeUrl(m.youtubeUrl || "");
    setCurrentTitle(m.title || `Dedicated Song by ${m.creator} 🎵`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) {
      alert("Please enter a Song Title!");
      return;
    }
    if (!creator.trim()) {
      alert("Please enter your name to sign the music dedication!");
      return;
    }
    if (!songUrl.trim()) {
      alert("Please provide a YouTube URL!");
      return;
    }
    if (!getYoutubeId(songUrl.trim())) {
      alert("Please provide a valid YouTube URL!");
      return;
    }

    onAddMusic({
      trackId: "custom",
      creator: creator.trim(),
      message: message.trim() || "Dedicated a beautiful cozy music loop",
      youtubeUrl: songUrl.trim(),
      title: songTitle.trim(),
    });

    setSongTitle("");
    setSongUrl("");
    setCreator("");
    setMessage("");

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4500);
  };

  // Hidden YouTube player — audio only, no visible video
  const youtubePlayer = currentYoutubeUrl ? (
    <div className="absolute w-0 h-0 overflow-hidden pointer-events-none opacity-0">
      <YouTube
        videoId={getYoutubeId(currentYoutubeUrl)}
        opts={{
          width: "1",
          height: "1",
          playerVars: { autoplay: 0 },
        }}
        onReady={(e) => { ytPlayerRef.current = e.target; }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnd={() => setIsPlaying(false)}
      />
    </div>
  ) : null;

  if (readOnly) {
    return (
      <div id="music-room" className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-pink-100">
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-900 flex items-center gap-2">
              <span>📻</span> Vintage Music Jukebox
            </h3>
            <p className="text-xs text-pink-500">
              Listen to tracks dedicated by friends and loved ones!
            </p>
          </div>
        </div>

        {/* Vinyl Disc + Player */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Spinning Vinyl */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-full border border-pink-50 p-1 shadow-xs">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="w-28 h-28 rounded-full bg-slate-900 border-[6px] border-slate-800 shadow-md flex items-center justify-center relative overflow-hidden"
            >
              <div className="w-24 h-24 rounded-full border border-slate-700/60 flex items-center justify-center">
                <div className="w-18 h-18 rounded-full border border-slate-700/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-pink-300 border-[3px] border-pink-400" />
                </div>
              </div>
            </motion.div>
            <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-100 border-2 border-slate-400 z-10 shadow-xs" />
          </div>

          {/* Track Info */}
          <div className="flex-grow text-center sm:text-left space-y-2 w-full">
            <span className="text-[9px] font-mono tracking-wider uppercase bg-pink-50 px-2 py-0.5 rounded text-pink-500 border border-pink-100">
              Playing Track
            </span>
            <h4 className="font-serif text-sm md:text-base font-bold text-pink-950 mt-1.5 line-clamp-2 min-h-[1.5rem]">
              {currentTitle}
            </h4>
            <p className="text-[10px] font-mono text-pink-400/90 font-bold">
              {isPlaying ? "⚡ Record Spinning..." : "⏸ Paused"}
            </p>
            <button
              onClick={togglePlayback}
              disabled={!currentYoutubeUrl}
              className={`mt-2 flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md duration-150 cursor-pointer ${
                !currentYoutubeUrl
                  ? "bg-stone-300 cursor-not-allowed text-stone-500 shadow-none"
                  : "bg-pink-600 hover:bg-pink-700 active:bg-pink-800"
              }`}
            >
              {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4 fill-white ml-0.5" /> Play</>}
            </button>
          </div>
        </div>

        {/* Hidden audio player */}
        {youtubePlayer}

        {/* Track List */}
        <div className="w-full">
          <div className="bg-white/90 p-5 rounded-3xl border border-pink-100/70 shadow-2xs">
            <h4 className="text-[10px] font-mono font-black text-pink-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-pink-50 flex items-center gap-1.5 justify-between">
              <span>📻 SELECT SOUNDTRACK</span>
              <span className="bg-pink-100/60 px-2 py-0.5 text-[9px] tracking-normal font-bold rounded-full text-pink-700">
                {musics.length} Active Tracks
              </span>
            </h4>

            {musics.length === 0 ? (
              <div className="py-12 text-center bg-pink-50/10 rounded-2xl border border-dashed border-pink-100/50">
                <p className="text-xs italic text-pink-400">Jukebox has no tracks yet</p>
                <p className="text-[9px] text-pink-300 mt-1 font-mono">
                  Use the contribution corner to paste a YouTube link!
                </p>
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
      {/* Dedication Form */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-pink-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 rounded-xl text-pink-600">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-900">Custom Song Dedicator</h3>
            <p className="text-xs text-pink-500">Paste a YouTube link to dedicate a song!</p>
          </div>
        </div>

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

            <div>
              <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                YouTube URL
              </label>
              <input
                id="input-music-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                required
                className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
              />
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

      {/* Player + Dedications Feed */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center gap-4">
          <p className="text-[10px] font-mono tracking-widest uppercase text-pink-400 font-bold">
            Live Jukebox Player
          </p>

          {/* Spinning Vinyl */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-slate-900/95 border-[8px] border-slate-800 shadow-lg flex items-center justify-center"
            >
              <div className="w-40 h-40 rounded-full border border-slate-700/60 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-slate-700/60 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-slate-700/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-pink-300 border-4 border-pink-400" />
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-400 z-10 shadow-xs" />
          </div>

          <div className="text-center space-y-1 px-4 w-full">
            <h4 className="font-serif text-sm font-semibold text-pink-900 line-clamp-1">
              {currentTitle}
            </h4>
            <p className="text-[10px] font-mono text-pink-400">
              {isPlaying ? "📻 Record Spinning..." : "⏸ Paused"}
            </p>
          </div>

          <button
            onClick={togglePlayback}
            disabled={!currentYoutubeUrl}
            className={`p-4 text-white rounded-full shadow-md duration-150 transform hover:scale-105 cursor-pointer ${
              !currentYoutubeUrl
                ? "bg-stone-300 cursor-not-allowed text-stone-500 hover:scale-100 shadow-none"
                : "bg-pink-500 hover:bg-pink-600 active:bg-pink-700"
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          {/* Hidden audio player */}
          {youtubePlayer}
        </div>

        {/* Dedications Feed */}
        <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-xs max-h-[180px] overflow-y-auto">
          <h4 className="text-xs font-mono font-bold text-pink-500 uppercase mb-3 flex items-center gap-1.5 pb-2 border-b border-pink-100">
            🎶 dedications ({musics.length})
          </h4>

          {musics.length === 0 ? (
            <p className="text-xs italic text-pink-400 py-3 text-center">No songs dedicated yet.</p>
          ) : (
            <div className="space-y-3">
              {musics.map((m) => (
                <div
                  key={m.id}
                  className="text-xs bg-pink-50/30 p-2.5 border border-pink-100/50 rounded-lg flex justify-between items-start"
                >
                  <div className="max-w-[85%]">
                    <button
                      onClick={() => playMusicItem(m)}
                      className="font-bold text-pink-900 hover:underline text-left cursor-pointer"
                    >
                      🎵 {m.title || "Custom Dedication"}
                    </button>
                    {m.message && (
                      <p className="italic text-pink-600 font-serif mt-1">"{m.message}"</p>
                    )}
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