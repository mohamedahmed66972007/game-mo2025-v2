import { Text, RoundedBox } from "@react-three/drei";
import { useNumberGame } from "@/lib/stores/useNumberGame";

export function DisplayPanel() {
  const { mode, singleplayer, multiplayer } = useNumberGame();
  const currentGuess = mode === "singleplayer" ? singleplayer.currentGuess : multiplayer.currentGuess;

  const displayText = currentGuess.map((d) => d.toString()).join("  ");
  const emptySlots = 4 - currentGuess.length;
  const emptyText = "_  ".repeat(emptySlots);

  return (
    <group position={[0, 2.2, 0]}>
      <RoundedBox
        args={[3.2, 0.65, 0.2]}
        radius={0.12}
        smoothness={6}
        castShadow
      >
        <meshStandardMaterial 
          color="#1e293b"
          metalness={0.3}
          roughness={0.5}
          emissive="#334155"
          emissiveIntensity={0.3}
        />
      </RoundedBox>
      
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.42}
        color="#f1f5f9"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.12}
      >
        {displayText}{emptyText}
      </Text>
    </group>
  );
}
