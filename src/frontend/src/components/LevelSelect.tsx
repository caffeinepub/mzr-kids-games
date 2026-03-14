import { AnimatePresence, motion } from "motion/react";

interface LevelSelectProps {
  gameName: string;
  gameEmoji: string;
  onSelect: (level: 1 | 2 | 3) => void;
  onBack: () => void;
}

const COLOR_DESCRIPTIONS: Record<string, string[]> = {
  "Color Match": ["3 colors", "5 colors", "6 colors"],
  "Image Match": ["4 pairs", "6 pairs", "8 pairs"],
};

const LEVELS = [
  {
    level: 1 as const,
    label: "Easy",
    stars: "⭐",
    bg: "oklch(72 0.22 145)",
    shadow: "oklch(55 0.25 145)",
    glow: "rgba(80,200,100,0.4)",
  },
  {
    level: 2 as const,
    label: "Medium",
    stars: "⭐⭐",
    bg: "oklch(72 0.22 60)",
    shadow: "oklch(55 0.25 60)",
    glow: "rgba(240,180,40,0.4)",
  },
  {
    level: 3 as const,
    label: "Hard",
    stars: "⭐⭐⭐",
    bg: "oklch(62 0.25 30)",
    shadow: "oklch(45 0.28 30)",
    glow: "rgba(240,80,60,0.4)",
  },
];

export function LevelSelect({
  gameName,
  gameEmoji,
  onSelect,
  onBack,
}: LevelSelectProps) {
  const descriptions = COLOR_DESCRIPTIONS[gameName] ?? [
    "Easy",
    "Medium",
    "Hard",
  ];

  return (
    <div
      data-ocid="level_select.page"
      className="min-h-screen pb-20 flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, oklch(92 0.08 280) 0%, oklch(88 0.12 320) 50%, oklch(92 0.1 200) 100%)",
      }}
    >
      <header className="flex items-center gap-3 p-4">
        <button
          type="button"
          data-ocid="level_select.back.button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-display font-bold text-white text-lg"
          style={{
            background: "oklch(55 0.18 280)",
            minHeight: "48px",
            boxShadow: "0 4px 12px oklch(45 0.2 280 / 0.4)",
          }}
        >
          ← Back
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center"
        >
          <div className="text-7xl mb-3">{gameEmoji}</div>
          <h2
            className="font-display font-extrabold text-4xl"
            style={{ color: "oklch(30 0.08 280)" }}
          >
            {gameName}
          </h2>
          <p
            className="font-body text-xl mt-1"
            style={{ color: "oklch(45 0.06 280)" }}
          >
            Choose your level!
          </p>
        </motion.div>

        <div className="flex flex-col gap-5 w-full max-w-sm">
          {LEVELS.map(({ level, label, stars, bg, shadow, glow }, idx) => (
            <motion.button
              key={level}
              type="button"
              data-ocid={`level_select.level${level}.button`}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: idx * 0.1 + 0.2,
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(level)}
              className="relative flex items-center gap-5 px-6 py-5 rounded-3xl text-white w-full overflow-hidden"
              style={{
                background: bg,
                boxShadow: `0 8px 24px ${glow}, 0 4px 8px ${shadow}44`,
              }}
            >
              {/* decorative blob */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
                style={{
                  background: "white",
                  transform: "translate(30%, -30%)",
                }}
              />
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.25)" }}
              >
                {level === 1 ? "😊" : level === 2 ? "😎" : "🔥"}
              </div>
              <div className="flex-1 text-left">
                <div className="font-display font-extrabold text-2xl">
                  {label}
                </div>
                <div className="text-base opacity-90">{descriptions[idx]}</div>
              </div>
              <div className="text-2xl flex-shrink-0">{stars}</div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
