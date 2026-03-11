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

const ENTRY_CAMERA_POSITION = new THREE.Vector3(0.18, 1.92, 12.9);
const ENTRY_LOOK_AT = new THREE.Vector3(0.18, 1.55, 6.2);
const GARDEN_CAMERA_POSITION = new THREE.Vector3(7.4, 4.45, 9.8);
const GARDEN_LOOK_AT = new THREE.Vector3(-0.3, 1.4, 1.5);
const PARTICLE_COUNT = 120;
const PANEL_OPEN_DELAY_MS = 520;

const WAYPOINTS = [
  {
    id: 'certifications',
    label: 'Certifications',
    theme: 'sakura',
    anchor: [-3.15, 0.52, -1.15],
    focusPosition: [2.55, 3.62, 5.78],
    focusLookAt: [-3.15, 1.02, -1.15],
    color: 'rgba(241, 189, 214, 0.96)',
    labelColor: 'rgba(255, 244, 250, 0.9)',
    inkColor: '#3e1b29',
  },
  {
    id: 'projects',
    label: 'Projects',
    theme: 'playground',
    anchor: [-4.95, 0.26, 2.78],
    focusPosition: [0.9, 3.18, 7.05],
    focusLookAt: [-4.95, 0.7, 2.78],
    color: 'rgba(249, 214, 160, 0.96)',
    labelColor: 'rgba(255, 248, 238, 0.9)',
    inkColor: '#3d2811',
  },
  {
    id: 'education',
    label: 'Education',
    theme: 'spring',
    anchor: [-0.92, 0.4, -0.12],
    focusPosition: [4.65, 3.42, 5.9],
    focusLookAt: [-0.92, 1.0, -0.12],
    color: 'rgba(241, 194, 123, 0.96)',
    labelColor: 'rgba(255, 248, 235, 0.9)',
    inkColor: '#43260e',
  },
  {
    id: 'work',
    label: 'Work',
    theme: 'fountain',
    anchor: [2.15, 0.18, 0.74],
    focusPosition: [6.55, 3.08, 5.5],
    focusLookAt: [2.15, 0.82, 0.74],
    color: 'rgba(165, 208, 242, 0.96)',
    labelColor: 'rgba(242, 249, 255, 0.9)',
    inkColor: '#14304a',
  },
  {
    id: 'contact',
    label: 'Contact',
    theme: 'warm',
    anchor: [1.98, 0.44, 4.45],
    focusPosition: [5.85, 2.9, 8.3],
    focusLookAt: [1.98, 0.92, 4.45],
    color: 'rgba(224, 192, 150, 0.96)',
    labelColor: 'rgba(255, 249, 242, 0.9)',
    inkColor: '#3a2413',
  },
];

const WAYPOINTS_BY_ID = Object.fromEntries(
  WAYPOINTS.map((waypoint) => [waypoint.id, waypoint]),
);

const PANEL_COPY = {
  certifications: {
    eyebrow: 'Sakura branch',
    title: 'Certifications',
    intro:
      'The sakura panel keeps the archive in a padded grid, opens enlarged previews in-place, and preserves direct PDF downloads.',
    theme: 'sakura',
  },
  projects: {
    eyebrow: 'Playground pavilion',
    title: 'Projects',
    intro:
      'Project cards keep the logos small and stable, then open focused details with an explicit GitHub redirect action.',
    theme: 'playground',
  },
  education: {
    eyebrow: 'Spring tree',
    title: 'Education',
    intro:
      'The spring tree panel focuses on the academic path only, ordered from newest to oldest and expanded on demand.',
    theme: 'spring',
  },
  work: {
    eyebrow: 'Fountain path',
    title: 'Work',
    intro:
      'The fountain panel isolates work history into its own timeline so the two career tracks no longer compete inside one list.',
    theme: 'fountain',
  },
  contact: {
    eyebrow: 'Information counter',
    title: 'Contact',
    intro:
      'The full-width contact form posts to Formspree and keeps GitHub, email, and resume links inside the same panel.',
    theme: 'warm',
  },
};

const BLOSSOM_OFFSETS = buildBlossomOffsets();
const SPRING_CANOPY_OFFSETS = buildSpringCanopyOffsets();
const PATH_STONES = buildPathStones();
const SHRUB_POSITIONS = [
  [-5.95, -0.6, 1.15],
  [-4.8, -0.58, 3.78],
  [4.85, -0.58, -0.45],
  [4.95, -0.58, 2.58],
  [1.22, -0.58, 5.12],
];

