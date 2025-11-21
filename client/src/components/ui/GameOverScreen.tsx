import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNumberGame } from "@/lib/stores/useNumberGame";

export function GameOverScreen() {
  const { multiplayer, setMode } = useNumberGame();

  const isWinner = multiplayer.phase === "won";
  const attempts = isWinner
    ? multiplayer.attempts.length
    : multiplayer.opponentAttempts.length;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <Card
        className={`w-full max-w-md mx-4 ${
          isWinner
            ? "bg-gradient-to-br from-green-900 to-green-950 border-green-600"
            : "bg-gradient-to-br from-red-900 to-red-950 border-red-600"
        }`}
      >
        <CardHeader>
          <CardTitle className="text-center text-white text-3xl">
            {isWinner ? "🎉 فزت! 🎉" : "😔 خسرت"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div
              className={`${
                isWinner ? "bg-green-800" : "bg-red-800"
              } bg-opacity-50 p-4 rounded-lg`}
            >
              <p
                className={`${
                  isWinner ? "text-green-200" : "text-red-200"
                } text-lg`}
              >
                {isWinner ? "عدد محاولاتك" : "عدد محاولات الخصم"}
              </p>
              <p className="text-white text-4xl font-bold">{attempts}</p>
            </div>

            {!isWinner && (
              <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
                <p className="text-red-200 text-lg">رقمك السري كان</p>
                <p className="text-white text-4xl font-bold tracking-wider">
                  {multiplayer.mySecretCode.join(" ")}
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={() => setMode("menu")}
            className={`w-full ${
              isWinner
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
            size="lg"
          >
            القائمة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
