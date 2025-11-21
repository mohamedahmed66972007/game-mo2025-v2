import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { useNumberGame } from "@/lib/stores/useNumberGame";

export function OpponentAttemptsDialog() {
  const showOpponentAttempts = useNumberGame((state) => state.multiplayer.showOpponentAttempts);
  const setShowOpponentAttempts = useNumberGame((state) => state.setShowOpponentAttempts);
  const opponentAttempts = useNumberGame((state) => state.multiplayer.opponentAttempts);

  return (
    <Dialog open={showOpponentAttempts} onOpenChange={setShowOpponentAttempts}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto bg-gradient-to-br from-indigo-900/95 to-purple-900/95 border-purple-500">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">محاولات الخصم</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {opponentAttempts.map((attempt, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 p-4 rounded-lg border border-purple-400/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-2">المحاولة #{index + 1}</p>
                  <p className="text-white text-2xl font-bold tracking-wider">
                    {attempt.guess.join(" ")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-400/30">
                    <p className="text-blue-200 text-xs mb-1">أرقام صحيحة</p>
                    <p className="text-white text-2xl font-bold">{attempt.correctCount}</p>
                  </div>
                  <div className="bg-green-900/50 p-3 rounded-lg border border-green-400/30 mt-2">
                    <p className="text-green-200 text-xs mb-1">في المكان الصحيح</p>
                    <p className="text-white text-2xl font-bold">{attempt.correctPositionCount}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
