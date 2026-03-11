import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import styles from '../styles/Hero.module.css';

const CAMERA_ORIGIN = { x: 0, y: 2.35, z: 6.15 };
const CANOPY_SWAY_Y = 0.08;
const CANOPY_SWAY_Z = 0.03;
const PARTICLE_COUNT = 16;
const WAYPOINTS = [
  {
    id: 'projects',
    label: 'Projects',
    theme: 'spring',
    style: { left: '31%', top: '62%' },
  },
  {
    id: 'certifications',
    label: 'Certifications',
    theme: 'sakura',
    style: { left: '50%', top: '36%' },
  },
  {
    id: 'timeline',
    label: 'Education and work',
    theme: 'fountain',
    style: { left: '76%', top: '56%' },
  },
  {
    id: 'contact',
    label: 'Contact kiosk',
    theme: 'warm',
    style: { left: '60%', top: '70%' },
  },
];
const PANEL_CONTENT = {
  projects: {
    title: 'Projects',
    theme: 'spring',
    intro:
      'The pavilion keeps the first two project stories ready for a fuller panel build in later tasks.',
    items: [
      'PR Brief: structured pull request summaries, risk notes, and automation hooks.',
      'Driftline: semantic project drift detection for codebases and intended product scope.',
    ],
  },
  certifications: {
    title: 'Certifications',
    theme: 'sakura',
    intro:
      'The sakura waypoint previews the certification grove with a muted pink panel and readable foreground contrast.',
    items: [
      'CS50 Cybersecurity, Harvard University, March 2025.',
      'CS50AI, Harvard University, March 2025.',
      'CS50P, Harvard University, December 2024.',
      'CS50x, Harvard University, August 2024.',
    ],
  },
  timeline: {
    title: 'Education and Work',
    theme: 'fountain',
    intro:
      'The fountain panel anchors the timeline branch with a cool, soft surface that stays easy on the eyes.',
    items: [
      'GCE A Levels, Tampines Meridian Junior College, 2022 to 2023.',
      'BComp in Computer Science, Nanyang Technological University, 2026 to 2030.',
      'Information Technology Officer, Setsco Services, February 2024 to April 2024.',
    ],
  },
  contact: {
    title: 'Contact kiosk',
    theme: 'warm',
    intro:
      'The kiosk remains intentionally light in this scaffold while the later contact task wires delivery and richer content.',
    items: [
      'Desktop garden panels already support theming, dimming, and blocked background interactions.',
      'Smaller screens use the 2D route instead of mounting the WebGL experience.',
    ],
  },
};
const PANEL_THEME_STYLES = {
  sakura: {
    backgroundColor: 'rgba(246, 217, 232, 0.96)',
    borderColor: 'rgba(127, 81, 98, 0.2)',
    color: '#2f1f26',
  },
  spring: {
    backgroundColor: 'rgba(226, 241, 229, 0.96)',
    borderColor: 'rgba(72, 105, 81, 0.2)',
    color: '#15241b',
  },
  fountain: {
    backgroundColor: 'rgba(221, 237, 245, 0.96)',
    borderColor: 'rgba(69, 100, 121, 0.2)',
    color: '#132436',
  },
  warm: {
    backgroundColor: 'rgba(247, 238, 226, 0.97)',
    borderColor: 'rgba(122, 98, 69, 0.18)',
    color: '#2e2518',
  },
};

function buildBlossomOffsets() {
  const offsets = [];

  for (let index = 0; index < 15; index += 1) {
    const angle = (Math.PI * 2 * index) / 15;
    const radius = index % 3 === 0 ? 0.95 : 0.7 + (index % 4) * 0.08;
    const height = -0.2 + (index % 5) * 0.16;
    const scale = 0.75 + (index % 4) * 0.12;

    offsets.push({
      x: Math.cos(angle) * radius * 0.95,
      y: height,
      z: Math.sin(angle) * radius * 0.72,
      scale,
    });
  }

  offsets.push({ x: 0, y: 0.24, z: 0, scale: 1.16 });
  offsets.push({ x: -0.34, y: 0.42, z: 0.14, scale: 0.88 });
  offsets.push({ x: 0.32, y: 0.36, z: -0.18, scale: 0.86 });

  return offsets;
}

