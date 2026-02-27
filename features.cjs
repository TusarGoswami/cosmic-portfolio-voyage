const fs = require('fs');
const path = require('path');
const filePath = 'src/components/GalaxyExploration.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// ── 1. Add "About & Contact" planet to PLANETS_DATA ──────────────────────────────────
// Insert after the Achievements planet (id:3), before the closing ];
const achievementsEnd = `    ]
  },
];`;

const aboutPlanet = `    ]
  },
  {
    id: 4, name: "About Me", orbitRadius: 120, size: 4, color: "#39ff88", orbitSpeed: 0.03, rotationSpeed: 0.7,
    spotColor: "#88ffbb", glowColor: "#66ffaa", hasSatellite: true, hasRing: false, initialAngle: Math.PI * 0.9,
    description: "About Tusar Goswami — Full Stack Developer, B.Tech CSE @ LPU.",
    facts: ["Full Stack Developer", "B.Tech CSE @ LPU", "Open to opportunities"],
    moons: 1, gravityRadius: 20, orbitCaptureRadius: 10,
    portfolioType: "about",
    projectTitle: "About Me",
    projectSubtitle: "Tusar Goswami — Full Stack Developer",
    period: "2004 - Present",
    githubUrl: "https://github.com/TusarGoswami",
    techStack: ["ReactJS", "NodeJS", "Python", "Java", "Flutter", "MongoDB", "MySQL"],
    bullets: [
      "👋 Hi! I'm Tusar Goswami, a passionate Full Stack Developer and B.Tech CSE student at Lovely Professional University, Punjab.",
      "💡 I love building scalable web apps, solving competitive programming challenges, and exploring AI/ML.",
      "🏆 LeetCode Top 15% globally — 300+ problems solved across LeetCode, CodeChef & GeeksforGeeks.",
      "🚀 Key projects: Head-2-Code (MERN), Velo-Rapido (PHP), LinkedIn Optimizer Pro (AI/Python).",
      "📍 Based in West Bengal, India. Open to internships & full-time roles in software development.",
    ]
  },
];`;

content = content.replace(achievementsEnd, aboutPlanet);
console.log('✅ Added About Me planet:', content.includes('About Me'));

// ── 2. Add IntroCinematic component before PlanetDetail ───────────────────────────────
const cometEnd = `// -- Planet Detail Panel -------------------------------------------`;

const cinematicComponent = `// -- Intro Cinematic Camera ------------------------------------------
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

// -- Planet Detail Panel -------------------------------------------`;

content = content.replace(cometEnd, cinematicComponent);
console.log('✅ Added IntroCinematic:', content.includes('IntroCinematic'));

// ── 3. Update PlanetDetail to include About/Contact panels ────────────────────────────
// Find and replace the PlanetDetail component body
// We'll replace the closing part of PlanetDetail that renders bullets/footer
const oldBulletsSection = `          {/* Bullets / Description */}
          <div className="p-6 space-y-2">
            {displayBullets.map((b, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="mt-0.5 text-gray-500 flex-shrink-0">•</span>
                <span>{b}</span>
              </div>
            ))}
          </div>`;

if (content.includes('Bullets / Description')) {
    console.log('✅ Found bullets section');
}

// Find the section after the tech stack display but before the footer buttons
// to inject the contact form for About planet
const contactFormInsertion = `          {/* Bullets / Description */}
          <div className="p-6 space-y-2">
            {/* About Me — special bio layout */}
            {planet.portfolioType === "about" && (
              <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(57,255,136,0.07)", border: "1px solid rgba(57,255,136,0.2)" }}>
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src="/tusar.jpg"
                    alt="Tusar Goswami"
                    className="w-16 h-16 rounded-full object-cover object-top flex-shrink-0"
                    style={{ border: "2px solid rgba(57,255,136,0.5)", boxShadow: "0 0 20px rgba(57,255,136,0.3)" }}
                  />
                  <div>
                    <p className="text-white font-bold text-base">Tusar Goswami</p>
                    <p className="text-xs" style={{ color: "#39ff8899" }}>Full Stack Developer · B.Tech CSE</p>
                    <p className="text-xs text-gray-500">Lovely Professional University, Punjab</p>
                  </div>
                </div>
              </div>
            )}
            {displayBullets.map((b, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="mt-0.5 text-gray-500 flex-shrink-0">•</span>
                <span>{b}</span>
              </div>
            ))}

            {/* Contact Form — only for About planet */}
            {planet.portfolioType === "about" && (
              <ContactForm accentColor={planet.color} />
            )}

            {/* GitHub Contribution Graph — only for Projects */}
            {planet.portfolioType === "project" && (
              <GitHubGraph />
            )}
          </div>`;

content = content.replace(
    `          {/* Bullets / Description */}
          <div className="p-6 space-y-2">
            {displayBullets.map((b, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="mt-0.5 text-gray-500 flex-shrink-0">•</span>
                <span>{b}</span>
              </div>
            ))}
          </div>`,
    contactFormInsertion
);
console.log('✅ Added contact form & github graph injection:', content.includes('ContactForm'));

