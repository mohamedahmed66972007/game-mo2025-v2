import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNumberGame } from "@/lib/stores/useNumberGame";

export function LoseScreen() {
  const { singleplayer, restartSingleplayer, setMode } = useNumberGame();
  
  const attempts = singleplayer.attempts.length;
  const timeElapsed = singleplayer.endTime
    ? Math.floor((singleplayer.endTime - singleplayer.startTime) / 1000)
    : 0;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-red-900 to-red-950 border-red-600">
        <CardHeader>
          <CardTitle className="text-center text-white text-3xl">😔 خسرت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
              <p className="text-red-200 text-lg">عدد محاولاتك</p>
              <p className="text-white text-4xl font-bold">{attempts}</p>
            </div>

            <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
              <p className="text-red-200 text-lg">الوقت المستغرق</p>
              <p className="text-white text-4xl font-bold">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}s`}
              </p>
            </div>

            <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
              <p className="text-red-200 text-lg">الرقم السري كان</p>
              <p className="text-white text-4xl font-bold tracking-wider">
                {singleplayer.secretCode.join(" ")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={restartSingleplayer}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              لعب مرة أخرى
            </Button>

            <Button
              onClick={() => setMode("menu")}
              className="w-full bg-red-700 hover:bg-red-800 text-white"
              size="lg"
            >
              العودة للقائمة الرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
