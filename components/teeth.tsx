// 'use client';

// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useGLTF } from '@react-three/drei';
// import { Suspense, useState, useEffect } from 'react';
// import * as THREE from 'three';

// const toothNameMap: { [key: string]: number } = {
//   'ZBrushPolyMesh3D_Mandible_ll8_0': 32,
//   'ZBrushPolyMesh3D1_Mandible_ll7_0': 31,
//   'ZBrushPolyMesh3D2_Mandible_blinn10_0': 30,
//   'ZBrushPolyMesh3D4_Mandible_ll5_0': 29,
//   'ZBrushPolyMesh3D3_Mandible_ll4_0': 28,
//   'ZBrushPolyMesh3D5_Mandible_ll3_0': 27,
//   'ZBrushPolyMesh3D6_Mandible_l2_0': 26,
//   'ZBrushPolyMesh3D7_Mandible_ll1_0': 25,
//   'LL1seam_2ZBrushPolyMesh3D_Mandible_ll1_0': 24,
//   'LL2seam_2ZBrushPolyMesh3D_Mandible_l2_0': 23,
//   'LL3seam_2ZBrushPolyMesh3D_Mandible_ll3_0': 22,
//   'LL4seam_2ZBrushPolyMesh3D_Mandible_ll4_0': 21,
//   'LL5seam_3ZBrushPolyMesh3D_Mandible_ll5_0': 20,
//   'LL6seam_2ZBrushPolyMesh3D_Mandible_blinn10_0': 19,
//   'LL7seam_2ZBrushPolyMesh3D_Mandible_ll7_0': 18,
//   'LL8seam_2ZBrushPolyMesh3D_Mandible_ll8_0': 17,

//   'ZBrushPolyMesh3D7_blinn20_0': 16,
//   'polySurface9_blinn19_0': 15,
//   'ZBrushPolyMesh3D5_blinn18_0': 14,
//   'ZBrushPolyMesh3D4_blinn17_0': 13,
//   'ZBrushPolyMesh3D3_blinn16_0': 12,
//   'ZBrushPolyMesh3D2_blinn15_0': 11,
//   'ZBrushPolyMesh3D1_blinn14_0': 10,
//   'polySurface1_UL1_0': 9,
//   'polySurface2_UL1_0': 8,
//   'polySurface4_blinn14_0': 7,
//   'polySurface6_blinn15_0': 6,
//   'ZBrushPolyMesh3D8_blinn16_0': 5,
//   'ZBrushPolyMesh3D9_blinn17_0': 4,
//   'polySurface8_blinn18_0': 3,
//   'polySurface10_blinn19_0': 2,
//   'polySurface12_blinn20_0': 1,
// };



// function ToothScene() {
//     const { scene } = useGLTF('/models/permanent_dentition.glb');
//     const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
//     const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);
//     const [hoveredTooth, setHoveredTooth] = useState<THREE.Object3D | null>(null);

//     useEffect(() => {
//       const clone = scene.clone(true);
  
//       clone.traverse((child: any) => {
//         if (child.isMesh) {
//           // Deep clone the material to avoid shared references
//           const originalMaterial = child.material.clone();
//           child.material = originalMaterial;

//           const mappedNumber = toothNameMap[child.name];
//           if (mappedNumber) {
//             child.name = mappedNumber.toString(); // Rename mesh to "1"..."32"
//           }

//           child.userData = {
//             ...child.userData,
//             originalColor: originalMaterial.color.clone(),
//           };
//         }
//       });
  
//       setClonedScene(clone);
//     }, [scene]);
  
//     // Highlight the selected tooth
//     useEffect(() => {
//       if (!clonedScene) return;
  
//       clonedScene.traverse((child: any) => {
//         if (child.isMesh) {
//           const isSelected = child.name === selectedTooth;
          
//           const originalColor = child.userData.originalColor;
//           if (originalColor) {
//             child.material.color.set(isSelected ? 'orange' : originalColor);

//           }
//         }
//       });
//     }, [selectedTooth, clonedScene]);
  
//     const handleClick = (e: any) => {
//       e.stopPropagation();
//       const clickedTooth = e.object.name;
  
//       // Toggle selection
//       setSelectedTooth((prev) => (prev === clickedTooth ? null : clickedTooth));
//       console.log('Selected:', clickedTooth);
//     };
  
//     return clonedScene ? (
//       <>
//         <primitive object={clonedScene} onClick={handleClick} />
//         {hoveredTooth && (
//           <div position={hoveredTooth.position}>
//             <div className="bg-white text-black px-2 py-1 rounded shadow text-sm border border-gray-300">
//               Tooth {hoveredTooth.name}
//             </div>
//           </div>
//       )}
//       </>
//     ) : null;
//   }

