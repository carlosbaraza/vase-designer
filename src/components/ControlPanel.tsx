import { useVaseStore } from "../store/vaseStore";
import { useState, useCallback } from "react";
import { debounce } from "lodash";

export default function ControlPanel() {
  const {
    parameters,
    setParameter,
    resetParameters,
    randomizeParameters,
    exportConfiguration,
    importConfiguration,
  } = useVaseStore();
  const [configText, setConfigText] = useState("");
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

  const handleExport = () => {
    const config = exportConfiguration();
    setConfigText(config);
  };

  const handleImport = () => {
    try {
      importConfiguration(configText);
      setConfigText("");
    } catch (error) {
      console.error("Failed to import configuration:", error);
    }
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
              max="20"
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
        <div className="space-y-2">
          <label className="block">
            Radius Formula
            <input
              type="text"
              value={localRadiusFormula}
              onChange={handleRadiusFormulaChange}
              className="w-full p-2 border rounded"
              placeholder="r * (1 + 0.3 * sin(y / height * pi))"
            />
            <span className="text-sm text-gray-500">
              Variables: r (base radius), y (current height), height (total height), angle, pi
            </span>
          </label>

          <label className="block">
            Vertical Deformation Formula
            <input
              type="text"
              value={localVerticalFormula}
              onChange={handleVerticalFormulaChange}
              className="w-full p-2 border rounded"
              placeholder="y + sin(angle * 3) * 10"
            />
            <span className="text-sm text-gray-500">
              Variables: y (current height), height (total height), angle, pi
            </span>
          </label>
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
              max="256"
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
              max="256"
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
            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              className="w-full h-32 p-2 border rounded font-mono text-sm"
              placeholder="Paste configuration JSON here..."
            />

            <div className="flex space-x-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
