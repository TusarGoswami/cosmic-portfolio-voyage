import { Suspense, useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Line, Html, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import useSWR from "swr";
import Particles from "./Particles";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  portfolioType?: "project" | "skills" | "education" | "achievements" | "certificates" | "about";
  projectTitle?: string;
  projectSubtitle?: string;
  githubUrl?: string;
  liveUrl?: string;
  techStack?: string[];
  period?: string;
  bullets?: string[];
  skillCategories?: { category: string; skills: string[] }[];
  techLinks?: Record<string, string>;
  certificates?: CertificateEntry[];
}

// Certificate Entry for Certificates planet
interface CertificateEntry {
  title: string;
  issuer: string;
  date: string;
  image: string;
  link: string;
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
    techStack: [],
    bullets: [],
    skillCategories: [
      { category: "Frameworks & Libraries", skills: ["ReactJS", "Redux", "NodeJS", "ExpressJS", "Flutter", "Tailwind CSS", "RESTful APIs", "JWT Authentication"] },
      { category: "Tools & Platforms", skills: ["MySQL", "MongoDB", "Git", "GitHub", "Postman", "Vercel", "Figma"] },
      { category: "Core CS Fundamentals", skills: ["DSA", "OOP", "DBMS", "OS", "CN", "System Design"] },
      { category: "Programming Languages", skills: ["Python", "Java", "C", "C++", "JavaScript", "PHP", "Dart"] }
    ]
  },
  {
    id: 2, name: "LPU Planet", orbitRadius: 75, size: 5, color: "#66ff88", orbitSpeed: 0.06, rotationSpeed: 0.8,
    spotColor: "#99ffaa", glowColor: "#88ffaa", hasSatellite: true, initialAngle: Math.PI * 0.7,
    description: "Lovely Professional University - B.Tech CSE @ LPU, Punjab",
    facts: ["B.Tech CSE @ LPU, Punjab", "CGPA: 7.45 | Aug 2023 - Present", "Flutter Training Certification"],
    moons: 2, gravityRadius: 20, orbitCaptureRadius: 10,
    portfolioType: "education",
    projectTitle: "Education & Training",
    projectSubtitle: "Lovely Professional University",
    period: "Aug 2023 - Present",
    techStack: ["Flutter", "Dart", "Java", "C++", "Python"],
    bullets: [
      "Bachelor of Technology - Computer Science and Engineering || Lovely Professional University, Punjab",
      "Intermediate: 80.4% | Mandalkuli Netaji Vidyapith, West Bengal (2022-23)",
      "Matriculation: 90.0% | Mandalkuli Netaji Vidyapith, West Bengal (2020-21)"
    ]
  },
  {
    id: 3, name: "Achievements", orbitRadius: 98, size: 4.5, color: "#ff4488", orbitSpeed: 0.04, rotationSpeed: 0.5,
    spotColor: "#ff77aa", glowColor: "#ff5599", hasRing: true, ringColor: "#cc2266", hasSatellite: true, initialAngle: Math.PI * 0.3,
    description: "Achievements & Competitive Programming milestones.",
    facts: ["LeetCode Global Top 15%", "5-star Java & C++ on HackerRank", "300+ problems solved"],
    moons: 0, gravityRadius: 22, orbitCaptureRadius: 11,
    portfolioType: "achievements",
    projectTitle: "Achievements",
    projectSubtitle: "Competitive Programming",
    period: "2023 - Present",
    githubUrl: "https://github.com/TusarGoswami",
    techStack: ["LeetCode", "HackerRank", "CodeChef", "GeeksforGeeks"],
    techLinks: {
      "LeetCode": "https://leetcode.com/u/TusarGoswami/",
      "HackerRank": "https://www.hackerrank.com/profile/tusarg937",
      "CodeChef": "https://www.codechef.com/users/tusar_27",
      "GeeksforGeeks": "https://www.geeksforgeeks.org/profile/__tusar27"
    },
    bullets: [
      "Secured Global Top 15% rank in LeetCode Weekly and Biweekly Contests",
      "Earned 5-star ratings in Java & C++ on HackerRank; solved 300+ problems across LeetCode, CodeChef, & GeeksforGeeks"
    ]
  },
  {
    id: 4, name: "Certifications", orbitRadius: 115, size: 4.2, color: "#9b5de5", orbitSpeed: 0.035, rotationSpeed: 0.6,
    spotColor: "#c28cf7", glowColor: "#7e3cc4", hasRing: false, hasSatellite: true, initialAngle: Math.PI * 1.6,
    description: "Professional Certifications & Training.",
    facts: ["ChatGPT-4 Prompt Engineering", "Flutter Dev", "Cloud Computing", "Computer Communications"],
    moons: 1, gravityRadius: 21, orbitCaptureRadius: 10,
    portfolioType: "certificates",
    projectTitle: "Certifications",
    projectSubtitle: "Professional Training",
    period: "2024 - 2025",
    githubUrl: "https://github.com/TusarGoswami",
    techStack: [],
    bullets: [],
    certificates: [
      {
        title: "Computer Communications",
        issuer: "Coursera (University of Colorado)",
        date: "Dec 2024",
        image: "/cert_coursera.png",
        link: "https://www.coursera.org/account/accomplishments/specialization/IAP9BOZ6TFFF"
      },
      {
        title: "Mobile Application Development Using Flutter",
        issuer: "Lovely Professional University",
        date: "Jul 2025",
        image: "/cert_flutter.png",
        link: "https://drive.google.com/file/d/163aiBlwwxBriK3vbJJ76zAYahYwbBUeg/view?usp=drive_link"
      },
      {
        title: "ChatGPT-4 Prompt Engineering: ChatGPT, Generative AI & LLM",
        issuer: "Infosys Springboard",
        date: "Aug 2025",
        image: "/cert_chatgpt.png",
        link: "https://drive.google.com/file/d/1y88z8CmDNRb6k-VV2HNohHdYL9Btgl1I/view?usp=drive_link"
      },
      {
        title: "Cloud Computing",
        issuer: "NPTEL IIT Kharagpur",
        date: "Apr 2025",
        image: "/cert_cloud.png",
        link: "https://drive.google.com/file/d/1mQy22KJBtTiqR_qrZ_FMtm0F_P2p8sFd/view"
      }
    ]
  },
  {
    id: 5, name: "About Me", orbitRadius: 135, size: 4, color: "#39ff88", orbitSpeed: 0.03, rotationSpeed: 0.7,
    spotColor: "#88ffbb", glowColor: "#66ffaa", hasSatellite: true, hasRing: false, initialAngle: Math.PI * 0.9,
    description: "Engineer by logic, artist by instinct.\n\nA Computer Science undergraduate at Lovely Professional University, passionate about algorithms, competitive programming, hackathons, and AI innovation. I merge analytical precision with creative expression through sketching and classical Tabla — building technology that reflects both structure and soul.",
    facts: ["Full Stack Developer", "B.Tech CSE @ LPU", "Open to opportunities"],
    moons: 1, gravityRadius: 20, orbitCaptureRadius: 10,
    portfolioType: "about",
    projectTitle: "About Me",
    githubUrl: "https://github.com/TusarGoswami",
    techStack: [],
    bullets: [],
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
    // If the event is triggered from an input field, do not handle as game controls
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

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

    // Setup touch look controls for mobile
    let touchLookId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Only use touches on the right half of screen for looking (left half is for joystick)
        if (t.clientX > window.innerWidth / 2 && touchLookId === null) {
          touchLookId = t.identifier;
          lastX = t.clientX;
          lastY = t.clientY;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchLookId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchLookId) {
          // Calculate delta. Multiply by a sensitivity factor to feel right on mobile
          const dx = t.clientX - lastX;
          const dy = t.clientY - lastY;
          mouseState.movementX += dx * 2.5;
          mouseState.movementY += dy * 2.5;
          lastX = t.clientX;
          lastY = t.clientY;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchLookId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchLookId) {
          touchLookId = null;
        }
      }
    };

    // Needs to be passive: false if we want to prevent default, but here we just listen
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const consumeMouseMovement = () => {
    const movement = { x: mouseState.movementX, y: mouseState.movementY };
    mouseState.movementX = 0;
    mouseState.movementY = 0;
    return movement;
  };

  return {
    isLocked: () => mouseState.isLocked || ('ontouchstart' in window), // always allow look on touch devices
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
      [1.0, 1.0, 1.0],
      [1.0, 0.92, 0.82],  // warm white
      [0.75, 0.88, 1.0],  // cool blue-white
      [1.0, 0.78, 0.55],  // orange giant
      [0.92, 0.96, 1.0],  // near-white
      [0.65, 0.75, 1.0],  // blue dwarf
      [1.0, 0.95, 0.70],  // yellow-white
    ];

    for (let i = 0; i < count; i++) {
      const radius = 150 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Varied star sizes — a few bright ones, many dim ones
      const roll = Math.random();
      sizes[i] = roll > 0.97 ? Math.random() * 5 + 4 : Math.random() * 3 + 0.8;
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
        const blink = Math.sin(time * (0.4 + (i % 13) * 0.07) + phases[i]) * 0.5 + 0.5;
        sizesAttr.array[i] = sizes[i] * (0.35 + blink * 0.65);
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
        size={2.2}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Global cache for sun texture
let cachedSunTexture: THREE.CanvasTexture | null = null;

// Procedural sun surface texture generator
const buildSunTexture = (): THREE.CanvasTexture => {
  if (cachedSunTexture) return cachedSunTexture;

  const w = 512, h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Base radial gradient — hot white core to deep orange edge
  const base = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  base.addColorStop(0.0, "#fffde0");
  base.addColorStop(0.2, "#ffe560");
  base.addColorStop(0.5, "#ffb830");
  base.addColorStop(0.8, "#ff7800");
  base.addColorStop(1.0, "#cc3300");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // Solar granulation — fewer cells, scaled appropriately
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 10 + 2;
    const bright = Math.random() > 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, bright ? "rgba(255,255,200,0.45)" : "rgba(160,60,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.5), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Solar filaments / prominences
  ctx.strokeStyle = "rgba(255,200,50,0.25)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + Math.random() * 40 - 20, y + Math.random() * 20 - 10,
      x + Math.random() * 40 - 20, y + Math.random() * 20 - 10,
      x + Math.random() * 50 - 25, y + Math.random() * 30 - 15);
    ctx.stroke();
  }

  // Sunspots — large magnetic fields
  for (let i = 0; i < 6; i++) {
    const x = 40 + Math.random() * (w - 80);
    const y = 30 + Math.random() * (h - 60);
    const r1 = Math.random() * 10 + 5;
    const sp = ctx.createRadialGradient(x, y, 0, x, y, r1);
    sp.addColorStop(0, "rgba(40,10,0,0.85)");
    sp.addColorStop(0.5, "rgba(100,30,0,0.5)");
    sp.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sp;
    ctx.beginPath();
    ctx.arc(x, y, r1, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;

  cachedSunTexture = tex;
  return tex;
};

// Central Sun/Galaxy Core
const GalaxyCore = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glow2Ref = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const sunTexture = useMemo(() => buildSunTexture(), []);
  const sunRoughnessMap = useMemo(() => {
    // Simple dark roughness map so emissive is more visible
    const c = document.createElement("canvas"); c.width = 64; c.height = 64;
    const cx = c.getContext("2d")!;
    cx.fillStyle = "#111"; cx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.06;
      sunRef.current.rotation.x = Math.sin(time * 0.03) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(time * 1.2) * 0.07);
    }
    if (glow2Ref.current) {
      glow2Ref.current.scale.setScalar(1 + Math.sin(time * 0.8 + 1) * 0.05);
      glow2Ref.current.rotation.y = time * 0.015;
    }
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(1 + Math.sin(time * 0.5 + 2) * 0.04);
      coronaRef.current.rotation.z = time * 0.008;
    }
  });

  return (
    <group>
      {/* Sun body — realistic emissive textured surface */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 128, 128]} />
        <meshStandardMaterial
          map={sunTexture}
          emissiveMap={sunTexture}
          emissive={new THREE.Color("#ff9900")}
          emissiveIntensity={1.8}
          roughnessMap={sunRoughnessMap}
          roughness={0.05}
          metalness={0}
        />
      </mesh>

      {/* Inner corona — tight orange halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[9.2, 64, 64]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Mid corona */}
      <mesh ref={glow2Ref}>
        <sphereGeometry args={[11, 64, 64]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Outer corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[14, 48, 48]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Distant halo */}
      <mesh>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Primary sun light illuminating all planets */}
      <pointLight color="#fff5cc" intensity={12} distance={350} decay={1.5} castShadow />
      {/* Warm fill light */}
      <pointLight color="#ff8800" intensity={4} distance={150} decay={2} />
      {/* Cool blue rim from "space" side */}
      <pointLight color="#aaddff" intensity={1.2} distance={250} decay={2} position={[-60, 20, -60]} />
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

