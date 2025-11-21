import { useEffect, useState } from "react";
import { useNumberGame } from "./lib/stores/useNumberGame";
import { useAudio } from "./lib/stores/useAudio";
import { send } from "./lib/websocket";
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
  const [isPointerLocked, setIsPointerLocked] = useState(false);

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

          {multiplayer.opponentId && multiplayer.rematchRequested && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
              <div className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-purple-500 rounded-2xl p-8 max-w-sm mx-4 text-center">
                <p className="text-white text-2xl font-bold mb-4">طلب إعادة مباراة 🔄</p>
                <p className="text-gray-300 mb-6">هل تريد إعادة المباراة مع الخصم؟</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      send({ type: "accept_rematch" });
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-3 rounded-lg"
                  >
                    ✓ قبول
                  </button>
                  <button
                    onClick={() => {
                      const { setMode, resetMultiplayer } = useNumberGame.getState();
                      resetMultiplayer();
                      setMode("menu");
                      setTimeout(() => {
                        window.location.reload();
                      }, 300);
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-lg"
                  >
                    ✕ رفض
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!multiplayer.roomId && <Menu />}
        </>
      )}
    </div>
  );
}

function HomeButton() {
  const { setMode, resetMultiplayer } = useNumberGame();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuit = () => {
    import("@/lib/websocket").then(({ send, disconnect }) => {
      send({ type: "opponent_quit" });
      disconnect();
    });
    resetMultiplayer();
    setMode("menu");
    setTimeout(() => {
      window.location.reload();
    }, 300);
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