// export default function Teeth() {
//   return (
//     <main className="flex flex-col items-center p-4">
//       <div className="w-full h-[600px]">
//         <Canvas camera={{ position: [0, 0, 5] }}>
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[10, 10, 5]} intensity={1} />
//           <Suspense fallback={null}>
//             <ToothScene />
//           </Suspense>
//           <OrbitControls />
//         </Canvas>
//       </div>
//     </main>
//   );
// }



'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const toothNameMap: { [key: string]: number } = {
  'ZBrushPolyMesh3D_Mandible_ll8_0': 32,
  'ZBrushPolyMesh3D1_Mandible_ll7_0': 31,
  'ZBrushPolyMesh3D2_Mandible_blinn10_0': 30,
  'ZBrushPolyMesh3D4_Mandible_ll5_0': 29,
  'ZBrushPolyMesh3D3_Mandible_ll4_0': 28,
  'ZBrushPolyMesh3D5_Mandible_ll3_0': 27,
  'ZBrushPolyMesh3D6_Mandible_l2_0': 26,
  'ZBrushPolyMesh3D7_Mandible_ll1_0': 25,
  'LL1seam_2ZBrushPolyMesh3D_Mandible_ll1_0': 24,
  'LL2seam_2ZBrushPolyMesh3D_Mandible_l2_0': 23,
  'LL3seam_2ZBrushPolyMesh3D_Mandible_ll3_0': 22,
  'LL4seam_2ZBrushPolyMesh3D_Mandible_ll4_0': 21,
  'LL5seam_3ZBrushPolyMesh3D_Mandible_ll5_0': 20,
  'LL6seam_2ZBrushPolyMesh3D_Mandible_blinn10_0': 19,
  'LL7seam_2ZBrushPolyMesh3D_Mandible_ll7_0': 18,
  'LL8seam_2ZBrushPolyMesh3D_Mandible_ll8_0': 17,

  'ZBrushPolyMesh3D7_blinn20_0': 16,
  'polySurface9_blinn19_0': 15,
  'ZBrushPolyMesh3D5_blinn18_0': 14,
  'ZBrushPolyMesh3D4_blinn17_0': 13,
  'ZBrushPolyMesh3D3_blinn16_0': 12,
  'ZBrushPolyMesh3D2_blinn15_0': 11,
  'ZBrushPolyMesh3D1_blinn14_0': 10,
  'polySurface1_UL1_0': 9,
  'polySurface2_UL1_0': 8,
  'polySurface4_blinn14_0': 7,
  'polySurface6_blinn15_0': 6,
  'ZBrushPolyMesh3D8_blinn16_0': 5,
  'ZBrushPolyMesh3D9_blinn17_0': 4,
  'polySurface8_blinn18_0': 3,
  'polySurface10_blinn19_0': 2,
  'polySurface12_blinn20_0': 1,
};

function ToothScene() {
  const { scene } = useGLTF('/models/permanent_dentition.glb');
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [hoveredTooth, setHoveredTooth] = useState<THREE.Object3D | null>(null);
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const clone = scene.clone(true);

    clone.traverse((child: any) => {
      if (child.isMesh) {
        const originalMaterial = child.material.clone();
        child.material = originalMaterial;

        const mappedNumber = toothNameMap[child.name];
        if (mappedNumber) {
          child.name = mappedNumber.toString(); // Rename mesh
        }

        child.userData.originalColor = originalMaterial.color.clone();
      }
    });

    setClonedScene(clone);
  }, [scene]);

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
    setSelectedTooth((prev) => (prev === clickedTooth ? null : clickedTooth));
    console.log('Selected:', clickedTooth);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHoveredTooth(e.object);
  };

  const handlePointerOut = () => {
    setHoveredTooth(null);
  };

  return clonedScene ? (
    <>
      <primitive
        object={clonedScene}
        onClick={handleClick}
        position={[0, -2, 0]} 
        rotation={[-Math.PI / 24, 0, 0]} 
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      {hoveredTooth && (
        <Html position={hoveredTooth.position}>
          <div className="bg-white text-black px-2 py-1 rounded shadow text-sm border border-gray-300">
            Tooth {hoveredTooth.name}
          </div>
        </Html>
      )}
    </>
  ) : null;
}

export default function Teeth() {
  return (
    <main className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-2">Interactive Tooth Selector</h1>
      <div className="w-full h-[600px]">
        <Canvas camera={{ position: [0, 1, 10], fov: 40}}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <ToothScene />
          </Suspense>
          <OrbitControls 
            enableZoom={true} 
            minDistance={5}
            maxDistance={8}
            target={[0, -1, 0]} 
          />
        </Canvas>
      </div>
    </main>
  );
}