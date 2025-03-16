import { create } from "zustand";
import * as THREE from "three";
import { exportVaseAsSTL } from "../utils/exportSTL";

export interface VaseParameters {
  // Basic parameters
  height: number;
  topDiameter: number;
  bottomDiameter: number;

  // Tab parameters
  topTabHeight: number;
  bottomTabHeight: number;

  // Radial waves
  radialWaveType: "sine" | "square" | "triangle" | "sawtooth";
  radialFrequency: number;
  radialAmplitude: number;

  // Vertical waves
  verticalWaveType: "sine" | "square" | "triangle" | "sawtooth";
  verticalFrequency: number;
  verticalAmplitude: number;

  // Twist
  twistAngle: number;
  twistRate: "linear" | "exponential";
  twistDirection: "clockwise" | "counterclockwise";

  // Surface features
  surfaceNoiseType: "none" | "perlin" | "simplex" | "voronoi";
  surfaceNoiseScale: number;
  surfaceNoiseAmount: number;

  // Mesh settings
  radialSegments: number;
  verticalSegments: number;

  // Custom formulas
  radiusFormula: string;
  verticalDeformationFormula: string;
}

interface VaseStore {
  parameters: VaseParameters;
  setParameter: <K extends keyof VaseParameters>(key: K, value: VaseParameters[K]) => void;
  resetParameters: () => void;
  randomizeParameters: () => void;
  exportConfiguration: () => { json: string; filename: string };
  importConfiguration: (config: string) => void;
  exportSTL: (geometry: THREE.BufferGeometry) => void;
}

const defaultParameters: VaseParameters = {
  height: 120,
  topDiameter: 100,
  bottomDiameter: 120,

  topTabHeight: 0,
  bottomTabHeight: 0,

  radialWaveType: "sine",
  radialFrequency: 6,
  radialAmplitude: 3,

  verticalWaveType: "sine",
  verticalFrequency: 1,
  verticalAmplitude: 0,

  twistAngle: 0,
  twistRate: "linear",
  twistDirection: "clockwise",

  surfaceNoiseType: "none",
  surfaceNoiseScale: 1,
  surfaceNoiseAmount: 0,

  radialSegments: 128,
  verticalSegments: 128,

  radiusFormula: "r",
  verticalDeformationFormula: "y",
};

export const useVaseStore = create<VaseStore>((set, get) => ({
  parameters: { ...defaultParameters },

  setParameter: (key, value) => {
    set((state) => ({
      parameters: {
        ...state.parameters,
        [key]: value,
      },
    }));
  },

  resetParameters: () => {
    set({ parameters: { ...defaultParameters } });
  },

  randomizeParameters: () => {
    const randomInRange = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    set((state) => ({
      parameters: {
        ...state.parameters,
        height: randomInRange(100, 150),
        topDiameter: randomInRange(40, 120),
        bottomDiameter: randomInRange(60, 140),
        radialFrequency: randomInRange(3, 8),
        radialAmplitude: randomInRange(5, 20),
        verticalFrequency: randomInRange(2, 6),
        verticalAmplitude: randomInRange(3, 15),
        twistAngle: randomInRange(0, 360),
      },
    }));
  },

  exportConfiguration: () => {
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0");
    const filename = `${timestamp}-vase.json`;
    return {
      json: JSON.stringify(get().parameters, null, 2),
      filename,
    };
  },

  importConfiguration: (config: string) => {
    try {
      const newParams = JSON.parse(config);
      set({ parameters: { ...defaultParameters, ...newParams } });
    } catch (error) {
      console.error("Failed to import configuration:", error);
    }
  },

  exportSTL: (geometry: THREE.BufferGeometry) => {
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0");
    const filename = `${timestamp}-vase.stl`;
    exportVaseAsSTL(geometry, filename);

    // Also export the JSON configuration
    const { json } = get().exportConfiguration();
    const jsonBlob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(jsonBlob);
    link.download = `${timestamp}-vase.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
}));
