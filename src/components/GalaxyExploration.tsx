import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Line, Html, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import Particles from "./Particles";
import { motion, AnimatePresence } from "framer-motion";

interface GalaxyExplorationProps {
  vehicle: "rocket" | "astronaut";
  onBack?: () => void;
}

interface PlanetData {
  id: number;
  name: string;
  orbitRadius: number;
  size: number;
  color: string;
  orbitSpeed: number;
  rotationSpeed: number;
  spotColor: string;
  glowColor: string;
  hasRing?: boolean;
  ringColor?: string;
  hasSatellite?: boolean;
  initialAngle: number;
  description: string;
  facts: string[];
  moons: number;
  gravityRadius: number;
  orbitCaptureRadius: number;
  // Portfolio fields
  portfolioType?: "project" | "skills" | "education" | "achievements" | "about";
  projectTitle?: string;
  projectSubtitle?: string;
  githubUrl?: string;
  liveUrl?: string;
  techStack?: string[];
  period?: string;
  bullets?: string[];
}

// Sub-projects inside the Projects Hub planet
interface ProjectEntry {
  title: string;
  subtitle: string;
  period: string;
  description: string;
  techStack: string[];
  bullets: string[];
  githubUrl?: string;
  color: string;
}

const PROJECTS: ProjectEntry[] = [
  {
    title: "Head-2-Code",
    subtitle: "MERN-Based Coding Platform",
    period: "Oct 2025 - Jan 2026",
    description: "MERN Competitive Coding Platform with real-time code execution and 1v1 battles.",
    techStack: ["ReactJS", "Redux", "NodeJS", "ExpressJS", "MongoDB", "JavaScript"],
    bullets: [
      "Architected a scalable backend using NodeJS, ExpressJS, MongoDB, and Judge0 API with JWT authentication.",
      "Enables learners to write & execute programs via online compiler and participate in 1v1 coding battles.",
      "Built a React/Redux interface with interactive editor, competitive programming console, and solution-review pipeline.",
    ],
    githubUrl: "https://github.com/TusarGoswami/Head-2-Code",
    color: "#00e5ff",
  },
  {
    title: "Velo-Rapido",
    subtitle: "Premium Bike Rental System",
    period: "Feb 2025 - May 2025",
    description: "Premium Bike Rental System with real-time tracking and admin control hub.",
    techStack: ["HTML", "CSS", "JavaScript", "MySQL", "PHP"],
    bullets: [
      "Developed an end-to-end rental ecosystem with secure authentication and real-time vehicle tracking.",
      "Engineered an admin control hub for fleet management and maintenance ticketing - improving efficiency by 40%.",
      "Structured a fully normalized MySQL database schema (3NF) reducing data redundancy by 30%.",
    ],
    githubUrl: "https://github.com/TusarGoswami/Bike_Rental",
    color: "#ff7700",
  },
  {
    title: "LinkedIn Optimizer Pro",
    subtitle: "AI-Powered Profile Assistant",
    period: "Mar 2025 - Apr 2025",
    description: "AI-powered LinkedIn profile diagnostics and personalized enhancement assistant.",
    techStack: ["Python", "Flask", "JavaScript"],
    bullets: [
      "Created an AI-powered LinkedIn optimization utility delivering real-time profile diagnostics.",
      "Integrated AI modules for keyword enrichment, headline scoring, summary analytics, and networking insights.",
      "Released an interactive chatbot with data visualizations and exportable PDF/Excel reports.",
    ],
    githubUrl: "https://github.com/TusarGoswami/AI_chatbot_Linkedln_Profile_Optimizer",
    color: "#aa44ff",
  },
];

const PLANETS_DATA: PlanetData[] = [
  {
    id: 0, name: "Projects Hub", orbitRadius: 30, size: 4.5, color: "#00e5ff", orbitSpeed: 0.18, rotationSpeed: 1.5,
    spotColor: "#88f5ff", glowColor: "#00c8e0", hasSatellite: true, hasRing: true, ringColor: "#0088aa", initialAngle: 0,
    description: "Explore all of Tusar's software projects - MERN platforms, PHP systems & AI tools.",
    facts: ["3 projects: MERN, PHP, Python", "Judge0 API & real-time features", "Full-stack & AI-powered"],
    moons: 3, gravityRadius: 16, orbitCaptureRadius: 8,
    portfolioType: "project",
    projectTitle: "Projects Hub",
    projectSubtitle: "All Software Projects",
    githubUrl: "https://github.com/TusarGoswami",
    period: "2025 - 2026",
    techStack: ["ReactJS", "NodeJS", "Python", "PHP", "MongoDB", "MySQL", "JavaScript"],
    bullets: [
      "Head-2-Code: MERN competitive coding platform with Judge0 API and real-time 1v1 battles.",
      "Velo-Rapido: Premium bike rental system with PHP/MySQL admin control hub.",
      "LinkedIn Optimizer Pro: AI-powered profile diagnostics with Python/Flask chatbot.",
    ]
  },
  {
    id: 1, name: "Skills Core", orbitRadius: 55, size: 6.5, color: "#ffd700", orbitSpeed: 0.08, rotationSpeed: 0.6,
    spotColor: "#ffee88", glowColor: "#ffcc00", hasRing: true, ringColor: "#ddaa00", hasSatellite: true, initialAngle: Math.PI * 1.3,
    description: "Tusar's Technical Skills Hub - Languages, Frameworks, Tools & Core CS.",
    facts: ["7 languages: Python, Java, C++, JS...", "React, Node, Flutter, Redux", "LeetCode Top 15% Globally"],
    moons: 0, gravityRadius: 25, orbitCaptureRadius: 12,
    portfolioType: "skills",
    projectTitle: "Technical Skills",
    projectSubtitle: "Languages, Frameworks & Tools",
    period: "2023 - Present",
    techStack: ["Python", "Java", "C", "C++", "JavaScript", "PHP", "Dart"],
    bullets: [
      "Frameworks & Libraries: ReactJS, Redux, NodeJS, ExpressJS, Flutter, Tailwind CSS, RESTful APIs, JWT Authentication",
      "Tools & Platforms: MySQL, MongoDB, Git, GitHub, Postman, Vercel, Figma",
      "Core CS Fundamentals: DSA, OOP, DBMS, OS, CN, System Design",
      "Soft Skills: Problem-Solving, Team Collaboration, Leadership, Adaptability"
    ]
  },
  {
    id: 2, name: "LPU Planet", orbitRadius: 75, size: 5, color: "#66ff88", orbitSpeed: 0.06, rotationSpeed: 0.8,
    spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI * 0.7,
    description: "Lovely Professional University - B.Tech CSE. CGPA: 7.45.",
    facts: ["B.Tech CSE @ LPU, Punjab", "CGPA: 7.45 | Aug 2023 - Present", "Flutter Training Certification"],
    moons: 2, gravityRadius: 20, orbitCaptureRadius: 10,
    portfolioType: "education",
    projectTitle: "Education & Training",
    projectSubtitle: "Lovely Professional University",
    period: "Aug 2023 - Present",
    techStack: ["Flutter", "Dart", "Java", "C++", "Python"],
    bullets: [
      "Bachelor of Technology - Computer Science and Engineering; CGPA: 7.45 | Lovely Professional University, Punjab",
      "Mobile Application Development Using Flutter - LPU Training (Jun-Jul 2025): Designed a university management mobile app.",
      "Intermediate: 80.4% | Mandalkuli Netaji Vidyapith, West Bengal (2022-23)",
      "Matriculation: 90.0% | Mandalkuli Netaji Vidyapith, West Bengal (2020-21)"
    ]
  },
  {
    id: 3, name: "Achievements", orbitRadius: 98, size: 4.5, color: "#ff4488", orbitSpeed: 0.04, rotationSpeed: 0.5,
    spotColor: "#ff77aa", glowColor: "#ff5599", hasRing: true, ringColor: "#cc2266", hasSatellite: true, initialAngle: Math.PI * 0.3,
    description: "Achievements, Certifications & Competitive Programming milestones.",
    facts: ["LeetCode Global Top 15%", "5-star Java & C++ on HackerRank", "300+ problems solved"],
    moons: 0, gravityRadius: 22, orbitCaptureRadius: 11,
    portfolioType: "achievements",
    projectTitle: "Achievements & Certs",
    projectSubtitle: "Competitive Programming & Certifications",
    period: "2023 - Present",
    githubUrl: "https://github.com/TusarGoswami",
    techStack: ["LeetCode", "HackerRank", "CodeChef", "GeeksforGeeks", "NPTEL"],
    bullets: [
      "Secured Global Top 15% rank in LeetCode Weekly and Biweekly Contests",
      "Earned 5-star ratings in Java & C++ on HackerRank; solved 300+ problems across LeetCode, CodeChef, & GeeksforGeeks",
      "ChatGPT-4 Prompt Engineering: ChatGPT, Generative AI & LLM - Infosys Springboard (Aug 2025)",
      "Mobile Application Development Using Flutter - Lovely Professional University (Jul 2025)",
      "Cloud Computing - NPTEL IIT Kharagpur (Apr 2025)"
    ]
  },
];

