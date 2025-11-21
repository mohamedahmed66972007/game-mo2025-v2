import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNumberGame } from "@/lib/stores/useNumberGame";
import { connectWebSocket } from "@/lib/websocket";

export function Menu() {
  const { setMode, startSingleplayer, setPlayerName } = useNumberGame();
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [playerName, setPlayerNameInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSingleplayer = () => {
    startSingleplayer();
  };

  const handleMultiplayerMenu = () => {
    setShowMultiplayer(true);
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("الرجاء إدخال اسمك");
      return;
    }
    setIsLoading(true);
    setPlayerName(playerName);
    setMode("multiplayer");
    connectWebSocket(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("الرجاء إدخال اسمك");
      return;
    }
    if (!roomId.trim()) {
      alert("الرجاء إدخال رقم الغرفة");
      return;
    }
    setIsLoading(true);
    setPlayerName(playerName);
    setMode("multiplayer");
    connectWebSocket(playerName, roomId.toUpperCase());
  };

  if (showMultiplayer) {
    if (isLoading) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
            <p className="text-white text-lg">جاري الاتصال...</p>
            <p className="text-gray-400 text-sm mt-2">يرجى الانتظار</p>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-purple-600">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">لعب متعدد اللاعبين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">اسمك</label>
              <Input
                type="text"
                placeholder="أدخل اسمك"
                value={playerName}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                className="bg-gray-800 text-white border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                إنشاء غرفة جديدة
              </Button>

              <div className="text-center text-gray-400 text-sm">أو</div>

              <Input
                type="text"
                placeholder="رقم الغرفة"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="bg-gray-800 text-white border-gray-700"
              />

              <Button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                الانضمام لغرفة
              </Button>
            </div>

            <Button
              onClick={() => {
                setShowMultiplayer(false);
                setIsLoading(false);
              }}
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-gray-800"
            >
              رجوع
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
                <span className="text-4xl">🎮</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-4xl font-bold mb-3">
            لعبة التخمين
          </CardTitle>
          <p className="text-center text-gray-300 text-base">
            خمن الرقم السري المكون من <span className="text-purple-400 font-bold">4 أرقام</span>
          </p>
          <p className="text-center text-gray-400 text-sm mt-1">
            لديك <span className="text-pink-400 font-semibold">20 محاولة</span> فقط!
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 p-6">
          <Button
            onClick={handleSingleplayer}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg py-7 rounded-2xl shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <span className="mr-3 text-2xl">🎯</span>
            لعب فردي
          </Button>

          <Button
            onClick={handleMultiplayerMenu}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-lg py-7 rounded-2xl shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <span className="mr-3 text-2xl">👥</span>
            لعب متعدد اللاعبين
          </Button>

          <div className="mt-6 p-5 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/20">
            <h3 className="text-white font-bold mb-3 text-lg flex items-center">
              <span className="mr-2 text-xl">📖</span>
              كيف تلعب:
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-purple-400 ml-2 mt-0.5">▸</span>
                <span>انقر على الشاشة لقفل المؤشر والدخول للعبة</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 ml-2 mt-0.5">▸</span>
                <span>استخدم الماوس للنظر حول الغرفة</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 ml-2 mt-0.5">▸</span>
                <span>استخدم <span className="text-pink-400 font-mono">W/A/S/D</span> للتحرك في الغرفة</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 ml-2 mt-0.5">▸</span>
                <span>انقر على الأرقام لبناء تخمينك ثم اضغط ✓</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
