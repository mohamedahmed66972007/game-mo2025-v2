import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNumberGame } from "@/lib/stores/useNumberGame";
import { send } from "@/lib/websocket";

export function MultiplayerLobby() {
  const { multiplayer, setMode, setChallengeStatus, setOpponentId } = useNumberGame();
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);

  const handleChallengePlayer = (opponentId: string) => {
    setSelectedOpponent(opponentId);
    setOpponentId(opponentId);
    setChallengeStatus("sent");
    send({ type: "challenge_player", opponentId });
  };

  const handleAcceptChallenge = () => {
    if (multiplayer.opponentId) {
      setChallengeStatus("accepted");
      send({ type: "accept_challenge", opponentId: multiplayer.opponentId });
    }
  };

  const otherPlayers = multiplayer.players.filter((p) => p.id !== multiplayer.playerId);

  // Show loading while challenge is being sent or received response
  if (multiplayer.challengeStatus === "sent") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
          <p className="text-white text-lg">جاري قبول التحدي...</p>
          <p className="text-gray-400 text-sm mt-2">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  // Don't show MultiplayerLobby if challenge is accepted
  if (multiplayer.challengeStatus === "accepted") {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 z-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <Card className="w-full max-w-lg mx-4 bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
        
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/50 transform rotate-6">
                <span className="text-4xl">👥</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-4xl font-bold mb-3">
            غرفة اللعب
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 p-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-4 rounded-xl border-2 border-purple-500/50">
            <p className="text-center text-gray-300 text-sm mb-2">رقم الغرفة</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={multiplayer.roomId}
                className="flex-1 px-4 py-3 bg-slate-900 border-2 border-purple-500/50 rounded-lg text-white font-mono font-bold text-center focus:outline-none"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(multiplayer.roomId);
                  // Optional: Show toast notification
                }}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold px-4 py-3 rounded-lg shadow-md"
              >
                📋 نسخ
              </Button>
            </div>
          </div>
          {multiplayer.challengeStatus === "received" && (
            <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 p-5 rounded-2xl border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20 animate-pulse">
              <div className="flex items-center justify-center mb-3">
                <span className="text-4xl">⚔️</span>
              </div>
              <p className="text-yellow-200 text-center mb-4 font-semibold text-lg">
                تلقيت تحدي! هل تقبل؟
              </p>
              <Button
                onClick={handleAcceptChallenge}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-6 rounded-xl shadow-lg"
              >
                <span className="mr-2">⚡</span>
                قبول التحدي
              </Button>
            </div>
          )}

          {multiplayer.challengeStatus === "none" && (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-2xl border border-purple-500/20">
              <h3 className="text-white font-bold mb-4 text-lg flex items-center">
                <span className="mr-2">🎮</span>
                اللاعبون ({multiplayer.players.length}/4)
              </h3>
              <div className="space-y-3">
                {multiplayer.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                      player.id === multiplayer.playerId
                        ? "bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                        : "bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50"
                    }`}
                  >
                    <span className="text-white font-medium flex items-center">
                      <span className="mr-2 text-xl">
                        {player.id === multiplayer.playerId ? "👤" : "👾"}
                      </span>
                      {player.name} 
                      {player.id === multiplayer.playerId && (
                        <span className="mr-2 text-purple-300 text-sm bg-purple-900/50 px-2 py-0.5 rounded-lg">(أنت)</span>
                      )}
                    </span>
                    {player.id !== multiplayer.playerId && (
                      <Button
                        onClick={() => handleChallengePlayer(player.id)}
                        disabled={selectedOpponent !== null}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        ⚔️ تحدي
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherPlayers.length === 0 && (
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-5 rounded-2xl border border-blue-500/30">
              <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
              <p className="text-blue-200 text-center font-medium">
                في انتظار انضمام لاعبين آخرين...
              </p>
            </div>
          )}

          <Button
            onClick={() => setMode("menu")}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-6 rounded-2xl shadow-lg shadow-slate-500/20 transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <span className="mr-3 text-xl">🚪</span>
            مغادرة الغرفة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
