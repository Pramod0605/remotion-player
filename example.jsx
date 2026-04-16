import { useState, useEffect, useRef } from "react";

const CHALK_TEXTS = [
  "Hello World",
  "Remotion",
  "Chalkboard",
  "Write Here",
];

// SVG path data for each letter (simplified hand-drawn style paths)
const letterPaths = {
  A: "M 2 28 L 14 2 L 26 28 M 7 18 L 21 18",
  B: "M 4 2 L 4 28 M 4 2 C 20 2, 22 14, 4 15 C 22 15, 24 28, 4 28",
  C: "M 24 6 C 14 -2, -2 6, 4 15 C -2 24, 14 32, 24 24",
  D: "M 4 2 L 4 28 M 4 2 C 28 2, 28 28, 4 28",
  E: "M 22 2 L 4 2 L 4 28 L 22 28 M 4 15 L 18 15",
  F: "M 22 2 L 4 2 L 4 28 M 4 15 L 18 15",
  G: "M 24 6 C 14 -2, -2 6, 4 15 C -2 24, 14 32, 24 24 L 24 15 L 16 15",
  H: "M 4 2 L 4 28 M 24 2 L 24 28 M 4 15 L 24 15",
  I: "M 8 2 L 20 2 M 14 2 L 14 28 M 8 28 L 20 28",
  J: "M 8 2 L 22 2 M 18 2 L 18 22 C 18 30, 4 30, 4 22",
  K: "M 4 2 L 4 28 M 22 2 L 4 16 L 22 28",
  L: "M 4 2 L 4 28 L 22 28",
  M: "M 2 28 L 2 2 L 14 18 L 26 2 L 26 28",
  N: "M 4 28 L 4 2 L 24 28 L 24 2",
  O: "M 14 2 C -2 2, -2 28, 14 28 C 30 28, 30 2, 14 2",
  P: "M 4 2 L 4 28 M 4 2 C 24 2, 24 16, 4 16",
  Q: "M 14 2 C -2 2, -2 28, 14 28 C 30 28, 30 2, 14 2 M 18 22 L 26 30",
  R: "M 4 2 L 4 28 M 4 2 C 24 2, 24 16, 4 16 L 22 28",
  S: "M 22 6 C 18 -2, 2 2, 6 10 C 10 18, 26 14, 22 24 C 18 32, 2 28, 6 22",
  T: "M 2 2 L 26 2 M 14 2 L 14 28",
  U: "M 4 2 L 4 22 C 4 30, 24 30, 24 22 L 24 2",
  V: "M 2 2 L 14 28 L 26 2",
  W: "M 0 2 L 7 28 L 14 12 L 21 28 L 28 2",
  X: "M 2 2 L 26 28 M 26 2 L 2 28",
  Y: "M 2 2 L 14 16 L 26 2 M 14 16 L 14 28",
  Z: "M 2 2 L 26 2 L 2 28 L 26 28",
  " ": "",
  "!": "M 14 2 L 14 18 M 14 24 L 14 26",
  ".": "M 14 26 L 14 28",
  ",": "M 14 26 L 12 30",
  "'": "M 14 2 L 14 8",
  "?": "M 6 6 C 6 -2, 22 -2, 22 8 C 22 14, 14 14, 14 18 M 14 24 L 14 26",
};

function getLetterPath(char) {
  return letterPaths[char.toUpperCase()] || "";
}

