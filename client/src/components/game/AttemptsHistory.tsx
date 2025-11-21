import { useState, useRef, useEffect } from "react";
import { Text, RoundedBox } from "@react-three/drei";
import { useNumberGame } from "@/lib/stores/useNumberGame";

function getFeedbackTextShort(correctCount: number, correctPositionCount: number): string {
  if (correctCount === 0) return "ولا رقم صح";
  const correctInWrongPosition = correctCount - correctPositionCount;
  
  if (correctPositionCount === 4) return "فوز!";
  if (correctPositionCount === 0) return `${correctCount} صح - مكان غلط`;
  if (correctInWrongPosition === 0) return `${correctPositionCount} صح - مكان صح`;
  return `${correctCount} صح - ${correctPositionCount} مكان صح`;
}

function getFeedbackColor(correctCount: number, correctPositionCount: number): string {
  // أحمر: لا أرقام صحيحة
  if (correctCount === 0) return "#ef4444";
  
  // أخضر: 2+ أرقام صحيحة في الموضع الصحيح
  if (correctPositionCount >= 2) return "#10b981";
  
  // برتقالي: أرقام صح (سواء مكانهم غلط أو مختلط)
  return "#f97316";
}

export function AttemptsHistory() {
  const { mode, singleplayer, multiplayer } = useNumberGame();
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollRef = useRef(0);

  if (mode !== "singleplayer" && mode !== "multiplayer") {
    return null;
  }

  const attempts = mode === "singleplayer" ? singleplayer.attempts : multiplayer.attempts;
  const attemptCount = attempts.length;
  const itemHeight = 0.65;
  const panelWidth = 5.5;
  const panelHeight = 4.5;
  const maxVisibleItems = 5;
  
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // التمرير بسرعة أكبر عشان يكون سلس زي التليفون
      const maxScroll = Math.max(0, attemptCount - maxVisibleItems) * itemHeight;
      scrollRef.current = Math.max(0, Math.min(maxScroll, scrollRef.current + e.deltaY * 0.008));
      setScrollOffset(scrollRef.current);
    };

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'PageDown' || (e.key === 'ArrowDown' && e.shiftKey)) {
        e.preventDefault();
        const maxScroll = Math.max(0, attemptCount - maxVisibleItems) * itemHeight;
        scrollRef.current = Math.max(0, Math.min(maxScroll, scrollRef.current + itemHeight * 2));
        setScrollOffset(scrollRef.current);
      } else if (e.key === 'PageUp' || (e.key === 'ArrowUp' && e.shiftKey)) {
        e.preventDefault();
        const maxScroll = Math.max(0, attemptCount - maxVisibleItems) * itemHeight;
        scrollRef.current = Math.max(0, Math.min(maxScroll, scrollRef.current - itemHeight * 2));
        setScrollOffset(scrollRef.current);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // كليك يمين مطول للسحب
      if (e.button === 2) { // 2 = right mouse button
        isDragging.current = true;
        dragStartY.current = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const deltaY = e.clientY - dragStartY.current;
      const maxScroll = Math.max(0, attemptCount - maxVisibleItems) * itemHeight;
      // عكس الاتجاه - لما تسحب لأسفل يرفع للأعلى
      scrollRef.current = Math.max(0, Math.min(maxScroll, scrollRef.current - deltaY * 0.008));
      setScrollOffset(scrollRef.current);
      dragStartY.current = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      // منع ظهور القائمة الافتراضية للكليك اليمين
      e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyboard);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyboard);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [attemptCount, maxVisibleItems, itemHeight]);

  const startIndex = Math.floor(scrollOffset / itemHeight);
  const visibleAttempts = attempts.slice(startIndex, startIndex + maxVisibleItems);

  const maxScroll = Math.max(0, (attemptCount - maxVisibleItems) * itemHeight);
  const scrollProgress = maxScroll > 0 ? scrollOffset / maxScroll : 0;

  return (
    <group position={[5, 2.8, -9.5]}>
      {/* خلفية اللوحة */}
      <RoundedBox
        args={[3.3, panelHeight, 0.25]}
        radius={0.18}
        smoothness={6}
        castShadow
      >
        <meshStandardMaterial 
          color="#f8fafc"
          metalness={0.15}
          roughness={0.6}
          emissive="#cbd5e1"
          emissiveIntensity={0.1}
        />
      </RoundedBox>

      {/* شريط التمرير الجانبي */}
      {attemptCount > maxVisibleItems && (
        <>
          {/* خلفية شريط التمرير */}
          <RoundedBox
            args={[0.2, panelHeight - 0.6, 0.15]}
            radius={0.1}
            smoothness={6}
            position={[1.6, -0.15, 0.15]}
          >
            <meshStandardMaterial 
              color="#f0f4ff"
              metalness={0.15}
              roughness={0.6}
              emissive="#cbd5e1"
              emissiveIntensity={0.08}
            />
          </RoundedBox>

          {/* مؤشر التمرير */}
          <RoundedBox
            args={[0.2, Math.max(0.3, (panelHeight - 0.6) * (maxVisibleItems / attemptCount)), 0.16]}
            radius={0.1}
            smoothness={6}
            position={[1.6, (panelHeight / 2 - 1) - scrollProgress * (Math.max(0, panelHeight - 0.6 - ((panelHeight - 0.6) * (maxVisibleItems / attemptCount)))), 0.16]}
          >
            <meshStandardMaterial 
              color="#818cf8"
              metalness={0.15}
              roughness={0.4}
              emissive="#818cf8"
              emissiveIntensity={0.3}
            />
          </RoundedBox>
        </>
      )}

      {/* عنوان اللوحة */}
      <Text
        position={[0, panelHeight / 2 - 0.5, 0.15]}
        fontSize={0.32}
        color="#4338ca"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        المحاولات ({attemptCount}/20)
      </Text>

      {/* خط فاصل */}
      <RoundedBox
        args={[3.2, 0.02, 0.02]}
        radius={0.01}
        smoothness={4}
        position={[0, panelHeight / 2 - 0.85, 0.12]}
      >
        <meshStandardMaterial 
          color="#818cf8"
          emissive="#818cf8"
          emissiveIntensity={0.5}
        />
      </RoundedBox>

      {/* قائمة المحاولات - مع clipping */}
      <group position={[0, 0, 0]}>
        {/* قناع clipping للمحاولات */}
        {visibleAttempts.map((attempt, visibleIndex) => {
          const globalIndex = startIndex + visibleIndex;
          const guessText = attempt.guess.join(" ");
          const feedbackText = getFeedbackTextShort(attempt.correctCount, attempt.correctPositionCount);
          const feedbackColor = getFeedbackColor(attempt.correctCount, attempt.correctPositionCount);
          const yPosition = panelHeight / 2 - 1.5 - visibleIndex * itemHeight;

          return (
            <group key={globalIndex} position={[0, yPosition, 0]}>
              {/* خلفية صف المحاولة */}
              <RoundedBox
                args={[3.05, itemHeight - 0.08, 0.08]}
                radius={0.1}
                smoothness={6}
                position={[0, 0, 0.08]}
              >
                <meshStandardMaterial 
                  color={globalIndex % 2 === 0 ? "#f0f4ff" : "#ffffff"}
                  transparent
                  opacity={0.7}
                  metalness={0.3}
                  roughness={0.2}
                />
              </RoundedBox>

              <Text
                position={[-1.35, 0.12, 0.15]}
                fontSize={0.18}
                color="#6366f1"
                anchorX="left"
                anchorY="middle"
                fontWeight="bold"
              >
                #{globalIndex + 1}
              </Text>

              <Text
                position={[-0.35, 0.12, 0.15]}
                fontSize={0.22}
                color="#1e293b"
                anchorX="left"
                anchorY="middle"
                fontWeight="bold"
              >
                {guessText}
              </Text>

              <Text
                position={[1.2, -0.08, 0.15]}
                fontSize={0.14}
                color={feedbackColor}
                anchorX="right"
                anchorY="middle"
                fontWeight="bold"
              >
                {feedbackText}
              </Text>
            </group>
          );
        })}
      </group>


      {attemptCount === 0 && (
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.24}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          لا توجد محاولات بعد
        </Text>
      )}
    </group>
  );
}
