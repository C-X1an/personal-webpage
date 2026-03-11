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

const CAMERA_INTRO_POSITION = new THREE.Vector3(0.35, 7.2, 5.25);
const CAMERA_FINAL_POSITION = new THREE.Vector3(0.45, 14.6, 9.4);
const CAMERA_LOOK_AT = new THREE.Vector3(0.1, 0.8, 0.7);
const PARTICLE_COUNT = 150;

const WAYPOINTS = [
  {
    id: 'certifications',
    label: 'Certifications',
    theme: 'sakura',
    anchor: [-1.1, 3.2, -1.8],
    color: 'rgba(226, 148, 187, 0.94)',
    labelColor: 'rgba(226, 148, 187, 0.9)',
    inkColor: '#2f1722',
  },
  {
    id: 'projects',
    label: 'Projects',
    theme: 'spring',
    anchor: [-4.2, 1.26, 1.3],
    color: 'rgba(129, 181, 139, 0.94)',
    labelColor: 'rgba(129, 181, 139, 0.9)',
    inkColor: '#112117',
  },
  {
    id: 'education',
    label: 'Education + Work',
    theme: 'fountain',
    anchor: [3.8, 1.3, 0.52],
    color: 'rgba(121, 174, 207, 0.94)',
    labelColor: 'rgba(121, 174, 207, 0.9)',
    inkColor: '#0f2237',
  },
  {
    id: 'contact',
    label: 'Contact kiosk',
    theme: 'warm',
    anchor: [1.4, 1.28, 3.35],
    color: 'rgba(197, 155, 103, 0.94)',
    labelColor: 'rgba(197, 155, 103, 0.9)',
    inkColor: '#291d12',
  },
];

const PANEL_COPY = {
  certifications: {
    eyebrow: 'Sakura canopy',
    title: 'Certifications',
    intro:
      'Searchable certificate cards sit in a soft pink panel that stays readable while the garden remains visually present behind the overlay.',
    theme: 'sakura',
  },
  projects: {
    eyebrow: 'Playground pavilion',
    title: 'Projects',
    intro:
      'The pavilion panel keeps project context concise: what each build does, the main stack, and the fastest route to the source.',
    theme: 'spring',
  },
  education: {
    eyebrow: 'Fountain route',
    title: 'Education and work',
    intro:
      'This timeline uses equal row spacing so each stop keeps the same visual cadence even when bullet counts vary.',
    theme: 'fountain',
  },
  contact: {
    eyebrow: 'Info kiosk',
    title: 'Contact',
    intro:
      'The contact panel sends Formspree requests client-side and keeps a direct mail draft available when delivery is unavailable.',
    theme: 'warm',
  },
};

const BLOSSOM_OFFSETS = buildBlossomOffsets();
const PATH_STONES = buildPathStones();
const SHRUB_POSITIONS = [
  [-5.2, -0.48, 0.1],
  [-4.6, -0.4, 2.2],
  [4.7, -0.42, -0.1],
  [4.5, -0.4, 2.2],
  [0.9, -0.44, 4.6],
];

function buildBlossomOffsets() {
  const offsets = [];

  for (let index = 0; index < 26; index += 1) {
    const angle = (Math.PI * 2 * index) / 26;
    const radius = 1.2 + (index % 4) * 0.22;
    const height = -0.3 + (index % 6) * 0.22;
    const scale = 0.52 + (index % 5) * 0.12;

    offsets.push({
      x: Math.cos(angle) * radius,
      y: height,
      z: Math.sin(angle) * radius * 0.78,
      scale,
    });
  }

  offsets.push({ x: 0, y: 0.48, z: 0, scale: 1.16 });
  offsets.push({ x: -0.52, y: 0.62, z: -0.2, scale: 0.92 });
  offsets.push({ x: 0.42, y: 0.56, z: 0.16, scale: 0.92 });

  return offsets;
}

function buildPathStones() {
  return Array.from({ length: 10 }, (_, index) => ({
    position: [-0.4 + (index % 3) * 0.45, -0.95, 4.5 - index * 0.76],
    scale: 0.5 + ((index + 1) % 3) * 0.12,
    rotation: ((index % 4) - 1.5) * 0.18,
  }));
}

function createProjectedWaypoints() {
  return WAYPOINTS.map((waypoint) => ({
    ...waypoint,
    x: 0,
    y: 0,
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
    spin: 0,
    rotation: new THREE.Euler(),
  }));
}

