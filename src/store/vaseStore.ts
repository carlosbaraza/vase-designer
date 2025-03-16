import { create } from "zustand";

export interface VaseParameters {
  // Basic parameters
  height: number;
  topDiameter: number;
  bottomDiameter: number;

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
  exportConfiguration: () => string;
  importConfiguration: (config: string) => void;
}

const defaultParameters: VaseParameters = {
  height: 200,
  topDiameter: 80,
  bottomDiameter: 100,

  radialWaveType: "sine",
  radialFrequency: 5,
  radialAmplitude: 10,

  verticalWaveType: "sine",
  verticalFrequency: 3,
  verticalAmplitude: 5,

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
        height: randomInRange(100, 300),
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
    return JSON.stringify(get().parameters, null, 2);
  },

  importConfiguration: (config: string) => {
    try {
      const newParams = JSON.parse(config);
      set({ parameters: { ...defaultParameters, ...newParams } });
    } catch (error) {
      console.error("Failed to import configuration:", error);
    }
  },
}));
