import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNumberGame } from "@/lib/stores/useNumberGame";
import { send } from "@/lib/websocket";

export function SecretCodeSetup() {
  const { multiplayer, setMySecretCode } = useNumberGame();
  const [code, setCode] = useState<number[]>([]);

  const handleDigitClick = (digit: number) => {
    if (code.length < 4) {
      setCode([...code, digit]);
    }
  };

  const handleDelete = () => {
    if (code.length > 0) {
      setCode(code.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    if (code.length === 4 && multiplayer.opponentId) {
      setMySecretCode(code);
      setCode([]);
      send({
        type: "set_secret_code",
        opponentId: multiplayer.opponentId,
        code,
      });
    }
  };

  const displayText = code.map((d) => d.toString()).join("  ");
  const emptySlots = 4 - code.length;
  const emptyText = "_  ".repeat(emptySlots);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 z-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <Card className="w-full max-w-lg mx-4 bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
        
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/50 transform rotate-6">
                <span className="text-4xl">🔒</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 text-4xl font-bold mb-3">
            اختر الرقم السري
          </CardTitle>
          <p className="text-center text-gray-300 text-base">
            اختر <span className="text-purple-400 font-bold">4 أرقام</span> ليخمنها خصمك
          </p>
        </CardHeader>
        
        <CardContent className="space-y-5 p-6">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
            <p className="text-purple-400 text-5xl font-mono tracking-[0.5em] text-center font-bold">
              {displayText}{emptyText}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <Button
                key={digit}
                onClick={() => handleDigitClick(digit)}
                disabled={code.length >= 4}
                className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 text-white text-2xl h-16 rounded-xl shadow-lg shadow-purple-500/20 transform hover:scale-105 transition-all duration-200 font-bold"
              >
                {digit}
              </Button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDelete}
              disabled={code.length === 0}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 text-white font-semibold py-6 rounded-xl shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2 text-xl">🗑️</span>
              حذف
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={code.length !== 4}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 text-white font-semibold py-6 rounded-xl shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2 text-xl">✓</span>
              تأكيد
            </Button>
          </div>

          {multiplayer.mySecretCode.length === 4 && (
            <div className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 p-5 rounded-2xl border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 animate-pulse">
              <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
              <p className="text-blue-200 text-center font-semibold text-lg">
                في انتظار الخصم...
              </p>
              <p className="text-blue-300 text-center text-sm mt-2">
                يرجى الانتظار حتى يدخل خصمك رقمه السري
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
