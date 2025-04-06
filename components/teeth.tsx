'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';


function ToothScene() {
    const { scene } = useGLTF('/models/permanent_dentition.glb');
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);
  
    useEffect(() => {
      const clone = scene.clone(true);
  
      clone.traverse((child: any) => {
        if (child.isMesh) {
          // Deep clone the material to avoid shared references
          const originalMaterial = child.material.clone();
          child.material = originalMaterial;
          child.userData = {
            ...child.userData,
            originalColor: originalMaterial.color.clone(),
          };
        }
      });
  
      setClonedScene(clone);
    }, [scene]);
  
    // Highlight the selected tooth
    useEffect(() => {
      if (!clonedScene) return;
  
      clonedScene.traverse((child: any) => {
        if (child.isMesh) {
          const isSelected = child.name === selectedTooth;
          const originalColor = child.userData.originalColor;
          if (originalColor) {
            child.material.color.set(isSelected ? 'orange' : originalColor);
          }
        }
      });
    }, [selectedTooth, clonedScene]);
  
    const handleClick = (e: any) => {
      e.stopPropagation();
      const clickedTooth = e.object.name;
  
      // Toggle selection
      setSelectedTooth((prev) => (prev === clickedTooth ? null : clickedTooth));
      console.log('Selected:', clickedTooth);
    };
  
    return clonedScene ? (
      <primitive object={clonedScene} onClick={handleClick} />
    ) : null;
  }

export default function Teeth() {
  return (
    <main className="flex flex-col items-center p-4">
      <div className="w-full h-[600px]">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <ToothScene />
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </main>
  );
}