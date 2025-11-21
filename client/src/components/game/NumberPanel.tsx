import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useNumberGame } from "@/lib/stores/useNumberGame";
import { useAudio } from "@/lib/stores/useAudio";
import { send } from "@/lib/websocket";
import { DisplayPanel } from "./DisplayPanel";

interface ButtonProps {
  position: [number, number, number];
  digit: number;
  onClick: (digit: number) => void;
}

function NumberButton({ position, digit, onClick }: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.setScalar(1.08);
      meshRef.current.position.z = 0.12;
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
      meshRef.current.position.z = 0;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.85, 0.85, 0.25]}
        radius={0.15}
        smoothness={6}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick(digit);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
        }}
        castShadow
      >
        <meshStandardMaterial 
          color={hovered ? "#7c3aed" : "#8b5cf6"}
          metalness={0.2}
          roughness={0.4}
          emissive={hovered ? "#5b21b6" : "#000000"}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.35]}
        fontSize={0.48}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {digit}
      </Text>
    </group>
  );
}

interface DeleteButtonProps {
  position: [number, number, number];
  onClick: () => void;
}

function DeleteButton({ position, onClick }: DeleteButtonProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.setScalar(1.08);
      meshRef.current.position.z = 0.12;
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
      meshRef.current.position.z = 0;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.85, 0.85, 0.25]}
        radius={0.15}
        smoothness={6}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
        }}
        castShadow
      >
        <meshStandardMaterial 
          color={hovered ? "#dc2626" : "#ef4444"}
          metalness={0.2}
          roughness={0.4}
          emissive={hovered ? "#991b1b" : "#000000"}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.35]}
        fontSize={0.42}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ✕
      </Text>
    </group>
  );
}

interface ConfirmButtonProps {
  position: [number, number, number];
  onClick: () => void;
  enabled: boolean;
}

function ConfirmButton({ position, onClick, enabled }: ConfirmButtonProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && hovered && enabled) {
      meshRef.current.scale.setScalar(1.08);
      meshRef.current.position.z = 0.12;
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
      meshRef.current.position.z = 0;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.85, 0.85, 0.25]}
        radius={0.15}
        smoothness={6}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (enabled) {
            e.stopPropagation();
            onClick();
          }
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          if (enabled) {
            e.stopPropagation();
            setHovered(true);
          }
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
        }}
        castShadow
      >
        <meshStandardMaterial 
          color={enabled ? (hovered ? "#059669" : "#10b981") : "#9ca3af"}
          metalness={0.2}
          roughness={0.4}
          emissive={enabled && hovered ? "#047857" : "#000000"}
          emissiveIntensity={enabled && hovered ? 0.4 : 0}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.35]}
        fontSize={0.42}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ✓
      </Text>
    </group>
  );
}

export function NumberPanel() {
  const { mode, singleplayer, multiplayer, addDigitToGuess, deleteLastDigit, submitGuess, addMultiplayerDigit, deleteMultiplayerDigit, submitMultiplayerGuess } = useNumberGame();
  const { playHit } = useAudio();

  const handleDigitClick = (digit: number) => {
    playHit();
    if (mode === "singleplayer") {
      addDigitToGuess(digit);
    } else if (mode === "multiplayer" && multiplayer.isMyTurn) {
      addMultiplayerDigit(digit);
    }
  };

  const handleDeleteClick = () => {
    playHit();
    if (mode === "singleplayer") {
      deleteLastDigit();
    } else if (mode === "multiplayer" && multiplayer.isMyTurn) {
      deleteMultiplayerDigit();
    }
  };

  const handleConfirmClick = () => {
    playHit();
    if (mode === "singleplayer") {
      submitGuess();
    } else if (mode === "multiplayer" && multiplayer.isMyTurn) {
      submitMultiplayerGuess();
      send({
        type: "submit_guess",
        opponentId: multiplayer.opponentId,
        guess: multiplayer.currentGuess,
      });
    }
  };

  const currentGuess = mode === "singleplayer" ? singleplayer.currentGuess : multiplayer.currentGuess;
  const canConfirm = currentGuess.length === 4 && (mode === "singleplayer" || multiplayer.isMyTurn);

  return (
    <group position={[0, 3.5, -9.5]}>
      {/* Display screen - شاشة عرض فوق الأرقام */}
      <DisplayPanel />

      {/* Row 1: 1 2 3 */}
      {[1, 2, 3].map((digit, idx) => (
        <NumberButton
          key={digit}
          position={[(idx - 1) * 1.05, 0.8, 0.3]}
          digit={digit}
          onClick={handleDigitClick}
        />
      ))}
      
      {/* Row 2: 4 5 6 */}
      {[4, 5, 6].map((digit, idx) => (
        <NumberButton
          key={digit}
          position={[(idx - 1) * 1.05, -0.3, 0.3]}
          digit={digit}
          onClick={handleDigitClick}
        />
      ))}

      {/* Row 3: 7 8 9 */}
      {[7, 8, 9].map((digit, idx) => (
        <NumberButton
          key={digit}
          position={[(idx - 1) * 1.05, -1.4, 0.3]}
          digit={digit}
          onClick={handleDigitClick}
        />
      ))}

      {/* Row 4: Delete - 0 - Confirm */}
      <DeleteButton position={[-1.05, -2.5, 0.3]} onClick={handleDeleteClick} />
      <NumberButton
        position={[0, -2.5, 0.3]}
        digit={0}
        onClick={handleDigitClick}
      />
      <ConfirmButton position={[1.05, -2.5, 0.3]} onClick={handleConfirmClick} enabled={canConfirm} />
    </group>
  );
}