function resetParticle(particle, index, spread = 0) {
  const angle = (Math.PI * 2 * index) / PARTICLE_COUNT + Math.random() * 0.45;
  const radius = 0.24 + Math.random() * (0.7 + spread);

  particle.x = Math.cos(angle) * radius * 0.68;
  particle.y = 1.95 + Math.random() * 0.9;
  particle.z = Math.sin(angle) * radius * 0.56;
  particle.vx = (Math.random() - 0.5) * 0.18;
  particle.vy = 0.36 + Math.random() * 0.22;
  particle.vz = (Math.random() - 0.5) * 0.15;
  particle.rotation = Math.random() * Math.PI;
  particle.spin = (Math.random() - 0.5) * 1.8;
  particle.scale = 0.05 + Math.random() * 0.05;
  particle.delay = index * 0.025;
}

function resetParticles(particles, spread = 0.3) {
  particles.forEach((particle, index) => {
    resetParticle(particle, index, spread);
  });
}

function ensureParticleState(ref) {
  if (!ref.current) {
    ref.current = Array.from({ length: PARTICLE_COUNT }, () => ({}));
    resetParticles(ref.current);
  }

  return ref.current;
}

function updateParticleInstances(mesh, particles, dummy) {
  particles.forEach((particle, index) => {
    dummy.position.set(particle.x, particle.y, particle.z);
    dummy.rotation.set(0, particle.rotation, particle.rotation * 0.35);
    dummy.scale.setScalar(particle.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
}

function buildBranchPositions() {
  return [
    {
      position: [0.02, 1.2, 0.06],
      rotation: [0.62, 0.16, -0.58],
      scale: [0.16, 1.55, 0.16],
    },
    {
      position: [-0.14, 1.36, -0.02],
      rotation: [0.78, -0.52, 0.42],
      scale: [0.14, 1.15, 0.14],
    },
    {
      position: [0.22, 1.42, -0.1],
      rotation: [0.44, 0.7, -0.16],
      scale: [0.12, 0.98, 0.12],
    },
  ];
}

function FiberGarden({ fiber, threeModule, burstCount }) {
  const Canvas = fiber.Canvas;

  return (
    <Canvas
      className={styles.gardenCanvas}
      camera={{ position: [CAMERA_ORIGIN.x, CAMERA_ORIGIN.y, CAMERA_ORIGIN.z], fov: 40 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      shadows
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor('#000000', 0);
        invalidate();
      }}
    >
      <FiberScene fiber={fiber} threeModule={threeModule} burstCount={burstCount} />
    </Canvas>
  );
}

function FiberScene({ fiber, threeModule, burstCount }) {
  const canopyRef = useRef(null);
  const blossomMeshRef = useRef(null);
  const particleMeshRef = useRef(null);
  const blossomOffsetsRef = useRef(null);
  const particleStateRef = useRef(null);
  const dummyRef = useRef(null);
  const { invalidate } = fiber.useThree();

  if (!blossomOffsetsRef.current) {
    blossomOffsetsRef.current = buildBlossomOffsets();
  }

  if (!dummyRef.current) {
    dummyRef.current = new threeModule.Object3D();
  }

  const particles = ensureParticleState(particleStateRef);

  useEffect(() => {
    if (!blossomMeshRef.current || !particleMeshRef.current) {
      return;
    }

    blossomOffsetsRef.current.forEach((offset, index) => {
      dummyRef.current.position.set(offset.x, offset.y, offset.z);
      dummyRef.current.scale.setScalar(offset.scale);
      dummyRef.current.updateMatrix();
      blossomMeshRef.current.setMatrixAt(index, dummyRef.current.matrix);
    });

    blossomMeshRef.current.instanceMatrix.needsUpdate = true;
    updateParticleInstances(particleMeshRef.current, particles, dummyRef.current);
    invalidate();
  }, [invalidate, particles]);

  useEffect(() => {
    resetParticles(particles, 0.45);
    if (particleMeshRef.current) {
      updateParticleInstances(particleMeshRef.current, particles, dummyRef.current);
    }
    invalidate();
  }, [burstCount, invalidate, particles]);

  fiber.useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const targetX = state.pointer.x * 0.4;
    const targetY = CAMERA_ORIGIN.y + state.pointer.y * 0.12;

    state.camera.position.x += (targetX - state.camera.position.x) * Math.min(1, delta * 2.6);
    state.camera.position.y += (targetY - state.camera.position.y) * Math.min(1, delta * 2.6);
    state.camera.position.z +=
      (CAMERA_ORIGIN.z - state.camera.position.z) * Math.min(1, delta * 2.6);
    state.camera.lookAt(0, 0.9, 0);

    if (canopyRef.current) {
      canopyRef.current.rotation.y = Math.sin(elapsed * 0.42) * CANOPY_SWAY_Y;
      canopyRef.current.rotation.z = Math.cos(elapsed * 0.58) * CANOPY_SWAY_Z;
    }

    particles.forEach((particle, index) => {
      if (particle.delay > 0) {
        particle.delay -= delta;
        return;
      }

      particle.x += particle.vx * delta;
      particle.y -= particle.vy * delta;
      particle.z += particle.vz * delta;
      particle.rotation += particle.spin * delta;

      if (particle.y < -0.85) {
        resetParticle(particle, index, 0.45);
      }
    });

    if (particleMeshRef.current) {
      updateParticleInstances(particleMeshRef.current, particles, dummyRef.current);
    }

    invalidate();
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight
        castShadow
        intensity={1.35}
        position={[4.8, 7.2, 4.1]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight intensity={0.35} position={[-4, 3, -2]} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}>
        <planeGeometry args={[18, 18, 1, 1]} />
        <meshStandardMaterial color="#e6dfd0" roughness={1} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, -0.12]}>
        <planeGeometry args={[1.65, 8.2, 1, 1]} />
        <meshStandardMaterial color="#cdb79a" roughness={0.92} />
      </mesh>

      <group position={[0, -0.02, -0.28]}>
        <mesh castShadow position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.2, 0.32, 2.45, 7]} />
          <meshStandardMaterial color="#5c3c2f" roughness={0.94} />
        </mesh>

        {buildBranchPositions().map((branch, index) => (
          <mesh
            key={branch.position.join('-')}
            castShadow
            position={branch.position}
            rotation={branch.rotation}
            scale={branch.scale}
          >
            <cylinderGeometry args={[0.2, 0.42, 1, 6]} />
            <meshStandardMaterial
              color={index === 0 ? '#6b4737' : '#5f3f31'}
              roughness={0.96}
            />
          </mesh>
        ))}

        <group ref={canopyRef} position={[0, 1.8, 0]}>
          <instancedMesh
            ref={blossomMeshRef}
            args={[undefined, undefined, blossomOffsetsRef.current.length]}
            castShadow
          >
            <sphereGeometry args={[0.38, 7, 7]} />
            <meshStandardMaterial color="#f4bfd7" roughness={0.6} />
          </instancedMesh>
        </group>
      </group>

      <group position={[-2.25, -0.76, 0.56]}>
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[1.2, 0.34, 1.1]} />
          <meshStandardMaterial color="#816042" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, 0.64, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.95, 0.56, 4]} />
          <meshStandardMaterial color="#c58d62" roughness={0.82} />
        </mesh>
      </group>

      <group position={[2.55, -0.76, 0.62]}>
        <mesh castShadow position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.78, 0.92, 0.28, 12]} />
          <meshStandardMaterial color="#e9dcc9" roughness={0.98} />
        </mesh>
        <mesh castShadow position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.36, 0.48, 0.32, 12]} />
          <meshStandardMaterial color="#f3ebdf" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 10]} />
          <meshStandardMaterial color="#b9dced" roughness={0.3} />
        </mesh>
      </group>

      <group position={[1.05, -0.72, 1.36]}>
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[0.72, 0.34, 0.38]} />
          <meshStandardMaterial color="#ceb894" roughness={0.95} />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.42, 0.42, 0.22]} />
          <meshStandardMaterial color="#8c6743" roughness={0.88} />
        </mesh>
      </group>

      <instancedMesh ref={particleMeshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[0.14, 5, 5]} />
        <meshStandardMaterial color="#f6d9e8" roughness={0.45} />
      </instancedMesh>
    </>
  );
}

