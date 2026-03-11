import clsx from 'clsx';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import CertificationGrid from './CertificationGrid';
import ContactPanel from './ContactPanel';
import EducationTimeline from './EducationTimeline';
import ModalPanel from './ModalPanel';
import ProjectShowcase from './ProjectShowcase';
import WaypointOverlay from './WaypointOverlay';
import styles from '../styles/GardenCanvas.module.css';

const ENTRY_CAMERA_POSITION = new THREE.Vector3(4.3, 2.6, 6.2);
const BASE_CAMERA_POSITION = new THREE.Vector3(8.6, 5.2, 11.6);
const BASE_LOOK_AT = new THREE.Vector3(-0.25, 1.45, 0.8);
const PARTICLE_COUNT = 120;
const PANEL_OPEN_DELAY_MS = 520;

const WAYPOINTS = [
  {
    id: 'certifications',
    label: 'Certifications',
    theme: 'sakura',
    anchor: [-3.05, 2.9, -0.85],
    focusPosition: [0.85, 4, 5.25],
    focusLookAt: [-3.05, 2.05, -0.85],
    color: 'rgba(244, 188, 212, 0.96)',
    labelColor: 'rgba(255, 246, 251, 0.86)',
    inkColor: '#341622',
  },
  {
    id: 'projects',
    label: 'Projects',
    theme: 'spring',
    anchor: [-5.15, 1.75, 2.45],
    focusPosition: [-0.7, 3.3, 7.6],
    focusLookAt: [-5.15, 1.25, 2.45],
    color: 'rgba(155, 207, 166, 0.96)',
    labelColor: 'rgba(245, 255, 247, 0.84)',
    inkColor: '#16311c',
  },
  {
    id: 'education',
    label: 'Education + work',
    theme: 'fountain',
    anchor: [2.75, 1.55, 0.4],
    focusPosition: [7.25, 3.25, 5.55],
    focusLookAt: [2.75, 1.15, 0.4],
    color: 'rgba(166, 212, 244, 0.96)',
    labelColor: 'rgba(245, 251, 255, 0.84)',
    inkColor: '#112a43',
  },
  {
    id: 'contact',
    label: 'Contact kiosk',
    theme: 'warm',
    anchor: [1.65, 1.5, 4.2],
    focusPosition: [6.15, 3.25, 9.2],
    focusLookAt: [1.65, 1.15, 4.2],
    color: 'rgba(231, 198, 150, 0.96)',
    labelColor: 'rgba(255, 249, 241, 0.84)',
    inkColor: '#342212',
  },
];

const WAYPOINTS_BY_ID = Object.fromEntries(
  WAYPOINTS.map((waypoint) => [waypoint.id, waypoint]),
);

const PANEL_COPY = {
  certifications: {
    eyebrow: 'Sakura canopy',
    title: 'Certifications',
    intro:
      'Search certificates, expand each preview in-place, and open the full archive route when you need the standalone page.',
    theme: 'sakura',
  },
  projects: {
    eyebrow: 'Playground pavilion',
    title: 'Projects',
    intro:
      'Cards stay concise in the garden, then open a clean detail view with the project description and direct GitHub access.',
    theme: 'spring',
  },
  education: {
    eyebrow: 'Fountain timeline',
    title: 'Education and work',
    intro:
      'Timeline stops are ordered from newest to oldest and expand into bullet details only when selected.',
    theme: 'fountain',
  },
  contact: {
    eyebrow: 'Info kiosk',
    title: 'Contact',
    intro:
      'The contact panel posts directly to Formspree using NEXT_PUBLIC_FORMSPREE_ENDPOINT and keeps mail and resume fallbacks close by.',
    theme: 'warm',
  },
};

const BLOSSOM_OFFSETS = buildBlossomOffsets();
const PATH_STONES = buildPathStones();
const SHRUB_POSITIONS = [
  [-5.8, -0.55, 1.35],
  [-4.55, -0.48, 3.45],
  [4.85, -0.52, -0.55],
  [5.25, -0.48, 2.65],
  [0.95, -0.48, 5.15],
];