function ChalkLetter({ char, delay, size, jitter }) {
  const pathRef = useRef(null);
  const [length, setLength] = useState(0);
  const [offset, setOffset] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(null);

  const pathData = getLetterPath(char);
  const wobbleX = jitter.x;
  const wobbleY = jitter.y;
  const wobbleR = jitter.r;

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setLength(len);
      setOffset(len);
    }
  }, [pathData]);

  useEffect(() => {
    if (length === 0) return;
    const duration = 400 + Math.random() * 200;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current - delay;
      if (elapsed < 0) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2.5);
      setOffset(length * (1 - eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [length, delay]);

  if (char === " ") {
    return <div style={{ width: size * 0.4, flexShrink: 0 }} />;
  }

  if (!pathData) {
    return <div style={{ width: size * 0.6, flexShrink: 0 }} />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="-2 -2 32 36"
      style={{
        overflow: "visible",
        flexShrink: 0,
        transform: `translate(${wobbleX}px, ${wobbleY}px) rotate(${wobbleR}deg)`,
      }}
    >
      <defs>
        <filter id={`chalk-${delay}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" />
        </filter>
      </defs>
      {/* Chalk dust glow */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={offset}
        style={{ filter: "blur(4px)" }}
      />
      {/* Main chalk stroke */}
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke="rgba(255,255,250,0.92)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={offset}
        style={{ filter: `url(#chalk-${delay})` }}
      />
      {/* Inner bright line */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function ChalkDust({ count = 40 }) {
  const dots = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.15 + 0.05,
  }));

  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            backgroundColor: `rgba(255,255,255,${d.opacity})`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

export default function ChalkboardScribble() {
  const [text, setText] = useState("Hello World");
  const [animKey, setAnimKey] = useState(0);
  const [fontSize, setFontSize] = useState(80);
  const [chalkColor] = useState("#fffefa");

  const jitters = useRef([]);

  const ensureJitters = (len) => {
    while (jitters.current.length < len) {
      jitters.current.push({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 4,
        r: (Math.random() - 0.5) * 4,
      });
    }
  };

  const letters = text.split("");
  ensureJitters(letters.length);

  const handleWrite = () => {
    jitters.current = [];
    setAnimKey((k) => k + 1);
  };

  const handlePreset = (t) => {
    setText(t);
    jitters.current = [];
    setTimeout(() => setAnimKey((k) => k + 1), 50);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Controls */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 900,
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
          style={{
            background: "#2a2a2a",
            border: "1px solid #444",
            color: "#ccc",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 16,
            flex: 1,
            minWidth: 180,
            outline: "none",
          }}
        />
        <button
          onClick={handleWrite}
          style={{
            background: "#4a7c59",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✏️ Write
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#888", fontSize: 13 }}>Size</span>
          <input
            type="range"
            min={40}
            max={160}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ width: 100, accentColor: "#4a7c59" }}
          />
          <span style={{ color: "#aaa", fontSize: 13, minWidth: 30 }}>{fontSize}</span>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {CHALK_TEXTS.map((t) => (
          <button
            key={t}
            onClick={() => handlePreset(t)}
            style={{
              background: "#333",
              color: "#aaa",
              border: "1px solid #555",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chalkboard */}
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 1000,
          minHeight: 420,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 0 80px rgba(0,0,0,0.3)",
          border: "12px solid #5c3a1e",
          background: `
            radial-gradient(ellipse at 30% 40%, #2e6b45 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, #1f5c3a 0%, transparent 50%),
            linear-gradient(135deg, #1a4d32 0%, #2a5a3e 25%, #1e5035 50%, #264f38 75%, #1a4a30 100%)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 30px",
        }}
      >
        {/* Chalk smudge texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 70%)
            `,
            pointerEvents: "none",
          }}
        />

        <ChalkDust count={60} />

        {/* Chalk tray */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 18,
            background: "linear-gradient(to bottom, #4a2e14, #5c3a1e, #6b4423)",
            borderTop: "2px solid #7a5030",
          }}
        />

        {/* Letters */}
        <div
          key={animKey}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: fontSize * 0.02,
            position: "relative",
            zIndex: 1,
          }}
        >
          {letters.map((char, i) => (
            <ChalkLetter
              key={`${animKey}-${i}`}
              char={char}
              delay={i * 120}
              size={fontSize}
              jitter={jitters.current[i]}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <p style={{ color: "#666", fontSize: 13, marginTop: 20, textAlign: "center" }}>
        Type text above and press <strong style={{ color: "#4a7c59" }}>Write</strong> to see the chalk scribble animation.
        <br />
        Adjust the size slider for bigger or smaller chalk text.
      </p>
    </div>
  );
}