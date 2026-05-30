import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trash2, Heart } from "lucide-react";

interface ScratchCardProps {
  id: string;
  src: string;
  caption: string;
  creator: string;
  scratched: boolean;
  onScratchComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  key?: string | number;
}

export default function ScratchCard({
  id,
  src,
  caption,
  creator,
  scratched: initialScratched,
  onScratchComplete,
  onDelete,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(initialScratched);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(initialScratched);
  const [canvasReady, setCanvasReady] = useState(false);

  // Paint the scratch overlay onto the canvas.
  // We use a small setTimeout to ensure the container has non-zero dimensions
  // after the browser has done its first layout pass.
  const paintCanvas = () => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // If dimensions are still zero, retry after another frame
    if (width === 0 || height === 0) {
      setTimeout(paintCanvas, 50);
      return;
    }

    canvas.width = width;
    canvas.height = height;

    // Layered pink gradient paint
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#FF85A1");
    gradient.addColorStop(0.5, "#FFA6C9");
    gradient.addColorStop(1, "#F72585");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Golden/white speckles
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,215,0,0.45)";
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Instruction text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "italic 600 16px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText("Scratch to Reveal ✨", width / 2, height / 2);

    setCanvasReady(true);
  };

  // Repaint whenever the card is freshly mounted or src changes
  useEffect(() => {
    if (isRevealed) return;
    // Reset canvas-ready flag on each fresh mount
    setCanvasReady(false);
    const timer = setTimeout(paintCanvas, 30);
    return () => clearTimeout(timer);
  }, [isRevealed, src]);

  // ── Scratch drawing helpers ──────────────────────────────────────────────

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isRevealed) return;
    setIsDrawing(true);

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 32;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isRevealed) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (Math.random() < 0.15) {
      checkScratchedPercent(ctx, canvas.width, canvas.height);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (!canvasRef.current || isRevealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) checkScratchedPercent(ctx, canvas.width, canvas.height);
  };

  const checkScratchedPercent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      let clearPixels = 0;
      let monitoredCount = 0;
      const sampleRate = 32;
      for (let i = 3; i < pixels.length; i += sampleRate) {
        monitoredCount++;
        if (pixels[i] === 0) clearPixels++;
      }
      const percentage = (clearPixels / monitoredCount) * 100;
      if (percentage > 45) {
        setIsRevealed(true);
        setIsScratched(true);
        onScratchComplete(id);
      }
    } catch (err) {
      console.warn("Could not calculate scratch ratio", err);
    }
  };

  const forceReveal = () => {
    setIsRevealed(true);
    setIsScratched(true);
    onScratchComplete(id);
  };

  return (
    <motion.div
      id={`polaroid-${id}`}
      layout
      initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 6 - 3 }}
      animate={{ opacity: 1, scale: 1, rotate: Math.random() * 4 - 2 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -6, rotate: Math.random() * 2 - 1, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="relative p-3 pb-6 bg-white border border-pink-100 rounded-none shadow-[0_4px_16px_rgba(244,63,94,0.08)] inline-block w-full max-w-sm aspect-[4/5] flex flex-col justify-between"
    >
      {/* Tape Effect */}
      <div className="absolute top-[-10px] left-1/3 right-1/3 h-5 bg-pink-100/70 border-x border-pink-200/50 rotate-[-1deg] backdrop-blur-xs flex items-center justify-center text-[8px] font-mono tracking-widest text-pink-400/80 uppercase select-none pointer-events-none">
        ★ Sweet Memories ★
      </div>

      {/* Polaroid Image */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-pink-50 overflow-hidden select-none"
      >
        <img
          src={src}
          alt={caption}
          className="w-full h-full object-cover select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Scratch Canvas — only rendered when NOT revealed.
            The canvas is always present in the DOM when !isRevealed so the
            ref is available for paintCanvas(); opacity-0 until canvasReady
            prevents a flash of transparent (fully-see-through) canvas. */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`absolute top-0 left-0 w-full h-full cursor-pointer touch-none z-10 transition-opacity duration-150 ${canvasReady ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Glitter reveal flash */}
        <AnimatePresence>
          {isRevealed && !initialScratched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-pink-400/20 mix-blend-color-burn flex items-center justify-center pointer-events-none z-20"
            >
              <Sparkles className="w-16 h-16 text-yellow-300 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption & controls */}
      <div className="mt-3 flex flex-col justify-between flex-grow">
        <p className="font-handwriting text-pink-700 text-xl text-center leading-tight line-clamp-2 px-1">
          "{caption}"
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-pink-100">
          <span className="font-mono text-[10px] text-pink-400 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-pink-300 text-pink-400 animate-pulse" />
            by {creator || "Mysterious Loved One"}
          </span>
          <div className="flex gap-2">
            {!isRevealed && (
              <button
                id={`reveal-btn-${id}`}
                onClick={forceReveal}
                className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full border border-amber-200 transition-colors"
              >
                Reveal 👀
              </button>
            )}
            {onDelete && (
              <button
                id={`delete-photo-${id}`}
                onClick={() => onDelete(id)}
                className="text-pink-300 hover:text-red-500 duration-200 p-0.5"
                title="Delete memory polaroid"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}