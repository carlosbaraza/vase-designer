import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";

export function exportVaseAsSTL(geometry: THREE.BufferGeometry, filename: string = "vase.stl") {
  const exporter = new STLExporter();
  const mesh = new THREE.Mesh(geometry);

  // Export as STL string
  const stlString = exporter.parse(mesh);

  // Create blob and download
  const blob = new Blob([stlString], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
