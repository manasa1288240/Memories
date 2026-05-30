import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BouquetItem } from "../types";
import { Plus, Heart, Trash2, CheckCircle2, Gift } from "lucide-react";

interface BouquetMakerProps {
  bouquets: BouquetItem[];
  onAddBouquet: (bouquet: Omit<BouquetItem, "id">) => void;
  onDeleteBouquet?: (id: string) => void;
  readOnly?: boolean;
}

const FLOWERS = [
  { name: "Blush Rose 🌹", color: "text-pink-500", label: "Blush Rose" },
  { name: "Pink Tulip 🌷", color: "text-pink-400", label: "Pink Tulip" },
  { name: "Peony Blossom 🌸", color: "text-pink-300", label: "Peony Blossom" },
  { name: "Rustic Carnation 🌺", color: "text-red-400", label: "Rustic Carnation" },
];

const WRAPS = [
  { id: "vintage", label: "Vintage Sheet Music 🎼" },
  { id: "brown", label: "Rustic Kraft Paper 📦" },
  { id: "pink-lace", label: "Pink Organza & Lace 🎀" },
  { id: "white-silk", label: "Elegant White Silk 🤍" },
];

const RIBBONS = [
  { id: "pink", label: "Blush Satin" },
  { id: "red", label: "Crimson Silk" },
  { id: "gold", label: "Gold Glint" },
  { id: "none", label: "No Ribbon" },
];