function getThemeColor(theme) {
  switch (theme) {
    case 'fountain':
      return '#b7dbff';
    case 'spring':
      return '#b2d9b9';
    case 'warm':
      return '#f2c996';
    case 'sakura':
    default:
      return '#f6d9e8';
  }
}

function resetParticle(particle, anchor, theme, stagger = 0) {
  const spread = theme === 'fountain' ? 1.2 : 0.9;
  const lift = theme === 'fountain' ? 0.8 : 0.45;
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.16 + Math.random() * spread;

  particle.active = true;
  particle.delay = stagger;
  particle.maxLife = 1.8 + Math.random() * 2.2;
  particle.life = particle.maxLife;
  particle.scale = 0.04 + Math.random() * 0.08;
  particle.position.set(
    anchor[0] + Math.cos(angle) * radius * 0.18,
    anchor[1] + Math.random() * 0.22,
    anchor[2] + Math.sin(angle) * radius * 0.18,
  );
  particle.velocity.set(
    Math.cos(angle) * radius * 0.34,
    lift + Math.random() * 0.3,
    Math.sin(angle) * radius * 0.28,
  );
  particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  particle.spin = (Math.random() - 0.5) * 2.2;
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
  projectedWaypointsRef,
  onProjectWaypoints,
  reducedMotion,
  invalidateRef,
}) {
  const rootRef = useRef(null);
  const canopyRef = useRef(null);
  const blossomMeshRef = useRef(null);
  const particleMeshRef = useRef(null);
  const particleMaterialRef = useRef(null);
  const dummyRef = useRef(new THREE.Object3D());
  const particleStateRef = useRef(createBurstParticles());
  const burstStateRef = useRef({
    anchor: WAYPOINTS[0].anchor,
    endTime: 0,
    theme: 'sakura',
    token: 0,
  });
  const introProgressRef = useRef(reducedMotion ? 1 : 0);
  const cameraTargetRef = useRef(CAMERA_FINAL_POSITION.clone());
  const lookTargetRef = useRef(CAMERA_LOOK_AT.clone());
  const projectionVectorRef = useRef(new THREE.Vector3());
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

    burstStateRef.current = {
      anchor: burstTrigger.anchor,
      endTime:
        performance.now() + (reducedMotion ? 1200 : 12000),
      theme: burstTrigger.theme,
      token: burstTrigger.token,
    };

    particleMaterialRef.current.color.set(getThemeColor(burstTrigger.theme));

    particleStateRef.current.forEach((particle, index) => {
      resetParticle(
        particle,
        burstTrigger.anchor,
        burstTrigger.theme,
        index * 0.018,
      );
    });

    invalidate();
  }, [burstTrigger, invalidate, reducedMotion]);

  useFrame((state, delta) => {
    const now = performance.now();
    const introDuration = reducedMotion ? 0.01 : 1.18;
    const pointer = pointerRef.current;

    introProgressRef.current = Math.min(
      1,
      introProgressRef.current + delta / introDuration,
    );

    const easedIntro = 1 - (1 - introProgressRef.current) ** 3;

    cameraTargetRef.current.lerpVectors(
      CAMERA_INTRO_POSITION,
      CAMERA_FINAL_POSITION,
      easedIntro,
    );
    cameraTargetRef.current.x += pointer.x * 0.56;
    cameraTargetRef.current.y += pointer.y * 0.34;
    cameraTargetRef.current.z += pointer.x * 0.28;

    lookTargetRef.current.copy(CAMERA_LOOK_AT);
    lookTargetRef.current.x += pointer.x * 0.62;
    lookTargetRef.current.z += pointer.y * 0.34;

    camera.position.lerp(cameraTargetRef.current, 0.12);
    camera.lookAt(lookTargetRef.current);

    if (rootRef.current) {
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        pointer.x * 0.08,
        0.08,
      );
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        pointer.y * 0.035,
        0.08,
      );
    }

    if (canopyRef.current) {
      const elapsed = state.clock.getElapsedTime();
      canopyRef.current.rotation.y = Math.sin(elapsed * 0.34) * 0.06;
      canopyRef.current.rotation.z = Math.cos(elapsed * 0.42) * 0.025;
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
        particle.velocity.y -= delta * 0.18;
        particle.rotation.y += particle.spin * delta;

        if (particle.life <= 0) {
          if (now < burstStateRef.current.endTime) {
            resetParticle(
              particle,
              burstStateRef.current.anchor,
              burstStateRef.current.theme,
            );
          } else {
            particle.active = false;
          }
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
        visible:
          projectionVectorRef.current.z < 1 &&
          projectionVectorRef.current.z > -1 &&
          projectionVectorRef.current.x >= -1.1 &&
          projectionVectorRef.current.x <= 1.1 &&
          projectionVectorRef.current.y >= -1.1 &&
          projectionVectorRef.current.y <= 1.1,
      };
    });

    const shouldUpdateProjection = nextProjectedWaypoints.some((item, index) => {
      const previous = projectedWaypointsRef.current[index];

      return (
        !previous ||
        Math.abs(previous.x - item.x) > 0.4 ||
        Math.abs(previous.y - item.y) > 0.4 ||
        previous.visible !== item.visible
      );
    });

    if (shouldUpdateProjection) {
      projectedWaypointsRef.current = nextProjectedWaypoints;
      onProjectWaypoints(nextProjectedWaypoints);
    }

    const pointerMotion =
      Math.abs(pointer.x) > 0.001 ||
      Math.abs(pointer.y) > 0.001 ||
      camera.position.distanceTo(cameraTargetRef.current) > 0.01;

    if (introProgressRef.current < 1 || activeParticles > 0 || pointerMotion) {
      invalidate();
    }
  });

  return (
    <>
      <ambientLight intensity={1.08} />
      <directionalLight
        castShadow
        intensity={1.3}
        position={[5.6, 9.4, 5.2]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={0.36} position={[-5, 5, -3]} />

      <group ref={rootRef}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#dfe6d7" roughness={1} />
        </mesh>

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.04, 1.3]}>
          <planeGeometry args={[3.2, 10.8]} />
          <meshStandardMaterial color="#d6c1a2" roughness={0.96} />
        </mesh>

        {PATH_STONES.map((stone) => (
          <mesh
            key={stone.position.join('-')}
            receiveShadow
            castShadow
            position={stone.position}
            rotation={[-Math.PI / 2, 0, stone.rotation]}
            scale={[stone.scale, stone.scale * 0.82, 1]}
          >
            <cylinderGeometry args={[0.46, 0.52, 0.16, 6]} />
            <meshStandardMaterial color="#c2ae93" roughness={0.98} />
          </mesh>
        ))}

        <group position={[-1.1, -0.02, -1.8]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.28, 0.46, 2.9, 7]} />
            <meshStandardMaterial color="#624133" roughness={0.94} />
          </mesh>

          <mesh
            castShadow
            position={[-0.22, 1.55, -0.1]}
            rotation={[0.8, 0.2, -0.7]}
            scale={[0.18, 1.6, 0.18]}
          >
            <cylinderGeometry args={[0.2, 0.42, 1, 6]} />
            <meshStandardMaterial color="#6d4938" roughness={0.95} />
          </mesh>

          <mesh
            castShadow
            position={[0.34, 1.72, 0.12]}
            rotation={[0.7, -0.46, 0.48]}
            scale={[0.16, 1.42, 0.16]}
          >
            <cylinderGeometry args={[0.2, 0.42, 1, 6]} />
            <meshStandardMaterial color="#6a4737" roughness={0.95} />
          </mesh>

          <group ref={canopyRef} position={[0, 2.45, 0]}>
            <instancedMesh
              ref={blossomMeshRef}
              args={[undefined, undefined, BLOSSOM_OFFSETS.length]}
              castShadow
            >
              <sphereGeometry args={[0.46, 7, 7]} />
              <meshStandardMaterial color="#f5c3da" roughness={0.65} />
            </instancedMesh>
          </group>
        </group>

        <group position={[-4.2, -0.74, 1.3]}>
          <mesh castShadow position={[0, 0.2, 0]}>
            <boxGeometry args={[1.48, 0.34, 1.32]} />
            <meshStandardMaterial color="#896444" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.18, 0.72, 4]} />
            <meshStandardMaterial color="#c08a5f" roughness={0.82} />
          </mesh>
          <mesh castShadow position={[-0.42, 0.56, -0.42]}>
            <boxGeometry args={[0.16, 0.72, 0.16]} />
            <meshStandardMaterial color="#6f4e33" roughness={0.94} />
          </mesh>
          <mesh castShadow position={[0.42, 0.56, 0.42]}>
            <boxGeometry args={[0.16, 0.72, 0.16]} />
            <meshStandardMaterial color="#6f4e33" roughness={0.94} />
          </mesh>
        </group>

        <group position={[3.8, -0.76, 0.52]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.92, 1.08, 0.28, 12]} />
            <meshStandardMaterial color="#ebddc9" roughness={0.98} />
          </mesh>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.48, 0.62, 0.32, 12]} />
            <meshStandardMaterial color="#f7eee0" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.54, 10]} />
            <meshStandardMaterial color="#b7d8ff" roughness={0.22} metalness={0.06} />
          </mesh>
          <mesh position={[0, 1.14, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#d2ebff" roughness={0.2} metalness={0.04} />
          </mesh>
        </group>

        <group position={[1.4, -0.72, 3.35]}>
          <mesh castShadow position={[0, 0.24, 0]}>
            <boxGeometry args={[0.88, 0.42, 0.62]} />
            <meshStandardMaterial color="#d5bd96" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, 0.72, 0]}>
            <boxGeometry args={[0.52, 0.48, 0.28]} />
            <meshStandardMaterial color="#8b6541" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 1.08, 0]}>
            <boxGeometry args={[0.82, 0.18, 0.12]} />
            <meshStandardMaterial color="#f2e8d8" roughness={0.78} />
          </mesh>
        </group>

        {SHRUB_POSITIONS.map((position) => (
          <mesh
            key={position.join('-')}
            castShadow
            position={position}
            scale={[1.1, 0.74, 0.92]}
          >
            <sphereGeometry args={[0.42, 6, 6]} />
            <meshStandardMaterial color="#86b48f" roughness={0.86} />
          </mesh>
        ))}

        <instancedMesh ref={particleMeshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial
            ref={particleMaterialRef}
            color="#f6d9e8"
            roughness={0.45}
            transparent
            opacity={0.92}
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
  onExit,
  onModalChange,
}) {
  const [activePanelId, setActivePanelId] = useState(null);
  const [projectedWaypoints, setProjectedWaypoints] = useState(createProjectedWaypoints);
  const [burstTrigger, setBurstTrigger] = useState({
    token: 0,
    anchor: WAYPOINTS[0].anchor,
    theme: WAYPOINTS[0].theme,
  });
  const invalidateRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const projectedWaypointsRef = useRef(createProjectedWaypoints());

  useEffect(() => {
    onModalChange(Boolean(activePanelId));
  }, [activePanelId, onModalChange]);

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

  function handlePointerLeave() {
    pointerRef.current = { x: 0, y: 0 };
    queueRender();
  }

  function triggerBurst(waypointId) {
    const waypoint = WAYPOINTS.find((item) => item.id === waypointId);

    if (!waypoint) {
      return;
    }

    setBurstTrigger((currentState) => ({
      token: currentState.token + 1,
      anchor: waypoint.anchor,
      theme: waypoint.theme,
    }));
  }

  function handleWaypointActivate(waypointId) {
    triggerBurst(waypointId);
    setActivePanelId(waypointId);
  }

  const activePanel = activePanelId ? PANEL_COPY[activePanelId] : null;

  return (
    <div
      className={clsx(styles.overlay, {
        [styles.modalOpen]: Boolean(activePanel),
      })}
    >
      <div
        className={styles.frame}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <button
          type="button"
          className={styles.exitButton}
          onClick={onExit}
          aria-label="Return to the garden gate"
        >
          Back to gate
        </button>

        <p className={styles.caption} aria-live="polite">
          Bird&apos;s-eye garden
        </p>

        <div className={styles.canvasShell}>
          <Canvas
            className={styles.canvas}
            camera={{ position: CAMERA_INTRO_POSITION.toArray(), fov: 36 }}
            dpr={typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)}
            frameloop="demand"
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            shadows
          >
            <SceneRig
              pointerRef={pointerRef}
              burstTrigger={burstTrigger}
              projectedWaypointsRef={projectedWaypointsRef}
              onProjectWaypoints={setProjectedWaypoints}
              reducedMotion={reducedMotion}
              invalidateRef={invalidateRef}
            />
          </Canvas>
        </div>

        <WaypointOverlay
          items={projectedWaypoints}
          activeId={activePanelId}
          blocked={Boolean(activePanel)}
          onActivate={handleWaypointActivate}
          onPreview={triggerBurst}
        />
      </div>

      <ModalPanel
        isOpen={Boolean(activePanel)}
        theme={activePanel?.theme}
        eyebrow={activePanel?.eyebrow}
        title={activePanel?.title}
        intro={activePanel?.intro}
        onClose={() => setActivePanelId(null)}
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
