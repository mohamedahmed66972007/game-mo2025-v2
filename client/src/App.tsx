import { useEffect, useState } from "react";
import { useNumberGame } from "./lib/stores/useNumberGame";
import { useAudio } from "./lib/stores/useAudio";
import { GameScene } from "./components/game/GameScene";
import { Menu } from "./components/ui/Menu";
import { WinScreen } from "./components/ui/WinScreen";
import { LoseScreen } from "./components/ui/LoseScreen";
import { MultiplayerLobby } from "./components/ui/MultiplayerLobby";
import { SecretCodeSetup } from "./components/ui/SecretCodeSetup";
import { GameHUD } from "./components/ui/GameHUD";
import { GameOverScreen } from "./components/ui/GameOverScreen";
import "@fontsource/inter";

function App() {
  const { mode, singleplayer, multiplayer, setMode } = useNumberGame();
  const { setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    
    hitAudio.load();
    successAudio.load();
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  const isMultiplayerGameActive =
    multiplayer.opponentId &&
    multiplayer.challengeStatus === "accepted" &&
    multiplayer.mySecretCode.length === 4;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {mode === "menu" && <Menu />}

      {mode === "singleplayer" && (
        <>
          <GameScene />
          <GameHUD />
          {singleplayer.phase === "won" && <WinScreen />}
          {singleplayer.phase === "lost" && <LoseScreen />}
        </>
      )}

      {mode === "multiplayer" && (
        <>
          {/* Show lobby only if in room but no opponent */}
          {multiplayer.roomId && !multiplayer.opponentId && <MultiplayerLobby />}
          
          {/* Show lobby while waiting for challenge acceptance */}
          {multiplayer.roomId && multiplayer.opponentId && multiplayer.challengeStatus !== "accepted" && (
            <MultiplayerLobby />
          )}
          
          {/* Show secret code setup or game after challenge accepted */}
          {multiplayer.opponentId && multiplayer.challengeStatus === "accepted" && (
            <>
              {multiplayer.mySecretCode.length === 0 && <SecretCodeSetup />}
              
              {isMultiplayerGameActive && (
                <>
                  <GameScene />
                  <GameHUD />
                  <HomeButton />
                  {(multiplayer.phase === "won" || multiplayer.phase === "lost") && (
                    <GameOverScreen />
                  )}
                </>
              )}
            </>
          )}
          
          {!multiplayer.roomId && <Menu />}
        </>
      )}
    </div>
  );
}

function HomeButton() {
  const { setMode, setMultiplayerPhase } = useNumberGame();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuit = () => {
    import("@/lib/websocket").then(({ send }) => {
      send({ type: "opponent_quit" });
    });
    setMultiplayerPhase("lost");
    setTimeout(() => {
      setMode("menu");
    }, 500);
  };

  if (showConfirm) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-900 border-2 border-red-600 rounded-lg p-4 shadow-lg">
        <p className="text-white font-semibold mb-3">هل تريد الانسحاب؟</p>
        <div className="flex gap-2">
          <button
            onClick={handleQuit}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
          >
            نعم
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-semibold"
          >
            لا
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="fixed top-4 right-4 z-40 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center shadow-lg text-xl transition-transform duration-200 hover:scale-110"
      title="البيت"
    >
      🏠
    </button>
  );
}

export default App;