function buildBlossomOffsets() {
  const offsets = [];

  for (let index = 0; index < 24; index += 1) {
    const angle = (Math.PI * 2 * index) / 24;
    const radius = 1.15 + (index % 4) * 0.24;
    const height = -0.48 + (index % 5) * 0.3;
    const scale = 0.5 + (index % 4) * 0.16;

    offsets.push({
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius * 0.86,
      scale,
    });
  }

  offsets.push({ x: 0, y: 0.72, z: 0, scale: 1.08 });
  offsets.push({ x: -0.54, y: 0.58, z: -0.16, scale: 0.92 });
  offsets.push({ x: 0.48, y: 0.62, z: 0.2, scale: 0.88 });

  return offsets;
}

function buildSpringCanopyOffsets() {
  const offsets = [];

  for (let index = 0; index < 18; index += 1) {
    const angle = (Math.PI * 2 * index) / 18;
    const radius = 0.92 + (index % 3) * 0.2;
    const height = -0.34 + (index % 4) * 0.28;

    offsets.push({
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius * 0.92,
      scale: 0.54 + (index % 3) * 0.14,
    });
  }

  offsets.push({ x: 0, y: 0.48, z: 0, scale: 0.92 });

  return offsets;
}

function buildPathStones() {
  return Array.from({ length: 12 }, (_, index) => ({
    position: [-0.65 + (index % 3) * 0.62, -1.03, 5.4 - index * 0.88],
    scale: 0.58 + ((index + 1) % 3) * 0.1,
    rotation: ((index % 4) - 1.5) * 0.16,
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
      return '#f2bf70';
    case 'playground':
      return '#f6ca8f';
    case 'warm':
      return '#e6c39d';
    case 'sakura':
    default:
      return '#f5c6dc';
  }
}

function resetParticle(particle, waypoint, stagger = 0) {
  const isFountain = waypoint.theme === 'fountain';
  const isSakura = waypoint.theme === 'sakura';
  const spread = isFountain ? 1.7 : 1.1;
  const lift = isFountain ? 2.45 : isSakura ? 0.95 : 1.18;
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.14 + Math.random() * spread * 0.18;

  particle.active = true;
  particle.delay = stagger;
  particle.maxLife = isFountain ? 0.8 + Math.random() * 0.4 : 1 + Math.random() * 0.75;
  particle.life = particle.maxLife;
  particle.scale = isFountain ? 0.05 + Math.random() * 0.04 : 0.06 + Math.random() * 0.05;
  particle.position.set(
    waypoint.anchor[0] + Math.cos(angle) * radius,
    waypoint.anchor[1] + (isFountain ? 0 : 0.15),
    waypoint.anchor[2] + Math.sin(angle) * radius,
  );
  particle.velocity.set(
    Math.cos(angle) * (isFountain ? 0.16 : 0.34),
    lift + Math.random() * (isFountain ? 0.62 : 0.34),
    Math.sin(angle) * (isFountain ? 0.16 : 0.28),
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
  transitionProgress,
}) {
  const rootRef = useRef(null);
  const sakuraCanopyRef = useRef(null);
  const sakuraBlossomMeshRef = useRef(null);
  const springCanopyRef = useRef(null);
  const springLeavesRef = useRef(null);
  const fountainWaterRef = useRef(null);
  const playgroundRoofRef = useRef(null);
  const infoDotRef = useRef(null);
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
  const focusAmountRef = useRef(0);
  const smoothedPointerRef = useRef({ x: 0, y: 0 });
  const projectionVectorRef = useRef(new THREE.Vector3());
  const baseCameraPositionRef = useRef(new THREE.Vector3());
  const baseCameraLookRef = useRef(new THREE.Vector3());
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
    if (!sakuraBlossomMeshRef.current || !springLeavesRef.current) {
      return;
    }

    BLOSSOM_OFFSETS.forEach((offset, index) => {
      dummyRef.current.position.set(offset.x, offset.y, offset.z);
      dummyRef.current.scale.setScalar(offset.scale);
      dummyRef.current.rotation.set(0, 0, 0);
      dummyRef.current.updateMatrix();
      sakuraBlossomMeshRef.current.setMatrixAt(index, dummyRef.current.matrix);
    });

    SPRING_CANOPY_OFFSETS.forEach((offset, index) => {
      dummyRef.current.position.set(offset.x, offset.y, offset.z);
      dummyRef.current.scale.setScalar(offset.scale);
      dummyRef.current.rotation.set(0, 0, 0);
      dummyRef.current.updateMatrix();
      springLeavesRef.current.setMatrixAt(index, dummyRef.current.matrix);
    });

    sakuraBlossomMeshRef.current.instanceMatrix.needsUpdate = true;
    springLeavesRef.current.instanceMatrix.needsUpdate = true;
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

    smoothedPointer.x = THREE.MathUtils.damp(smoothedPointer.x, pointer.x, 3.6, delta);
    smoothedPointer.y = THREE.MathUtils.damp(smoothedPointer.y, pointer.y, 3.2, delta);

    focusAmountRef.current = THREE.MathUtils.damp(
      focusAmountRef.current,
      focusId ? 1 : 0,
      focusId ? 4.2 : 5.4,
      delta,
    );

    const easedIntro = reducedMotion
      ? 1
      : transitionProgress < 0.5
        ? 4 * transitionProgress ** 3
        : 1 - ((-2 * transitionProgress + 2) ** 3) / 2;
    const easedFocus = 1 - (1 - focusAmountRef.current) ** 2;

    baseCameraPositionRef.current.copy(GARDEN_CAMERA_POSITION);
    baseCameraPositionRef.current.x += smoothedPointer.x * 0.54;
    baseCameraPositionRef.current.y += smoothedPointer.y * 0.24;
    baseCameraPositionRef.current.z += smoothedPointer.x * 0.2;

    baseCameraLookRef.current.copy(GARDEN_LOOK_AT);
    baseCameraLookRef.current.x += smoothedPointer.x * 0.32;
    baseCameraLookRef.current.y += smoothedPointer.y * 0.12;
    baseCameraLookRef.current.z += smoothedPointer.y * 0.2;

    cameraPositionRef.current.copy(ENTRY_CAMERA_POSITION);
    cameraPositionRef.current.lerp(baseCameraPositionRef.current, easedIntro);

    cameraLookRef.current.copy(ENTRY_LOOK_AT);
    cameraLookRef.current.lerp(baseCameraLookRef.current, easedIntro);

    const focusWaypoint = focusId ? WAYPOINTS_BY_ID[focusId] : null;

    if (focusWaypoint) {
      tempPositionRef.current.fromArray(focusWaypoint.focusPosition);
      tempLookRef.current.fromArray(focusWaypoint.focusLookAt);
      cameraPositionRef.current.lerp(tempPositionRef.current, easedFocus);
      cameraLookRef.current.lerp(tempLookRef.current, easedFocus);
    }

    camera.position.copy(cameraPositionRef.current);
    camera.fov = THREE.MathUtils.lerp(24, 35, easedIntro);
    camera.updateProjectionMatrix();
    camera.lookAt(cameraLookRef.current);

    if (rootRef.current) {
      rootRef.current.rotation.y = THREE.MathUtils.damp(
        rootRef.current.rotation.y,
        smoothedPointer.x * 0.04,
        4,
        delta,
      );
      rootRef.current.rotation.x = THREE.MathUtils.damp(
        rootRef.current.rotation.x,
        smoothedPointer.y * 0.018,
        4,
        delta,
      );
    }

    if (sakuraCanopyRef.current) {
      const sakuraBurst =
        burstStateRef.current.id === 'certifications'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;

      sakuraCanopyRef.current.rotation.y = Math.sin(elapsed * 0.34) * 0.08;
      sakuraCanopyRef.current.rotation.z =
        Math.cos(elapsed * 0.31) * 0.03 + sakuraBurst * 0.05;
    }

    if (springCanopyRef.current) {
      const springBurst =
        burstStateRef.current.id === 'education'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;

      springCanopyRef.current.rotation.y = Math.sin(elapsed * 0.42) * 0.06;
      springCanopyRef.current.rotation.z =
        Math.cos(elapsed * 0.36) * 0.022 + springBurst * 0.04;
    }

    if (fountainWaterRef.current) {
      const fountainBurst =
        burstStateRef.current.id === 'work'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;
      fountainWaterRef.current.scale.y =
        1 + Math.sin(elapsed * 3.8) * 0.06 + fountainBurst * 0.26;
      fountainWaterRef.current.position.y = 0.85 + Math.sin(elapsed * 3.8) * 0.04;
    }

    if (playgroundRoofRef.current) {
      const playgroundBurst =
        burstStateRef.current.id === 'projects'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;
      playgroundRoofRef.current.position.y = 1 + playgroundBurst * 0.14;
    }

    if (infoDotRef.current) {
      const infoBurst =
        burstStateRef.current.id === 'contact'
          ? Math.max(0, (burstStateRef.current.endTime - now) / 950)
          : 0;
      infoDotRef.current.emissiveIntensity =
        0.42 + Math.sin(elapsed * 2.4) * 0.08 + infoBurst * 1.1;
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
          delta * (burstStateRef.current.waypoint.theme === 'fountain' ? 4.1 : 0.86);
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
          (projectionVectorRef.current.x * 0.5 + 0.5) * size.width > size.width * 0.64
            ? 'left'
            : 'right',
        visible:
          transitionProgress > 0.24 &&
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
      activeParticles > 0 ||
      pointerIsSettling ||
      Math.abs(focusAmountRef.current - (focusId ? 1 : 0)) > 0.002 ||
      transitionProgress < 0.999
    ) {
      invalidate();
    }
  });

  return (
    <>
      <ambientLight intensity={1.14} />
      <directionalLight
        castShadow
        intensity={1.35}
        position={[6.4, 10.8, 5.4]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={0.42} position={[-6, 5, -4]} />

      <group ref={rootRef}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
          <planeGeometry args={[22, 22]} />
          <meshStandardMaterial color="#dce9db" roughness={1} />
        </mesh>

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0.05, -1.04, 1.4]}>
          <planeGeometry args={[4.2, 12.6]} />
          <meshStandardMaterial color="#d8c2a1" roughness={0.98} />
        </mesh>

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-1.05, -1.02, -0.2]}>
          <planeGeometry args={[3.8, 3.2]} />
          <meshStandardMaterial color="#d7e6c9" roughness={0.98} />
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

        <group position={[-3.2, -0.08, -1.1]}>
          <mesh castShadow position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.28, 0.48, 3.35, 7]} />
            <meshStandardMaterial color="#674433" roughness={0.95} />
          </mesh>
          <mesh
            castShadow
            position={[-0.34, 1.72, -0.1]}
            rotation={[0.72, 0.22, -0.78]}
            scale={[0.18, 1.9, 0.18]}
          >
            <cylinderGeometry args={[0.18, 0.42, 1, 6]} />
            <meshStandardMaterial color="#6f4937" roughness={0.95} />
          </mesh>
          <mesh
            castShadow
            position={[0.45, 1.82, 0.18]}
            rotation={[0.64, -0.4, 0.5]}
            scale={[0.16, 1.72, 0.16]}
          >
            <cylinderGeometry args={[0.18, 0.4, 1, 6]} />
            <meshStandardMaterial color="#6f4937" roughness={0.95} />
          </mesh>
          <group ref={sakuraCanopyRef} position={[0, 2.48, 0]}>
            <instancedMesh
              ref={sakuraBlossomMeshRef}
              args={[undefined, undefined, BLOSSOM_OFFSETS.length]}
              castShadow
            >
              <sphereGeometry args={[0.52, 7, 7]} />
              <meshStandardMaterial color="#f4c0d9" roughness={0.68} />
            </instancedMesh>
          </group>
          <mesh castShadow position={[0.42, 0.06, 0.74]}>
            <boxGeometry args={[1.58, 0.18, 0.52]} />
            <meshStandardMaterial color="#9d6f48" roughness={0.92} />
          </mesh>
          <mesh castShadow position={[0.42, -0.22, 0.52]}>
            <boxGeometry args={[0.12, 0.46, 0.12]} />
            <meshStandardMaterial color="#7a5839" roughness={0.94} />
          </mesh>
          <mesh castShadow position={[0.42, -0.22, 0.96]}>
            <boxGeometry args={[0.12, 0.46, 0.12]} />
            <meshStandardMaterial color="#7a5839" roughness={0.94} />
          </mesh>
        </group>

        <group position={[-0.8, -0.08, -0.1]}>
          <mesh castShadow position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.22, 0.34, 2.56, 7]} />
            <meshStandardMaterial color="#74543b" roughness={0.95} />
          </mesh>
          <group ref={springCanopyRef} position={[0, 1.8, 0]}>
            <instancedMesh
              ref={springLeavesRef}
              args={[undefined, undefined, SPRING_CANOPY_OFFSETS.length]}
              castShadow
            >
              <sphereGeometry args={[0.48, 7, 7]} />
              <meshStandardMaterial color="#efb76a" roughness={0.72} />
            </instancedMesh>
          </group>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0.64, -0.67, 0.48]}>
            <planeGeometry args={[1.1, 1.5]} />
            <meshStandardMaterial color="#f1dec4" roughness={0.98} />
          </mesh>
          <mesh castShadow position={[1.02, -0.56, 0.08]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#f3be67" roughness={0.84} />
          </mesh>
          <mesh castShadow position={[1.18, -0.58, 0.18]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffd07b" roughness={0.84} />
          </mesh>
          <mesh castShadow position={[0.9, -0.58, 0.2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ff966c" roughness={0.84} />
          </mesh>
        </group>

        <group position={[-5.1, -0.78, 2.62]}>
          <mesh castShadow position={[0, 0.24, 0]}>
            <boxGeometry args={[1.72, 0.38, 1.56]} />
            <meshStandardMaterial color="#8c6544" roughness={0.92} />
          </mesh>
          <mesh
            ref={playgroundRoofRef}
            castShadow
            position={[0, 1, 0]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <coneGeometry args={[1.42, 1, 4]} />
            <meshStandardMaterial color="#d8a36f" roughness={0.82} />
          </mesh>
          <mesh castShadow position={[-0.55, 0.68, -0.52]}>
            <boxGeometry args={[0.16, 0.94, 0.16]} />
            <meshStandardMaterial color="#6f4e33" roughness={0.94} />
          </mesh>
          <mesh castShadow position={[0.55, 0.68, 0.52]}>
            <boxGeometry args={[0.16, 0.94, 0.16]} />
            <meshStandardMaterial color="#6f4e33" roughness={0.94} />
          </mesh>
        </group>

        <group position={[2.2, -0.78, 0.68]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[1.02, 1.2, 0.34, 14]} />
            <meshStandardMaterial color="#efe2cf" roughness={0.98} />
          </mesh>
          <mesh castShadow position={[0, 0.56, 0]}>
            <cylinderGeometry args={[0.58, 0.72, 0.38, 14]} />
            <meshStandardMaterial color="#faf2e5" roughness={0.94} />
          </mesh>
          <mesh ref={fountainWaterRef} position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.72, 10]} />
            <meshStandardMaterial color="#b9e1ff" roughness={0.18} metalness={0.06} />
          </mesh>
          <mesh position={[0, 1.28, 0]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#d8efff" roughness={0.22} metalness={0.04} />
          </mesh>
        </group>

        <group position={[1.95, -0.78, 4.45]}>
          <mesh castShadow position={[0, 0.28, 0]}>
            <boxGeometry args={[1.3, 0.56, 0.92]} />
            <meshStandardMaterial color="#dbc09b" roughness={0.94} />
          </mesh>
          <mesh castShadow position={[0, 0.88, 0]}>
            <boxGeometry args={[0.88, 0.66, 0.52]} />
            <meshStandardMaterial color="#8f6945" roughness={0.92} />
          </mesh>
          <mesh castShadow position={[0, 1.28, 0]}>
            <boxGeometry args={[1.38, 0.2, 0.16]} />
            <meshStandardMaterial color="#f5ede1" roughness={0.78} />
          </mesh>
          <mesh castShadow position={[0.1, 0.88, 0.28]}>
            <boxGeometry args={[0.1, 0.38, 0.02]} />
            <meshStandardMaterial color="#faf2e5" roughness={0.68} />
          </mesh>
          <mesh position={[0.1, 1.14, 0.3]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial
              ref={infoDotRef}
              color="#ffe3a9"
              emissive="#f7d27c"
              emissiveIntensity={0.42}
              roughness={0.2}
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
          <octahedronGeometry args={[0.11, 0]} />
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
  transitionProgress = 0,
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
  const educationItems = timelineItems.filter((item) => item.kind === 'education');
  const workItems = timelineItems.filter((item) => item.kind === 'job');

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
  const revealProgress = reducedMotion
    ? 1
    : transitionState === 'open'
      ? 1
      : transitionState === 'entering'
        ? transitionProgress
        : 0;

  return (
    <div
      id="desktop-garden"
      className={clsx(styles.overlay, {
        [styles.open]: transitionState === 'open',
        [styles.modalOpen]: sceneBlocked,
      })}
      style={{
        opacity: Math.max(0, revealProgress * 1.04 - 0.04),
        transform: `scale(${1.03 - revealProgress * 0.03})`,
        filter: `blur(${(1 - revealProgress) * 8}px) saturate(${0.94 + revealProgress * 0.08})`,
        pointerEvents: transitionState === 'open' ? 'auto' : 'none',
      }}
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
            camera={{ position: GARDEN_CAMERA_POSITION.toArray(), fov: 35 }}
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
              transitionProgress={revealProgress}
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
        {activePanelId === 'projects' ? <ProjectShowcase items={projects} /> : null}
        {activePanelId === 'education' ? (
          <EducationTimeline items={educationItems} theme="spring" />
        ) : null}
        {activePanelId === 'work' ? (
          <EducationTimeline items={workItems} theme="fountain" />
        ) : null}
        {activePanelId === 'contact' ? <ContactPanel /> : null}
      </ModalPanel>
    </div>
  );
}
