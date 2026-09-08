"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Group, Quaternion, Vector3 } from "three";
import {
  computeBonds,
  ELEMENTS,
  type MoleculePreset,
} from "@/lib/molecules/presets";

const UP = new Vector3(0, 1, 0);

function AtomMesh({
  element,
  position,
}: {
  element: keyof typeof ELEMENTS;
  position: [number, number, number];
}) {
  const info = ELEMENTS[element];
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[info.radius * 0.72, 42, 42]} />
        <meshStandardMaterial
          color={info.color}
          roughness={0.32}
          metalness={element === "H" ? 0 : 0.1}
        />
      </mesh>
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: "none",
          color: element === "H" || element === "S" || element === "Cl" ? "#3a372c" : "#f5efe1",
          fontSize: "9px",
          fontWeight: 700,
          fontFamily: "ui-monospace, monospace",
          textShadow: "0 1px 3px rgb(0 0 0 / 0.5)",
        }}
      >
        {element}
      </Html>
    </group>
  );
}

function BondMesh({
  start,
  end,
  order,
}: {
  start: [number, number, number];
  end: [number, number, number];
  order: 1 | 2;
}) {
  const objects = useMemo(() => {
    const a = new Vector3(...start);
    const b = new Vector3(...end);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const direction = b.clone().sub(a);
    const length = direction.length();
    const quaternion = new Quaternion().setFromUnitVectors(
      UP,
      direction.clone().normalize(),
    );
    const side = new Vector3(1, 0, 0);
    if (order === 2) {
      side.cross(new Vector3(0, 0, 1)).normalize();
      if (side.lengthSq() < 0.5) side.set(0, 0, 1);
      side.multiplyScalar(0.09);
    }
    return { mid, length, quaternion, side };
  }, [start, end, order]);

  const cylinders =
    order === 1
      ? [[0, 0, 0]]
      : [
          [objects.side.x, objects.side.y, objects.side.z],
          [-objects.side.x, -objects.side.y, -objects.side.z],
        ];

  return (
    <group position={objects.mid} quaternion={objects.quaternion}>
      {cylinders.map((offset, index) => (
        <mesh key={index} position={[offset[0], offset[1], offset[2]]}>
          <cylinderGeometry args={[order === 1 ? 0.075 : 0.05, order === 1 ? 0.075 : 0.05, objects.length * 0.86, 16]} />
          <meshStandardMaterial color="#c9bfa6" roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function RotatingMolecule({ preset }: { preset: MoleculePreset }) {
  const groupRef = useRef<Group>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current && !userInteracted) {
      groupRef.current.rotation.y += delta * 0.35;
    }
    void state;
  });

  const bonds = useMemo(
    () => preset.bonds ?? computeBonds(preset.atoms),
    [preset],
  );

  return (
    <>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={2.4}
        maxDistance={9}
        onStart={() => setUserInteracted(true)}
      />
      <group ref={groupRef}>
        {preset.atoms.map((atom, index) => (
          <AtomMesh
            key={`${preset.id}-atom-${index}`}
            element={atom.el}
            position={atom.pos}
          />
        ))}
        {bonds.map((bond, index) => (
          <BondMesh
            key={`${preset.id}-bond-${index}`}
            start={preset.atoms[bond.a].pos}
            end={preset.atoms[bond.b].pos}
            order={bond.order}
          />
        ))}
      </group>
    </>
  );
}

export default function MoleculeViewer({ preset }: { preset: MoleculePreset }) {
  return (
    <Canvas
      camera={{ position: [0, 1.4, 6], fov: 40 }}
      style={{ touchAction: "pan-y" }}
      shadows
      dpr={[1, 2]}
      aria-label={`Modelo 3D de ${preset.name}`}
    >
      <color attach="background" args={["#17130e"]} />
      <ambientLight intensity={0.7} />
      <spotLight
        position={[5, 8, 6]}
        intensity={1.6}
        angle={0.5}
        penumbra={0.9}
        castShadow
      />
      <hemisphereLight args={["#f2ead4", "#17130e", 0.5]} />
      <Suspense fallback={null}>
        <RotatingMolecule preset={preset} />
      </Suspense>
    </Canvas>
  );
}