// Keyboard state - global singleton to avoid event conflicts
const keyState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

// Mouse state for look controls
const mouseState = {
  movementX: 0,
  movementY: 0,
  isLocked: false,
};

// Setup keyboard listeners once
let listenersSetup = false;
const setupKeyboardListeners = () => {
  if (listenersSetup) return;
  listenersSetup = true;

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code;

    // Prevent default browser behavior for game controls
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' ||
      key === ' ' || key === 'shift' ||
      code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight' ||
      code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
      e.preventDefault();
    }

    if (key === "w" || code === "ArrowUp") keyState.forward = true;
    if (key === "s" || code === "ArrowDown") keyState.backward = true;
    if (key === "a" || code === "ArrowLeft") keyState.left = true;
    if (key === "d" || code === "ArrowRight") keyState.right = true;
    if (key === " " || code === "Space") keyState.up = true;
    if (key === "shift" || code === "ShiftLeft" || code === "ShiftRight") keyState.down = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code;

    if (key === "w" || code === "ArrowUp") keyState.forward = false;
    if (key === "s" || code === "ArrowDown") keyState.backward = false;
    if (key === "a" || code === "ArrowLeft") keyState.left = false;
    if (key === "d" || code === "ArrowRight") keyState.right = false;
    if (key === " " || code === "Space") keyState.up = false;
    if (key === "shift" || code === "ShiftLeft" || code === "ShiftRight") keyState.down = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mouseState.isLocked) {
      mouseState.movementX = e.movementX;
      mouseState.movementY = e.movementY;
    }
  };

  const handlePointerLockChange = () => {
    mouseState.isLocked = document.pointerLockElement !== null;
  };

  document.addEventListener("keydown", handleKeyDown, { capture: true });
  document.addEventListener("keyup", handleKeyUp, { capture: true });
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("pointerlockchange", handlePointerLockChange);
};

const useKeyboardControls = () => {
  useEffect(() => {
    setupKeyboardListeners();
  }, []);

  return { current: keyState };
};

const useMouseControls = () => {
  useEffect(() => {
    setupKeyboardListeners(); // This also sets up mouse listeners
  }, []);

  const consumeMouseMovement = () => {
    const movement = { x: mouseState.movementX, y: mouseState.movementY };
    mouseState.movementX = 0;
    mouseState.movementY = 0;
    return movement;
  };

  return {
    isLocked: () => mouseState.isLocked,
    consumeMouseMovement,
    requestPointerLock: (element: HTMLElement) => {
      element.requestPointerLock();
    }
  };
};

// Blinking Stars Background
const BlinkingStars = ({ count = 4000 }: { count?: number }) => {
  const starsRef = useRef<THREE.Points>(null);

  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const starColors = [
      [1, 1, 1],
      [1, 0.9, 0.8],
      [0.8, 0.9, 1],
      [1, 0.8, 0.6],
      [0.9, 0.95, 1],
    ];

    for (let i = 0; i < count; i++) {
      const radius = 150 + Math.random() * 350;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = Math.random() * 3 + 1;
      phases[i] = Math.random() * Math.PI * 2;

      const colorIdx = Math.floor(Math.random() * starColors.length);
      colors[i * 3] = starColors[colorIdx][0];
      colors[i * 3 + 1] = starColors[colorIdx][1];
      colors[i * 3 + 2] = starColors[colorIdx][2];
    }

    return { positions, sizes, phases, colors };
  }, [count]);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime;
      const sizesAttr = starsRef.current.geometry.attributes.size as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        const blink = Math.sin(time * (0.5 + (i % 10) * 0.1) + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.4 + blink * 0.6);
      }
      sizesAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Central Sun/Galaxy Core
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.08);
    }
    if (glow2Ref.current) {
      glow2Ref.current.scale.setScalar(1 + Math.sin(time * 2 + 1) * 0.05);
      glow2Ref.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
      </mesh>

      <mesh ref={glow2Ref}>
        <sphereGeometry args={[10.5, 32, 32]} />
        <meshBasicMaterial color="#ff9900" transparent opacity={0.3} />
      </mesh>

      <mesh>
        <sphereGeometry args={[13, 32, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.15} />
      </mesh>

      <mesh>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.08} />
      </mesh>

      <pointLight color="#ffdd44" intensity={5} distance={200} />
      <pointLight color="#ff8800" intensity={2} distance={100} />
    </group>
  );
};

