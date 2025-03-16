import { useMemo, useRef, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { VaseParameters } from "../store/vaseStore";
import { createNoise2D } from "simplex-noise";
import { evaluate, compile } from "mathjs";
import { exportVaseAsSTL } from "../utils/exportSTL";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

interface VaseProps {
  parameters: VaseParameters;
}

// Validate and compile formula
function compileFormula(formula: string, defaultValue: string) {
  try {
    // Test the formula with sample values
    const scope = { r: 1, y: 1, height: 1, angle: 1, pi: Math.PI };
    evaluate(formula, scope);
    return compile(formula);
  } catch (error) {
    console.error("Invalid formula:", error);
    return compile(defaultValue);
  }
}

export default function Vase({ parameters }: VaseProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Compile formulas once
  const compiledRadiusFormula = useMemo(
    () => compileFormula(parameters.radiusFormula, "r"),
    [parameters.radiusFormula]
  );

  const compiledVerticalFormula = useMemo(
    () => compileFormula(parameters.verticalDeformationFormula, "y"),
    [parameters.verticalDeformationFormula]
  );

  // Create geometry
  const geometry = useMemo(() => {
    const {
      height,
      topDiameter,
      bottomDiameter,
      radialWaveType,
      radialFrequency,
      radialAmplitude,
      verticalWaveType,
      verticalFrequency,
      verticalAmplitude,
      twistAngle,
      twistRate,
      twistDirection,
      surfaceNoiseType,
      surfaceNoiseScale,
      surfaceNoiseAmount,
      radialSegments,
      verticalSegments,
    } = parameters;

    // Create a parametric geometry
    const parametricGeometry = new ParametricGeometry(
      (u: number, v: number, target: THREE.Vector3) => {
        // v goes from 0 to 1 (bottom to top)
        // u goes from 0 to 1 (around the circumference)

        const angle = u * Math.PI * 2;
        const heightFactor = v;

        // Calculate base radius
        const baseRadius = THREE.MathUtils.lerp(bottomDiameter / 2, topDiameter / 2, heightFactor);

        // Apply radial waves
        let radius = baseRadius;
        const waveFunction = getWaveFunction(radialWaveType);
        radius += radialAmplitude * waveFunction(angle * radialFrequency);

        // Apply vertical waves
        const verticalWaveFunction = getWaveFunction(verticalWaveType);
        const verticalOffset =
          verticalAmplitude * verticalWaveFunction(heightFactor * verticalFrequency * Math.PI * 2);

        // Apply twist
        const twistFactor = twistDirection === "clockwise" ? 1 : -1;
        const twistAmount =
          twistRate === "linear"
            ? heightFactor * twistAngle
            : Math.pow(heightFactor, 2) * twistAngle;
        const twistedAngle = angle + (twistFactor * twistAmount * Math.PI) / 180;

        // Apply surface noise if enabled
        let noiseOffset = 0;
        if (surfaceNoiseType !== "none") {
          const noise2D = createNoise2D();
          noiseOffset =
            noise2D(u * surfaceNoiseScale * 10, v * surfaceNoiseScale * 10) * surfaceNoiseAmount;
        }

        // Apply custom formulas
        const scope = {
          r: radius,
          y: height * heightFactor,
          height,
          angle: twistedAngle,
          pi: Math.PI,
        };

        try {
          radius = compiledRadiusFormula.evaluate(scope);
          const verticalDef = compiledVerticalFormula.evaluate(scope);
          const y = height * heightFactor + verticalDef + verticalOffset;

          // Calculate final position
          const x = (radius + noiseOffset) * Math.cos(twistedAngle);
          const z = (radius + noiseOffset) * Math.sin(twistedAngle);

          target.set(x, y, z);
        } catch (error) {
          console.error("Error evaluating formula:", error);
          // Fallback to basic shape on error
          const x = radius * Math.cos(twistedAngle);
          const z = radius * Math.sin(twistedAngle);
          const y = height * heightFactor + verticalOffset;
          target.set(x, y, z);
        }
      },
      radialSegments,
      verticalSegments
    );

    // Compute vertex normals for proper lighting
    parametricGeometry.computeVertexNormals();

    return parametricGeometry;
  }, [parameters, compiledRadiusFormula, compiledVerticalFormula]);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
  }, []);

  // Add export button
  const handleExport = () => {
    if (meshRef.current) {
      exportVaseAsSTL(meshRef.current.geometry);
    }
  };

  // Add export button to the scene
  return (
    <>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <Html position={[0, -parameters.height / 2 - 50, 0]}>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export STL
        </button>
      </Html>
    </>
  );
}

// Helper function to get wave function based on type
function getWaveFunction(type: "sine" | "square" | "triangle" | "sawtooth") {
  switch (type) {
    case "sine":
      return Math.sin;
    case "square":
      return (x: number) => Math.sign(Math.sin(x));
    case "triangle":
      return (x: number) => {
        const t = ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        return 2 * Math.abs(2 * (t / (2 * Math.PI) - Math.floor(t / (2 * Math.PI) + 0.5)));
      };
    case "sawtooth":
      return (x: number) => {
        const t = ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        return t / Math.PI - 1;
      };
    default:
      return Math.sin;
  }
}