// ── 4. Add ContactForm + GitHubGraph components before PlanetDetail ───────────────────
const beforePlanetDetail = `const PlanetDetail = ({ planet, onClose }: PlanetDetailProps) => {`;

const newComponents = `// Contact Form component
const ContactForm = ({ accentColor }: { accentColor: string }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    // Using mailto as fallback (no backend needed)
    const subject = encodeURIComponent('Portfolio Contact: ' + form.name);
    const body = encodeURIComponent('From: ' + form.name + '\\nEmail: ' + form.email + '\\n\\n' + form.message);
    window.open('mailto:tusargoswami0027@gmail.com?subject=' + subject + '&body=' + body);
    setTimeout(() => {
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    }, 500);
  };

  if (status === 'sent') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="mt-5 p-5 rounded-xl text-center"
        style={{ background: \`\${accentColor}15\`, border: \`1px solid \${accentColor}44\` }}>
        <div className="text-3xl mb-2">✅</div>
        <p className="text-white font-bold">Message sent!</p>
        <p className="text-gray-400 text-sm mt-1">Your email client should open. I'll get back to you soon!</p>
        <button onClick={() => setStatus('idle')} className="mt-3 text-xs underline" style={{ color: accentColor }}>Send another</button>
      </motion.div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t" style={{ borderColor: \`\${accentColor}33\` }}>
      <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: accentColor }}>✉ Get In Touch</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text" placeholder="Your Name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:ring-1"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", focusRingColor: accentColor }}
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
          {status === 'sending' ? 'Opening mail...' : 'Send Message 🚀'}
        </button>
      </form>
    </div>
  );
};

// GitHub Contribution Graph (embedded via GitHub readme stats API)
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

const PlanetDetail = ({ planet, onClose }: PlanetDetailProps) => {`;

content = content.replace(beforePlanetDetail, newComponents);
console.log('✅ Added ContactForm & GitHubGraph:', content.includes('ContactForm'));

// ── 5. Also fix the footer — add Resume download button for About planet ───────────────
const oldFooterButtons = `            {(isProjectsHub && currentProject?.githubUrl || (!isProjectsHub && planet.githubUrl)) && (
              <a
                href={isProjectsHub && currentProject ? currentProject.githubUrl : planet.githubUrl}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                style={{ borderColor: displayColor, color: displayColor }}
              >
                GitHub →
              </a>
            )}`;

const newFooterButtons = `            {(isProjectsHub && currentProject?.githubUrl || (!isProjectsHub && planet.githubUrl)) && (
              <a
                href={isProjectsHub && currentProject ? currentProject.githubUrl : planet.githubUrl}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                style={{ borderColor: displayColor, color: displayColor }}
              >
                GitHub →
              </a>
            )}
            {planet.portfolioType === "about" && (
              <a
                href="/resume.pdf"
                download="Tusar_Goswami_Resume.pdf"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: planet.color, color: '#000', boxShadow: \`0 0 20px \${planet.color}66\` }}
              >
                📄 Download Resume
              </a>
            )}`;

content = content.replace(oldFooterButtons, newFooterButtons);
console.log('✅ Added Resume download button:', content.includes('Download Resume'));

// ── 6. Add cinematic state to GalaxyExploration component ────────────────────────────
const oldGalaxyState = `  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);`;

const newGalaxyState = `  const [isMobile, setIsMobile] = useState(false);
  const [cinematicDone, setCinematicDone] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);`;

content = content.replace(oldGalaxyState, newGalaxyState);
console.log('✅ Added cinematic state:', content.includes('cinematicDone'));

// ── 7. Add IntroCinematic to the Canvas ──────────────────────────────────────────────
const oldCanvasContent = `          <GalaxyScene vehicle={vehicle} onPlanetApproach={setNearPlanet} onOrbitCapture={setOrbitingPlanet}`;

const newCanvasContent = `          {!cinematicDone && <IntroCinematic onComplete={() => setCinematicDone(true)} />}
          <GalaxyScene vehicle={vehicle} onPlanetApproach={setNearPlanet} onOrbitCapture={setOrbitingPlanet}`;

content = content.replace(oldCanvasContent, newCanvasContent);
console.log('✅ Added IntroCinematic to Canvas:', content.includes('cinematicDone && <Intro'));

// ── 8. Show cinematic overlay text ───────────────────────────────────────────────────
const oldCollisionFlash = `      {/* Back Button */}
      {onBack && (`;

const cinematicOverlay = `      {/* Intro cinematic overlay */}
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

      {/* Back Button */}
      {onBack && (`;

content = content.replace(oldCollisionFlash, cinematicOverlay);
console.log('✅ Added cinematic overlay:', content.includes('COSMIC VOYAGE'));

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ All done! Total lines:', content.split('\n').length);
