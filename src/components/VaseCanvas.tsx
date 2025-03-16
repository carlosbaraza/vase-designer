import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import Vase from "./Vase";
import { useVaseStore } from "../store/vaseStore";

export default function VaseCanvas() {
  const parameters = useVaseStore((state) => state.parameters);

  return (
    <Canvas>
      <color attach="background" args={["#f0f0f0"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 400]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      <Suspense fallback={null}>
        <Vase parameters={parameters} />
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
