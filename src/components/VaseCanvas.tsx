import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import Vase from "./Vase";
import { useVaseStore } from "../store/vaseStore";

interface VaseCanvasProps {
  meshRef?: React.RefObject<THREE.Mesh | null>;
}

function MeasuringTape({
  axis,
  length = 500,
  step = 50,
}: {
  axis: "x" | "y" | "z";
  length: number;
  step: number;
}) {
  const color = axis === "x" ? "#ff0000" : axis === "y" ? "#00ff00" : "#0000ff";

  // Create main axis line geometry
  const mainLineGeometry = new THREE.BufferGeometry();
  const mainLineVertices = new Float32Array([
    0,
    0,
    0,
    axis === "x" ? length : 0,
    axis === "y" ? length : 0,
    axis === "z" ? length : 0,
  ]);
  mainLineGeometry.setAttribute("position", new THREE.BufferAttribute(mainLineVertices, 3));
  const mainLine = new THREE.Line(mainLineGeometry, new THREE.LineBasicMaterial({ color }));

  // Create tick marks geometry with different sizes
  const tickVertices = [];
  for (let i = 0; i <= length; i += 10) {
    // Small ticks every 10mm
    const isLargeTick = i % 100 === 0;
    const isMediumTick = i % 50 === 0;
    const tickLength = isLargeTick ? 15 : isMediumTick ? 10 : 5;

    // Start point of tick
    tickVertices.push(axis === "x" ? i : 0, axis === "y" ? i : 0, axis === "z" ? i : 0);
    // End point of tick with varying lengths
    tickVertices.push(
      axis === "x" ? i : axis === "z" ? tickLength : 0,
      axis === "y" ? i : tickLength,
      axis === "z" ? i : axis === "y" ? tickLength : 0
    );
  }
  const tickGeometry = new THREE.BufferGeometry();
  tickGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(tickVertices), 3)
  );
  const tickLines = new THREE.LineSegments(tickGeometry, new THREE.LineBasicMaterial({ color }));

  return (
    <group>
      <primitive object={mainLine} />
      <primitive object={tickLines} />
      {/* Small labels every 10mm */}
      {Array.from({ length: Math.floor(length / 10) + 1 }, (_, i) => i * 10)
        .filter((value) => value % 50 !== 0) // Skip values that will have medium or large labels
        .map((value) => (
          <Text
            key={value}
            position={[
              axis === "x" ? value : axis === "z" ? 7 : 0,
              axis === "y" ? value : 7,
              axis === "z" ? value : axis === "y" ? 7 : 0,
            ]}
            fontSize={5}
            color={color}
            anchorX="left"
            anchorY="middle"
          >
            {value}
          </Text>
        ))}
      {/* Medium labels every 50mm */}
      {Array.from({ length: Math.floor(length / 50) + 1 }, (_, i) => i * 50)
        .filter((value) => value % 100 !== 0) // Skip values that will have large labels
        .map((value) => (
          <Text
            key={value}
            position={[
              axis === "x" ? value : axis === "z" ? 12 : 0,
              axis === "y" ? value : 12,
              axis === "z" ? value : axis === "y" ? 12 : 0,
            ]}
            fontSize={8}
            color={color}
            anchorX="left"
            anchorY="middle"
          >
            {value}
          </Text>
        ))}
      {/* Large labels every 100mm */}
      {Array.from({ length: Math.floor(length / 100) + 1 }, (_, i) => i * 100).map((value) => (
        <Text
          key={value}
          position={[
            axis === "x" ? value : axis === "z" ? 17 : 0,
            axis === "y" ? value : 17,
            axis === "z" ? value : axis === "y" ? 17 : 0,
          ]}
          fontSize={12}
          color={color}
          anchorX="left"
          anchorY="middle"
        >
          {value}mm
        </Text>
      ))}
    </group>
  );
}

export default function VaseCanvas({ meshRef }: VaseCanvasProps) {
  const parameters = useVaseStore((state) => state.parameters);
  const [showMeasurements, setShowMeasurements] = useState(false);

  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className="px-4 py-2 bg-white text-black rounded shadow hover:bg-gray-100"
        >
          {showMeasurements ? "Hide" : "Show"} Measurements
        </button>
      </div>
      <Canvas>
        <color attach="background" args={["#3f3f3f"]} />
        <PerspectiveCamera makeDefault position={[0, 0, 600]} /> {/* Increased camera distance */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.3} />
        <Suspense fallback={null}>
          <Vase parameters={parameters} meshRef={meshRef} />
          {showMeasurements && (
            <>
              <MeasuringTape axis="x" length={500} step={50} />
              <MeasuringTape axis="y" length={500} step={50} />
              <MeasuringTape axis="z" length={500} step={50} />
            </>
          )}
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={100}
          maxDistance={1500}
        />
      </Canvas>
    </>
  );
}
