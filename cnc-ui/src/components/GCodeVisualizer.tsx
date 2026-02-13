import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, GizmoHelper, GizmoViewport, Line } from '@react-three/drei';
import * as THREE from 'three';

interface Props { 
  gcodeText: string; 
  currentPos?: { x: number; y: number; z: number }; 
  toolDiameter?: number; // Optional: specify tool diameter in mm
}

// Optimized component for rendering the paths
const Toolpath = ({ gcodeText }: { gcodeText: string }) => {
  const { feedPoints, rapidPoints } = useMemo(() => {
    const feeds: THREE.Vector3[] = [];
    const rapids: THREE.Vector3[] = [];
    let lastPos = new THREE.Vector3(0, 0, 0);
    let isRapid = true;

    gcodeText.split('\n').forEach(line => {
      const l = line.trim().toUpperCase();
      if (!l || l.startsWith('(') || l.startsWith(';')) return;

      if (/\bG0*0\b/.test(l)) isRapid = true;
      if (/\bG0*[123]\b/.test(l)) isRapid = false;

      const xMatch = l.match(/X([-+]?[0-9]*\.?[0-9]+)/);
      const yMatch = l.match(/Y([-+]?[0-9]*\.?[0-9]+)/);
      const zMatch = l.match(/Z([-+]?[0-9]*\.?[0-9]+)/);

      if (xMatch || yMatch || zMatch) {
        const newPos = new THREE.Vector3(
          xMatch ? parseFloat(xMatch[1]) : lastPos.x,
          yMatch ? parseFloat(yMatch[1]) : lastPos.y,
          zMatch ? parseFloat(zMatch[1]) : lastPos.z
        );

        if (isRapid) {
          rapids.push(lastPos.clone(), newPos.clone());
        } else {
          feeds.push(lastPos.clone(), newPos.clone());
        }
        lastPos.copy(newPos);
      }
    });
    return { feedPoints: feeds, rapidPoints: rapids };
  }, [gcodeText]);

  return (
    <group>
      {feedPoints.length > 0 && (
        <Line points={feedPoints} color="#22d3ee" lineWidth={1.5} segments />
      )}
      {rapidPoints.length > 0 && (
        <Line 
          points={rapidPoints} 
          color="#ef4444" 
          lineWidth={0.5} 
          dashed 
          dashSize={20} 
          gapSize={10} 
          transparent 
          opacity={0.4} 
          segments 
        />
      )}
    </group>
  );
};

export default function GCodeVisualizer({ gcodeText, currentPos, toolDiameter = 6 }: Props) {
  const controlsRef = useRef<any>(null);
  const [followTool, setFollowTool] = useState(false);

  const setTopView = () => {
    if (controlsRef.current) {
      // Snaps to top-down view centered on the machine bed
      controlsRef.current.setLookAt(592.5, 1250, 2000, 592.5, 1250, 0, true);
    }
  };

  // Internal component to handle the "Follow Tool" logic within the R3F loop
  const CameraFollower = () => {
    useFrame(() => {
      if (followTool && currentPos && controlsRef.current) {
        const target = new THREE.Vector3(currentPos.x, currentPos.y, 0);
        controlsRef.current.target.lerp(target, 0.1);
        controlsRef.current.update();
      }
    });
    return null;
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* UI Overlay - Using cnc-theme styles */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <button 
          onClick={setTopView}
          className="px-4 py-2 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded shadow-lg hover:border-cyan-400 transition-colors"
        >
          TOP VIEW (2D)
        </button>
        <button 
          onClick={() => setFollowTool(!followTool)}
          className={`px-4 py-2 text-xs font-bold rounded border shadow-lg transition-colors ${
            followTool 
              ? 'bg-cyan-600 border-cyan-300 text-white' 
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-400'
          }`}
        >
          {followTool ? 'FOLLOWING TOOL' : 'FOLLOW TOOL'}
        </button>
      </div>

      <Canvas shadowProps-enabled>
        <PerspectiveCamera makeDefault position={[1200, -1800, 1500]} up={[0, 0, 1]} far={10000} />
        <OrbitControls 
          ref={controlsRef}
          makeDefault 
          target={[592.5, 1250, 0]} 
          maxDistance={8000}
          enableDamping={true}
          dampingFactor={0.2}
          rotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.6} />
        <pointLight position={[592, 1250, 1000]} intensity={0.5} />

        <CameraFollower />
        
        {/* Machine Bed & Bounds */}
        <group>
          <gridHelper 
            args={[2500, 25, "#334155", "#1e293b"]} 
            rotation={[Math.PI / 2, 0, 0]} 
            position={[592.5, 1250, -0.1]} 
          />
          <Line
            points={[[0, 0, 0], [1185, 0, 0], [1185, 2500, 0], [0, 2500, 0], [0, 0, 0]]}
            color="#22d3ee"
            lineWidth={1}
            transparent
            opacity={0.2}
          />
        </group>

        <Toolpath gcodeText={gcodeText} />

        {/* Live Tool Indicator */}
        {currentPos && (
          <group position={[currentPos.x, currentPos.y, currentPos.z]}>
            {/* The Actual Bit */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 25]}>
              <cylinderGeometry args={[toolDiameter/2, toolDiameter/2, 50, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
            </mesh>
            
            {/* Projected Crosshair on the wasteboard */}
            <group position={[0, 0, -currentPos.z]}>
              <lineSegments>
                <bufferGeometry attach="geometry" onUpdate={s => s.setFromPoints([
                  new THREE.Vector3(-50, 0, 0), new THREE.Vector3(50, 0, 0),
                  new THREE.Vector3(0, -50, 0), new THREE.Vector3(0, 50, 0)
                ])} />
                <lineBasicMaterial attach="material" color="#fbbf24" opacity={0.5} transparent />
              </lineSegments>
            </group>
          </group>
        )}
        
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}