function buildBlossomOffsets() {
  const offsets = [];

  for (let index = 0; index < 24; index += 1) {
    const angle = (Math.PI * 2 * index) / 24;
    const radius = 1.05 + (index % 4) * 0.28;
    const height = -0.45 + (index % 5) * 0.32;
    const scale = 0.48 + (index % 4) * 0.18;

    offsets.push({
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius * 0.82,
      scale,
    });
  }

  offsets.push({ x: 0, y: 0.78, z: 0, scale: 1.15 });
  offsets.push({ x: -0.55, y: 0.64, z: -0.2, scale: 0.96 });
  offsets.push({ x: 0.52, y: 0.58, z: 0.24, scale: 0.9 });

  return offsets;
}

function buildPathStones() {
  return Array.from({ length: 10 }, (_, index) => ({
    position: [-0.5 + (index % 3) * 0.58, -0.96, 4.8 - index * 0.82],
    scale: 0.56 + ((index + 1) % 3) * 0.12,
    rotation: ((index % 4) - 1.5) * 0.14,
  }));
}

function createProjectedWaypoints() {
  return WAYPOINTS.map((waypoint) => ({
    ...waypoint,
    x: 0,
    y: 0,
    side: 'right',
    visible: false,
  }));
}

function createBurstParticles() {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    active: false,
    delay: 0,
    life: 0,
    maxLife: 0,
    scale: 0,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    spin: 0,
  }));
}

function getThemeColor(theme) {
  switch (theme) {
    case 'fountain':
      return '#b7dbff';
    case 'spring':
      return '#b9deb8';
    case 'warm':
      return '#f2c996';
    case 'sakura':
    default:
      return '#f5c6dc';
  }
}

function resetParticle(particle, waypoint, stagger = 0) {
  const isFountain = waypoint.theme === 'fountain';
  const spread = isFountain ? 1.8 : 1.25;
  const lift = isFountain ? 2.35 : 1.05;
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.12 + Math.random() * spread * 0.18;

  particle.active = true;
  particle.delay = stagger;
  particle.maxLife = isFountain ? 0.85 + Math.random() * 0.45 : 1.2 + Math.random() * 0.8;
  particle.life = particle.maxLife;
  particle.scale = isFountain ? 0.05 + Math.random() * 0.05 : 0.08 + Math.random() * 0.05;
  particle.position.set(
    waypoint.anchor[0] + Math.cos(angle) * radius,
    waypoint.anchor[1] - (isFountain ? 0.1 : 0.3),
    waypoint.anchor[2] + Math.sin(angle) * radius,
  );
  particle.velocity.set(
    Math.cos(angle) * (isFountain ? 0.15 : 0.42),
    lift + Math.random() * (isFountain ? 0.7 : 0.35),
    Math.sin(angle) * (isFountain ? 0.15 : 0.34),
  );
  particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  particle.spin = (Math.random() - 0.5) * (isFountain ? 3.1 : 2.1);
}

