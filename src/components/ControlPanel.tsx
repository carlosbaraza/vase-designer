import { useVaseStore } from "../store/vaseStore";
import { useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import * as THREE from "three";

interface ControlPanelProps {
  meshRef?: React.RefObject<THREE.Mesh | null>;
}

export default function ControlPanel({ meshRef }: ControlPanelProps) {
  const {
    parameters,
    setParameter,
    resetParameters,
    randomizeParameters,
    exportConfiguration,
    importConfiguration,
    exportSTL,
  } = useVaseStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localRadiusFormula, setLocalRadiusFormula] = useState(parameters.radiusFormula);
  const [localVerticalFormula, setLocalVerticalFormula] = useState(
    parameters.verticalDeformationFormula
  );

  // Debounced formula updates
  const debouncedSetRadiusFormula = useCallback(
    debounce((formula: string) => {
      setParameter("radiusFormula", formula);
    }, 500),
    []
  );

  const debouncedSetVerticalFormula = useCallback(
    debounce((formula: string) => {
      setParameter("verticalDeformationFormula", formula);
    }, 500),
    []
  );

  const handleRadiusFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formula = e.target.value;
    setLocalRadiusFormula(formula);
    debouncedSetRadiusFormula(formula);
  };

  const handleVerticalFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formula = e.target.value;
    setLocalVerticalFormula(formula);
    debouncedSetVerticalFormula(formula);
  };

  // Add example radius formulas
  const radiusFormulaExamples = {
    Basic: "r",
    "Geometric Pattern": "r * (1 + 0.15 * (sin(6 * angle) * sin(8 * y/height * pi)))",
    "Organic Flow": "r * (1 + 0.2 * sin(3 * angle) + 0.15 * sin(5 * y/height * pi))",
    "Bulging Middle": "r * (1 + 0.3 * sin(y/height * pi))",
    "Double Bulge": "r * (1 + 0.25 * sin(2 * y/height * pi))",
    "Triple Bulge": "r * (1 + 0.2 * sin(3 * y/height * pi))",
    "Asymmetric Bulge": "r * (1 + 0.3 * (sin(y/height * pi) + 0.3 * sin(2 * y/height * pi)))",
    "Gentle Waves": "r * (1 + 0.15 * sin(4 * angle) * (1 - (y/height - 0.5)^2))",
    "Smooth Ripple": "r * (1 + 0.15 * sin(6 * angle + 8 * y/height * pi))",
    "Flowing Curves": "r * (1 + 0.2 * sin(4 * angle) * sin(3 * y/height * pi))",
    "Dancing Waves": "r * (1 + 0.25 * sin(3 * angle) * (0.5 + 0.5 * sin(4 * y/height * pi)))",
    "Elegant Twist": "r * (1 + 0.2 * sin(4 * (angle + 2 * y/height * pi)))",
    "Smooth Bell": "r * (1 + 0.4 * (1 - (y/height - 0.5)^2))",
    "Lower Bulge": "r * (1 + 0.35 * (1 - y/height)^1.5)",
    "Upper Bulge": "r * (1 + 0.35 * (y/height)^1.5)",
    Amphora: "r * (1 + 0.4 * sin(y/height * pi) * (1 - y/height))",
    "Wavy Bulge": "r * (1 + 0.3 * sin(y/height * pi) + 0.1 * sin(6 * angle))",
    "Spiral Bulge": "r * (1 + 0.25 * sin(y/height * pi) * (1 + 0.3 * sin(4 * angle)))",
    "Undulating Surface":
      "r * (1 + 0.2 * sin(5 * angle) * sin(6 * y/height * pi) + 0.1 * sin(y/height * pi))",
    "Gentle Hourglass": "r * (0.8 + 0.4 * sin(y/height * pi + pi/2))",
    "Perfect Sphere (needs tweaking)": "r + height/1.1 * sqrt(1.4 - ((2 * y/height  - 1))^2) - 46",
    "Spherical Bulge": "r * (1 + 0.5 * sin(pi * y/height))",
    "Oval Sphere": "r * (1 + 0.4 * sin(pi * y/height)) * (1 + 0.2 * sin(4 * angle))",
    "Squished Sphere": "r * (1 + 0.4 * sin(pi * y/height)) * (1 + 0.3 * cos(2 * angle))",
  };

  const handleRadiusFormulaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formula = e.target.value;
    setLocalRadiusFormula(formula);
    debouncedSetRadiusFormula(formula);
  };

  const handleExport = () => {
    const { json, filename } = exportConfiguration();
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = event.target?.result as string;
        importConfiguration(config);
        // Update local formula states with the imported values
        const importedConfig = JSON.parse(config);
        setLocalRadiusFormula(importedConfig.radiusFormula);
        setLocalVerticalFormula(importedConfig.verticalDeformationFormula);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      } catch (error) {
        console.error("Failed to import configuration:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Vase Parameters</h2>

      {/* Basic Parameters */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Parameters</h3>
        <div className="space-y-2">
          <label className="block">
            Height
            <input
              type="range"
              min="50"
              max="500"
              value={parameters.height}
              onChange={(e) => setParameter("height", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.height}mm</span>
          </label>

          <label className="block">
            Top Diameter
            <input
              type="range"
              min="20"
              max="200"
              value={parameters.topDiameter}
              onChange={(e) => setParameter("topDiameter", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.topDiameter}mm</span>
          </label>

          <label className="block">
            Bottom Diameter
            <input
              type="range"
              min="20"
              max="200"
              value={parameters.bottomDiameter}
              onChange={(e) => setParameter("bottomDiameter", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.bottomDiameter}mm</span>
          </label>

          <label className="block">
            Top Tab Height
            <input
              type="range"
              min="0"
              max="50"
              value={parameters.topTabHeight}
              onChange={(e) => setParameter("topTabHeight", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.topTabHeight}mm</span>
          </label>

          <label className="block">
            Bottom Tab Height
            <input
              type="range"
              min="0"
              max="50"
              value={parameters.bottomTabHeight}
              onChange={(e) => setParameter("bottomTabHeight", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.bottomTabHeight}mm</span>
          </label>
        </div>
      </section>

      {/* Wave Parameters */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Wave Parameters</h3>

        {/* Radial Waves */}
        <div className="space-y-2">
          <h4 className="font-medium">Radial Waves</h4>
          <select
            value={parameters.radialWaveType}
            onChange={(e) => setParameter("radialWaveType", e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
          </select>

          <label className="block">
            Frequency
            <input
              type="range"
              min="1"
              max="100"
              value={parameters.radialFrequency}
              onChange={(e) => setParameter("radialFrequency", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.radialFrequency}</span>
          </label>

          <label className="block">
            Amplitude
            <input
              type="range"
              step="0.1"
              min="0"
              max="50"
              value={parameters.radialAmplitude}
              onChange={(e) => setParameter("radialAmplitude", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.radialAmplitude}mm</span>
          </label>
        </div>

        {/* Vertical Waves */}
        <div className="space-y-2">
          <h4 className="font-medium">Vertical Waves</h4>
          <select
            value={parameters.verticalWaveType}
            onChange={(e) => setParameter("verticalWaveType", e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="sawtooth">Sawtooth</option>
          </select>

          <label className="block">
            Frequency
            <input
              type="range"
              min="1"
              max="20"
              value={parameters.verticalFrequency}
              onChange={(e) => setParameter("verticalFrequency", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.verticalFrequency}</span>
          </label>

          <label className="block">
            Amplitude
            <input
              type="range"
              min="0"
              max="50"
              value={parameters.verticalAmplitude}
              onChange={(e) => setParameter("verticalAmplitude", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.verticalAmplitude}mm</span>
          </label>
        </div>
      </section>

      {/* Twist Parameters */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Twist Parameters</h3>
        <div className="space-y-2">
          <label className="block">
            Twist Angle
            <input
              type="range"
              min="0"
              max="720"
              value={parameters.twistAngle}
              onChange={(e) => setParameter("twistAngle", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.twistAngle}°</span>
          </label>

          <select
            value={parameters.twistRate}
            onChange={(e) => setParameter("twistRate", e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="linear">Linear</option>
            <option value="exponential">Exponential</option>
          </select>

          <select
            value={parameters.twistDirection}
            onChange={(e) => setParameter("twistDirection", e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="clockwise">Clockwise</option>
            <option value="counterclockwise">Counterclockwise</option>
          </select>
        </div>
      </section>

      {/* Surface Features */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Surface Features</h3>
        <div className="space-y-2">
          <select
            value={parameters.surfaceNoiseType}
            onChange={(e) => setParameter("surfaceNoiseType", e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="none">None</option>
            <option value="perlin">Perlin Noise</option>
            <option value="simplex">Simplex Noise</option>
            <option value="voronoi">Voronoi</option>
          </select>

          <label className="block">
            Noise Scale
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={parameters.surfaceNoiseScale}
              onChange={(e) => setParameter("surfaceNoiseScale", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.surfaceNoiseScale}</span>
          </label>

          <label className="block">
            Noise Amount
            <input
              type="range"
              min="0"
              max="20"
              value={parameters.surfaceNoiseAmount}
              onChange={(e) => setParameter("surfaceNoiseAmount", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.surfaceNoiseAmount}mm</span>
          </label>
        </div>
      </section>

      {/* Custom Formulas */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Formulas</h3>

        {/* Radius Formula */}
        <div className="space-y-2">
          <h4 className="font-medium">Radius Formula</h4>
          <select
            value={
              Object.entries(radiusFormulaExamples).find(
                ([_, v]) => v === localRadiusFormula
              )?.[0] || ""
            }
            onChange={handleRadiusFormulaSelect}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select an example...</option>
            {Object.entries(radiusFormulaExamples).map(([name, formula]) => (
              <option key={name} value={formula}>
                {name}
              </option>
            ))}
          </select>
          <textarea
            value={localRadiusFormula}
            onChange={(e) => {
              setLocalRadiusFormula(e.target.value);
              debouncedSetRadiusFormula(e.target.value);
            }}
            className="w-full p-2 border rounded font-mono text-sm h-20 resize-y"
            placeholder="Enter radius formula..."
          />
          <p className="text-sm text-gray-600">
            Available variables: r (base radius), y (current height), height (total height), angle
            (in radians), pi (π), topRadius (top diameter/2), bottomRadius (bottom diameter/2)
          </p>
        </div>

        {/* Vertical Deformation Formula */}
        <div className="space-y-2">
          <h4 className="font-medium">Vertical Deformation Formula</h4>
          <textarea
            value={localVerticalFormula}
            onChange={(e) => {
              setLocalVerticalFormula(e.target.value);
              debouncedSetVerticalFormula(e.target.value);
            }}
            className="w-full p-2 border rounded font-mono text-sm h-20 resize-y"
            placeholder="Enter vertical deformation formula..."
          />
          <p className="text-sm text-gray-600">
            Available variables: r (base radius), y (current height), height (total height), angle
            (in radians), pi (π)
          </p>
        </div>
      </section>

      {/* Mesh Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Mesh Settings</h3>
        <div className="space-y-2">
          <label className="block">
            Radial Segments
            <input
              type="range"
              min="16"
              max="512"
              step="8"
              value={parameters.radialSegments}
              onChange={(e) => setParameter("radialSegments", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.radialSegments}</span>
          </label>

          <label className="block">
            Vertical Segments
            <input
              type="range"
              min="16"
              max="512"
              step="8"
              value={parameters.verticalSegments}
              onChange={(e) => setParameter("verticalSegments", Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{parameters.verticalSegments}</span>
          </label>
        </div>
      </section>

      {/* Configuration Management */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Configuration</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={resetParameters}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={randomizeParameters}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Randomize
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export JSON
              </button>
              <label className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer">
                Import JSON
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  if (meshRef?.current?.geometry) {
                    exportSTL(meshRef.current.geometry);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export STL
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
