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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-purple-600">
        <CardHeader>
          <CardTitle className="text-center text-white text-2xl">اختر الرقم السري</CardTitle>
          <p className="text-center text-gray-400 text-sm mt-2">
            اختر 4 أرقام ليخمنها خصمك
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-purple-400 text-3xl font-mono tracking-widest">
              {displayText}{emptyText}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <Button
                key={digit}
                onClick={() => handleDigitClick(digit)}
                disabled={code.length >= 4}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xl h-12"
              >
                {digit}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={code.length === 0}
              variant="outline"
              className="flex-1 border-red-600 text-white hover:bg-red-900"
            >
              حذف
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={code.length !== 4}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              تأكيد
            </Button>
          </div>

          {multiplayer.mySecretCode.length === 4 && (
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border border-blue-600">
              <p className="text-blue-200 text-center">
                في انتظار الخصم...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