function syncParticleInstances(mesh, particles, dummy) {
  let activeCount = 0;

  particles.forEach((particle, index) => {
    if (!particle.active || particle.delay > 0 || particle.life <= 0) {
      dummy.position.set(0, -100, 0);
      dummy.scale.setScalar(0.0001);
      dummy.rotation.copy(particle.rotation);
    } else {
      dummy.position.copy(particle.position);
      dummy.scale.setScalar(particle.scale);
      dummy.rotation.copy(particle.rotation);
      activeCount += 1;
    }

    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;

  return activeCount;
}

function SceneRig({
  pointerRef,
  burstTrigger,
  focusId,
  projectedWaypointsRef,
  onProjectWaypoints,
  reducedMotion,
  invalidateRef,
}) {
  const rootRef = useRef(null);
  const canopyRef = useRef(null);
  const blossomMeshRef = useRef(null);
  const fountainWaterRef = useRef(null);
  const pavilionRoofRef = useRef(null);
  const kioskGlowRef = useRef(null);
  const particleMeshRef = useRef(null);
  const particleMaterialRef = useRef(null);
  const dummyRef = useRef(new THREE.Object3D());
  const particleStateRef = useRef(createBurstParticles());
  const burstStateRef = useRef({
    id: null,
    endTime: 0,
    token: 0,
    waypoint: WAYPOINTS[0],
  });
  const introProgressRef = useRef(reducedMotion ? 1 : 0);
  const focusAmountRef = useRef(0);
  const smoothedPointerRef = useRef({ x: 0, y: 0 });
  const projectionVectorRef = useRef(new THREE.Vector3());
  const cameraPositionRef = useRef(new THREE.Vector3());
  const cameraLookRef = useRef(new THREE.Vector3());
  const tempPositionRef = useRef(new THREE.Vector3());
  const tempLookRef = useRef(new THREE.Vector3());
  const { camera, size, invalidate, gl } = useThree();

  useEffect(() => {
    invalidateRef.current = invalidate;
  }, [invalidate, invalidateRef]);

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    gl.setClearColor('#000000', 0);
  }, [gl]);

  useEffect(() => {
    if (!blossomMeshRef.current) {
      return;
    }

    BLOSSOM_OFFSETS.forEach((offset, index) => {
      dummyRef.current.position.set(offset.x, offset.y, offset.z);
      dummyRef.current.scale.setScalar(offset.scale);
      dummyRef.current.rotation.set(0, 0, 0);
      dummyRef.current.updateMatrix();
      blossomMeshRef.current.setMatrixAt(index, dummyRef.current.matrix);
    });

    blossomMeshRef.current.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    if (!particleMeshRef.current) {
      return;
    }

    syncParticleInstances(
      particleMeshRef.current,
      particleStateRef.current,
      dummyRef.current,
    );
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    if (!particleMaterialRef.current || burstTrigger.token === 0) {
      return;
    }

    const waypoint = WAYPOINTS_BY_ID[burstTrigger.id];

    if (!waypoint) {
      return;
    }

    burstStateRef.current = {
      id: waypoint.id,
      endTime: performance.now() + 950,
      token: burstTrigger.token,
      waypoint,
    };

    particleMaterialRef.current.color.set(getThemeColor(waypoint.theme));

    particleStateRef.current.forEach((particle, index) => {
      resetParticle(particle, waypoint, index * 0.01);
    });

    invalidate();
  }, [burstTrigger, invalidate]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const now = performance.now();
    const pointer = pointerRef.current;
    const smoothedPointer = smoothedPointerRef.current;

    smoothedPointer.x = THREE.MathUtils.damp(
      smoothedPointer.x,
      pointer.x,
      3.8,
      delta,
    );
    smoothedPointer.y = THREE.MathUtils.damp(
      smoothedPointer.y,
      pointer.y,
      3.8,
      delta,
    );

    introProgressRef.current = reducedMotion
      ? 1
      : Math.min(1, introProgressRef.current + delta / 1.18);
    focusAmountRef.current = THREE.MathUtils.damp(
      focusAmountRef.current,
      focusId ? 1 : 0,
      focusId ? 4.2 : 5.6,
      delta,
    );

    const easedIntro = 1 - (1 - introProgressRef.current) ** 3;
    const easedFocus = 1 - (1 - focusAmountRef.current) ** 2;

    cameraPositionRef.current.lerpVectors(
      ENTRY_CAMERA_POSITION,
      BASE_CAMERA_POSITION,
      easedIntro,
    );
    cameraPositionRef.current.x += smoothedPointer.x * 0.72;
    cameraPositionRef.current.y += smoothedPointer.y * 0.28;
    cameraPositionRef.current.z += smoothedPointer.x * 0.32;

    cameraLookRef.current.copy(BASE_LOOK_AT);
    cameraLookRef.current.x += smoothedPointer.x * 0.48;
    cameraLookRef.current.y += smoothedPointer.y * 0.18;
    cameraLookRef.current.z += smoothedPointer.y * 0.42;

    const focusWaypoint = focusId ? WAYPOINTS_BY_ID[focusId] : null;

    if (focusWaypoint) {
      tempPositionRef.current.fromArray(focusWaypoint.focusPosition);
      tempLookRef.current.fromArray(focusWaypoint.focusLookAt);
      cameraPositionRef.current.lerp(tempPositionRef.current, easedFocus);
      cameraLookRef.current.lerp(tempLookRef.current, easedFocus);
    }

    camera.position.copy(cameraPositionRef.current);
    camera.lookAt(cameraLookRef.current);

    if (rootRef.current) {
      rootRef.current.rotation.y = THREE.MathUtils.damp(
        rootRef.current.rotation.y,
        smoothedPointer.x * 0.055,
        4,
        delta,
      );
      rootRef.current.rotation.x = THREE.MathUtils.damp(
        rootRef.current.rotation.x,
        smoothedPointer.y * 0.025,
        4,
        delta,
      );
    }

    if (canopyRef.current) {
      const canopyBurst =
        burstStateRef.current.id === 'certifications'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;

      canopyRef.current.rotation.y = Math.sin(elapsed * 0.45) * 0.08;
      canopyRef.current.rotation.z = Math.cos(elapsed * 0.38) * 0.03 + canopyBurst * 0.05;
    }

    if (fountainWaterRef.current) {
      const fountainBurst =
        burstStateRef.current.id === 'education'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;
      fountainWaterRef.current.scale.y = 1 + Math.sin(elapsed * 3.8) * 0.06 + fountainBurst * 0.24;
      fountainWaterRef.current.position.y = 0.84 + Math.sin(elapsed * 3.8) * 0.03;
    }

    if (pavilionRoofRef.current) {
      const pavilionBurst =
        burstStateRef.current.id === 'projects'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;
      pavilionRoofRef.current.position.y = 0.88 + pavilionBurst * 0.12;
    }

    if (kioskGlowRef.current) {
      const kioskBurst =
        burstStateRef.current.id === 'contact'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;
      kioskGlowRef.current.emissiveIntensity = 0.35 + kioskBurst * 1.4;
    }

    let activeParticles = 0;

    if (particleMeshRef.current) {
      particleStateRef.current.forEach((particle) => {
        if (!particle.active) {
          return;
        }

        if (particle.delay > 0) {
          particle.delay -= delta;
          return;
        }

        particle.life -= delta;
        particle.position.addScaledVector(particle.velocity, delta);
        particle.velocity.y -=
          delta *
          (burstStateRef.current.waypoint.theme === 'fountain' ? 3.9 : 0.72);
        particle.rotation.y += particle.spin * delta;

        if (particle.life <= 0) {
          particle.active = false;
        }
      });

      activeParticles = syncParticleInstances(
        particleMeshRef.current,
        particleStateRef.current,
        dummyRef.current,
      );
    }

    const nextProjectedWaypoints = WAYPOINTS.map((waypoint) => {
      projectionVectorRef.current.set(...waypoint.anchor).project(camera);

      return {
        ...waypoint,
        x: (projectionVectorRef.current.x * 0.5 + 0.5) * size.width,
        y: (-projectionVectorRef.current.y * 0.5 + 0.5) * size.height,
        side:
          (projectionVectorRef.current.x * 0.5 + 0.5) * size.width >
          size.width * 0.66
            ? 'left'
            : 'right',
        visible:
          projectionVectorRef.current.z < 1 &&
          projectionVectorRef.current.z > -1 &&
          projectionVectorRef.current.x >= -1.05 &&
          projectionVectorRef.current.x <= 1.05 &&
          projectionVectorRef.current.y >= -1.05 &&
          projectionVectorRef.current.y <= 1.05,
      };
    });

    const shouldUpdateProjection = nextProjectedWaypoints.some((item, index) => {
      const previous = projectedWaypointsRef.current[index];

      return (
        !previous ||
        Math.abs(previous.x - item.x) > 0.4 ||
        Math.abs(previous.y - item.y) > 0.4 ||
        previous.visible !== item.visible ||
        previous.side !== item.side
      );
    });

    if (shouldUpdateProjection) {
      projectedWaypointsRef.current = nextProjectedWaypoints;
      onProjectWaypoints(nextProjectedWaypoints);
    }

    const pointerIsSettling =
      Math.abs(pointer.x - smoothedPointer.x) > 0.001 ||
      Math.abs(pointer.y - smoothedPointer.y) > 0.001;

    if (
      introProgressRef.current < 1 ||
      activeParticles > 0 ||
      pointerIsSettling ||
      Math.abs(focusAmountRef.current - (focusId ? 1 : 0)) > 0.002
    ) {
      invalidate();
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight
        castShadow
        intensity={1.35}
        position={[6.2, 10.4, 5.8]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={0.4} position={[-6, 5, -4]} />

      <group ref={rootRef}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}>
          <planeGeometry args={[22, 22]} />
          <meshStandardMaterial color="#dce7dc" roughness={1} />
        </mesh>

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0.1, -1.04, 1.6]}>
          <planeGeometry args={[4.2, 11.8]} />
          <meshStandardMaterial color="#d5c1a0" roughness={0.98} />
        </mesh>

        {PATH_STONES.map((stone) => (
          <mesh
            key={stone.position.join('-')}
            receiveShadow
            castShadow
            position={stone.position}
            rotation={[-Math.PI / 2, 0, stone.rotation]}
            scale={[stone.scale, stone.scale * 0.84, 1]}
          >
            <cylinderGeometry args={[0.46, 0.52, 0.18, 6]} />
            <meshStandardMaterial color="#c4b195" roughness={0.98} />
          </mesh>
        ))}

        <group position={[-3.2, -0.08, -0.85]}>
          <mesh castShadow position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.28, 0.46, 3.2, 7]} />
            <meshStandardMaterial color="#674433" roughness={0.95} />
          </mesh>

          <mesh
            castShadow
            position={[-0.34, 1.7, -0.1]}
            rotation={[0.72, 0.24, -0.78]}
            scale={[0.18, 1.9, 0.18]}
          >
            <cylinderGeometry args={[0.18, 0.42, 1, 6]} />
            <meshStandardMaterial color="#6f4937" roughness={0.95} />
          </mesh>

          <mesh
            castShadow
            position={[0.45, 1.8, 0.18]}
            rotation={[0.64, -0.4, 0.5]}
            scale={[0.16, 1.72, 0.16]}
          >
            <cylinderGeometry args={[0.18, 0.4, 1, 6]} />
            <meshStandardMaterial color="#6f4937" roughness={0.95} />
          </mesh>

          <group ref={canopyRef} position={[0, 2.45, 0]}>
            <instancedMesh
              ref={blossomMeshRef}
              args={[undefined, undefined, BLOSSOM_OFFSETS.length]}
              castShadow
            >
              <sphereGeometry args={[0.52, 7, 7]} />
              <meshStandardMaterial color="#f4c0d9" roughness={0.68} />
            </instancedMesh>
          </group>
        </group>

        <group position={[-5.15, -0.78, 2.45]}>
          <mesh castShadow position={[0, 0.22, 0]}>
            <boxGeometry args={[1.56, 0.36, 1.42]} />
            <meshStandardMaterial color="#8c6544" roughness={0.92} />
          </mesh>
          <mesh ref={pavilionRoofRef} castShadow position={[0, 0.88, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.32, 0.92, 4]} />
            <meshStandardMaterial color="#be8b60" roughness={0.84} />
          </mesh>
          <mesh castShadow position={[-0.5, 0.62, -0.48]}>
            <boxGeometry args={[0.16, 0.84, 0.16]} />
            <meshStandardMaterial color="#6f4e33" roughness={0.94} />
          </mesh>
          <mesh castShadow position={[0.5, 0.62, 0.48]}>
            <boxGeometry args={[0.16, 0.84, 0.16]} />
            <meshStandardMaterial color="#6f4e33" roughness={0.94} />
          </mesh>
        </group>

        <group position={[2.75, -0.78, 0.4]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[1.02, 1.2, 0.34, 14]} />
            <meshStandardMaterial color="#efe2cf" roughness={0.98} />
          </mesh>
          <mesh castShadow position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.58, 0.72, 0.38, 14]} />
            <meshStandardMaterial color="#faf2e5" roughness={0.94} />
          </mesh>
          <mesh ref={fountainWaterRef} position={[0, 0.84, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.72, 10]} />
            <meshStandardMaterial color="#b9e1ff" roughness={0.18} metalness={0.06} />
          </mesh>
          <mesh position={[0, 1.26, 0]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#d8efff" roughness={0.22} metalness={0.04} />
          </mesh>
        </group>

        <group position={[1.65, -0.75, 4.2]}>
          <mesh castShadow position={[0, 0.24, 0]}>
            <boxGeometry args={[0.94, 0.42, 0.7]} />
            <meshStandardMaterial color="#d7bd96" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, 0.76, 0]}>
            <boxGeometry args={[0.56, 0.52, 0.32]} />
            <meshStandardMaterial color="#8d6641" roughness={0.92} />
          </mesh>
          <mesh castShadow position={[0, 1.12, 0]}>
            <boxGeometry args={[0.88, 0.18, 0.12]} />
            <meshStandardMaterial color="#f4ecde" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.94, 0.2]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial
              ref={kioskGlowRef}
              color="#ffe3a9"
              emissive="#f7d27c"
              emissiveIntensity={0.35}
              roughness={0.25}
            />
          </mesh>
        </group>

        {SHRUB_POSITIONS.map((position) => (
          <mesh
            key={position.join('-')}
            castShadow
            position={position}
            scale={[1.14, 0.78, 0.94]}
          >
            <sphereGeometry args={[0.44, 7, 7]} />
            <meshStandardMaterial color="#89b88f" roughness={0.88} />
          </mesh>
        ))}

        <instancedMesh ref={particleMeshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial
            ref={particleMaterialRef}
            color="#f5c6dc"
            roughness={0.48}
            transparent
            opacity={0.9}
          />
        </instancedMesh>
      </group>
    </>
  );
}

