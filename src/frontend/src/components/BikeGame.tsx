import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSaveScore } from "../hooks/useQueries";

interface BikeGameProps {
  onBack: () => void;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const OBSTACLE_SPEED_INIT = 4;
const OBSTACLE_INTERVAL = 2200;
const GROUND_H = 60;

interface Obstacle {
  x: number;
  w: number;
  h: number;
}

interface GameState {
  playerY: number;
  playerVY: number;
  onGround: boolean;
  obstacles: Obstacle[];
  score: number;
  gameOver: boolean;
  started: boolean;
}

export function BikeGame({ onBack }: BikeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>({
    playerY: 0,
    playerVY: 0,
    onGround: true,
    obstacles: [],
    score: 0,
    gameOver: false,
    started: false,
  });
  const rafRef = useRef<number>(0);
  const lastObstacleRef = useRef<number>(0);
  const lastScoreRef = useRef<number>(0);
  const speedRef = useRef<number>(OBSTACLE_SPEED_INIT);
  const [displayState, setDisplayState] = useState<{
    score: number;
    gameOver: boolean;
    started: boolean;
  }>({
    score: 0,
    gameOver: false,
    started: false,
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number>(1);
  const saveScore = useSaveScore();

  const currentLevel = Math.min(Math.floor(displayState.score / 10) + 1, 5);

  // Trigger level-up flash when level increases
  useEffect(() => {
    if (currentLevel > prevLevelRef.current) {
      prevLevelRef.current = currentLevel;
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 1200);
      return () => clearTimeout(t);
    }
  }, [currentLevel]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) return;
    if (!s.started) {
      s.started = true;
      setDisplayState((d) => ({ ...d, started: true }));
    }
    if (s.onGround) {
      s.playerVY = JUMP_FORCE;
      s.onGround = false;
    }
  }, []);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const groundY = canvas.height - GROUND_H;
    stateRef.current = {
      playerY: groundY - 50,
      playerVY: 0,
      onGround: true,
      obstacles: [],
      score: 0,
      gameOver: false,
      started: false,
    };
    speedRef.current = OBSTACLE_SPEED_INIT;
    lastObstacleRef.current = 0;
    lastScoreRef.current = 0;
    prevLevelRef.current = 1;
    setDisplayState({ score: 0, gameOver: false, started: false });
    setShowLevelUp(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const s = stateRef.current;
      s.playerY = canvas.height - GROUND_H - 50;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const groundY = H - GROUND_H;
      const PLAYER_X = 80;
      const PLAYER_SIZE = 48;

      if (!s.gameOver && s.started) {
        if (timestamp - lastObstacleRef.current > OBSTACLE_INTERVAL) {
          lastObstacleRef.current = timestamp;
          const h = 30 + Math.random() * 35;
          s.obstacles.push({ x: W + 20, w: 28, h });
          speedRef.current =
            OBSTACLE_SPEED_INIT + Math.floor(s.score / 5) * 0.5;
        }

        if (timestamp - lastScoreRef.current > 1000) {
          lastScoreRef.current = timestamp;
          s.score++;
          setDisplayState((d) => ({ ...d, score: s.score }));
        }

        s.playerVY += GRAVITY;
        s.playerY += s.playerVY;
        if (s.playerY >= groundY - PLAYER_SIZE) {
          s.playerY = groundY - PLAYER_SIZE;
          s.playerVY = 0;
          s.onGround = true;
        }

        s.obstacles = s.obstacles
          .map((o) => ({ ...o, x: o.x - speedRef.current }))
          .filter((o) => o.x + o.w > -10);

        for (const o of s.obstacles) {
          const px = PLAYER_X;
          const py = s.playerY;
          const margin = 8;
          if (
            px + PLAYER_SIZE - margin > o.x + margin &&
            px + margin < o.x + o.w - margin &&
            py + PLAYER_SIZE - margin > groundY - o.h
          ) {
            s.gameOver = true;
            setDisplayState((d) => ({ ...d, gameOver: true, score: s.score }));
            saveScore.mutate({ gameName: "bike-game", score: BigInt(s.score) });
            break;
          }
        }
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, "#87CEEB");
      skyGrad.addColorStop(1, "#E0F4FF");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = 0; i < 3; i++) {
        const cx =
          ((W * 0.2 * (i + 1) + timestamp * 0.02 * (i + 1)) % (W + 100)) - 50;
        ctx.beginPath();
        ctx.arc(cx, 50 + i * 20, 25, 0, Math.PI * 2);
        ctx.arc(cx + 30, 45 + i * 20, 30, 0, Math.PI * 2);
        ctx.arc(cx + 60, 50 + i * 20, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#4ade80";
      ctx.fillRect(0, groundY, W, 12);
      ctx.fillStyle = "#86efac";
      ctx.fillRect(0, groundY, W, 4);
      ctx.fillStyle = "#92400e";
      ctx.fillRect(0, groundY + 12, W, GROUND_H - 12);

      ctx.fillStyle = "#a16207";
      for (let i = 0; i < W; i += 80) {
        const dashX = (i - ((timestamp * speedRef.current * 0.1) % 80)) % W;
        ctx.fillRect(dashX, groundY + 20, 50, 6);
      }

      for (const o of s.obstacles) {
        ctx.fillStyle = "#6b7280";
        ctx.beginPath();
        ctx.roundRect(o.x, groundY - o.h, o.w, o.h, 4);
        ctx.fill();
        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(o.x + 4, groundY - o.h + 4, o.w - 8, 6);
        ctx.font = `${Math.min(o.w, o.h)}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("🪨", o.x + o.w / 2, groundY - o.h / 2 + 8);
      }

      ctx.font = "42px serif";
      ctx.textAlign = "center";
      const bounce =
        s.onGround && s.started ? Math.sin(timestamp * 0.01) * 2 : 0;
      ctx.fillText(
        "🚲",
        PLAYER_X + PLAYER_SIZE / 2,
        s.playerY + PLAYER_SIZE - 4 + bounce,
      );

      if (!s.started) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(W / 2 - 140, H / 2 - 40, 280, 70);
        ctx.fillStyle = "white";
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Tap or press SPACE to start!", W / 2, H / 2 + 5);
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", resize);
    };
  }, [jump, saveScore]);

  return (
    <div
      data-ocid="bike_game.page"
      className="min-h-screen flex flex-col pb-20"
      style={{
        background:
          "linear-gradient(135deg, oklch(88 0.18 85) 0%, oklch(85 0.15 145) 100%)",
      }}
    >
      <header className="flex items-center gap-3 p-4">
        <button
          type="button"
          data-ocid="bike_game.back.button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-display font-bold text-white text-lg shadow-game"
          style={{ background: "oklch(60 0.22 85)", minHeight: "48px" }}
        >
          ← Back
        </button>
        <h2 className="font-display font-extrabold text-3xl text-white drop-shadow">
          🚲 Bike Race
        </h2>
        <div className="font-display font-bold text-white text-sm bg-white/25 rounded-2xl px-3 py-1 flex items-center gap-1">
          🏆 Level {currentLevel}
        </div>
        <div className="ml-auto font-display font-bold text-white text-xl bg-white/20 rounded-2xl px-4 py-2">
          ⭐ {displayState.score}
        </div>
      </header>

      {/* Inline sponsored banner */}
      <div
        style={{
          height: "50px",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
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
            color: "#aaa",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Sponsored
        </span>
        <span style={{ fontSize: "11px", color: "#bbb" }}>
          Ad — ca-app-pub-9330624457981835/7791137015
        </span>
      </div>

      <div className="flex-1 px-4 relative mt-3" style={{ minHeight: "300px" }}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: game canvas uses keyboard events via window listener */}
        <canvas
          ref={canvasRef}
          onClick={jump}
          data-ocid="bike_game.canvas_target"
          className="w-full rounded-3xl shadow-game cursor-pointer"
          style={{ height: "320px", display: "block", touchAction: "none" }}
        />

        {/* Level Up flash overlay */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-4 flex items-center justify-center pointer-events-none rounded-3xl"
              style={{ background: "rgba(255,215,0,0.35)" }}
            >
              <div className="text-center">
                <div className="text-5xl mb-1">🏆</div>
                <div
                  className="font-display font-extrabold text-4xl"
                  style={{
                    color: "oklch(35 0.25 85)",
                    textShadow: "0 2px 8px rgba(255,200,0,0.8)",
                  }}
                >
                  Level Up!
                </div>
                <div
                  className="font-display font-bold text-2xl mt-1"
                  style={{ color: "oklch(35 0.2 85)" }}
                >
                  Level {currentLevel}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayState.gameOver && (
          <div
            className="absolute inset-4 flex flex-col items-center justify-center rounded-3xl"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <div className="text-6xl mb-3">💥</div>
            <h3 className="font-display font-extrabold text-4xl text-white mb-2">
              Game Over!
            </h3>
            <p className="font-body text-xl text-white/90 mb-1">
              Score: <strong>{displayState.score}</strong>
            </p>
            <p className="font-body text-lg text-white/80 mb-6">
              🏆 Level {currentLevel} reached!
            </p>
            <button
              type="button"
              data-ocid="bike_game.play_again.button"
              onClick={resetGame}
              className="px-8 py-4 rounded-2xl font-display font-bold text-white text-2xl shadow-game"
              style={{ background: "oklch(65 0.28 145)" }}
            >
              Play Again!
            </button>
          </div>
        )}
      </div>

      <div className="text-center py-3 px-4">
        <p className="font-body text-white/90 text-lg font-semibold">
          {displayState.started
            ? "Tap canvas or press SPACE to jump!"
            : "Tap the game area to start!"}
        </p>
      </div>
    </div>
  );
}
