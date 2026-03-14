import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AdBanner } from "./components/AdBanner";
import { BikeGame } from "./components/BikeGame";
import { CarDodgeGame } from "./components/CarDodgeGame";
import { ColorMatchGame } from "./components/ColorMatchGame";
import { HomeScreen } from "./components/HomeScreen";
import { ImageMatchGame } from "./components/ImageMatchGame";
import { InterstitialAd } from "./components/InterstitialAd";
import { LevelSelect } from "./components/LevelSelect";

type Screen =
  | "home"
  | "level-select-color"
  | "level-select-image"
  | "color-match"
  | "image-match"
  | "bike-game"
  | "car-game";

const queryClient = new QueryClient();

function GameApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);

  const goHome = () => {
    setShowInterstitial(true);
  };

  const handleInterstitialClose = () => {
    setShowInterstitial(false);
    setScreen("home");
  };

  const handleNavigate = (game: string) => {
    if (game === "color-match") {
      setScreen("level-select-color");
    } else if (game === "image-match") {
      setScreen("level-select-image");
    } else {
      setScreen(game as Screen);
    }
  };

  return (
    <div className="relative min-h-screen">
      {screen === "home" && <HomeScreen onNavigate={handleNavigate} />}

      {screen === "level-select-color" && (
        <LevelSelect
          gameName="Color Match"
          gameEmoji="🎨"
          onBack={() => setScreen("home")}
          onSelect={(level) => {
            setSelectedLevel(level);
            setScreen("color-match");
          }}
        />
      )}

      {screen === "level-select-image" && (
        <LevelSelect
          gameName="Image Match"
          gameEmoji="🃏"
          onBack={() => setScreen("home")}
          onSelect={(level) => {
            setSelectedLevel(level);
            setScreen("image-match");
          }}
        />
      )}

      {screen === "color-match" && (
        <ColorMatchGame onBack={goHome} level={selectedLevel} />
      )}
      {screen === "image-match" && (
        <ImageMatchGame onBack={goHome} level={selectedLevel} />
      )}
      {screen === "bike-game" && <BikeGame onBack={goHome} />}
      {screen === "car-game" && <CarDodgeGame onBack={goHome} />}

      <AdBanner />
      <Toaster />
      {showInterstitial && <InterstitialAd onClose={handleInterstitialClose} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameApp />
    </QueryClientProvider>
  );
}
