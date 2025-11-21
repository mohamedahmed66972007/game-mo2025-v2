import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Text, RoundedBox } from "@react-three/drei";
import { FirstPersonControls, Controls } from "./FirstPersonControls";
import { NumberPanel } from "./NumberPanel";
import { DisplayPanel } from "./DisplayPanel";
import { FeedbackPanel } from "./FeedbackPanel";
import { AttemptsHistory } from "./AttemptsHistory";
import { CurrentGuessDisplay } from "./CurrentGuessDisplay";
import { Crosshair } from "../ui/Crosshair";
import { useNumberGame } from "@/lib/stores/useNumberGame";

function BackWallStatus() {
  const opponentStatus = useNumberGame((state) => state.multiplayer.opponentStatus);
  const opponentWonFirst = useNumberGame((state) => state.multiplayer.opponentWonFirst);
  const mode = useNumberGame((state) => state.mode);

  // Only show in multiplayer mode
  if (mode !== "multiplayer") return null;

  return (
    <Text
      position={[0, 4, 12.6]}
      rotation={[0, Math.PI, 0]}
      outlineWidth={0.08}
      outlineColor="black"
      fontSize={0.4}
      color={opponentWonFirst ? "#ef4444" : "#10b981"}
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
      maxWidth={10}
    >
      {opponentStatus}
    </Text>
  );
}

function PendingWinStatus() {
  const pendingWin = useNumberGame((state) => state.multiplayer.pendingWin);
  const pendingWinMessage = useNumberGame((state) => state.multiplayer.pendingWinMessage);
  const mode = useNumberGame((state) => state.mode);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!pendingWin) return;
    const interval = setInterval(() => {
      setOpacity((prev) => prev === 1 ? 0.3 : 1);
    }, 600);
    return () => clearInterval(interval);
  }, [pendingWin]);

  if (mode !== "multiplayer" || !pendingWin) return null;

  return (
    <group position={[0, 2, -7]}>
      {/* Glowing rounded box background */}
      <RoundedBox
        args={[3.2, 1.3, 0.15]}
        radius={0.2}
        smoothness={6}
      >
        <meshStandardMaterial 
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={opacity * 0.5}
          metalness={0.3}
          roughness={0.3}
        />
      </RoundedBox>
      
      {/* Text on top */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        maxWidth={2.8}
        anchorZ={0.5}
        lineHeight={1.3}
      >
        {pendingWinMessage}
      </Text>
    </group>
  );
}

function Scene({ onLockChange, isPointerLocked = false }: { onLockChange?: (locked: boolean) => void; isPointerLocked?: boolean }) {
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      onLockChange?.(isLocked);
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
    };
  }, [onLockChange]);

  return (
    <>
      {/* خلفية بيضاء فاتحة */}
      <color attach="background" args={["#f8f9fa"]} />
      
      {/* إضاءة محيطة ناعمة */}
      <ambientLight intensity={1.5} />
      
      {/* إضاءة رئيسية من الأعلى */}
      <directionalLight 
        position={[0, 10, 0]} 
        intensity={2} 
        color="#ffffff"
        castShadow
      />
      
      {/* إضاءة جانبية لإظهار الانعكاسات */}
      <pointLight position={[8, 3, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-8, 3, 0]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 3, 8]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 3, -8]} intensity={0.8} color="#ffffff" />
      
      {/* أرضية بيضاء مع انعكاس */}
      <mesh 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.2}
          roughness={0.05}
          envMapIntensity={1}
        />
      </mesh>

      {/* الحائط الأمامي (الذي يواجه اللاعب) - سيحتوي على لوحة الأرقام */}
      <mesh position={[0, 4, -13]} receiveShadow>
        <boxGeometry args={[27, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* الحائط الخلفي */}
      <mesh position={[0, 4, 13]} receiveShadow>
        <boxGeometry args={[27, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* الحائط الأيمن */}
      <mesh position={[13, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[27, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* الحائط الأيسر */}
      <mesh position={[-13, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[27, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* السقف */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[27, 27]} />
        <meshStandardMaterial 
          color="#fafafa" 
          metalness={0.1}
          roughness={0.4}
        />
      </mesh>

      <NumberPanel isPointerLocked={isPointerLocked} />
      <FeedbackPanel />
      <AttemptsHistory />
      <CurrentGuessDisplay />
      <BackWallStatus />
      <PendingWinStatus />
      
      <FirstPersonControls />
    </>
  );
}

const keyMap = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
];

export function GameScene() {
  const [isLocked, setIsLocked] = useState(false);
  const pendingWin = useNumberGame((state) => state.multiplayer.pendingWin);
  const pendingWinMessage = useNumberGame((state) => state.multiplayer.pendingWinMessage);

  return (
    <>
      <KeyboardControls map={keyMap}>
        <Canvas
          camera={{
            position: [0, 1.6, 0],
            fov: 60,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true,
          }}
        >
          <Scene onLockChange={setIsLocked} isPointerLocked={isLocked} />
        </Canvas>
      </KeyboardControls>
      {!isLocked && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-white text-sm bg-black bg-opacity-50 p-4 rounded text-top">
            <p className="mb-2">اضغط على الشاشة لقفل المؤشر</p>
          </div>
        </div>
      )}
      <Crosshair />
    </>
  );
}