// Orbital Path
const OrbitalPath = ({ radius, color = "#ffffff" }: { radius: number; color?: string }) => {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.25}
    />
  );
};

// Satellite orbiting a planet
const Satellite = ({ orbitRadius, speed, size = 0.3 }: { orbitRadius: number; speed: number; size?: number }) => {
  const satelliteRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (satelliteRef.current) {
      const time = state.clock.elapsedTime * speed;
      satelliteRef.current.position.x = Math.cos(time) * orbitRadius;
      satelliteRef.current.position.z = Math.sin(time) * orbitRadius;
      satelliteRef.current.position.y = Math.sin(time * 2) * 0.5;
    }
  });

  return (
    <group ref={satelliteRef}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.3, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      <pointLight color="#ffffff" intensity={0.5} distance={4} />
    </group>
  );
};

// Planet Component
interface PlanetProps {
  planet: PlanetData;
  getPlanetPosition: (planet: PlanetData, time: number) => THREE.Vector3;
  onPlanetClick?: (planet: PlanetData) => void;
  onPlanetHover?: (planet: PlanetData | null) => void;
}

const Planet = ({ planet, getPlanetPosition, onPlanetClick, onPlanetHover }: PlanetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const spotTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(0.3, planet.spotColor || planet.color);
      gradient.addColorStop(0.7, planet.color);
      gradient.addColorStop(1, planet.spotColor || planet.color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = planet.spotColor || "rgba(255,255,255,0.25)";
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 40 + 15;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.ellipse(x, y, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 8;
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 40 + Math.random() * 15;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + 10, 384, y - 10, 512, y);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, [planet.color, planet.spotColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const pos = getPlanetPosition(planet, time);

    if (groupRef.current) {
      groupRef.current.position.copy(pos);
      // Pulse effect when hovered
      if (isHovered) {
        const pulse = 1 + Math.sin(time * 4) * 0.05;
        groupRef.current.scale.setScalar(pulse);
      } else {
        groupRef.current.scale.setScalar(1);
      }
    }

    if (planetRef.current) {
      planetRef.current.rotation.y = time * planet.rotationSpeed;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = time * planet.rotationSpeed * 0.5;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    onPlanetHover?.(planet);
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
    onPlanetHover?.(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPlanetClick?.(planet);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[planet.size, 64, 64]} />
        <meshStandardMaterial
          map={spotTexture}
          emissive={planet.color}
          emissiveIntensity={isHovered ? 0.4 : 0.15}
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>

      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planet.size * 1.05, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={isHovered ? 0.4 : 0.2} />
      </mesh>

      <mesh>
        <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
        <meshBasicMaterial color={planet.glowColor || planet.color} transparent opacity={isHovered ? 0.25 : 0.1} />
      </mesh>

      {/* Hover ring indicator */}
      {isHovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.size * 1.3, planet.size * 1.5, 64]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {planet.hasRing && (
        <>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[planet.size * 1.5, planet.size * 2.2, 128]} />
            <meshBasicMaterial color={planet.ringColor || planet.color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2.8, 0.1, 0]}>
            <ringGeometry args={[planet.size * 2.2, planet.size * 2.5, 128]} />
            <meshBasicMaterial color={planet.ringColor || planet.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {planet.hasSatellite && (
        <Satellite orbitRadius={planet.size * 2.5} speed={1.5} size={planet.size * 0.2} />
      )}

      {/* 3D Planet Name Label - Always faces camera */}
      <Billboard position={[0, planet.size + 2.5, 0]}>
        <Text
          fontSize={1.8}
          color={planet.color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.06}
          outlineColor="#000000"
        >
          {planet.portfolioType ? planet.portfolioType.toUpperCase() : planet.name.toUpperCase()}
        </Text>
        {planet.projectTitle && (
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.8}
            color="#ffffff"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {planet.projectTitle}
          </Text>
        )}
      </Billboard>

      <pointLight color={planet.color} intensity={isHovered ? 0.8 : 0.3} distance={planet.size * 5} />
    </group>
  );
};

// Spaceship Component - Detailed models matching ExitChoices
interface SpaceshipProps {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  rotationRef: React.MutableRefObject<THREE.Euler>;
  velocityRef: React.MutableRefObject<THREE.Vector3>;
  isOrbiting: boolean;
  orbitingPlanet: PlanetData | null;
  vehicle: "rocket" | "astronaut";
}

const Spaceship = ({ positionRef, rotationRef, velocityRef, isOrbiting, vehicle }: SpaceshipProps) => {
  const shipRef = useRef<THREE.Group>(null);

  // Create attractive rocket materials - vibrant teal/gold theme
  const rocketBodyMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#1a1a2e"),
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    reflectivity: 1,
  }), []);

  const rocketAccentMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#00e5ff"),
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 0.8,
    emissive: new THREE.Color("#00e5ff"),
    emissiveIntensity: 0.3,
  }), []);

  const rocketGoldMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffd700"),
    metalness: 0.95,
    roughness: 0.1,
    clearcoat: 1,
    emissive: new THREE.Color("#ff9500"),
    emissiveIntensity: 0.2,
  }), []);

  const suitMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#f8f8f8"),
    metalness: 0.1,
    roughness: 0.7,
    clearcoat: 0.1,
    sheen: 0.3,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color("#aaccff"),
  }), []);

  const visorMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffaa00"),
    metalness: 1,
    roughness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    reflectivity: 1,
    envMapIntensity: 2,
  }), []);

  useFrame((state) => {
    if (shipRef.current) {
      shipRef.current.position.copy(positionRef.current);
      shipRef.current.rotation.copy(rotationRef.current);
    }
  });

  const speed = velocityRef.current.length();
  const isMoving = speed > 0.01;

  if (vehicle === "astronaut") {
    return (
      <group ref={shipRef} scale={1.8}>
        {/* Helmet - larger and more detailed */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.7, 64, 64]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Gold visor - reflective */}
        <mesh position={[0, 1.55, 0.45]} rotation={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={visorMaterial} attach="material" />
        </mesh>

        {/* Helmet rim/collar */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[0.6, 0.1, 16, 64]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Neck ring */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.15, 32]} />
          <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Torso - more realistic shape */}
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.55, 0.7, 16, 32]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Chest control unit */}
        <mesh position={[0, 0.35, 0.52]}>
          <boxGeometry args={[0.45, 0.5, 0.12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Control buttons/lights */}
        <mesh position={[-0.12, 0.5, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0.12, 0.5, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 0.38, 0.59]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshBasicMaterial color="#0088ff" />
        </mesh>

        {/* Life support backpack - larger */}
        <mesh position={[0, 0.2, -0.55]}>
          <boxGeometry args={[0.75, 0.95, 0.35]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* Backpack details */}
        <mesh position={[0, 0.55, -0.75]}>
          <cylinderGeometry args={[0.1, 0.1, 0.25, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Jetpack thrusters */}
        <mesh position={[-0.22, -0.25, -0.65]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0.22, -0.25, -0.65]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
        </mesh>

        {/* Jetpack flames */}
        <Particles
          position={[-0.22, -0.4, -0.65]}
          count={40}
          color="#66ddff"
          size={0.05}
          spread={0.1}
          speed={isMoving ? 3 : 1.2}
          type="flame"
          active={true}
        />
        <Particles
          position={[0.22, -0.4, -0.65]}
          count={40}
          color="#66ddff"
          size={0.05}
          spread={0.1}
          speed={isMoving ? 3 : 1.2}
          type="flame"
          active={true}
        />

        {/* Arms */}
        <group position={[-0.75, 0.35, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4.5]}>
            <capsuleGeometry args={[0.16, 0.35, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.25, -0.15, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.4, -0.35, 0]} rotation={[0, 0, Math.PI / 6]}>
            <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.55, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ff7700" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>

        <group position={[0.75, 0.35, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 4.5]}>
            <capsuleGeometry args={[0.16, 0.35, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.25, -0.15, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.4, -0.35, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.55, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ff7700" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.25, -0.8, 0]}>
          <capsuleGeometry args={[0.18, 0.65, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        <mesh position={[0.25, -0.8, 0]}>
          <capsuleGeometry args={[0.18, 0.65, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Boots */}
        <mesh position={[-0.25, -1.35, 0.08]}>
          <boxGeometry args={[0.22, 0.18, 0.35]} />
          <meshStandardMaterial color="#333333" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0.25, -1.35, 0.08]}>
          <boxGeometry args={[0.22, 0.18, 0.35]} />
          <meshStandardMaterial color="#333333" metalness={0.85} roughness={0.2} />
        </mesh>

        <pointLight position={[0, 0, 1]} color="#ffffff" intensity={0.5} distance={4} />
        <pointLight position={[0, -0.5, -0.8]} color="#66ddff" intensity={isMoving ? 2 : 0.5} distance={4} />
      </group>
    );
  }

  return (
    <group ref={shipRef} scale={1.8}>
      {/* Main rocket body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 3, 32]} />
        <primitive object={rocketBodyMaterial} attach="material" />
      </mesh>

      {/* Body details - rivets/panels */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={`rivet-${i}`}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.52,
            0.8,
            Math.sin((angle * Math.PI) / 180) * 0.52,
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#888888" metalness={1} roughness={0.3} />
        </mesh>
      ))}

      {/* Accent stripe band */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.25, 32]} />
        <primitive object={rocketAccentMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.2, 32]} />
        <primitive object={rocketGoldMaterial} attach="material" />
      </mesh>

      {/* Nose cone with better shape */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.5, 1.2, 32]} />
        <primitive object={rocketGoldMaterial} attach="material" />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[0.12, 0.3, 16]} />
        <primitive object={rocketAccentMaterial} attach="material" />
      </mesh>

      {/* Windows - multiple portholes */}
      {[0, 120, 240].map((angle, i) => (
        <group key={`window-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <mesh position={[0, 1.3, 0.48]}>
            <circleGeometry args={[0.15, 32]} />
            <meshPhysicalMaterial
              color="#88ddff"
              metalness={0.3}
              roughness={0.1}
              emissive="#44aaff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Window frame */}
          <mesh position={[0, 1.3, 0.47]}>
            <ringGeometry args={[0.15, 0.19, 32]} />
            <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Fins - more detailed */}
      {[0, 90, 180, 270].map((angle, i) => (
        <group key={`fin-${i}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <mesh position={[0.65, -0.5, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.4, 0.8, 0.06]} />
            <meshStandardMaterial
              color="#ffd700"
              metalness={0.85}
              roughness={0.2}
              emissive="#ff9500"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Fin edge detail */}
          <mesh position={[0.85, -0.7, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Engine section */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.4, 32]} />
        <meshStandardMaterial color="#222222" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Engine nozzle - bell shape */}
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.35, 0.55, 0.5, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.98} roughness={0.05} />
      </mesh>
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.15, 32]} />
        <meshStandardMaterial color="#ff4400" metalness={0.5} roughness={0.4} emissive="#ff2200" emissiveIntensity={0.3} />
      </mesh>

      {/* Flame - layered for realism */}
      <mesh position={[0, -1.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 0.9, 32]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={isMoving ? 0.85 : 0.5} />
      </mesh>
      <mesh position={[0, -1.85, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.7, 32]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={isMoving ? 0.9 : 0.6} />
      </mesh>
      <mesh position={[0, -1.95, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={isMoving ? 0.95 : 0.7} />
      </mesh>

      {/* Flame particles */}
      <Particles
        position={[0, -1.4, 0]}
        count={100}
        color="#ff6600"
        size={0.1}
        spread={0.35}
        speed={isMoving ? 5 : 2.5}
        type="flame"
        active={true}
      />
      <Particles
        position={[0, -1.4, 0]}
        count={60}
        color="#ffff00"
        size={0.07}
        spread={0.2}
        speed={isMoving ? 6 : 3}
        type="flame"
        active={true}
      />

      <pointLight position={[0, -1, 0]} color="#ff6600" intensity={isMoving ? 5 : 2.5} distance={6} />
      <pointLight position={[0, 1, 1]} color="#ffffff" intensity={0.5} distance={3} />
    </group>
  );
};

// Free look camera state - independent from ship rotation
const cameraState = {
  yaw: 0,
  pitch: 0,
};

// Camera that follows the ship with independent free look
interface FollowCameraProps {
  shipPositionRef: React.MutableRefObject<THREE.Vector3>;
  shipRotationRef: React.MutableRefObject<THREE.Euler>;
  isOrbiting: boolean;
  orbitingPlanetPos: THREE.Vector3 | null;
}

const FollowCamera = ({ shipPositionRef, shipRotationRef, isOrbiting, orbitingPlanetPos }: FollowCameraProps) => {
  const { camera, gl } = useThree();
  const smoothCameraPos = useRef(new THREE.Vector3(30, 10, 40));
  const smoothLookAt = useRef(new THREE.Vector3(30, 5, 30));
  const initialized = useRef(false);
  const mouse = useMouseControls();

  // Request pointer lock on click
  useEffect(() => {
    const handleClick = () => {
      if (!mouse.isLocked()) {
        mouse.requestPointerLock(gl.domElement);
      }
    };
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [gl, mouse]);

  useFrame(() => {
    // Handle mouse look for camera (free look)
    if (mouse.isLocked() && !isOrbiting) {
      const mouseMovement = mouse.consumeMouseMovement();
      const mouseSensitivity = 0.003;

      // Update camera yaw and pitch independently
      cameraState.yaw -= mouseMovement.x * mouseSensitivity;
      cameraState.pitch -= mouseMovement.y * mouseSensitivity;
      cameraState.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraState.pitch));
    }

    const shipPos = shipPositionRef.current;

    if (isOrbiting && orbitingPlanetPos) {
      // When orbiting: camera stays fixed, looking at the vehicle
      const cameraDistance = 25;
      const cameraHeight = 12;

      // Fixed camera position relative to the planet
      const targetCameraPos = new THREE.Vector3(
        orbitingPlanetPos.x + cameraDistance,
        orbitingPlanetPos.y + cameraHeight,
        orbitingPlanetPos.z + cameraDistance
      );

      // Smooth camera position
      const lerpSpeed = 0.05;
      smoothCameraPos.current.lerp(targetCameraPos, lerpSpeed);

      // Always look at the ship
      smoothLookAt.current.lerp(shipPos, 0.1);

      camera.position.copy(smoothCameraPos.current);
      camera.lookAt(smoothLookAt.current);
    } else {
      // Free flight: camera follows ship but rotates independently with mouse
      const cameraDistance = 18;
      const cameraHeight = 8;

      // Camera offset based on FREE LOOK rotation (not ship rotation)
      const pitchFactor = Math.cos(cameraState.pitch);
      const verticalOffset = cameraHeight - Math.sin(cameraState.pitch) * cameraDistance * 0.5;

      const behindOffset = new THREE.Vector3(
        Math.sin(cameraState.yaw) * cameraDistance * pitchFactor,
        verticalOffset,
        Math.cos(cameraState.yaw) * cameraDistance * pitchFactor
      );

      const targetCameraPos = shipPos.clone().add(behindOffset);

      // Look at position in front of camera view direction
      const lookAheadDistance = 15;
      const forward = new THREE.Vector3(
        -Math.sin(cameraState.yaw) * lookAheadDistance,
        -Math.sin(cameraState.pitch) * lookAheadDistance * 0.5,
        -Math.cos(cameraState.yaw) * lookAheadDistance
      );
      const targetLookAt = shipPos.clone().add(forward);

      if (!initialized.current) {
        smoothCameraPos.current.copy(targetCameraPos);
        smoothLookAt.current.copy(targetLookAt);
        initialized.current = true;
      }

      const lerpSpeed = 0.12;
      smoothCameraPos.current.lerp(targetCameraPos, lerpSpeed);
      smoothLookAt.current.lerp(targetLookAt, lerpSpeed * 1.2);

      camera.position.copy(smoothCameraPos.current);
      camera.lookAt(smoothLookAt.current);
    }
  });

  return null;
};

// Main Galaxy Scene
interface GalaxySceneProps {
  vehicle: "rocket" | "astronaut";
  onPlanetApproach: (planet: PlanetData | null) => void;
  onOrbitCapture: (planet: PlanetData | null) => void;
  orbitingPlanet: PlanetData | null;
  showEnterButton: boolean;
  onAsteroidCollision: () => void;
  onShipPositionUpdate: (pos: { x: number; z: number }, time: number) => void;
  onPlanetClick: (planet: PlanetData) => void;
}

const GalaxyScene = ({
  vehicle,
  onPlanetApproach,
  onOrbitCapture,
  orbitingPlanet,
  showEnterButton,
  onAsteroidCollision,
  onShipPositionUpdate,
  onPlanetClick
}: GalaxySceneProps) => {
  const keys = useKeyboardControls();
  const shipPosition = useRef(new THREE.Vector3(30, 5, 30));
  const shipVelocity = useRef(new THREE.Vector3());
  const shipRotation = useRef(new THREE.Euler(0, 0, 0));
  const orbitAngle = useRef(0);
  const orbitingPlanetPosRef = useRef<THREE.Vector3 | null>(null);
  const [, forceUpdate] = useState(0);

  const getPlanetPosition = useCallback((planet: PlanetData, time: number) => {
    const angle = planet.initialAngle + time * planet.orbitSpeed;
    return new THREE.Vector3(
      Math.cos(angle) * planet.orbitRadius,
      Math.sin(angle * 2) * 1,
      Math.sin(angle) * planet.orbitRadius
    );
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const delta = Math.min(state.clock.getDelta(), 0.1);

    const acceleration = 3.5;
    const maxSpeed = 7;
    const friction = 0.96;
    const rotationSpeed = 0.05;

    // If orbiting, handle orbit mechanics
    if (orbitingPlanet) {
      const planetPos = getPlanetPosition(orbitingPlanet, time);
      orbitingPlanetPosRef.current = planetPos.clone();
      const orbitDistance = orbitingPlanet.size + orbitingPlanet.orbitCaptureRadius * 0.6;

      // Check for escape input
      const escaping = keys.current.forward || keys.current.backward || keys.current.left || keys.current.right;

      if (escaping) {
        // Escape velocity based on camera direction
        const forward = new THREE.Vector3(
          -Math.sin(cameraState.yaw),
          0,
          -Math.cos(cameraState.yaw)
        );
        const right = new THREE.Vector3(
          Math.cos(cameraState.yaw),
          0,
          -Math.sin(cameraState.yaw)
        );

        const escapeDir = new THREE.Vector3();
        if (keys.current.forward) escapeDir.add(forward);
        if (keys.current.backward) escapeDir.sub(forward);
        if (keys.current.left) escapeDir.sub(right);
        if (keys.current.right) escapeDir.add(right);
        escapeDir.normalize().multiplyScalar(maxSpeed * 1.5);

        shipVelocity.current.copy(escapeDir);
        shipPosition.current.add(escapeDir.clone().multiplyScalar(delta * 60));
        orbitingPlanetPosRef.current = null;
        onOrbitCapture(null);
      } else {
        // Continue orbiting - vehicle moves but camera stays fixed
        orbitAngle.current += 0.02;
        shipPosition.current.set(
          planetPos.x + Math.cos(orbitAngle.current) * orbitDistance,
          planetPos.y + Math.sin(orbitAngle.current * 0.5) * 2,
          planetPos.z + Math.sin(orbitAngle.current) * orbitDistance
        );

        // Face the direction of orbit (vehicle rotates, not camera)
        const tangent = new THREE.Vector3(
          -Math.sin(orbitAngle.current),
          0,
          Math.cos(orbitAngle.current)
        );
        shipRotation.current.y = Math.atan2(tangent.x, tangent.z);
      }
    } else {
      // Free flight mode - NOT orbiting
      orbitingPlanetPosRef.current = null;

      // Movement based on CAMERA direction (free look)
      const forward = new THREE.Vector3(
        -Math.sin(cameraState.yaw),
        0,
        -Math.cos(cameraState.yaw)
      );
      const right = new THREE.Vector3(
        Math.cos(cameraState.yaw),
        0,
        -Math.sin(cameraState.yaw)
      );

      // Update ship rotation to face movement direction (smooth)
      if (keys.current.forward || keys.current.backward) {
        const targetRotation = keys.current.forward ? cameraState.yaw : cameraState.yaw + Math.PI;
        const angleDiff = targetRotation - shipRotation.current.y;
        // Normalize angle difference
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        shipRotation.current.y += normalizedDiff * 0.1;
      }

      // Apply movement input
      if (keys.current.forward) {
        shipVelocity.current.add(forward.clone().multiplyScalar(acceleration * delta * 60));
      }
      if (keys.current.backward) {
        shipVelocity.current.add(forward.clone().multiplyScalar(-acceleration * 0.5 * delta * 60));
      }
      if (keys.current.left) {
        shipVelocity.current.add(right.clone().multiplyScalar(-acceleration * delta * 60));
      }
      if (keys.current.right) {
        shipVelocity.current.add(right.clone().multiplyScalar(acceleration * delta * 60));
      }
      if (keys.current.up) {
        shipVelocity.current.y += acceleration * 1.2 * delta * 60;
      }
      if (keys.current.down) {
        shipVelocity.current.y -= acceleration * 1.2 * delta * 60;
      }

      // Clamp speed
      if (shipVelocity.current.length() > maxSpeed) {
        shipVelocity.current.normalize().multiplyScalar(maxSpeed);
      }

      // Apply friction
      shipVelocity.current.multiplyScalar(friction);

      // Check gravity and collision with planets
      let nearestPlanet: PlanetData | null = null;
      let nearestDistance = Infinity;

      for (const planet of PLANETS_DATA) {
        const planetPos = getPlanetPosition(planet, time);
        const distance = shipPosition.current.distanceTo(planetPos);

        // Invisible wall - can't pass through planet
        if (distance < planet.size + 1) {
          const pushDir = shipPosition.current.clone().sub(planetPos).normalize();
          shipPosition.current.copy(planetPos).add(pushDir.multiplyScalar(planet.size + 1.1));
          shipVelocity.current.reflect(pushDir).multiplyScalar(0.3);
        }

        // Gravity attraction
        if (distance < planet.gravityRadius && distance > planet.size) {
          const gravityStrength = (1 - distance / planet.gravityRadius) * 0.015;
          const gravityDir = planetPos.clone().sub(shipPosition.current).normalize();
          shipVelocity.current.add(gravityDir.multiplyScalar(gravityStrength));

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestPlanet = planet;
          }

          // Orbit capture
          if (distance < planet.size + planet.orbitCaptureRadius) {
            onOrbitCapture(planet);
            orbitAngle.current = Math.atan2(
              shipPosition.current.z - planetPos.z,
              shipPosition.current.x - planetPos.x
            );
          }
        }
      }

      onPlanetApproach(nearestPlanet);

      // Apply velocity
      shipPosition.current.add(shipVelocity.current.clone().multiplyScalar(delta * 60));

      // Keep ship in bounds
      const maxBound = 140;
      if (shipPosition.current.length() > maxBound) {
        shipPosition.current.normalize().multiplyScalar(maxBound);
        shipVelocity.current.multiplyScalar(-0.5);
      }

      // Keep above a minimum height
      if (shipPosition.current.y < -20) {
        shipPosition.current.y = -20;
        shipVelocity.current.y = Math.abs(shipVelocity.current.y) * 0.5;
      }
      if (shipPosition.current.y > 50) {
        shipPosition.current.y = 50;
        shipVelocity.current.y = -Math.abs(shipVelocity.current.y) * 0.5;
      }
    }

    // Update ship position for minimap
    onShipPositionUpdate({ x: shipPosition.current.x, z: shipPosition.current.z }, time);

    forceUpdate(n => n + 1);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[30, 30, 15]} intensity={0.4} />

      <BlinkingStars count={5000} />
      <GalaxyCore />

      {/* Orbital paths */}
      {PLANETS_DATA.map((planet) => (
        <OrbitalPath key={`orbit-${planet.id}`} radius={planet.orbitRadius} color={planet.color} />
      ))}

      {/* Planets */}
      {PLANETS_DATA.map((planet) => (
        <Planet
          key={`planet-${planet.id}`}
          planet={planet}
          getPlanetPosition={getPlanetPosition}
          onPlanetClick={onPlanetClick}
        />
      ))}



      {/* Player Spaceship */}
      <Spaceship
        positionRef={shipPosition}
        rotationRef={shipRotation}
        velocityRef={shipVelocity}
        isOrbiting={orbitingPlanet !== null}
        orbitingPlanet={orbitingPlanet}
        vehicle={vehicle}
      />

      {/* Follow Camera with free look */}
      <FollowCamera
        shipPositionRef={shipPosition}
        shipRotationRef={shipRotation}
        isOrbiting={orbitingPlanet !== null}
        orbitingPlanetPos={orbitingPlanetPosRef.current}
      />

      {/* Nebula fog */}
      <fog attach="fog" args={["#050510", 80, 300]} />
    </>
  );
};