export default function BouquetMaker({
  bouquets,
  onAddBouquet,
  onDeleteBouquet,
  readOnly = false,
}: BouquetMakerProps) {
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(["Blush Rose 🌹", "Pink Tulip 🌷"]);
  const [selectedWrap, setSelectedWrap] = useState<"vintage" | "brown" | "pink-lace" | "white-silk">("vintage");
  const [selectedRibbon, setSelectedRibbon] = useState<"pink" | "red" | "gold" | "none">("pink");
  const [message, setMessage] = useState("");
  const [creator, setCreator] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddFlower = (flowerName: string) => {
    if (selectedFlowers.length >= 10) return; // Keep max 10 flowers for canvas neatness
    setSelectedFlowers((prev) => [...prev, flowerName]);
  };

  const handleRemoveFlowerOfIndex = (index: number) => {
    setSelectedFlowers((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCurrentBouquet = () => {
    setSelectedFlowers([]);
    setMessage("");
    setCreator("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFlowers.length === 0) {
      alert("Please add at least one flower to compile your bouquet!");
      return;
    }
    if (!creator.trim()) {
      alert("Please specify your name so they know who gifted it!");
      return;
    }

    onAddBouquet({
      flowers: selectedFlowers,
      wrap: selectedWrap,
      ribbon: selectedRibbon,
      message: message.trim() || "Sent with all our warmth and fragrance!",
      creator: creator.trim(),
    });

    // Flash success
    setShowSuccess(true);
    clearCurrentBouquet();
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  // Get flower emoji representative
  const getFlowerEmoji = (name: string) => {
    if (name.includes("🌹")) return "🌹";
    if (name.includes("🌷")) return "🌷";
    if (name.includes("🌸")) return "🌸";
    if (name.includes("🌺")) return "🌺";
    return "✨";
  };

  if (readOnly) {
    return (
      <div id="bouquet-maker" className="space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-pink-100">
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-900 flex items-center gap-2">
              <span>💐</span> Dedicated Bouquet Gift Box
            </h3>
            <p className="text-xs text-pink-500">Floral creations designed specifically to celebrate and wish our favorite recipient!</p>
          </div>
        </div>

        {bouquets.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-pink-200 rounded-3xl">
            <span className="text-5xl block animate-bounce mb-3">💐</span>
            <h4 className="font-serif font-bold text-pink-900 text-sm">No bouquets have been compiled yet</h4>
            <p className="text-xs text-pink-400 mt-1">This box will display gorgeous combinations of roses and tulips sent as celebratory wishes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bouquets.map((b) => (
              <div key={b.id} className="bg-white p-6 rounded-3xl border border-pink-100 shadow-md relative overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow">
                {/* Visual bouquet rendering miniaturized */}
                <div className="relative h-32 flex items-center justify-center bg-pink-50/50 rounded-2xl mb-4 p-2 overflow-hidden animate-fadeIn">
                  <div
                    className={`absolute bottom-0 w-24 h-16 z-10 origin-bottom rounded-b-2xl transition-all duration-300 ${
                      b.wrap === "vintage"
                        ? "bg-amber-100 border border-amber-300 rotate-[4deg] bg-[radial-gradient(#b45309_0.5px,_transparent_0.5px)] bg-[size:8px_8px]"
                        : b.wrap === "brown"
                          ? "bg-amber-700/80 border border-amber-800 rotate-[-24deg] rounded-t-md"
                          : b.wrap === "pink-lace"
                            ? "bg-pink-100/90 border-2 border-pink-300/40 rotate-[10deg] rounded-t-md"
                            : "bg-white border-2 border-slate-100 rotate-[-5deg] rounded-t-md"
                    }`}
                  />
                  
                  {b.ribbon !== "none" && (
                    <div
                      className={`absolute bottom-3 w-8 h-8 rounded-full flex items-center justify-center z-20 text-[10px] ${
                        b.ribbon === "pink"
                          ? "bg-pink-400 text-white shadow-sm"
                          : b.ribbon === "red"
                            ? "bg-red-500 text-white shadow-sm"
                            : "bg-yellow-400 text-slate-900 shadow-sm"
                      }`}
                    >
                      🎗️
                    </div>
                  )}

                  {b.flowers.map((name, idx) => {
                    const emoji = getFlowerEmoji(name);
                    const angle = (idx - (b.flowers.length - 1) / 2) * (70 / Math.max(b.flowers.length, 1));
                    const distance = 30 - Math.abs(idx - (b.flowers.length - 1) / 2) * 2;

                    return (
                      <div
                        key={idx}
                        style={{
                          transform: `translate(${Math.sin((angle * Math.PI) / 180) * distance}px, ${-Math.cos((angle * Math.PI) / 180) * distance - 10}px) rotate(${angle}deg)`,
                        }}
                        className="absolute text-3xl z-5 select-none"
                      >
                        {emoji}
                      </div>
                    );
                  })}
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h5 className="font-semibold text-pink-900 text-xs tracking-tight">
                      Bouquet of {b.flowers.map(f => f.slice(0, 2)).join(", ")}
                    </h5>
                    <p className="font-handwriting text-pink-700 text-lg leading-snug mt-2 text-center pb-2">
                      "{b.message}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-pink-50 text-right mt-2">
                    <p className="text-[10px] font-mono text-pink-400">
                      Gifted with love from <span className="font-bold text-pink-600">{b.creator}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="bouquet-maker" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Bouquet Builder Form */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-pink-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-pink-100 rounded-xl text-pink-600">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-pink-900">Custom Pink Florist</h3>
            <p className="text-xs text-pink-500">Pick beautiful flowers, wraps, and chords to place in the scrapbook</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Add Flowers */}
          <div>
            <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-2">
              Step 1: Pick Flowers (Max 10)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {FLOWERS.map((flower) => (
                <button
                  id={`btn-add-flower-${flower.label.toLowerCase().replace(/ /g, "-")}`}
                  key={flower.name}
                  type="button"
                  onClick={() => handleAddFlower(flower.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50/70 hover:bg-pink-100/90 text-pink-900 text-xs font-medium rounded-full border border-pink-200/50 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-500" />
                  {flower.name}
                </button>
              ))}
            </div>

            {/* Selected Flowers Stack */}
            <div className="bg-pink-50/30 p-3 rounded-xl border border-dashed border-pink-200 min-h-[50px] flex flex-wrap gap-2 items-center">
              {selectedFlowers.length === 0 ? (
                <p className="text-xs italic text-pink-400 mx-auto">No flowers in your wrapping wrapper yet. Click above to add!</p>
              ) : (
                selectedFlowers.map((name, idx) => (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={`${name}-${idx}`}
                    className="flex items-center gap-1 bg-white text-xs text-pink-800 px-2.5 py-1 rounded-full shadow-xs border border-pink-100"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFlowerOfIndex(idx)}
                      className="text-pink-300 hover:text-pink-600 duration-150 ml-1 font-bold text-xs"
                    >
                      ×
                    </button>
                  </motion.span>
                ))
              )}
            </div>
          </div>

          {/* Step 2: Custom wraps & Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-2">
                Step 2: Paper Wrapping Style
              </label>
              <select
                id="select-wrap-style"
                value={selectedWrap}
                onChange={(e) => setSelectedWrap(e.target.value as any)}
                className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
              >
                {WRAPS.map((wrap) => (
                  <option key={wrap.id} value={wrap.id}>
                    {wrap.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-2">
                Step 3: Satin Ribbon
              </label>
              <select
                id="select-ribbon-style"
                value={selectedRibbon}
                onChange={(e) => setSelectedRibbon(e.target.value as any)}
                className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
              >
                {RIBBONS.map((ribbon) => (
                  <option key={ribbon.id} value={ribbon.id}>
                    {ribbon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message & Creator details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-mono font-bold text-pink-600 uppercase mb-1">
                Step 4: Attached Flower Greeting Card
              </label>
              <input
                id="input-bouquet-card-msg"
                type="text"
                placeholder="Wishing you a beautiful year packed of blossoms!..."
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
                id="input-bouquet-creator"
                type="text"
                placeholder="Aunt Sarah"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                required
                className="w-full text-sm bg-pink-50/35 border border-pink-200 rounded-lg p-2.5 text-pink-900 focus:ring-1 focus:ring-pink-300 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              id="btn-clear-bouquet"
              type="button"
              onClick={clearCurrentBouquet}
              className="text-xs font-medium text-pink-500 hover:text-pink-700 px-4 py-2 cursor-pointer"
            >
              Reset Flower Box
            </button>
            <button
              id="submit-bouquet-btn"
              type="submit"
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium text-sm rounded-xl shadow-md shadow-pink-200 hover:shadow-lg hover:shadow-pink-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              Gift Bouquet 🌸
            </button>
          </div>
        </form>

        {/* Success toast notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-green-800"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Bouquet compiled!</span> Placed gently onto the scrapbook board table. Look right! 👉
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bouquet Preview & Sent Ribbons */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Real-time Bouquet Visual Board */}
        <div className="bg-pink-50/70 border-2 border-dashed border-pink-200 p-6 rounded-2xl flex flex-col items-center justify-between min-h-[350px] relative overflow-hidden shadow-xs">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-pink-100 text-[9px] font-mono font-bold text-pink-500 rounded uppercase tracking-wider select-none">
            Live Preview Box
          </div>

          <div className="flex-grow flex items-center justify-center relative w-full h-[220px]">
            {/* Render Flower Bunch based on selection */}
            {selectedFlowers.length === 0 ? (
              <div className="text-center p-4">
                <span className="text-4xl block animate-bounce mb-2">💐</span>
                <p className="text-sm text-pink-400 italic">Prepping your fresh petals</p>
              </div>
            ) : (
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Custom wrap render representation */}
                <div
                  className={`absolute bottom-0 w-36 h-28 z-10 origin-bottom rounded-b-3xl transition-all duration-300 ${
                    selectedWrap === "vintage"
                      ? "bg-amber-100 border border-amber-300 rotate-[4deg] shadow-md bg-[radial-gradient(#b45309_0.5px,_transparent_0.5px)] bg-[size:10px_10px]"
                      : selectedWrap === "brown"
                        ? "bg-amber-700/80 border border-amber-800 rotate-[-24deg] rounded-t-xl"
                        : selectedWrap === "pink-lace"
                          ? "bg-pink-100/90 border-2 border-pink-300/40 rotate-[10deg] shadow-[0_0_12px_rgba(244,63,94,0.15)] rounded-t-lg"
                          : "bg-white border-2 border-slate-100 rotate-[-5deg] shadow-sm rounded-t-xl"
                  }`}
                />

                {/* Ribbon Satin Bow Knot */}
                {selectedRibbon !== "none" && (
                  <div
                    className={`absolute bottom-6 w-12 h-12 rounded-full flex items-center justify-center z-20 ${
                      selectedRibbon === "pink"
                        ? "bg-pink-400 text-white animate-pulse shadow-md"
                        : selectedRibbon === "red"
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-yellow-400 text-slate-900 shadow"
                    }`}
                  >
                    🎗️
                  </div>
                )}

                {/* Render Flowers individually as fanning positions */}
                {selectedFlowers.map((name, idx) => {
                  const emoji = getFlowerEmoji(name);
                  // Fan arrangement layout
                  const angle = (idx - (selectedFlowers.length - 1) / 2) * (70 / Math.max(selectedFlowers.length, 1));
                  const distance = 45 - Math.abs(idx - (selectedFlowers.length - 1) / 2) * 4;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, y: 100 }}
                      animate={{
                        scale: 1,
                        x: Math.sin((angle * Math.PI) / 180) * distance,
                        y: -Math.cos((angle * Math.PI) / 180) * distance - 20,
                        rotate: angle,
                      }}
                      className="absolute text-5xl z-5 select-none"
                    >
                      {emoji}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-full text-center mt-3 pt-3 border-t border-pink-200/50">
            <p className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold">Attached Greeting Card</p>
            <p className="font-serif italic text-pink-700 text-xs px-2 line-clamp-2">
              "{message || "Happy celebration flowers! 💐"}"
            </p>
          </div>
        </div>

        {/* Historic Sent Bouquets Carousel/Table */}
        <div className="bg-white p-4 rounded-xl border border-pink-100 shadow-xs max-h-[220px] overflow-y-auto">
          <h4 className="text-xs font-mono font-bold text-pink-500 uppercase mb-3 flex items-center gap-1.5 pb-2 border-b border-pink-150">
            🌷 Delivered Bouquets ({bouquets.length})
          </h4>

          {bouquets.length === 0 ? (
            <p className="text-xs italic text-pink-400 py-3 text-center">No flowers delivered yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {bouquets.map((b) => (
                <div key={b.id} className="text-xs bg-pink-50/40 p-2.5 rounded-lg border border-pink-100/50 flex justify-between items-start gap-2">
                  <div className="flex-grow">
                    <p className="font-semibold text-pink-900 leading-snug">
                      Bouquet of {b.flowers.map(f => f.slice(0, 2)).join(", ")}
                    </p>
                    <p className="text-[10px] italic text-pink-600 font-serif mt-1">"{b.message}"</p>
                    <p className="text-[9px] font-mono text-pink-400 mt-1 flex items-center gap-1">
                      <span>from</span>
                      <span className="font-bold text-pink-500">{b.creator}</span>
                      <span>• Wrapping: {b.wrap}</span>
                    </p>
                  </div>

                  {onDeleteBouquet && (
                    <button
                      id={`delete-bouquet-${b.id}`}
                      onClick={() => onDeleteBouquet(b.id)}
                      className="text-pink-300 hover:text-red-500 cursor-pointer"
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
