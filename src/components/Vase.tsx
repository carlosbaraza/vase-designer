import { useMemo, useRef, useCallback, forwardRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { VaseParameters } from "../store/vaseStore";
import { createNoise2D } from "simplex-noise";
import { evaluate, compile } from "mathjs";
import { exportVaseAsSTL } from "../utils/exportSTL";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

interface VaseProps {
  parameters: VaseParameters;
  meshRef?: React.RefObject<THREE.Mesh | null>;
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

export default function Vase({ parameters, meshRef: externalMeshRef }: VaseProps) {
  const internalMeshRef = useRef<THREE.Mesh>(null);
  const meshRef = externalMeshRef || internalMeshRef;

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
      topTabHeight,
      bottomTabHeight,
    } = parameters;

    // Create base parametric geometry
    const parametricGeometry = new ParametricGeometry(
      (u: number, v: number, target: THREE.Vector3) => {
        // v goes from 0 to 1 (bottom to top)
        // u goes from 0 to 1 (around the circumference)

        const angle = u * Math.PI * 2;
        const heightFactor = v;

        // Calculate base radius (keeping the same scale as height)
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
          y: (height / 2) * heightFactor,
          height: height / 2,
          angle: twistedAngle,
          pi: Math.PI,
        };

        try {
          radius = compiledRadiusFormula.evaluate(scope);
          const verticalDef = compiledVerticalFormula.evaluate(scope);
          const y = (height / 2) * heightFactor + verticalDef + verticalOffset;

          // Calculate final position
          const x = (radius + noiseOffset) * Math.cos(twistedAngle);
          const z = (radius + noiseOffset) * Math.sin(twistedAngle);

          target.set(x, y, z);
        } catch (error) {
          console.error("Error evaluating formula:", error);
          // Fallback to basic shape on error
          const x = radius * Math.cos(twistedAngle);
          const z = radius * Math.sin(twistedAngle);
          const y = (height / 2) * heightFactor + verticalOffset;
          target.set(x, y, z);
        }
      },
      radialSegments,
      verticalSegments
    );

    // Add tabs by extruding top and bottom profiles
    if (topTabHeight > 0 || bottomTabHeight > 0) {
      // Get the original vertices and faces
      const originalPositions = parametricGeometry.getAttribute("position");
      const originalIndices = parametricGeometry.getIndex();

      if (!originalIndices) {
        console.error("Geometry has no indices");
        return parametricGeometry;
      }

      // Calculate vertices per layer (radialSegments + 1 because we need to close the circle)
      const verticesPerLayer = radialSegments + 1;

      // Create arrays for new vertices and faces
      const newPositions = [];
      const newIndices = [];

      // Copy all original vertices and indices
      for (let i = 0; i < originalPositions.count; i++) {
        newPositions.push(
          originalPositions.getX(i),
          originalPositions.getY(i),
          originalPositions.getZ(i)
        );
      }
      for (let i = 0; i < originalIndices.count; i++) {
        newIndices.push(originalIndices.getX(i));
      }

      // Add bottom tab if needed
      if (bottomTabHeight > 0) {
        const bottomVertexStart = newPositions.length / 3;
        // Copy bottom profile vertices and move them down
        for (let i = 0; i < verticesPerLayer; i++) {
          newPositions.push(
            originalPositions.getX(i),
            originalPositions.getY(i) - bottomTabHeight,
            originalPositions.getZ(i)
          );
        }
        // Create faces connecting bottom profile to its extrusion
        for (let i = 0; i < radialSegments; i++) {
          const a = i;
          const b = i + 1;
          const c = bottomVertexStart + i + 1;
          const d = bottomVertexStart + i;
          // Add two triangles to form a quad
          newIndices.push(a, b, c);
          newIndices.push(c, d, a);
        }
      }

      // Add top tab if needed
      if (topTabHeight > 0) {
        const topLayerStart = verticesPerLayer * verticalSegments;
        const topVertexStart = newPositions.length / 3;
        // Copy top profile vertices and move them up
        for (let i = 0; i < verticesPerLayer; i++) {
          const vertexIndex = topLayerStart + i;
          newPositions.push(
            originalPositions.getX(vertexIndex),
            originalPositions.getY(vertexIndex) + topTabHeight,
            originalPositions.getZ(vertexIndex)
          );
        }
        // Create faces connecting top profile to its extrusion
        for (let i = 0; i < radialSegments; i++) {
          const a = topLayerStart + i;
          const b = topLayerStart + i + 1;
          const c = topVertexStart + i + 1;
          const d = topVertexStart + i;
          // Add two triangles to form a quad
          newIndices.push(a, c, b);
          newIndices.push(c, a, d);
        }
      }

      // Create new geometry with the added tabs
      const newGeometry = new THREE.BufferGeometry();
      newGeometry.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
      newGeometry.setIndex(newIndices);
      newGeometry.computeVertexNormals();

      return newGeometry;
    }

    // If no tabs needed, return original geometry
    parametricGeometry.computeVertexNormals();
    return parametricGeometry;
  }, [parameters, compiledRadiusFormula, compiledVerticalFormula]);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
  }, []);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

// Helper function to get wave function based on type
function getWaveFunction(type: "sine" | "square" | "triangle" | "sawtooth") {
  switch (type) {
    case "sine":
      return Math.sin;
    case "square":
      return (x: number) => {
        // Normalize angle to [0, 2π]
        const t = ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Simple square wave that's guaranteed to be the same at 0 and 2π
        return t < Math.PI ? 1 : -1;
      };
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