function PlainThreeGarden({ threeModule, burstCount }) {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const burstRef = useRef(burstCount);

  burstRef.current = burstCount;

  useEffect(() => {
    if (!canvasRef.current || !shellRef.current) {
      return undefined;
    }

    const shellNode = shellRef.current;
    const THREE = threeModule;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: canvasRef.current,
      powerPreference: 'high-performance',
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
    const root = new THREE.Group();
    const canopy = new THREE.Group();
    const particleDummy = new THREE.Object3D();
    const blossomDummy = new THREE.Object3D();
    const particleState = Array.from({ length: PARTICLE_COUNT }, () => ({}));
    const blossomOffsets = buildBlossomOffsets();
    const pointer = { x: 0, y: 0 };
    let animationFrameId = 0;
    let previousBurst = burstRef.current;
    let disposed = false;
    const clock = new THREE.Clock();

    resetParticles(particleState);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    camera.position.set(CAMERA_ORIGIN.x, CAMERA_ORIGIN.y, CAMERA_ORIGIN.z);
    scene.add(root);

    const ambientLight = new THREE.AmbientLight('#ffffff', 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.35);
    keyLight.position.set(4.8, 7.2, 4.1);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#ffffff', 0.35);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18, 1, 1),
      new THREE.MeshStandardMaterial({ color: '#e6dfd0', roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.08;
    ground.receiveShadow = true;
    root.add(ground);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(1.65, 8.2, 1, 1),
      new THREE.MeshStandardMaterial({ color: '#cdb79a', roughness: 0.92 }),
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, -1.05, -0.12);
    path.receiveShadow = true;
    root.add(path);

    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, -0.02, -0.28);
    root.add(treeGroup);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.32, 2.45, 7),
      new THREE.MeshStandardMaterial({ color: '#5c3c2f', roughness: 0.94 }),
    );
    trunk.position.set(0, 0.12, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    buildBranchPositions().forEach((branch, index) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.42, 1, 6),
        new THREE.MeshStandardMaterial({
          color: index === 0 ? '#6b4737' : '#5f3f31',
          roughness: 0.96,
        }),
      );
      mesh.position.set(...branch.position);
      mesh.rotation.set(...branch.rotation);
      mesh.scale.set(...branch.scale);
      mesh.castShadow = true;
      treeGroup.add(mesh);
    });

    canopy.position.set(0, 1.8, 0);
    treeGroup.add(canopy);

    const blossomMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.38, 7, 7),
      new THREE.MeshStandardMaterial({ color: '#f4bfd7', roughness: 0.6 }),
      blossomOffsets.length,
    );
    blossomMesh.castShadow = true;
    blossomOffsets.forEach((offset, index) => {
      blossomDummy.position.set(offset.x, offset.y, offset.z);
      blossomDummy.scale.setScalar(offset.scale);
      blossomDummy.updateMatrix();
      blossomMesh.setMatrixAt(index, blossomDummy.matrix);
    });
    canopy.add(blossomMesh);

    const pavilion = new THREE.Group();
    pavilion.position.set(-2.25, -0.76, 0.56);
    root.add(pavilion);

    const pavilionBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.34, 1.1),
      new THREE.MeshStandardMaterial({ color: '#816042', roughness: 0.9 }),
    );
    pavilionBase.position.set(0, 0.18, 0);
    pavilionBase.castShadow = true;
    pavilion.add(pavilionBase);

    const pavilionRoof = new THREE.Mesh(
      new THREE.ConeGeometry(0.95, 0.56, 4),
      new THREE.MeshStandardMaterial({ color: '#c58d62', roughness: 0.82 }),
    );
    pavilionRoof.position.set(0, 0.64, 0);
    pavilionRoof.rotation.y = Math.PI / 4;
    pavilionRoof.castShadow = true;
    pavilion.add(pavilionRoof);

    const fountain = new THREE.Group();
    fountain.position.set(2.55, -0.76, 0.62);
    root.add(fountain);

    [
      {
        geometry: new THREE.CylinderGeometry(0.78, 0.92, 0.28, 12),
        material: new THREE.MeshStandardMaterial({ color: '#e9dcc9', roughness: 0.98 }),
        position: [0, 0.16, 0],
      },
      {
        geometry: new THREE.CylinderGeometry(0.36, 0.48, 0.32, 12),
        material: new THREE.MeshStandardMaterial({ color: '#f3ebdf', roughness: 0.92 }),
        position: [0, 0.44, 0],
      },
      {
        geometry: new THREE.CylinderGeometry(0.05, 0.05, 0.4, 10),
        material: new THREE.MeshStandardMaterial({ color: '#b9dced', roughness: 0.3 }),
        position: [0, 0.72, 0],
      },
    ].forEach((piece) => {
      const mesh = new THREE.Mesh(piece.geometry, piece.material);
      mesh.position.set(...piece.position);
      mesh.castShadow = true;
      fountain.add(mesh);
    });

    const kiosk = new THREE.Group();
    kiosk.position.set(1.05, -0.72, 1.36);
    root.add(kiosk);

    [
      {
        geometry: new THREE.BoxGeometry(0.72, 0.34, 0.38),
        material: new THREE.MeshStandardMaterial({ color: '#ceb894', roughness: 0.95 }),
        position: [0, 0.18, 0],
      },
      {
        geometry: new THREE.BoxGeometry(0.42, 0.42, 0.22),
        material: new THREE.MeshStandardMaterial({ color: '#8c6743', roughness: 0.88 }),
        position: [0, 0.5, 0],
      },
    ].forEach((piece) => {
      const mesh = new THREE.Mesh(piece.geometry, piece.material);
      mesh.position.set(...piece.position);
      mesh.castShadow = true;
      kiosk.add(mesh);
    });

    const particleMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.14, 5, 5),
      new THREE.MeshStandardMaterial({ color: '#f6d9e8', roughness: 0.45 }),
      PARTICLE_COUNT,
    );
    updateParticleInstances(particleMesh, particleState, particleDummy);
    root.add(particleMesh);

    function handleResize() {
      const width = shellNode?.clientWidth || 1;
      const height = shellNode?.clientHeight || 1;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function handlePointerMove(event) {
      const bounds = shellNode?.getBoundingClientRect();
      if (!bounds) {
        return;
      }

      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    }

    function handlePointerLeave() {
      pointer.x = 0;
      pointer.y = 0;
    }

    function animate() {
      if (disposed) {
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.033);
      const elapsed = clock.elapsedTime;

      if (burstRef.current !== previousBurst) {
        previousBurst = burstRef.current;
        resetParticles(particleState, 0.45);
      }

      camera.position.x += (pointer.x * 0.4 - camera.position.x) * Math.min(1, delta * 2.6);
      camera.position.y +=
        (CAMERA_ORIGIN.y + pointer.y * 0.12 - camera.position.y) * Math.min(1, delta * 2.6);
      camera.position.z +=
        (CAMERA_ORIGIN.z - camera.position.z) * Math.min(1, delta * 2.6);
      camera.lookAt(0, 0.9, 0);

      canopy.rotation.y = Math.sin(elapsed * 0.42) * CANOPY_SWAY_Y;
      canopy.rotation.z = Math.cos(elapsed * 0.58) * CANOPY_SWAY_Z;

      particleState.forEach((particle, index) => {
        if (particle.delay > 0) {
          particle.delay -= delta;
          return;
        }

        particle.x += particle.vx * delta;
        particle.y -= particle.vy * delta;
        particle.z += particle.vz * delta;
        particle.rotation += particle.spin * delta;

        if (particle.y < -0.85) {
          resetParticle(particle, index, 0.45);
        }
      });

      updateParticleInstances(particleMesh, particleState, particleDummy);
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
    }

    handleResize();
    animate();

    window.addEventListener('resize', handleResize);
    shellNode.addEventListener('pointermove', handlePointerMove);
    shellNode.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      shellNode.removeEventListener('pointermove', handlePointerMove);
      shellNode.removeEventListener('pointerleave', handlePointerLeave);

      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [threeModule]);

  return (
    <div ref={shellRef} className={styles.gardenFallbackCanvas}>
      <canvas ref={canvasRef} className={styles.gardenCanvas} />
    </div>
  );
}

