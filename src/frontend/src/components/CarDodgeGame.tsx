import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSaveScore } from "../hooks/useQueries";

interface CarDodgeGameProps {
  onBack: () => void;
}

const LANE_COUNT = 3;
const CAR_W = 44;
const CAR_H = 70;
const PLAYER_H = 80;
const PLAYER_W = 50;
const SPAWN_INTERVAL_INIT = 1600;
const SPEED_INIT = 3;

interface EnemyCar {
  id: number;
  lane: number;
  y: number;
  color: string;
}

const ENEMY_COLORS = ["#ef4444", "#f97316", "#a855f7", "#ec4899", "#06b6d4"];

let nextId = 0;

export function CarDodgeGame({ onBack }: CarDodgeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerLaneRef = useRef<number>(1);
  const enemiesRef = useRef<EnemyCar[]>([]);
  const scoreRef = useRef<number>(0);
  const gameOverRef = useRef<boolean>(false);
  const startedRef = useRef<boolean>(false);
  const speedRef = useRef<number>(SPEED_INIT);
  const spawnIntervalRef = useRef<number>(SPAWN_INTERVAL_INIT);
  const lastSpawnRef = useRef<number>(0);
  const lastScoreRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [displayState, setDisplayState] = useState({
    score: 0,
    gameOver: false,
    started: false,
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number>(1);
  const saveScore = useSaveScore();

  const currentLevel = Math.min(Math.floor(displayState.score / 10) + 1, 5);

  useEffect(() => {
    if (currentLevel > prevLevelRef.current) {
      prevLevelRef.current = currentLevel;
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 1200);
      return () => clearTimeout(t);
    }
  }, [currentLevel]);

  const moveLeft = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      setDisplayState((d) => ({ ...d, started: true }));
    }
    playerLaneRef.current = Math.max(0, playerLaneRef.current - 1);
  }, []);

  const moveRight = useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      setDisplayState((d) => ({ ...d, started: true }));
    }
    playerLaneRef.current = Math.min(LANE_COUNT - 1, playerLaneRef.current + 1);
  }, []);

  const resetGame = useCallback(() => {
    playerLaneRef.current = 1;
    enemiesRef.current = [];
    scoreRef.current = 0;
    gameOverRef.current = false;
    startedRef.current = false;
    speedRef.current = SPEED_INIT;
    spawnIntervalRef.current = SPAWN_INTERVAL_INIT;
    lastSpawnRef.current = 0;
    lastScoreRef.current = 0;
    prevLevelRef.current = 1;
    setDisplayState({ score: 0, gameOver: false, started: false });
    setShowLevelUp(false);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveLeft();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveRight();
      }
      if (!startedRef.current) {
        startedRef.current = true;
        setDisplayState((d) => ({ ...d, started: true }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveLeft, moveRight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawCar = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      isPlayer: boolean,
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = isPlayer ? "#93c5fd" : "#fca5a5";
      if (isPlayer) {
        ctx.fillRect(x + 6, y + 8, w - 12, h * 0.3);
      } else {
        ctx.fillRect(x + 6, y + h - h * 0.35, w - 12, h * 0.3);
      }
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(x - 4, y + 10, 8, 14);
      ctx.fillRect(x + w - 4, y + 10, 8, 14);
      ctx.fillRect(x - 4, y + h - 24, 8, 14);
      ctx.fillRect(x + w - 4, y + h - 24, 8, 14);
      if (isPlayer) {
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(x + 6, y + h - 10, 12, 6);
        ctx.fillRect(x + w - 18, y + h - 10, 12, 6);
      }
    };

    const gameLoop = (timestamp: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const laneW = W / LANE_COUNT;

      if (!gameOverRef.current && startedRef.current) {
        if (timestamp - lastSpawnRef.current > spawnIntervalRef.current) {
          lastSpawnRef.current = timestamp;
          const lane = Math.floor(Math.random() * LANE_COUNT);
          const color =
            ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];
          enemiesRef.current.push({
            id: nextId++,
            lane,
            y: -CAR_H - 10,
            color,
          });
          if (spawnIntervalRef.current > 800) spawnIntervalRef.current -= 20;
        }

        if (timestamp - lastScoreRef.current > 1000) {
          lastScoreRef.current = timestamp;
          scoreRef.current++;
          speedRef.current =
            SPEED_INIT + Math.floor(scoreRef.current / 5) * 0.5;
          setDisplayState((d) => ({ ...d, score: scoreRef.current }));
        }

        enemiesRef.current = enemiesRef.current
          .map((e) => ({ ...e, y: e.y + speedRef.current }))
          .filter((e) => e.y < H + CAR_H + 10);

        const playerX = playerLaneRef.current * laneW + (laneW - PLAYER_W) / 2;
        const playerY = H - PLAYER_H - 20;
        for (const enemy of enemiesRef.current) {
          const ex = enemy.lane * laneW + (laneW - CAR_W) / 2;
          const margin = 6;
          if (
            playerX + PLAYER_W - margin > ex + margin &&
            playerX + margin < ex + CAR_W - margin &&
            playerY + margin < enemy.y + CAR_H - margin &&
            playerY + PLAYER_H - margin > enemy.y + margin
          ) {
            gameOverRef.current = true;
            setDisplayState((d) => ({
              ...d,
              gameOver: true,
              score: scoreRef.current,
            }));
            saveScore.mutate({
              gameName: "car-game",
              score: BigInt(scoreRef.current),
            });
          }
        }
      }

      ctx.fillStyle = "#374151";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.setLineDash([30, 20]);
      const dashOffset = startedRef.current
        ? -(timestamp * speedRef.current * 0.05) % 50
        : 0;
      ctx.lineDashOffset = dashOffset;
      for (let i = 1; i < LANE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneW, 0);
        ctx.lineTo(i * laneW, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(2, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - 2, 0);
      ctx.lineTo(W - 2, H);
      ctx.stroke();

      for (const enemy of enemiesRef.current) {
        const ex = enemy.lane * laneW + (laneW - CAR_W) / 2;
        drawCar(ex, enemy.y, CAR_W, CAR_H, enemy.color, false);
      }

      const playerX = playerLaneRef.current * laneW + (laneW - PLAYER_W) / 2;
      const playerY = H - PLAYER_H - 20;
      drawCar(playerX, playerY, PLAYER_W, PLAYER_H, "#3b82f6", true);

      if (!startedRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(W / 2 - 150, H / 2 - 35, 300, 60);
        ctx.fillStyle = "white";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Use arrow keys or buttons!", W / 2, H / 2 + 5);
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [saveScore]);

  return (
    <div
      data-ocid="car_game.page"
      className="min-h-screen flex flex-col pb-20"
      style={{
        background:
          "linear-gradient(135deg, oklch(80 0.18 260) 0%, oklch(75 0.22 290) 100%)",
      }}
    >
      <header className="flex items-center gap-3 p-4">
        <button
          type="button"
          data-ocid="car_game.back.button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-display font-bold text-white text-lg shadow-game"
          style={{ background: "oklch(50 0.22 260)", minHeight: "48px" }}
        >
          ← Back
        </button>
        <h2 className="font-display font-extrabold text-3xl text-white drop-shadow">
          🚗 Car Dodge
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
          backgroundColor: "rgba(255,255,255,0.15)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
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
            color: "rgba(255,255,255,0.6)",
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

      <div className="flex-1 px-4 relative mt-3">
        <canvas
          ref={canvasRef}
          data-ocid="car_game.canvas_target"
          className="w-full rounded-3xl shadow-game"
          style={{ height: "320px", display: "block" }}
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
              style={{ background: "rgba(100,150,255,0.35)" }}
            >
              <div className="text-center">
                <div className="text-5xl mb-1">🏆</div>
                <div
                  className="font-display font-extrabold text-4xl"
                  style={{
                    color: "white",
                    textShadow: "0 2px 12px rgba(80,120,255,0.9)",
                  }}
                >
                  Level Up!
                </div>
                <div className="font-display font-bold text-2xl mt-1 text-white">
                  Level {currentLevel}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayState.gameOver && (
          <div
            className="absolute inset-4 flex flex-col items-center justify-center rounded-3xl"
            style={{ background: "rgba(0,0,0,0.65)" }}
          >
            <div className="text-6xl mb-3">💥</div>
            <h3 className="font-display font-extrabold text-4xl text-white mb-2">
              Crashed!
            </h3>
            <p className="font-body text-xl text-white/90 mb-1">
              Score: <strong>{displayState.score}</strong>
            </p>
            <p className="font-body text-lg text-white/80 mb-6">
              🏆 Level {currentLevel} reached!
            </p>
            <button
              type="button"
              data-ocid="car_game.play_again.button"
              onClick={resetGame}
              className="px-8 py-4 rounded-2xl font-display font-bold text-white text-2xl shadow-game"
              style={{ background: "oklch(65 0.25 260)" }}
            >
              Play Again!
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-6 py-4 px-4">
        <button
          type="button"
          data-ocid="car_game.left.button"
          onPointerDown={moveLeft}
          className="w-20 h-20 rounded-2xl font-display font-bold text-white text-4xl shadow-game active:shadow-game-hover select-none"
          style={{
            background: "oklch(55 0.22 260)",
            minHeight: "60px",
            touchAction: "none",
          }}
          aria-label="Move Left"
        >
          ◀
        </button>
        <button
          type="button"
          data-ocid="car_game.right.button"
          onPointerDown={moveRight}
          className="w-20 h-20 rounded-2xl font-display font-bold text-white text-4xl shadow-game active:shadow-game-hover select-none"
          style={{
            background: "oklch(55 0.22 260)",
            minHeight: "60px",
            touchAction: "none",
          }}
          aria-label="Move Right"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
