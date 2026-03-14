import { motion } from "motion/react";

type Screen = "home" | "color-match" | "image-match" | "bike-game" | "car-game";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const STARS = ["⭐", "🌟", "✨", "💫", "⭐", "🌟"];

const games = [
  {
    id: "color-match" as Screen,
    emoji: "🎨",
    name: "Color Match",
    description: "Match the colors!",
    bg: "from-emerald-400 to-teal-500",
    marker: "home.color_match.button",
  },
  {
    id: "image-match" as Screen,
    emoji: "🃏",
    name: "Image Match",
    description: "Flip & find pairs!",
    bg: "from-orange-400 to-pink-500",
    marker: "home.image_match.button",
  },
  {
    id: "bike-game" as Screen,
    emoji: "🚲",
    name: "Bike Race",
    description: "Jump over rocks!",
    bg: "from-yellow-400 to-lime-500",
    marker: "home.bike_game.button",
  },
  {
    id: "car-game" as Screen,
    emoji: "🚗",
    name: "Car Dodge",
    description: "Dodge the traffic!",
    bg: "from-blue-400 to-violet-500",
    marker: "home.car_game.button",
  },
];

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div
      data-ocid="home.page"
      className="min-h-screen pb-20"
      style={{
        background:
          "linear-gradient(135deg, oklch(90 0.12 85) 0%, oklch(88 0.1 145) 50%, oklch(88 0.12 200) 100%)",
      }}
    >
      <header className="pt-8 pb-4 px-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-block mb-3"
        >
          <img
            src="/assets/generated/logo-transparent.dim_200x200.png"
            alt="MZR Kids Games Logo"
            className="w-24 h-24 mx-auto float"
          />
        </motion.div>
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="font-display font-extrabold text-5xl md:text-6xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(45 0.25 30), oklch(50 0.28 145), oklch(45 0.25 260))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(2px 3px 0px rgba(0,0,0,0.1))",
          }}
        >
          MZR Kids Games
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-body text-lg font-semibold mt-1"
          style={{ color: "oklch(40 0.06 270)" }}
        >
          Pick a game and start playing! 🎮
        </motion.p>
      </header>

      <main className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {games.map((game, i) => (
            <motion.button
              key={game.id}
              type="button"
              data-ocid={game.marker}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.1 * i + 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(game.id)}
              className={`bg-gradient-to-br ${game.bg} rounded-3xl p-5 flex flex-col items-center gap-2 shadow-game active:shadow-game-hover transition-shadow cursor-pointer border-0 outline-none`}
              style={{ minHeight: "160px" }}
            >
              <span className="text-6xl" role="img" aria-label={game.name}>
                {game.emoji}
              </span>
              <span className="font-display font-bold text-white text-xl leading-tight">
                {game.name}
              </span>
              <span className="font-body text-white/80 text-sm">
                {game.description}
              </span>
              <span className="mt-1 px-4 py-1.5 bg-white/30 backdrop-blur rounded-full font-display font-bold text-white text-base border-2 border-white/50">
                Play! 🎯
              </span>
            </motion.button>
          ))}
        </div>
      </main>

      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
        style={{ zIndex: -1 }}
      >
        {STARS.map((star, i) => (
          <span
            key={star + String(i)}
            className="absolute text-2xl opacity-20"
            style={{
              top: `${10 + i * 14}%`,
              left: i % 2 === 0 ? `${3 + i * 4}%` : `${75 + i * 3}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {star}
          </span>
        ))}
      </div>

      <footer className="text-center py-3 pb-20">
        <p className="text-xs" style={{ color: "oklch(55 0.04 270)" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