// Global cache to prevent re-generating textures when re-mounting
const planetTextureCache = new Map<string, { diffuseMap: THREE.CanvasTexture, roughnessMap: THREE.CanvasTexture }>();

const Planet = ({ planet, getPlanetPosition, onPlanetClick, onPlanetHover }: PlanetProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const atmo2Ref = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Rich procedural diffuse texture with continent-like patches, cloud bands, polar caps
  const { diffuseMap, roughnessMap } = useMemo(() => {
    const cacheKey = `explore-${planet.color}-${planet.spotColor}`;
    if (planetTextureCache.has(cacheKey)) {
      return planetTextureCache.get(cacheKey)!;
    }

    const w = 256, h = 128;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // --- Base gradient (day/night side simulation) ---
    const base = ctx.createLinearGradient(0, 0, w, 0);
    base.addColorStop(0, planet.color);
    base.addColorStop(0.35, planet.spotColor || planet.color);
    base.addColorStop(0.65, planet.color);
    base.addColorStop(1, planet.spotColor || planet.color);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // --- Equatorial darker band ---
    const eqGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
    const c = new THREE.Color(planet.color);
    eqGrad.addColorStop(0, "rgba(0,0,0,0)");
    eqGrad.addColorStop(0.5, `rgba(${Math.round(c.r * 30)},${Math.round(c.g * 30)},${Math.round(c.b * 30)},0.35)`);
    eqGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = eqGrad;
    ctx.fillRect(0, 0, w, h);

    // --- Atmospheric band stripes ---
    for (let band = 0; band < 5; band++) {
      const cy = (band / 5) * h + h * 0.05;
      const bw = 8 + Math.random() * 20;
      const alpha = 0.06 + Math.random() * 0.14;
      const bandGrad = ctx.createLinearGradient(0, cy - bw, 0, cy + bw);
      bandGrad.addColorStop(0, "rgba(0,0,0,0)");
      bandGrad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      bandGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(0, cy - bw, w, bw * 2);
    }

    // --- Continental masses (large irregular patches) ---
    const spotC = planet.spotColor || "rgba(255,255,255,0.3)";
    ctx.fillStyle = spotC;
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const rx = Math.random() * 40 + 15;
      const ry = Math.random() * 20 + 5;
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
      g2.addColorStop(0, `${spotC.startsWith("#") ? spotC : spotC}`);
      g2.addColorStop(0.6, `${spotC.startsWith("#") ? spotC + "99" : "rgba(200,200,200,0.2)"}`);
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Craters / surface detail (small dark circles) ---
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 6 + 2;
      const cr = ctx.createRadialGradient(x, y, 0, x, y, r);
      cr.addColorStop(0, "rgba(0,0,0,0.35)");
      cr.addColorStop(0.7, "rgba(0,0,0,0.1)");
      cr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cr;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Polar cap (white top/bottom) ---
    const topCap = ctx.createLinearGradient(0, 0, 0, h * 0.2);
    topCap.addColorStop(0, "rgba(240,248,255,0.85)");
    topCap.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topCap;
    ctx.fillRect(0, 0, w, h * 0.2);
    const botCap = ctx.createLinearGradient(0, h * 0.8, 0, h);
    botCap.addColorStop(0, "rgba(0,0,0,0)");
    botCap.addColorStop(1, "rgba(240,248,255,0.75)");
    ctx.fillStyle = botCap;
    ctx.fillRect(0, h * 0.8, w, h * 0.2);

    const diffuseTex = new THREE.CanvasTexture(canvas);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.anisotropy = 2;

    // --- Roughness map (dark = shiny water-like, bright = rough land) ---
    const rc = document.createElement("canvas");
    rc.width = 128; rc.height = 64;
    const rx2 = rc.getContext("2d")!;
    rx2.fillStyle = "#888"; rx2.fillRect(0, 0, 128, 64);
    // Add rough "land" patches matching continent positions above
    for (let i = 0; i < 6; i++) {
      const x2 = Math.random() * 128;
      const y2 = Math.random() * 64;
      const rRad = Math.random() * 30 + 10;
      const rg = rx2.createRadialGradient(x2, y2, 0, x2, y2, rRad);
      rg.addColorStop(0, "#ddd");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      rx2.fillStyle = rg;
      rx2.beginPath();
      rx2.ellipse(x2, y2, rRad, rRad * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      rx2.fill();
    }
    const roughnessTex = new THREE.CanvasTexture(rc);
    roughnessTex.wrapS = THREE.RepeatWrapping;

    planetTextureCache.set(cacheKey, { diffuseMap: diffuseTex, roughnessMap: roughnessTex });
    return { diffuseMap: diffuseTex, roughnessMap: roughnessTex };
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
    if (atmo2Ref.current) {
      atmo2Ref.current.rotation.y = -time * planet.rotationSpeed * 0.3;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
    onPlanetHover?.(planet);

    // Auto-release pointer lock when hovering over an interactable planet
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
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
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[planet.size, 128, 128]} />
        <meshStandardMaterial
          map={diffuseMap}
          roughnessMap={roughnessMap}
          emissive={new THREE.Color(planet.color)}
          emissiveIntensity={isHovered ? 0.25 : 0.06}
          metalness={0.05}
          roughness={0.82}
        />
      </mesh>

      {/* Inner atmosphere — thin limb glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planet.size * 1.04, 64, 64]} />
        <meshBasicMaterial
          color={planet.glowColor || planet.color}
          transparent
          opacity={isHovered ? 0.38 : 0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Mid atmosphere haze */}
      <mesh ref={atmo2Ref}>
        <sphereGeometry args={[planet.size * 1.10, 48, 48]} />
        <meshBasicMaterial
          color={planet.glowColor || planet.color}
          transparent
          opacity={isHovered ? 0.18 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[planet.size * 1.22, 32, 32]} />
        <meshBasicMaterial
          color={planet.glowColor || planet.color}
          transparent
          opacity={isHovered ? 0.1 : 0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
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
          font="/audiowide.woff"
          fontSize={1.8}
          color={planet.color}
          anchorX="center"
          anchorY="bottom"
          letterSpacing={0.08}
          outlineWidth={0.07}
          outlineColor="#000000"
        >
          {planet.portfolioType ? planet.portfolioType.toUpperCase() : planet.name.toUpperCase()}
        </Text>
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
    color: new THREE.Color("#f0f0f0"),
    metalness: 0.15,
    roughness: 0.55,       // lower = catches more light
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
    sheen: 0.5,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#aaccff"),
  }), []);

  const visorMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffaa00"),
    metalness: 1,
    roughness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    reflectivity: 1,
    envMapIntensity: 3,
    emissive: new THREE.Color("#ff8800"),
    emissiveIntensity: 0.15,   // slight self-lit glow so it's never pitch black
  }), []);

  // Smoothed tilt values (persisted between frames via refs)
  const tiltX = useRef(0); // forward/back tilt (rotation.x)
  const tiltZ = useRef(0); // left/right tilt  (rotation.z)
  const bodyTiltRef = useRef<THREE.Group>(null); // astronaut body tilt group

  useFrame((_, delta) => {
    if (!shipRef.current) return;

    // ── 1. Base position + yaw from ship movement system ──────────────
    shipRef.current.position.copy(positionRef.current);
    shipRef.current.rotation.copy(rotationRef.current);

    // ── 2. Compute target tilt from live key input ─────────────────────
    const MAX_TILT = 0.22; // ~12.5 degrees — realistic, not too wild
    const LERP_IN = Math.min(1, delta * 7);  // fast response when key held
    const LERP_OUT = Math.min(1, delta * 5);  // slightly slower return

    // If orbiting, smoothly zero out tilt
    if (isOrbiting) {
      tiltX.current += (0 - tiltX.current) * LERP_OUT;
      tiltZ.current += (0 - tiltZ.current) * LERP_OUT;
    } else {
      const targetX = keyState.forward ? MAX_TILT
        : keyState.backward ? -MAX_TILT
          : 0;
      const targetZ = keyState.right ? MAX_TILT   // lean right
        : keyState.left ? -MAX_TILT   // lean left
          : 0;

      const factor = (targetX !== 0 || targetZ !== 0) ? LERP_IN : LERP_OUT;
      tiltX.current += (targetX - tiltX.current) * factor;
      tiltZ.current += (targetZ - tiltZ.current) * factor;
    }

    // ── 3. Apply tilt ON TOP of base rotation ─────────────────────────
    // For rocket: tilt the whole shipRef group additional axes
    if (vehicle === "rocket") {
      shipRef.current.rotation.x += tiltX.current;
      shipRef.current.rotation.z -= tiltZ.current;
    }

    // For astronaut: tilt a separate body group so lights don't move
    if (vehicle === "astronaut" && bodyTiltRef.current) {
      bodyTiltRef.current.rotation.x = tiltX.current;
      bodyTiltRef.current.rotation.z = -tiltZ.current;
    }
  });

  const speed = velocityRef.current.length();
  const isMoving = speed > 0.01;

  if (vehicle === "astronaut") {
    return (
      <group ref={shipRef} scale={1.8}>
        {/* ── Astronaut Lights (world-stable, outside tilt group) ──────── */}
        <pointLight position={[0, 3, 2.5]} color="#fff8e8" intensity={8} distance={14} decay={1.5} />
        <pointLight position={[-3, 1, 1]} color="#aac8ff" intensity={4} distance={12} decay={2} />
        <pointLight position={[0, 0.5, -3]} color="#66ddff" intensity={isMoving ? 6 : 3} distance={8} decay={2} />
        <pointLight position={[0, 1.6, 1.5]} color="#ffcc44" intensity={2.5} distance={4} decay={2} />

        {/* ── Tilt group — all body geometry leans on movement ────────── */}
        <group ref={bodyTiltRef}>
          {/* Helmet */}
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.7, 64, 64]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>

          {/* Gold visor */}
          <mesh position={[0, 1.55, 0.45]} rotation={[-0.2, 0, 0]} castShadow>
            <sphereGeometry args={[0.5, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={visorMaterial} attach="material" />
          </mesh>

          {/* Helmet rim/collar */}
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <torusGeometry args={[0.6, 0.1, 16, 64]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Neck ring */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.55, 0.15, 32]} />
            <meshStandardMaterial color="#888888" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Torso */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.55, 0.7, 16, 32]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>

          {/* Chest control unit */}
          <mesh position={[0, 0.35, 0.52]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.5, 0.12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Control indicator lights — emissive so always visible */}
          <mesh position={[-0.12, 0.5, 0.59]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.12, 0.5, 0.59]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 0.38, 0.59]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={2} />
          </mesh>

          {/* Life support backpack */}
          <mesh position={[0, 0.2, -0.55]} castShadow receiveShadow>
            <boxGeometry args={[0.75, 0.95, 0.35]} />
            <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.55, -0.75]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.25, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Jetpack thrusters */}
          <mesh position={[-0.22, -0.25, -0.65]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
          </mesh>
          <mesh position={[0.22, -0.25, -0.65]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.08} />
          </mesh>

          {/* Jetpack flames */}
          <Particles position={[-0.22, -0.4, -0.65]} count={40} color="#66ddff" size={0.05} spread={0.1} speed={isMoving ? 3 : 1.2} type="flame" active={true} />
          <Particles position={[0.22, -0.4, -0.65]} count={40} color="#66ddff" size={0.05} spread={0.1} speed={isMoving ? 3 : 1.2} type="flame" active={true} />

          {/* Left arm */}
          <group position={[-0.75, 0.35, 0]}>
            <mesh rotation={[0, 0, Math.PI / 4.5]} castShadow receiveShadow>
              <capsuleGeometry args={[0.16, 0.35, 8, 16]} />
              <primitive object={suitMaterial} attach="material" />
            </mesh>
            <mesh position={[-0.25, -0.15, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-0.4, -0.35, 0]} rotation={[0, 0, Math.PI / 6]} castShadow receiveShadow>
              <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
              <primitive object={suitMaterial} attach="material" />
            </mesh>
            <mesh position={[-0.55, -0.5, 0]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#ff7700" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>

          {/* Right arm */}
          <group position={[0.75, 0.35, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 4.5]} castShadow receiveShadow>
              <capsuleGeometry args={[0.16, 0.35, 8, 16]} />
              <primitive object={suitMaterial} attach="material" />
            </mesh>
            <mesh position={[0.25, -0.15, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.4, -0.35, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow receiveShadow>
              <capsuleGeometry args={[0.14, 0.3, 8, 16]} />
              <primitive object={suitMaterial} attach="material" />
            </mesh>
            <mesh position={[0.55, -0.5, 0]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#ff7700" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>

          {/* Legs */}
          <mesh position={[-0.25, -0.8, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.18, 0.65, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>
          <mesh position={[0.25, -0.8, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.18, 0.65, 8, 16]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>

          {/* Boots */}
          <mesh position={[-0.25, -1.35, 0.08]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.18, 0.35]} />
            <meshStandardMaterial color="#333333" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.25, -1.35, 0.08]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.18, 0.35]} />
            <meshStandardMaterial color="#333333" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>{/* end bodyTiltRef */}
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

  // (Pointer lock logic has been moved to Canvas onPointerMissed and planet hover events for better UX)

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

    const acceleration = 15.0;
    const maxSpeed = 25;
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
      let moveX = 0;
      let moveZ = 0;
      if (keys.current.left) moveX -= 1;
      if (keys.current.right) moveX += 1;
      if (keys.current.forward) moveZ -= 1;
      if (keys.current.backward) moveZ += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const targetRotation = cameraState.yaw + Math.atan2(moveX, moveZ);
        const angleDiff = targetRotation - shipRotation.current.y;
        // Normalize angle difference
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        shipRotation.current.y += normalizedDiff * 0.15;
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
      {/* Scene base lighting */}
      <ambientLight intensity={0.35} color="#1a2840" />
      {/* Sky/ground hemisphere for natural bounce light */}
      <hemisphereLight args={["#334466", "#000510", 0.6]} />
      {/* Sun directional light angled to illuminate the scene from the core */}
      <directionalLight
        position={[50, 40, 80]}
        color="#fff5cc"
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={600}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />

      <BlinkingStars count={1200} />
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

// -- Intro Cinematic Camera ------------------------------------------
interface IntroCinematicProps {
  onComplete: () => void;
}

const IntroCinematic = ({ onComplete }: IntroCinematicProps) => {
  const { camera } = useThree();
  const progress = useRef(0);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (done.current) return;
    progress.current = Math.min(progress.current + delta * 0.18, 1);
    const t = progress.current;

    // Ease-out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    // Start close to the sun, zoom out to starting position
    const startDist = 15;
    const endDist = 80;
    const dist = startDist + (endDist - startDist) * ease;
    const angle = Math.PI * 0.25 + t * Math.PI * 0.15;
    const height = 80 - ease * 60;

    camera.position.set(
      Math.cos(angle) * dist,
      height,
      Math.sin(angle) * dist
    );
    camera.lookAt(0, 0, 0);

    if (t >= 1 && !done.current) {
      done.current = true;
      onComplete();
    }
  });

  return null;
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
  certificates: "📜",
  about: "👨‍💻",
};

const typeLabel: Record<string, string> = {
  project: "PROJECTS",
  skills: "SKILLS",
  education: "EDUCATION",
  achievements: "ACHIEVEMENTS",
  certificates: "CERTIFICATES",
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
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  Postman: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg",
  Vercel: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg",
  LeetCode: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
  HackerRank: "https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png",
  CodeChef: "https://cdn.iconscout.com/icon/free/png-256/free-codechef-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-2-pack-logos-icons-2944760.png",
  GeeksforGeeks: "https://upload.wikimedia.org/wikipedia/commons/4/43/GeeksforGeeks.svg",
};

const TechBadge = ({ tech, accentColor, url }: { tech: string; accentColor: string; url?: string }) => {
  const logo = TECH_LOGOS[tech];
  const content = (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium border ${url ? 'transition-colors hover:brightness-125 hover:scale-105 cursor-pointer' : ''}`}
      style={{ background: `${accentColor}18`, borderColor: `${accentColor}44`, color: accentColor }}
    >
      {logo && (
        <img src={logo} alt={tech} className="w-4 h-4 object-contain" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} />
      )}
      {tech}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
};

// Typewriter Effect Component
const TypewriterTitles = ({ titles, color }: { titles: string[], color: string }) => {
  const [titleIdx, setTitleIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTitle = titles[titleIdx];
    const delay = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentTitle.length) {
          setText(currentTitle.slice(0, text.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTitleIdx((prev) => (prev + 1) % titles.length);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, titleIdx, titles]);

  return (
    <span style={{ color: color }} className="font-mono text-sm block min-h-[1.25rem]">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// LeetCode Stats & Fun Fact Component
const LeetCodeStatsAndFunFact = ({ planetColor }: { planetColor: string }) => {
  const { data, error, isLoading } = useSWR('https://leetcode-stats-api.herokuapp.com/TusarGoswami', fetcher);

  const totalSolved = data ? data.totalSolved : "300+";
  const ranking = data ? data.ranking : "Top 15%";

  const easySolved = data ? data.easySolved : 130;
  const totalEasy = data ? data.totalEasy : 800;
  const easyPercent = data ? (data.easySolved / data.totalEasy) * 100 : 45;

  const mediumSolved = data ? data.mediumSolved : 115;
  const totalMedium = data ? data.totalMedium : 1600;
  const mediumPercent = data ? (data.mediumSolved / data.totalMedium) * 100 : 40;

  const hardSolved = data ? data.hardSolved : 55;
  const totalHard = data ? data.totalHard : 700;
  const hardPercent = data ? (data.hardSolved / data.totalHard) * 100 : 15;

  return (
    <div className="mt-6 space-y-4">
      {/* LeetCode Card */}
      <div className="p-4 sm:p-5 rounded-2xl border relative overflow-hidden" style={{ background: "#0a0a0a", borderColor: `${planetColor}33` }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" style={{ background: `${planetColor}22` }} />
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black" style={{ background: `${planetColor}22`, color: planetColor }}>
              &lt;/&gt;
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide" style={{ background: `linear-gradient(90deg, #9b5de5, ${planetColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                &lt; LeetCode /&gt;
              </h3>
              <a href="https://leetcode.com/u/TusarGoswami/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 font-mono hover:text-[#00e5ff] transition-colors line-clamp-1 block">
                @TusarGoswami
              </a>
            </div>
          </div>
          <a href="https://leetcode.com/u/TusarGoswami/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
          <div className="p-3 rounded-xl border flex flex-col items-center justify-center transition-all" style={{ background: "#111", borderColor: "#222" }}>
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] sm:text-xs mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              Problems
            </div>
            {isLoading ? <div className="h-6 w-16 bg-white/10 animate-pulse rounded my-1" /> : (
              <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5">{totalSolved}</p>
            )}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Solved</p>
          </div>
          <div className="p-3 rounded-xl border flex flex-col items-center justify-center transition-all" style={{ background: "#111", borderColor: "#222" }}>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs mb-1" style={{ color: planetColor }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              Ranking
            </div>
            {isLoading ? <div className="h-6 w-20 bg-white/10 animate-pulse rounded my-1" /> : (
              <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5" style={{ fontSize: String(ranking).length > 6 ? '1.25rem' : '' }}>
                {ranking}
              </p>
            )}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global</p>
          </div>
        </div>

        <div className="space-y-3 mb-5 relative z-10">
          <p className="font-mono text-xs text-[#666]">{'// Difficulty breakdown'}</p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#00b8a3] w-12 font-medium tracking-wide">Easy</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ background: "#00b8a3", width: `${easyPercent}%` }} />
            </div>
            <span className="text-xs text-white font-bold w-6 text-right">
              {isLoading ? <span className="inline-block w-4 h-3 bg-white/20 animate-pulse rounded" /> : easySolved}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#ffc01e] w-12 font-medium tracking-wide">Medium</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ background: "#ffc01e", width: `${mediumPercent}%` }} />
            </div>
            <span className="text-xs text-white font-bold w-6 text-right">
              {isLoading ? <span className="inline-block w-4 h-3 bg-white/20 animate-pulse rounded" /> : mediumSolved}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#ff375f] w-12 font-medium tracking-wide">Hard</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ background: "#ff375f", width: `${hardPercent}%` }} />
            </div>
            <span className="text-xs text-white font-bold w-6 text-right">
              {isLoading ? <span className="inline-block w-4 h-3 bg-white/20 animate-pulse rounded" /> : hardSolved}
            </span>
          </div>
        </div>

        <div className="px-3 sm:px-4 py-2.5 rounded-lg border flex items-center gap-3 relative z-10" style={{ background: `linear-gradient(90deg, ${planetColor}15, transparent)`, borderColor: `${planetColor}33` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={planetColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          <span className="text-xs sm:text-sm font-medium" style={{ color: planetColor }}>
            Biweekly Contest 146: <span className="text-white">Rank 746 / 30.7k+</span>
          </span>
        </div>
      </div>

      {/* Fun Fact Card */}
      <div className="p-4 sm:p-5 rounded-xl border" style={{ background: "#0a0a0a", borderLeft: `3px solid ${planetColor}`, borderColor: "#222" }}>
        <p className="font-mono text-xs mb-2" style={{ color: planetColor }}>{'// Fun Fact'}</p>
        <p className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-line">
          When I’m not coding, I actively participate in hackathons and continuously sharpen my competitive programming skills.

          Beyond tech, I’ve represented myself in district-level photography competitions and have a strong command of Tabla, reflecting my creative and artistic side.
        </p>
      </div>
    </div>
  );
};

// Contact Form component
const ContactForm = ({ accentColor }: { accentColor: string }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "c40626ee-4071-43bb-a344-81ea28c5b4a1",
          name: form.name,
          email: form.email,
          message: form.message,
          subject: "New Portfolio Message: " + form.name,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('sent');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        console.error("Web3Forms error:", result.message);
      }
    } catch (error) {
      setStatus('error');
      console.error("Form submission failed:", error);
    }
  };

  if (status === 'sent') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="mt-5 p-5 rounded-xl text-center"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}44` }}>
        <div className="text-3xl mb-2">✅</div>
        <p className="text-white font-bold">Message Delivered!</p>
        <p className="text-gray-400 text-sm mt-1">I've received your message and will get back to you soon via email.</p>
        <button onClick={() => setStatus('idle')} className="mt-3 text-xs underline" style={{ color: accentColor }}>Send another</button>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="mt-5 p-5 rounded-xl text-center"
        style={{ background: 'rgba(255, 68, 68, 0.15)', border: '1px solid rgba(255, 68, 68, 0.4)' }}>
        <div className="text-3xl mb-2">❎</div>
        <p className="text-white font-bold">Transmission Failed!</p>
        <p className="text-gray-400 text-sm mt-1">Something went wrong while sending your message. Please try again.</p>
        <button onClick={() => setStatus('idle')} className="mt-3 text-xs underline" style={{ color: '#ff6666' }}>Try again</button>
      </motion.div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t" style={{ borderColor: `${accentColor}33` }}>
      <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: accentColor }}>✉ Get In Touch</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text" placeholder="Your Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:ring-1"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", '--tw-ring-color': accentColor } as React.CSSProperties}
            required
          />
          <input
            type="email" placeholder="Your Email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:ring-1"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            required
          />
        </div>
        <textarea
          placeholder="Your message..." value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          required
        />
        <button
          type="submit" disabled={status === 'sending'}
          className="w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
          style={{ background: accentColor, color: '#000' }}
        >
          {status === 'sending' ? 'Transmitting... ⏳' : 'Send Message 🚀'}
        </button>
      </form>
    </div>
  );
};

// GitHub Contribution Graph
const GitHubGraph = () => (
  <div className="mt-5 pt-4 border-t border-white/10">
    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">GitHub Activity</h3>
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
      <img
        src="https://ghchart.rshah.org/00e5ff/TusarGoswami"
        alt="Tusar Goswami GitHub Contribution Graph"
        className="w-full object-cover"
        style={{ filter: "brightness(1.2) saturate(1.3)" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://github-readme-stats.vercel.app/api?username=TusarGoswami&show_icons=true&theme=radical&bg_color=0d0d25&border_color=00e5ff55&title_color=00e5ff&icon_color=00e5ff&text_color=ffffff";
        }}
      />
    </div>
    <a href="https://github.com/TusarGoswami" target="_blank" rel="noopener noreferrer"
      className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
      View full profile →
    </a>
  </div>
);

const PlanetDetail = ({ planet, onClose }: PlanetDetailProps) => {
  const [projectIdx, setProjectIdx] = useState(0);
  const icon = planet.portfolioType ? typeIcon[planet.portfolioType] : "🪐";
  const label = planet.portfolioType ? typeLabel[planet.portfolioType] : "PLANET";
  const isProjectsHub = planet.portfolioType === "project";
  const currentProject = isProjectsHub ? PROJECTS[projectIdx] : null;
  const displayColor = isProjectsHub && currentProject ? currentProject.color : planet.color;
  const displayTechStack = isProjectsHub && currentProject ? currentProject.techStack : (planet.techStack || []);
  const displayBullets = isProjectsHub && currentProject ? currentProject.bullets : (planet.bullets || []);
  const displaySkillCategories = planet.skillCategories || [];

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
          > ⚔️
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
          {/* About Me — special bio layout with real photo */}
          {planet.portfolioType === "about" && (
            <div className="p-5 sm:p-6 rounded-2xl relative overflow-hidden" style={{ background: "rgba(57,255,136,0.05)", border: "1px solid rgba(57,255,136,0.2)" }}>
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-0 w-32 h-32 bg-[#39ff88] rounded-full mix-blend-screen filter blur-[80px] opacity-20 -translate-y-1/2 pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#39ff88] to-[#00e5ff] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                  <img
                    src="/tusar.jpg"
                    alt="Tusar Goswami"
                    className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-full object-cover object-top"
                    style={{ border: "4px solid rgba(57,255,136,0.6)", boxShadow: "0 0 40px rgba(57,255,136,0.3)" }}
                  />
                </div>
                <div className="text-center sm:text-left flex-1 mt-2 sm:mt-4">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Tusar Goswami</h1>
                  <TypewriterTitles
                    titles={["Competitive Programmer", "Full-Stack Developer", "Flutter Enthusiast", "System Design"]}
                    color={displayColor}
                  />
                  <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#39ff88]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Kolkata, West Bengal
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-line p-1">
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
                  <TechBadge key={tech} tech={tech} accentColor={displayColor} url={isProjectsHub && currentProject ? undefined : planet.techLinks?.[tech]} />
                ))}
              </div>
            </div>
          )}

          {/* Skill Categories with logos */}
          {displaySkillCategories.length > 0 && (
            <div className="space-y-4">
              {displaySkillCategories.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: displayColor }}>
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <TechBadge key={skill} tech={skill} accentColor={displayColor} url={isProjectsHub && currentProject ? undefined : planet.techLinks?.[skill]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications with Images */}
          {planet.portfolioType === "certificates" && planet.certificates && planet.certificates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {planet.certificates.map((cert, i) => (
                <div key={i} className="rounded-xl overflow-hidden border transition-transform hover:scale-[1.02]" style={{ background: "rgba(0,0,0,0.3)", borderColor: `${displayColor}33` }}>
                  <div className="w-full relative pt-[60%] bg-[rgba(255,255,255,0.02)] border-b" style={{ borderColor: `${displayColor}22` }}>
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="absolute inset-0 w-full h-full object-contain p-2"
                      style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="p-3" style={{ background: `linear-gradient(to bottom, ${displayColor}11, transparent)` }}>
                    <h4 className="text-white font-bold text-sm mb-1 leading-tight line-clamp-2" title={cert.title}>{cert.title}</h4>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate pr-2">{cert.issuer}</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider flex-shrink-0" style={{ background: `${displayColor}22`, color: displayColor }}>{cert.date}</span>
                    </div>
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                      style={{ background: displayColor, color: "#000" }}
                    >
                      <svg viewBox="0 0 1024 1024" width="14" height="14"><path d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512 282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0z" fill="#000000"></path><path d="M447.856 754.272a27.184 27.184 0 0 1-19.168-7.92l-180.352-179.312a27.152 27.152 0 1 1 38.256-38.48l161.056 160.112 301.776-318.576a27.168 27.168 0 0 1 39.52 37.472l-321.728 339.696a27.12 27.12 0 0 1-19.36 7.008z" fill="#ffffff"></path></svg>
                      Verify
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* About Me Extras: LeetCode & Fun Fact */}
          {planet.portfolioType === "about" && (
            <LeetCodeStatsAndFunFact planetColor={displayColor} />
          )}

          {/* Contact Form — only for About planet */}
          {planet.portfolioType === "about" && (
            <ContactForm accentColor={displayColor} />
          )}

          {/* GitHub Contribution Graph — only for Projects */}
          {planet.portfolioType === "project" && (
            <GitHubGraph />
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
            {planet.portfolioType === "about" && (
              <a
                href="https://drive.google.com/file/d/1x52wasItykb2rDwZ-5wxV8zEbeORwtAv/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: displayColor, color: '#000', boxShadow: `0 0 20px ${displayColor}66` }}
              >
                📄 Resume
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
  const [cinematicDone, setCinematicDone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Auto-hide instructions when user starts moving for the first time
  useEffect(() => {
    if (!showInstructions) return;

    const handleFirstMove = () => {
      setShowInstructions(false);
      window.removeEventListener('keydown', handleFirstMove);
      window.removeEventListener('mousedown', handleFirstMove);
      window.removeEventListener('touchstart', handleFirstMove);
    };

    const timer = setTimeout(() => {
      window.addEventListener('keydown', handleFirstMove, { once: true });
      window.addEventListener('mousedown', handleFirstMove, { once: true });
      window.addEventListener('touchstart', handleFirstMove, { once: true });
    }, 3000); // Give them 3 seconds to read before any keypress hides it

    // Fallback: hide after 12 seconds anyway
    const hideTimer = setTimeout(() => setShowInstructions(false), 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
      window.removeEventListener('keydown', handleFirstMove);
      window.removeEventListener('mousedown', handleFirstMove);
      window.removeEventListener('touchstart', handleFirstMove);
    };
  }, [showInstructions]);

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

      {/* Intro cinematic overlay */}
      <AnimatePresence>
        {!cinematicDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
              transition={{ duration: 4, times: [0, 0.15, 0.75, 1] }}
              className="text-center"
            >
              <motion.h1
                className="text-3xl sm:text-5xl font-black tracking-[0.3em] uppercase mb-3"
                style={{
                  background: "linear-gradient(90deg, #ffee66, #ff9900, #ffee66)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 30px rgba(255,200,0,0.8))",
                }}
              >
                COSMIC VOYAGE
              </motion.h1>
              <p className="text-gray-400 text-sm tracking-[0.4em] uppercase">Tusar Goswami · Portfolio</p>
            </motion.div>
            <motion.p
              className="absolute bottom-12 text-xs text-gray-600 tracking-widest uppercase"
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 3, delay: 1, repeat: Infinity }}
            >
              Entering the galaxy...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas
        camera={{ position: [50, 20, 50], fov: 60 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
        shadows
        dpr={[1, 1.5]}
        onPointerMissed={(e) => {
          // Allow toggle background click to lock/unlock cursor
          if (e.type !== 'contextmenu') {
            if (document.pointerLockElement) {
              document.exitPointerLock();
            } else {
              (e.target as HTMLElement)?.requestPointerLock?.();
            }
          }
        }}
      >
        <Suspense fallback={null}>
          {!cinematicDone && <IntroCinematic onComplete={() => setCinematicDone(true)} />}
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

      {/* Help Toggle Button */}
      <button
        onClick={() => setShowInstructions(prev => !prev)}
        className="absolute bottom-4 left-4 sm:left-4 z-30 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white/80 transition-all hover:text-white hover:scale-105 hover:bg-white/10"
        style={{
          background: "rgba(20, 20, 40, 0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          left: isMobile ? 'auto' : '1rem',
          right: isMobile ? '1rem' : 'auto',
          bottom: isMobile ? '1rem' : '1rem'
        }}
        title="Show Controls"
      >
        <span className="text-base sm:text-lg font-bold">?</span>
      </button>

      {/* Controls Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && cinematicDone && (
          <motion.div
            initial={{ opacity: 0, x: -20, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-16 left-4 z-30 pointer-events-none"
          >
            <div
              className="px-5 py-4 rounded-xl text-sm"
              style={{
                background: "linear-gradient(145deg, rgba(15,20,35,0.85), rgba(5,10,20,0.9))",
                border: "1px solid rgba(100,150,255,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
                left: isMobile ? 'auto' : '0',
                right: isMobile ? '0' : 'auto'
              }}
            >
              <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-wider text-xs border-b border-cyan-500/30 pb-1">Controls</h3>

              <div className="flex flex-col gap-2.5 text-gray-300">
                {isMobile ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-[10px] border border-white/20">Joystick</span>
                      <span className="text-xs">Move / Strafe</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-6 flex items-center justify-center bg-cyan-900/50 rounded font-mono text-[10px] border border-cyan-500/30">Touch Area</span>
                      <span className="text-xs">Drag right side to Look</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-xs border border-white/20">W</span>
                        <span className="text-gray-500">/</span>
                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-xs border border-white/20">↑</span>
                      </div>
                      <span className="text-xs">Move Forward</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-xs border border-white/20">S</span>
                        <span className="text-gray-500">/</span>
                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-xs border border-white/20">↓</span>
                      </div>
                      <span className="text-xs">Move Backward</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-xs text-transparent" style={{ textShadow: "0 0 0 transparent" }}>·</span>
                        <span className="text-transparent">/</span>
                        <span className="px-2 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-[10px] border border-white/20 whitespace-nowrap">A D ← →</span>
                      </div>
                      <span className="text-xs">Strafe Left / Right</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-[10px] border border-white/20">Space</span>
                      <span className="text-xs">Move Up</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 h-6 flex items-center justify-center bg-white/10 rounded font-mono text-[10px] border border-white/20">Shift</span>
                      <span className="text-xs">Move Down</span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                      <span className="px-2 h-6 flex items-center justify-center bg-cyan-900/50 rounded font-mono text-[10px] border border-cyan-500/30 text-cyan-200">Mouse</span>
                      <span className="text-xs text-cyan-100">Click background to Look</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Near planet approaching indicator — compact corner badge */}
      <AnimatePresence>
        {nearPlanet && !orbitingPlanet && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-16 right-3 md:bottom-10 md:right-5 pointer-events-none z-20"
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${nearPlanet.color}22, rgba(5,5,20,0.75))`,
                border: `1px solid ${nearPlanet.color}44`,
                boxShadow: `0 0 14px ${nearPlanet.color}22`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 10,
                padding: "6px 10px",
              }}
            >
              <p style={{ fontSize: 8, letterSpacing: "0.15em", color: `${nearPlanet.color}bb`, textTransform: "uppercase", marginBottom: 1 }}>
                Approaching
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {nearPlanet.name}
              </p>
              {nearPlanet.portfolioType && (
                <p style={{ fontSize: 9, color: "rgba(180,185,200,0.6)", marginTop: 1 }}>
                  {typeLabel[nearPlanet.portfolioType]}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbit notification — compact centered HUD */}
      <AnimatePresence>
        {orbitingPlanet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              position: "absolute",
              top: "68%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${orbitingPlanet.color}28, rgba(5,5,20,0.82))`,
                border: `1px solid ${orbitingPlanet.color}55`,
                boxShadow: `0 0 24px ${orbitingPlanet.color}33, inset 0 1px 0 rgba(255,255,255,0.06)`,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "14px",
                padding: "10px 14px",
                minWidth: "180px",
                maxWidth: "260px",
                textAlign: "center",
              }}
            >
              {/* Planet color accent bar */}
              <div style={{ height: 2, borderRadius: 99, background: orbitingPlanet.color, marginBottom: 8, opacity: 0.7 }} />

              {/* Status tag */}
              <p style={{ fontSize: 9, letterSpacing: "0.18em", color: `${orbitingPlanet.color}cc`, textTransform: "uppercase", marginBottom: 2 }}>
                ⬤ Orbiting
              </p>

              {/* Planet name */}
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 2 }}>
                {orbitingPlanet.projectTitle || orbitingPlanet.name}
              </p>

              {/* Optional period */}
              {orbitingPlanet.period && (
                <p style={{ fontSize: 10, color: "rgba(200,200,220,0.55)", marginBottom: 6 }}>
                  {orbitingPlanet.period}
                </p>
              )}

              {/* Explore button */}
              <button
                onClick={handleEnterPlanet}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 12,
                  background: orbitingPlanet.color,
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 0 12px ${orbitingPlanet.color}66`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  marginBottom: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {orbitingPlanet.portfolioType === "project" ? "View Projects ⚡" : "Explore →"}
              </button>

              {/* Escape hint */}
              <p style={{ fontSize: 9, color: "rgba(150,160,180,0.6)", letterSpacing: "0.05em" }}>
                {isMobile ? "Joystick to escape" : "WASD / ↑↓←→ to escape"}
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
