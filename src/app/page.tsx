"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const VaseCanvas = dynamic(() => import("../components/VaseCanvas"), { ssr: false });
const ControlPanel = dynamic(() => import("../components/ControlPanel"), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* 3D Preview Section */}
      <div className="flex-1 h-[50vh] md:h-screen relative">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">Loading 3D View...</div>
          }
        >
          <VaseCanvas />
        </Suspense>
      </div>

      {/* Control Panel Section */}
      <div className="w-full md:w-96 h-[50vh] md:h-screen overflow-y-auto bg-white border-l border-gray-200">
        <Suspense fallback={<div className="p-4">Loading Controls...</div>}>
          <ControlPanel />
        </Suspense>
      </div>
    </main>
  );
}
