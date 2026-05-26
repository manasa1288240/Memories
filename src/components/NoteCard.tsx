import React from "react";
import { motion } from "motion/react";
import { Trash2, Heart } from "lucide-react";

interface NoteCardProps {
  id: string;
  text: string;
  creator: string;
  font: "cursive" | "sans" | "serif" | "handwriting";
  paperType: "ruled" | "plain" | "floral" | "grid";
  onDelete?: (id: string) => void;
  key?: string | number;
}

export default function NoteCard({
  id,
  text,
  creator,
  font,
  paperType,
  onDelete,
}: NoteCardProps) {
  // Select appropriate typography class
  const getFontClass = () => {
    switch (font) {
      case "cursive":
        return "font-cursive text-2xl tracking-normal leading-relaxed";
      case "handwriting":
        return "font-handwriting text-xl tracking-tight leading-relaxed";
      case "serif":
        return "font-serif text-base font-medium leading-relaxed";
      case "sans":
      default:
        return "font-sans text-sm tracking-normal leading-relaxed";
    }
  };

  // Choose paper pattern class and borders
  const getPaperStyle = () => {
    switch (paperType) {
      case "ruled":
        return "bg-amber-50/90 border-l-4 border-l-red-300 shadow-md bg-[linear-gradient(#f194b4_1px,_transparent_1px)] bg-[size:100%_24px]";
      case "floral":
        return "bg-pink-50/90 border-l-4 border-l-pink-400 shadow-md border-pink-100 rounded-lg relative overflow-hidden bg-[radial-gradient(#ffdada_1px,_transparent_1px)] bg-[size:16px_16px]";
      case "grid":
        return "bg-slate-50/95 border-l-4 border-l-pink-300 shadow-md bg-[linear-gradient(rgba(244,63,94,0.06)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(244,63,94,0.06)_1px,_transparent_1px)] bg-[size:20px_20px]";
      case "plain":
      default:
        return "bg-white border border-pink-200/60 shadow-md rounded-sm";
    }
  };

  return (
    <motion.div
      id={`note-card-${id}`}
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`p-6 min-h-[160px] flex flex-col justify-between relative ${getPaperStyle()}`}
    >
      {/* Tape Tape Sticker at top */}
      <div className="absolute top-[-8px] left-[35%] right-[35%] h-5 bg-pink-300/30 border-y border-pink-400/20 backdrop-blur-xs flex items-center justify-center text-[7px] font-mono tracking-widest text-pink-600/70 rotate-[-1.5deg] select-none pointer-events-none shadow-xs">
        ♥ LOVE NOTE ♥
      </div>

      {/* Love Note Message */}
      <div className="pt-2 flex-grow">
        <p className={`text-pink-950 ${getFontClass()}`}>
          "{text}"
        </p>
      </div>

      {/* Footer information */}
      <div className="mt-4 pt-2 border-t border-dotted border-pink-300/50 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <p className="font-mono text-[10px] text-pink-600">
            from <span className="font-semibold text-pink-800">{creator || "Secret Admirer"}</span>
          </p>
        </div>

        {onDelete && (
          <button
            id={`delete-note-${id}`}
            onClick={() => onDelete(id)}
            className="text-pink-300 hover:text-red-500 duration-200 p-1"
            title="Delete this note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Decorative floral motifs in corner */}
      {paperType === "floral" && (
        <div className="absolute right-1 bottom-1 opacity-10 pointer-events-none select-none text-2xl text-pink-500">
          🌸
        </div>
      )}
    </motion.div>
  );
}