const Comet = ({ seed }: { seed: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random());
  const startPos = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 80,
    (Math.random() - 0.5) * 300
  ), [seed]);
  const endPos = useMemo(() => new THREE.Vector3(
    startPos.x + (Math.random() - 0.5) * 200,
    startPos.y + (Math.random() - 0.5) * 40,
    startPos.z + (Math.random() - 0.5) * 200
  ), [startPos, seed]);

  useFrame((_, delta) => {
    progress.current += delta * 0.12;
    if (progress.current > 1) progress.current = 0;
    const t = progress.current;
    const pos = startPos.clone().lerp(endPos, t);
    if (ref.current) ref.current.position.copy(pos);
    if (trailRef.current) {
      trailRef.current.position.copy(pos.clone().lerp(startPos, 0.08));
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// -- Planet Detail Panel -------------------------------------------
interface PlanetDetailProps {
  planet: PlanetData;
  onClose: () => void;
}

const typeIcon: Record<string, string> = {
  project: "🚀",
  skills: "⚡",
  education: "🎓",
  achievements: "🏆",
  about: "👨‍💻",
};

const typeLabel: Record<string, string> = {
  project: "PROJECT",
  skills: "SKILLS",
  education: "EDUCATION",
  achievements: "ACHIEVEMENTS",
  about: "ABOUT",
};

// Map tech names to devicons CDN logo URLs
const TECH_LOGOS: Record<string, string> = {
  Python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  JavaScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  Java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  C: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  PHP: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  Dart: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg",
  Flutter: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  ReactJS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  Redux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
  NodeJS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  ExpressJS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  MongoDB: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  MySQL: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  Flask: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
  HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  Git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  GitHub: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  Figma: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
};

const TechBadge = ({ tech, accentColor }: { tech: string; accentColor: string }) => {
  const logo = TECH_LOGOS[tech];
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium border"
      style={{ background: `${accentColor}18`, borderColor: `${accentColor}44`, color: accentColor }}
    >
      {logo && (
        <img src={logo} alt={tech} className="w-4 h-4 object-contain" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} />
      )}
      {tech}
    </span>
  );
};

const PlanetDetail = ({ planet, onClose }: PlanetDetailProps) => {
  const [projectIdx, setProjectIdx] = useState(0);
  const icon = planet.portfolioType ? typeIcon[planet.portfolioType] : "🪐";
  const label = planet.portfolioType ? typeLabel[planet.portfolioType] : "PLANET";
  const isProjectsHub = planet.portfolioType === "project";
  const currentProject = isProjectsHub ? PROJECTS[projectIdx] : null;
  const displayColor = isProjectsHub && currentProject ? currentProject.color : planet.color;
  const displayTechStack = isProjectsHub && currentProject ? currentProject.techStack : (planet.techStack || []);
  const displayBullets = isProjectsHub && currentProject ? currentProject.bullets : (planet.bullets || []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 30 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(5,5,20,0.85)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{
          background: `linear-gradient(135deg, #0d0d25 60%, ${displayColor}22)`,
          borderColor: `${displayColor}55`,
          boxShadow: `0 0 60px ${displayColor}33`,
        }}
      >
        {/* Header */}
        <div
          className="p-6 relative"
          style={{ background: `linear-gradient(135deg, ${displayColor}33, transparent)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold transition-all hover:scale-110"
            style={{ background: `${displayColor}33`, color: displayColor }}
          > ❌
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${displayColor}, ${displayColor}55)`,
                boxShadow: `0 0 30px ${displayColor}66`,
              }}
            >
              {icon}
            </div>
            <div>
              <span
                className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2 inline-block"
                style={{ color: displayColor, borderColor: `${displayColor}55`, background: `${displayColor}15` }}
              >
                {label}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {isProjectsHub && currentProject ? currentProject.title : (planet.projectTitle || planet.name)}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: `${displayColor}cc` }}>
                {isProjectsHub && currentProject ? currentProject.subtitle : planet.projectSubtitle}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isProjectsHub && currentProject ? currentProject.period : planet.period}
              </p>
            </div>
          </div>

          {/* Projects carousel tabs */}
          {isProjectsHub && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {PROJECTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setProjectIdx(i)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105"
                  style={{
                    background: i === projectIdx ? p.color : `${p.color}18`,
                    borderColor: `${p.color}66`,
                    color: i === projectIdx ? "#000" : p.color,
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed">
            {isProjectsHub && currentProject ? currentProject.description : planet.description}
          </p>

          {/* Bullets */}
          {displayBullets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: displayColor }}>
                Key Highlights
              </h3>
              <ul className="space-y-2">
                {displayBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: displayColor }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech Stack with logos */}
          {displayTechStack.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: displayColor }}>
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayTechStack.map((tech) => (
                  <TechBadge key={tech} tech={tech} accentColor={displayColor} />
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-2">
            {(isProjectsHub && currentProject ? currentProject.githubUrl : planet.githubUrl) && (
              <a
                href={isProjectsHub && currentProject ? currentProject.githubUrl : planet.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: displayColor, color: "#000" }}
              >
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" className="w-4 h-4" alt="GitHub" style={{ filter: "invert(1)" }} />
                GitHub
              </a>
            )}
            {planet.liveUrl && (
              <a
                href={planet.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                style={{ borderColor: displayColor, color: displayColor }}
              >
                Live Demo
              </a>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white/70 hover:border-white/50 transition-all ml-auto"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// â”€â”€ Mobile Touch Joystick â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface MobileJoystickProps {
  onMove: (dx: number, dy: number) => void;
}

const MobileJoystick = ({ onMove }: MobileJoystickProps) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const basePos = useRef({ x: 0, y: 0 });
  const maxRadius = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchId.current !== null) return;
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    const rect = baseRef.current!.getBoundingClientRect();
    basePos.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
    if (!t || !knobRef.current) return;
    const dx = t.clientX - basePos.current.x;
    const dy = t.clientY - basePos.current.y;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * dist;
    const clampedY = Math.sin(angle) * dist;
    knobRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    onMove(clampedX / maxRadius, clampedY / maxRadius);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
    if (!t) return;
    touchId.current = null;
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
    onMove(0, 0);
  };

  return (
    <div
      ref={baseRef}
      className="w-24 h-24 rounded-full flex items-center justify-center touch-none"
      style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.18)" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={knobRef}
        className="w-10 h-10 rounded-full transition-none"
        style={{ background: "rgba(255,255,255,0.35)", border: "2px solid rgba(255,255,255,0.6)" }}
      />
    </div>
  );
};