export default function GardenCanvas({
  certifications,
  projects,
  timelineItems,
  reducedMotion = false,
  transitionState = 'idle',
  onExit,
  onModalChange,
}) {
  const [activePanelId, setActivePanelId] = useState(null);
  const [pendingPanelId, setPendingPanelId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [projectedWaypoints, setProjectedWaypoints] = useState(createProjectedWaypoints);
  const [burstTrigger, setBurstTrigger] = useState({ token: 0, id: null });
  const invalidateRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const projectedWaypointsRef = useRef(createProjectedWaypoints());
  const timersRef = useRef([]);

  useEffect(() => {
    onModalChange(Boolean(activePanelId || pendingPanelId));
  }, [activePanelId, onModalChange, pendingPanelId]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  function queueRender() {
    invalidateRef.current?.();
  }

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      y: -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
    };
    queueRender();
  }

  function triggerBurst(waypointId) {
    if (!WAYPOINTS_BY_ID[waypointId]) {
      return;
    }

    setBurstTrigger((currentState) => ({
      token: currentState.token + 1,
      id: waypointId,
    }));
  }

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function handleWaypointActivate(waypointId) {
    if (activePanelId || pendingPanelId) {
      return;
    }

    clearTimers();
    triggerBurst(waypointId);
    setFocusId(waypointId);
    setPendingPanelId(waypointId);

    if (reducedMotion) {
      setActivePanelId(waypointId);
      setPendingPanelId(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setActivePanelId(waypointId);
      setPendingPanelId(null);
    }, PANEL_OPEN_DELAY_MS);

    timersRef.current.push(timer);
  }

  function handleClosePanel() {
    clearTimers();
    setPendingPanelId(null);
    setActivePanelId(null);
    setFocusId(null);
    queueRender();
  }

  function handleExit() {
    clearTimers();
    setPendingPanelId(null);
    setActivePanelId(null);
    setFocusId(null);
    onExit();
  }

  const activePanel = activePanelId ? PANEL_COPY[activePanelId] : null;
  const sceneBlocked = Boolean(activePanelId || pendingPanelId);

  return (
    <div
      id="desktop-garden"
      className={clsx(styles.overlay, {
        [styles.entering]: transitionState === 'entering',
        [styles.open]: transitionState === 'open',
        [styles.modalOpen]: sceneBlocked,
      })}
    >
      <div
        className={styles.frame}
        onPointerMove={handlePointerMove}
        onPointerLeave={queueRender}
      >
        <button
          type="button"
          className={styles.exitButton}
          onClick={handleExit}
          disabled={sceneBlocked}
          aria-label="Return to the garden gate"
        >
          Back to gate
        </button>

        <div className={styles.canvasShell}>
          <Canvas
            className={styles.canvas}
            camera={{ position: ENTRY_CAMERA_POSITION.toArray(), fov: 36 }}
            dpr={typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)}
            frameloop="demand"
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            shadows
          >
            <SceneRig
              pointerRef={pointerRef}
              burstTrigger={burstTrigger}
              focusId={focusId}
              projectedWaypointsRef={projectedWaypointsRef}
              onProjectWaypoints={setProjectedWaypoints}
              reducedMotion={reducedMotion}
              invalidateRef={invalidateRef}
            />
          </Canvas>
        </div>

        <WaypointOverlay
          items={projectedWaypoints}
          activeId={activePanelId || pendingPanelId}
          blocked={sceneBlocked}
          onActivate={handleWaypointActivate}
        />
        <div className={styles.sceneDimmer} aria-hidden="true" />
      </div>

      <ModalPanel
        isOpen={Boolean(activePanel)}
        theme={activePanel?.theme}
        eyebrow={activePanel?.eyebrow}
        title={activePanel?.title}
        intro={activePanel?.intro}
        onClose={handleClosePanel}
      >
        {activePanelId === 'certifications' ? (
          <CertificationGrid items={certifications} />
        ) : null}
        {activePanelId === 'projects' ? (
          <ProjectShowcase items={projects} />
        ) : null}
        {activePanelId === 'education' ? (
          <EducationTimeline items={timelineItems} />
        ) : null}
        {activePanelId === 'contact' ? <ContactPanel /> : null}
      </ModalPanel>
    </div>
  );
}
