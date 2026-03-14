import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useSaveScore } from "../hooks/useQueries";

interface ColorMatchGameProps {
  onBack: () => void;
  level?: 1 | 2 | 3;
}

const COLORS = [
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "green", label: "Green", hex: "#22c55e" },
  { id: "yellow", label: "Yellow", hex: "#eab308" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "purple", label: "Purple", hex: "#a855f7" },
];

const LEVEL_COLOR_COUNT: Record<1 | 2 | 3, number> = { 1: 3, 2: 5, 3: 6 };

interface Circle {
  uid: string;
  colorId: string;
  hex: string;
  matched: boolean;
  flashing: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCircles(level: 1 | 2 | 3): Circle[] {
  const count = LEVEL_COLOR_COUNT[level];
  const activeColors = COLORS.slice(0, count);
  const pairs = activeColors.flatMap((c, i) => [
    {
      uid: `${c.id}-a`,
      colorId: c.id,
      hex: c.hex,
      matched: false,
      flashing: false,
      _sort: i * 2,
    },
    {
      uid: `${c.id}-b`,
      colorId: c.id,
      hex: c.hex,
      matched: false,
      flashing: false,
      _sort: i * 2 + 1,
    },
  ]);
  return shuffle(pairs).map(({ _sort: _, ...rest }) => rest);
}

export function ColorMatchGame({ onBack, level = 1 }: ColorMatchGameProps) {
  const [circles, setCircles] = useState<Circle[]>(() => createCircles(level));
  const [selected, setSelected] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);
  const saveScore = useSaveScore();

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const handleCircleClick = useCallback(
    (uid: string) => {
      if (locked || won) return;
      const circle = circles.find((c) => c.uid === uid);
      if (!circle || circle.matched) return;

      if (!selected) {
        setSelected(uid);
        return;
      }

      if (selected === uid) {
        setSelected(null);
        return;
      }

      const first = circles.find((c) => c.uid === selected);
      const second = circle;

      if (first && first.colorId === second.colorId) {
        setLocked(true);
        setCircles((prev) =>
          prev.map((c) =>
            c.uid === selected || c.uid === uid ? { ...c, flashing: true } : c,
          ),
        );
        setTimeout(() => {
          setCircles((prev) => {
            const next = prev.map((c) =>
              c.uid === selected || c.uid === uid
                ? { ...c, matched: true, flashing: false }
                : c,
            );
            const allMatched = next.every((c) => c.matched);
            if (allMatched) {
              setRunning(false);
              setWon(true);
              saveScore.mutate({
                gameName: "color-match",
                score: BigInt(elapsed),
              });
            }
            return next;
          });
          setSelected(null);
          setLocked(false);
        }, 500);
      } else {
        setLocked(true);
        setTimeout(() => {
          setSelected(null);
          setLocked(false);
        }, 500);
      }
    },
    [circles, selected, locked, won, elapsed, saveScore],
  );

  const resetGame = () => {
    setCircles(createCircles(level));
    setSelected(null);
    setElapsed(0);
    setRunning(true);
    setWon(false);
    setLocked(false);
  };

  return (
    <div
      data-ocid="color_match.page"
      className="min-h-screen pb-20 flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(88 0.12 145) 0%, oklch(85 0.1 200) 100%)",
      }}
    >
      <header className="flex items-center gap-3 p-4">
        <button
          type="button"
          data-ocid="color_match.back.button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-display font-bold text-white text-lg shadow-game active:shadow-game-hover"
          style={{ background: "oklch(65 0.22 145)", minHeight: "48px" }}
        >
          ← Back
        </button>
        <h2 className="font-display font-extrabold text-3xl text-white drop-shadow">
          🎨 Color Match
        </h2>
        <div className="font-display font-bold text-white text-sm bg-white/25 rounded-2xl px-3 py-1 flex items-center gap-1">
          ⭐ Level {level}
        </div>
        <div className="ml-auto font-display font-bold text-white text-xl bg-white/20 rounded-2xl px-4 py-2">
          ⏱️ {elapsed}s
        </div>
      </header>

      {/* Inline sponsored banner */}
      <div
        style={{
          height: "50px",
          backgroundColor: "rgba(255,255,255,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 16px",
          borderRadius: "8px",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Sponsored
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
          Ad — ca-app-pub-9330624457981835/7791137015
        </span>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 mt-3">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <AnimatePresence>
            {circles.map((circle) => (
              <motion.button
                key={circle.uid}
                type="button"
                layout
                initial={{ scale: 0 }}
                animate={{
                  scale: circle.matched ? 0 : 1,
                  opacity: circle.matched ? 0 : 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileHover={!circle.matched ? { scale: 1.15 } : {}}
                whileTap={!circle.matched ? { scale: 0.9 } : {}}
                onClick={() => handleCircleClick(circle.uid)}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 transition-all"
                style={{
                  backgroundColor: circle.hex,
                  borderColor:
                    selected === circle.uid ? "white" : "rgba(255,255,255,0.4)",
                  boxShadow:
                    selected === circle.uid
                      ? `0 0 0 4px white, 0 8px 20px ${circle.hex}99`
                      : `0 6px 16px ${circle.hex}66`,
                  cursor: circle.matched ? "default" : "pointer",
                }}
                aria-label={circle.colorId}
              />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ scale: 0, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center p-8 rounded-3xl shadow-game"
              style={{ background: "oklch(98 0.08 85)" }}
            >
              <div className="text-6xl mb-3">🎉</div>
              <h3
                className="font-display font-extrabold text-3xl"
                style={{ color: "oklch(40 0.25 145)" }}
              >
                You Won!
              </h3>
              <p
                className="font-body text-lg mt-1"
                style={{ color: "oklch(45 0.04 270)" }}
              >
                Time: <strong>{elapsed} seconds</strong>
              </p>
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  type="button"
                  onClick={resetGame}
                  className="px-6 py-3 rounded-2xl font-display font-bold text-white text-xl shadow-game"
                  style={{ background: "oklch(65 0.28 145)" }}
                >
                  Play Again!
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-2xl font-display font-bold text-white text-xl shadow-game"
                  style={{ background: "oklch(60 0.18 270)" }}
                >
                  Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!won && (
          <p className="font-body text-white/80 text-center text-base">
            Tap two circles with the same color to match them!
          </p>
        )}
      </main>
    </div>
  );
}
