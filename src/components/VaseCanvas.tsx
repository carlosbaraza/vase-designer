import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import Vase from "./Vase";
import { useVaseStore } from "../store/vaseStore";

interface VaseCanvasProps {
  meshRef?: React.RefObject<THREE.Mesh | null>;
}

export default function VaseCanvas({ meshRef }: VaseCanvasProps) {
  const parameters = useVaseStore((state) => state.parameters);

  return (
    <Canvas>
      <color attach="background" args={["#3f3f3f"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 400]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.3} />

      <Suspense fallback={null}>
        <Vase parameters={parameters} meshRef={meshRef} />
      </Suspense>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={100}
        maxDistance={1000}
      />
    </Canvas>
  );
}
