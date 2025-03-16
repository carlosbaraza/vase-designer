# 3D Vase Generator

A web-based application for designing custom vases for 3D printing in vase mode. Create beautiful, mathematically-generated vases with highly customizable parameters and export them as STL files.

## Features

- Real-time 3D preview
- Customizable vase parameters:
  - Basic dimensions (height, top/bottom diameter)
  - Radial and vertical waves
  - Twist and spiral effects
  - Surface features (noise, patterns)
  - Custom mathematical formulas
- Export to STL for 3D printing
- Save and load designs
- Random design generator

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vase-generator.git
cd vase-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Adjust the vase parameters using the control panel on the right
2. Preview your changes in real-time in the 3D viewer
3. Use the camera controls to inspect your design:
   - Left click + drag to rotate
   - Right click + drag to pan
   - Scroll to zoom
4. Click "Export STL" when you're happy with your design
5. Use the configuration panel to save/load your designs

## Custom Formulas

The vase generator supports custom mathematical formulas for both radius and vertical deformation. Available variables:

- `r`: Base radius at current point
- `y`: Current height
- `angle`: Current angle (in radians)

Example formulas:
- Radius: `r * (1 + sin(angle * 5) * 0.2)`
- Vertical: `y + cos(angle * 3) * 10`

## 3D Printing Tips

- The generated STL is a solid model
- Use "vase mode" (spiral outer contour) in your slicer
- Recommended slicer settings:
  - Layer height: 0.2-0.3mm
  - Line width: 0.4-0.6mm
  - Bottom layers: 3-5
  - No top layers
  - No infill needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