// -- Main GalaxyExploration --
const GalaxyExploration = ({ vehicle, onBack }: GalaxyExplorationProps) => {
  const [nearPlanet, setNearPlanet] = useState<PlanetData | null>(null);
  const [orbitingPlanet, setOrbitingPlanet] = useState<PlanetData | null>(null);
  const [viewingPlanet, setViewingPlanet] = useState<PlanetData | null>(null);
  const [collisionFlash, setCollisionFlash] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleShipPositionUpdate = useCallback(() => { }, []);
  const handleAsteroidCollision = useCallback(() => {
    setCollisionFlash(true);
    setTimeout(() => setCollisionFlash(false), 200);
  }, []);
  const handleEnterPlanet = useCallback(() => {
    if (orbitingPlanet) setViewingPlanet(orbitingPlanet);
  }, [orbitingPlanet]);
  const handlePlanetClick = useCallback((planet: PlanetData) => {
    setViewingPlanet(planet);
  }, []);
  const handleClosePlanetView = useCallback(() => {
    setViewingPlanet(null);
  }, []);
  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    keyState.forward = dy < -0.3;
    keyState.backward = dy > 0.3;
    keyState.left = dx < -0.3;
    keyState.right = dx > 0.3;
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 bg-[#05050f] overflow-hidden">
      <AnimatePresence>
        {collisionFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 z-40 pointer-events-none" />
        )}
      </AnimatePresence>

      <Canvas camera={{ position: [50, 20, 50], fov: 60 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <GalaxyScene vehicle={vehicle} onPlanetApproach={setNearPlanet} onOrbitCapture={setOrbitingPlanet}
            orbitingPlanet={orbitingPlanet} showEnterButton={orbitingPlanet !== null}
            onAsteroidCollision={handleAsteroidCollision} onShipPositionUpdate={handleShipPositionUpdate}
            onPlanetClick={handlePlanetClick} />
          {[0, 1, 2, 3, 4].map(i => <Comet key={i} seed={i} />)}
        </Suspense>
      </Canvas>

      {/* Back Button */}
      {onBack && (
        <button onClick={onBack}
          className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105 pointer-events-auto"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
          ← <span className="hidden sm:inline">Back</span>
        </button>
      )}

      {/* Social Links — icon-only on mobile */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-auto z-30">
        <a href="https://github.com/TusarGoswami" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" className="w-3.5 h-3.5" style={{ filter: "invert(1)" }} alt="GitHub" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <a href="https://www.linkedin.com/in/tusar027/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-blue-300 transition-all hover:scale-105"
          style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <span className="text-blue-400 font-bold text-xs">in</span>
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
        <a href="mailto:tusargoswami0027@gmail.com"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-red-300 transition-all hover:scale-105"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <span>✉</span>
          <span className="hidden sm:inline">Email</span>
        </a>
      </div>

      {/* Planet Legend (desktop only) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none hidden md:flex gap-3">
        {PLANETS_DATA.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </div>
        ))}
      </div>

      {/* Mobile Joystick */}
      {isMobile && !viewingPlanet && !orbitingPlanet && (
        <div className="absolute bottom-6 left-5 z-30 pointer-events-auto">
          <MobileJoystick onMove={handleJoystickMove} />
          <p className="text-center text-[10px] text-gray-500 mt-1">Move</p>
        </div>
      )}

      {/* Near planet indicator */}
      <AnimatePresence>
        {nearPlanet && !orbitingPlanet && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-14 right-3 md:top-44 md:right-6 pointer-events-none z-20 max-w-[160px] sm:max-w-none">
            <div className="backdrop-blur-md rounded-xl px-3 sm:px-4 py-2 sm:py-3 border shadow-lg"
              style={{ background: `linear-gradient(135deg, ${nearPlanet.color}22, transparent)`, borderColor: `${nearPlanet.color}55`, boxShadow: `0 0 20px ${nearPlanet.color}33` }}>
              <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">Approaching</p>
              <p className="text-white text-sm sm:text-lg font-bold">{nearPlanet.name}</p>
              <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">{nearPlanet.portfolioType ? typeLabel[nearPlanet.portfolioType] : "Gravity detected"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbiting indicator */}
      <AnimatePresence>
        {orbitingPlanet && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[85vw] max-w-xs sm:max-w-sm">
            <div className="backdrop-blur-md rounded-2xl px-4 sm:px-6 py-4 sm:py-5 border shadow-2xl text-center"
              style={{ background: `linear-gradient(135deg, ${orbitingPlanet.color}44, ${orbitingPlanet.color}11)`, borderColor: `${orbitingPlanet.color}66`, boxShadow: `0 0 40px ${orbitingPlanet.color}44` }}>
              <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1">Orbiting</p>
              <p className="text-white text-lg sm:text-2xl font-bold mb-1">{orbitingPlanet.projectTitle || orbitingPlanet.name}</p>
              {orbitingPlanet.period && (
                <p className="text-xs mb-3" style={{ color: `${orbitingPlanet.color}cc` }}>{orbitingPlanet.period}</p>
              )}
              <button onClick={handleEnterPlanet}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                style={{ background: orbitingPlanet.color, color: '#000', boxShadow: `0 0 20px ${orbitingPlanet.color}88` }}>
                {orbitingPlanet.portfolioType === "project" ? "View Projects ⚡" : "Explore →"}
              </button>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-2 sm:mt-3">
                {isMobile ? "Use joystick to escape orbit" : "Press WASD / arrows to escape orbit"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planet detail view */}
      <AnimatePresence>
        {viewingPlanet && (
          <PlanetDetail planet={viewingPlanet} onClose={handleClosePlanetView} />
        )}
      </AnimatePresence>
    </div>
  );
};


export default GalaxyExploration;
