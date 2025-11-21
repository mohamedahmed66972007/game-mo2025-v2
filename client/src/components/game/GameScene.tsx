import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { FirstPersonControls, Controls } from "./FirstPersonControls";
import { NumberPanel } from "./NumberPanel";
import { DisplayPanel } from "./DisplayPanel";
import { FeedbackPanel } from "./FeedbackPanel";
import { AttemptsHistory } from "./AttemptsHistory";
import { CurrentGuessDisplay } from "./CurrentGuessDisplay";
import { Crosshair } from "../ui/Crosshair";

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
      <mesh position={[0, 4, -10]} receiveShadow>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* الحائط الخلفي */}
      <mesh position={[0, 4, 10]} receiveShadow>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* الحائط الأيمن */}
      <mesh position={[10, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* الحائط الأيسر */}
      <mesh position={[-10, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 8, 0.5]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* السقف */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
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
          <div className="text-white text-sm bg-black bg-opacity-50 p-4 rounded text-center">
            <p className="mb-2">اضغط على الشاشة لقفل المؤشر</p>
            <p className="text-xs text-gray-400">WASD للحركة | الماوس للنظر</p>
          </div>
        </div>
      )}
      <Crosshair />
    </>
  );
}
