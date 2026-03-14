import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { useSaveScore } from "../hooks/useQueries";

interface ImageMatchGameProps {
  onBack: () => void;
  level?: 1 | 2 | 3;
}

const ALL_EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const LEVEL_PAIR_COUNT: Record<1 | 2 | 3, number> = { 1: 4, 2: 6, 3: 8 };

interface Card {
  uid: string;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createCards(level: 1 | 2 | 3): Card[] {
  const count = LEVEL_PAIR_COUNT[level];
  const emojis = ALL_EMOJIS.slice(0, count);
  const pairs = emojis.flatMap((e, i) => [
    { uid: `${i}-a`, emoji: e, flipped: false, matched: false },
    { uid: `${i}-b`, emoji: e, flipped: false, matched: false },
  ]);
  const arr = [...pairs];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function ImageMatchGame({ onBack, level = 1 }: ImageMatchGameProps) {
  const [cards, setCards] = useState<Card[]>(() => createCards(level));
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const saveScore = useSaveScore();

  const handleCardClick = useCallback(
    (uid: string) => {
      if (locked || won) return;
      const card = cards.find((c) => c.uid === uid);
      if (!card || card.flipped || card.matched) return;
      if (flippedUids.length === 1 && flippedUids[0] === uid) return;

      const newFlipped = [...flippedUids, uid];
      setCards((prev) =>
        prev.map((c) => (c.uid === uid ? { ...c, flipped: true } : c)),
      );
      setFlippedUids(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [uid1, uid2] = newFlipped;
        const c1 = cards.find((c) => c.uid === uid1);
        const c2 = cards.find((c) => c.uid === uid2);

        if (c1 && c2 && c1.emoji === c2.emoji) {
          setTimeout(() => {
            setCards((prev) => {
              const next = prev.map((c) =>
                c.uid === uid1 || c.uid === uid2 ? { ...c, matched: true } : c,
              );
              const allMatched = next.every((c) => c.matched);
              if (allMatched) {
                setWon(true);
                saveScore.mutate({
                  gameName: "image-match",
                  score: BigInt(moves + 1),
                });
              }
              return next;
            });
            setFlippedUids([]);
            setLocked(false);
          }, 600);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.uid === uid1 || c.uid === uid2 ? { ...c, flipped: false } : c,
              ),
            );
            setFlippedUids([]);
            setLocked(false);
          }, 1000);
        }
      }
    },
    [cards, flippedUids, locked, won, moves, saveScore],
  );

  const resetGame = () => {
    setCards(createCards(level));
    setFlippedUids([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
  };

  const cols = level === 1 ? 4 : level === 2 ? 4 : 4;

  return (
    <div
      data-ocid="image_match.page"
      className="min-h-screen pb-20 flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(85 0.14 30) 0%, oklch(82 0.15 350) 100%)",
      }}
    >
      <header className="flex items-center gap-3 p-4">
        <button
          type="button"
          data-ocid="image_match.back.button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-display font-bold text-white text-lg shadow-game"
          style={{ background: "oklch(60 0.22 30)", minHeight: "48px" }}
        >
          ← Back
        </button>
        <h2 className="font-display font-extrabold text-3xl text-white drop-shadow">
          🃏 Image Match
        </h2>
        <div className="font-display font-bold text-white text-sm bg-white/25 rounded-2xl px-3 py-1 flex items-center gap-1">
          ⭐ Level {level}
        </div>
        <div className="ml-auto font-display font-bold text-white text-xl bg-white/20 rounded-2xl px-4 py-2">
          🔄 {moves}
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
        <div
          className="grid gap-3 mb-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {cards.map((card) => (
            <motion.button
              key={card.uid}
              type="button"
              onClick={() => handleCardClick(card.uid)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl text-3xl flex items-center justify-center cursor-pointer border-0 outline-none relative overflow-hidden"
              style={{
                background: card.matched
                  ? "oklch(80 0.2 145)"
                  : card.flipped
                    ? "white"
                    : "oklch(55 0.22 30)",
                boxShadow: card.matched
                  ? "0 4px 12px rgba(0,200,0,0.3)"
                  : "0 6px 16px rgba(0,0,0,0.2)",
                cursor: card.matched || card.flipped ? "default" : "pointer",
              }}
              whileHover={!card.flipped && !card.matched ? { scale: 1.1 } : {}}
              whileTap={!card.flipped && !card.matched ? { scale: 0.9 } : {}}
              aria-label={card.flipped ? card.emoji : "card"}
            >
              <AnimatePresence mode="wait">
                {card.flipped || card.matched ? (
                  <motion.span
                    key="front"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {card.emoji}
                  </motion.span>
                ) : (
                  <motion.span
                    key="back"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    🎴
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ scale: 0, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center p-8 rounded-3xl shadow-game"
              style={{ background: "oklch(98 0.06 30)" }}
            >
              <div className="text-6xl mb-3">🏆</div>
              <h3
                className="font-display font-extrabold text-3xl"
                style={{ color: "oklch(45 0.25 30)" }}
              >
                Brilliant!
              </h3>
              <p
                className="font-body text-lg mt-1"
                style={{ color: "oklch(45 0.04 270)" }}
              >
                Completed in <strong>{moves} moves</strong>
              </p>
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  type="button"
                  onClick={resetGame}
                  className="px-6 py-3 rounded-2xl font-display font-bold text-white text-xl shadow-game"
                  style={{ background: "oklch(60 0.25 30)" }}
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
            Flip cards and find all the matching pairs!
          </p>
        )}
      </main>
    </div>
  );
}
