import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNumberGame } from "@/lib/stores/useNumberGame";
import { send } from "@/lib/websocket";

export function WinScreen() {
  const { mode, singleplayer, multiplayer, restartSingleplayer, setMode, setShowResults, setShowOpponentAttempts } = useNumberGame();
  
  const isSingleplayer = mode === "singleplayer";
  const attempts = isSingleplayer ? singleplayer.attempts.length : multiplayer.attempts.length;
  const timeElapsed = isSingleplayer
    ? (singleplayer.endTime ? Math.floor((singleplayer.endTime - singleplayer.startTime) / 1000) : 0)
    : (multiplayer.endTime ? Math.floor((multiplayer.endTime - multiplayer.startTime) / 1000) : 0);
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const secretCode = isSingleplayer ? singleplayer.secretCode : multiplayer.opponentSecretCode;
  const isMultiplayer = mode === "multiplayer";
  const isTie = multiplayer.gameResult === "tie";

  const handleRematch = () => {
    send({ type: "request_rematch", opponentId: multiplayer.opponentId });
  };

  const handleBackToLobby = () => {
    setShowResults(false);
    setMode("menu");
  };

  const handleShowOpponentAttempts = () => {
    setShowOpponentAttempts(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 z-50">
      <Card className="w-full max-w-2xl mx-4 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-purple-500 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <CardTitle className="text-white text-5xl font-bold mb-2">
              {isTie ? "تعادل!" : "لقد فزت!"}
            </CardTitle>
            {isMultiplayer && isTie && (
              <p className="text-purple-200 text-lg">كلاكما خمنتم الرقم السري في نفس عدد المحاولات</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-6 rounded-xl border border-purple-400/30">
              <p className="text-purple-200 text-lg mb-2">محاولاتك</p>
              <p className="text-white text-5xl font-bold">{attempts}</p>
            </div>

            {isMultiplayer && multiplayer.opponentAttempts && (
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-6 rounded-xl border border-purple-400/30">
                <p className="text-purple-200 text-lg mb-2">محاولات الخصم</p>
                <p className="text-white text-5xl font-bold">{multiplayer.opponentAttempts.length}</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-6 rounded-xl border border-purple-400/30">
              <p className="text-purple-200 text-lg mb-2">الوقت المستغرق</p>
              <p className="text-white text-4xl font-bold">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}ث`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-6 rounded-xl border border-purple-400/30">
              <p className="text-purple-200 text-lg mb-2">الرقم السري للخصم</p>
              <p className="text-white text-5xl font-bold tracking-wider">
                {secretCode.join(" ")}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {isMultiplayer ? (
              <>
                <Button
                  onClick={handleShowOpponentAttempts}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg py-6"
                  size="lg"
                >
                  عرض محاولات الخصم
                </Button>
                <Button
                  onClick={handleRematch}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
                  size="lg"
                >
                  طلب إعادة المباراة
                </Button>
                <Button
                  onClick={handleBackToLobby}
                  className="w-full bg-purple-700/50 hover:bg-purple-700 text-white text-lg py-6 border border-purple-400/50"
                  size="lg"
                >
                  العودة للقائمة
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={restartSingleplayer}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
                  size="lg"
                >
                  لعب مرة أخرى
                </Button>
                <Button
                  onClick={() => setMode("menu")}
                  className="w-full bg-purple-700/50 hover:bg-purple-700 text-white text-lg py-6 border border-purple-400/50"
                  size="lg"
                >
                  العودة للقائمة الرئيسية
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