export default function GardenCanvas({ onExit }) {
  const [rendererState, setRendererState] = useState({
    mode: 'loading',
    fiber: null,
    threeModule: null,
  });
  const [activePanelId, setActivePanelId] = useState(null);
  const [burstCount, setBurstCount] = useState(0);

  const activePanel = activePanelId ? PANEL_CONTENT[activePanelId] : null;

  useEffect(() => {
    let cancelled = false;

    async function loadRenderer() {
      try {
        const [fiber, threeModule] = await Promise.all([
          import('@react-three/fiber'),
          import('three'),
        ]);

        if (!cancelled) {
          setRendererState({
            mode: 'r3f',
            fiber,
            threeModule,
          });
        }
      } catch (fiberError) {
        try {
          const threeModule = await import('three');

          if (!cancelled) {
            setRendererState({
              mode: 'three',
              fiber: null,
              threeModule,
            });
          }
        } catch {
          if (!cancelled) {
            setRendererState({
              mode: 'fallback',
              fiber: null,
              threeModule: null,
            });
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          console.error('Garden canvas renderer fallback triggered.', fiberError);
        }
      }
    }

    loadRenderer();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        if (activePanelId) {
          setActivePanelId(null);
          return;
        }

        onExit();
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [activePanelId, onExit]);

  function handleOpenPanel(panelId) {
    setBurstCount((count) => count + 1);
    setActivePanelId(panelId);
  }

  function handlePointerNudge() {
    setBurstCount((count) => count + 1);
  }

  return (
    <div
      className={clsx(styles.gardenOverlay, {
        [styles.gardenModalOpen]: Boolean(activePanel),
      })}
      aria-label="Interactive garden canvas"
    >
      <div className={styles.gardenFrame}>
        {rendererState.mode === 'r3f' ? (
          <FiberGarden
            fiber={rendererState.fiber}
            threeModule={rendererState.threeModule}
            burstCount={burstCount}
          />
        ) : null}

        {rendererState.mode === 'three' ? (
          <PlainThreeGarden
            threeModule={rendererState.threeModule}
            burstCount={burstCount}
          />
        ) : null}

        {rendererState.mode === 'loading' || rendererState.mode === 'fallback' ? (
          <div className={styles.gardenLoading} aria-live="polite">
            <span className={styles.loadingOrb} aria-hidden="true" />
            <span>
              {rendererState.mode === 'fallback'
                ? 'Falling back to the 2D shell.'
                : 'Growing the garden...'}
            </span>
          </div>
        ) : null}

        <div
          className={clsx(styles.waypointLayer, {
            [styles.waypointLayerBlocked]: Boolean(activePanel),
          })}
        >
          {WAYPOINTS.map((waypoint) => (
            <button
              key={waypoint.id}
              type="button"
              className={styles.waypoint}
              style={waypoint.style}
              aria-label={waypoint.label}
              onMouseEnter={handlePointerNudge}
              onFocus={handlePointerNudge}
              onClick={() => handleOpenPanel(waypoint.id)}
            >
              <span
                className={styles.waypointDiamond}
                data-theme={waypoint.theme}
                aria-hidden="true"
              />
              <span className={styles.waypointLabel}>{waypoint.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.exitButton}
          onClick={onExit}
          aria-label="Return to the hero gate"
        >
          Back to gate
        </button>
      </div>

      {activePanel ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setActivePanelId(null)}
        >
          <div
            className={styles.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="garden-panel-title"
            style={PANEL_THEME_STYLES[activePanel.theme]}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setActivePanelId(null)}
              aria-label="Close garden panel"
            >
              Close
            </button>
            <p className={styles.modalEyebrow}>Waypoint panel</p>
            <h2 id="garden-panel-title" className={styles.modalTitle}>
              {activePanel.title}
            </h2>
            <p className={styles.modalIntro}>{activePanel.intro}</p>
            <ul className={styles.modalList}>
              {activePanel.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
