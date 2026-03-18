import React, { useState, ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from "motion/react";
import { HelpCircle, MapPin, Clock, Info, Heart, CheckCircle2, Flower2, Music, Volume2, VolumeX, Sparkles, Calendar } from "lucide-react";

// Global discovery flag — once any card is tapped, hint vanishes on all cards
let globalDiscovered = false;
const discoveryListeners: (() => void)[] = [];
function markDiscovered() {
  if (globalDiscovered) return;
  globalDiscovered = true;
  discoveryListeners.forEach(fn => fn());
}

// FlipCard Component with 3D Tilt Effect + Premium Mobile Tap Hint
function FlipCard({ front, back, className, containerClassName, rounded = "rounded-[2rem]", ...motionProps }: {
  front: ReactNode,
  back: ReactNode,
  className?: string,
  containerClassName?: string,
  rounded?: string,
  [key: string]: any
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(!globalDiscovered);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
    const handle = () => setShowHint(false);
    discoveryListeners.push(handle);
    return () => {
      const idx = discoveryListeners.indexOf(handle);
      if (idx > -1) discoveryListeners.splice(idx, 1);
    };
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsFlipped(false);
  }

  function handleClick() {
    setIsFlipped(prev => !prev);
    if (!globalDiscovered) {
      setShowHint(false);
      markDiscovered();
    }
  }

  return (
    <motion.div
      {...motionProps}
      ref={cardRef}
      className={`perspective-1000 cursor-pointer relative ${containerClassName || ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { if (!isTouchDevice) setIsFlipped(true); }}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        rotateX: isFlipped ? 0 : springRotateX,
        rotateY: isFlipped ? 0 : springRotateY,
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={`w-full h-full transform-style-3d relative ${className || ""}`}
      >
        {/* Front */}
        <div className={`absolute inset-0 backface-hidden w-full h-full ${rounded} overflow-hidden shadow-2xl border border-white/40 ring-1 ring-black/5`}>
          {front}
          {/* Subtle Corner Ornament */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-white/30 rounded-tl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-white/30 rounded-br-lg" />
        </div>

        {/* Back */}
        <div
          style={{ transform: "rotateY(180deg)" }}
          className={`absolute inset-0 backface-hidden w-full h-full bg-paper/95 backdrop-blur-xl border border-sage/20 ${rounded} flex flex-col justify-center items-center text-center p-3 md:p-8 shadow-2xl overflow-y-auto overflow-x-hidden`}
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-sage/10 rounded-tl-xl" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-sage/10 rounded-br-xl" />
          <div className="relative z-10 w-full h-full flex flex-col py-4">
            {back}
          </div>
        </div>
      </motion.div>

      {/* ── Premium Mobile "Tap to Reveal" Hint ── */}
      <AnimatePresence>
        {showHint && isTouchDevice && !isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.4 } }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-50"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-xl"
            >
              {/* Ripple tap dot */}
              <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                <motion.span
                  animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-white/70"
                />
                <span className="relative w-2 h-2 rounded-full bg-white shadow-sm" />
              </span>
              <span
                className="text-white text-[9px] uppercase tracking-[0.2em] font-bold whitespace-nowrap"
                style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.18em" }}
              >
                Tap to reveal
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Realistic Organic Petal Component
function RealisticPetal({ size = 20, className = "" }: { size?: number, className?: string }) {
  const organicPetal = "M15 30C15 30 0 25 0 15C0 5 10 0 15 0C20 0 30 5 30 15C30 25 15 30 15 30Z";

  return (
    <motion.div
      animate={{
        rotateX: [0, 45, -45, 0],
        rotateY: [0, 180, 360],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ width: size, height: size }}
      className={className}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="petalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C4714A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#9C8470" stopOpacity="0.65" />
          </radialGradient>
        </defs>
        <path
          d={organicPetal}
          fill="url(#petalGrad)"
          style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.05))" }}
        />
      </svg>
    </motion.div>
  );
}

export default function App() {
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateSize = () => setIsSmallScreen(mediaQuery.matches);
    updateSize();
    mediaQuery.addEventListener("change", updateSize);
    return () => mediaQuery.removeEventListener("change", updateSize);
  }, []);

  const addHeart = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const id = Date.now();
    setHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 1000);
  };

  const handleOpen = () => {
    setIsFlapOpen(true);
    setTimeout(() => {
      setIsOpened(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200); // Wait for flap animation
  };

  return (
    <div
      className="min-h-screen bg-paper text-zinc-800 selection:bg-sage/20 overflow-x-hidden relative"
      onMouseDown={addHeart}
      onTouchStart={addHeart}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-sage origin-left z-[1000]"
        style={{ scaleX }}
      />

      {/* Music Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-6 right-6 z-[500] w-12 h-12 rounded-full bg-sage text-white shadow-2xl flex items-center justify-center backdrop-blur-md border border-white/20"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
      </motion.button>

      {/* Floating Sparkle Hearts on Click */}
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, scale: 0, y: 0, x: -10 }}
            animate={{ opacity: 0, scale: 1.5, y: -100, x: (Math.random() - 0.5) * 100 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-[999] text-sage/40"
            style={{ left: heart.x, top: heart.y }}
          >
            <Heart fill="currentColor" size={Math.random() * 20 + 10} />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.5 } }}
            className="fixed inset-0 z-[100] bg-paper/95 backdrop-blur-md flex items-center justify-center p-6 overflow-hidden"
          >
            {/* Majestic Fading Typography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              className="absolute top-12 md:top-24 left-0 right-0 text-center z-10 pointer-events-none"
            >
              <h1 className="serif text-4xl md:text-6xl text-sage/80 font-light tracking-[0.2em] drop-shadow-xl">Hashimi & Zerlin</h1>
              <p className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.6em] text-sage/60 font-bold">23 May 2026</p>
            </motion.div>

            {/* Slow Spinning Elegant Ambient Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[90vw] md:h-[90vw] rounded-full border-2 border-sage/10 border-dashed pointer-events-none z-0 opacity-50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] rounded-full border border-sage/10 pointer-events-none z-0 opacity-40 flex items-center justify-center p-8"
            >
              <div className="w-full h-full rounded-full border-[0.5px] border-sage/5" />
            </motion.div>

            {/* Glowing Aura Behind Envelope */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[80vw] md:w-[600px] h-[80vw] md:h-[600px] bg-sage/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"
            />

            {/* Cinematic Sunlight, Optical Bokeh, and Dust Motes */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              {/* Soft Light Leaks */}
              <motion.div
                animate={{
                  x: ["-10%", "10%", "-10%"],
                  y: ["-5%", "5%", "-5%"],
                  opacity: [0.6, 0.9, 0.6]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[30%] -left-[20%] w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(196,113,74,0.45)_0%,transparent_60%)] blur-3xl"
              />
              <motion.div
                animate={{
                  x: ["10%", "-10%", "10%"],
                  y: ["5%", "-5%", "5%"],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-[30%] -right-[20%] w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(156,132,112,0.4)_0%,transparent_60%)] blur-3xl"
              />

              {/* Natural floating dust motes / glowing ambient petals */}
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={`dust-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -Math.random() * 500 - 300],
                    x: [0, (Math.random() - 0.5) * 200],
                    rotate: [0, Math.random() * 360],
                    opacity: [0, Math.random() * 0.5 + 0.2, 0],
                    scale: [0.5, Math.random() * 1 + 0.5, 0.5]
                  }}
                  transition={{
                    duration: 10 + Math.random() * 20,
                    repeat: Infinity,
                    delay: Math.random() * 10,
                    ease: "easeInOut",
                  }}
                >
                  {i % 4 === 0 ? (
                    <Flower2 className="text-sage/20 w-4 h-4 md:w-6 md:h-6" />
                  ) : (
                    <div
                      className="rounded-full shadow-[0_0_15px_rgba(196,113,74,0.4)]"
                      style={{
                        backgroundColor: i % 2 === 0 ? '#C4714A' : '#A84C2C', // Terracotta and Rust
                        width: Math.random() * 6 + 2 + "px",
                        height: Math.random() * 6 + 2 + "px",
                        filter: `blur(${Math.random() * 1}px)`,
                      }}
                    />
                  )}
                </motion.div>
              ))}

              {/* Enhanced Falling Hearts & Rose Petals specifically for Loading State */}
              {[...Array(20)].map((_, i) => {
                const isHeart = i % 2 === 0;
                const size = isHeart ? Math.random() * 20 + 10 : Math.random() * 25 + 15;
                return (
                  <motion.div
                    key={`loading-falling-${i}`}
                    className="absolute pointer-events-none z-10"
                    initial={{ top: "-10%", left: `${Math.random() * 100}%`, rotate: 0, opacity: 0 }}
                    animate={{
                      top: "110%",
                      left: [`${Math.random() * 100}%`, `${Math.random() * 100 + (Math.random() - 0.5) * 20}%`, `${Math.random() * 100}%`],
                      rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 15 + Math.random() * 15,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                      ease: "linear"
                    }}
                  >
                    {isHeart ? (
                      <Heart className="text-sage" fill="currentColor" size={size} />
                    ) : (
                      <RealisticPetal size={size} />
                    )}
                  </motion.div>
                );
              })}

              {/* Heavy out-of-focus organic "bokeh" foreground orbs */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`bokeh-${i}`}
                  className="absolute rounded-full mix-blend-soft-light"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#9C8470' : '#F5EFE0',
                    opacity: 0.3,
                    width: Math.random() * 150 + 100 + "px",
                    height: Math.random() * 150 + 100 + "px",
                    left: `${Math.random() * 100}%`,
                    bottom: `-20%`,
                    filter: `blur(${Math.random() * 20 + 30}px)`,
                  }}
                  animate={{
                    y: [0, -1200],
                    x: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: 25 + Math.random() * 35,
                    repeat: Infinity,
                    delay: Math.random() * 20,
                    ease: "linear",
                  }}
                />
              ))}
            </div>

            <motion.div
              layoutId="envelope-box"
              style={{ perspective: 1500 }}
              animate={!isFlapOpen ? { y: [0, -10, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-2xl h-80 md:h-[450px] bg-sage rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center z-10"
            >
              {/* Back paper texture */}
              <div className="absolute inset-0 rounded-[2rem] opacity-30 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] overflow-hidden pointer-events-none" />

              {/* Inside content - Hidden initially by the flap and seal, but revealed when flap opens */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 md:space-y-6">
                <span className="serif text-white/50 text-lg md:text-3xl tracking-[0.4em] md:tracking-[0.6em] uppercase text-center px-4">The Invitation</span>
                <div className="w-10 md:w-16 h-px bg-white/20" />
              </div>

              {/* Bottom fold (static) */}
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-white/5 clip-path-envelope-bottom pointer-events-none rounded-b-[2rem]" />
              {/* set shadow to make it look layered */}
              <div className="absolute bottom-0 left-0 right-0 h-[65%] shadow-[inset_0_20px_30px_rgba(0,0,0,0.1)] clip-path-envelope-bottom pointer-events-none rounded-b-[2rem]" />

              {/* Top Flap */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: isFlapOpen ? 180 : 0, opacity: isFlapOpen ? 0 : 1 }}
                transition={{ duration: 1, ease: [0.3, 0.1, 0.2, 1] }}
                style={{ transformOrigin: "top", backfaceVisibility: "hidden" }}
                className="absolute top-0 left-0 right-0 h-[55%] bg-sage drop-shadow-2xl z-20 rounded-t-[2rem] clip-path-envelope flex flex-col items-center justify-start overflow-hidden pt-8 pointer-events-none"
              >
                <div className="absolute inset-0 rounded-t-[2rem] opacity-30 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
              </motion.div>

              {/* Beautiful Wax Seal Stamp */}
              {!isFlapOpen && (
                <motion.div
                  initial={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer"
                  onClick={handleOpen}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-4 mt-8 md:mt-12 group"
                  >
                    {/* Elegant Minimalist Seal */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 bg-white/20 border border-white/40 p-1.5 backdrop-blur-md">
                      <div className="w-full h-full rounded-full bg-sage shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_4px_10px_rgba(0,0,0,0.2)] flex items-center justify-center border border-sage/50">
                        <Heart className="text-paper/90 w-10 h-10 md:w-14 md:h-14 drop-shadow-md mt-1" fill="currentColor" />
                      </div>
                    </div>

                    {/* Cute Tap Hint Below Stamp */}
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <p className="serif text-white/70 tracking-[0.3em] uppercase text-[10px] md:text-xs whitespace-nowrap">Tap to break seal</p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/background.png"
          alt="Background"
          className="w-full h-full object-cover opacity-[0.35] md:opacity-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-transparent to-paper/40" />
      </div>

      {/* Main Container */}
      <motion.main
        initial={false}
        animate={isOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="max-w-[1600px] mx-auto px-4 py-12 md:px-12 md:py-24 flex flex-col gap-10 md:gap-16 relative z-10 min-h-screen"
      >

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isOpened ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          className="text-center space-y-4 md:space-y-8 mt-4 md:mt-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex items-center justify-center gap-4 text-sage/60"
          >
            <div className="h-px w-8 md:w-16 bg-current opacity-30" />
            <p className="text-[10px] md:text-sm uppercase tracking-[0.6em] font-bold">
              With joy in our hearts
            </p>
            <div className="h-px w-8 md:w-16 bg-current opacity-30" />
          </motion.div>

          <h1 className="flex flex-col items-center px-2">
            <span className="serif italic text-3xl sm:text-5xl md:text-[8rem] text-sage font-light leading-tight drop-shadow-sm mb-1 md:mb-6">
              You're Invited!
            </span>
            <span className="serif text-sm sm:text-base md:text-4xl text-sage/40 tracking-[0.15em] md:tracking-[0.3em] uppercase font-light">to the wedding of</span>
          </h1>

          <div className="flex flex-row md:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-16 mt-4 md:mt-8 relative w-full px-2">
            {/* Subtle Glow Backdrop */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-sage/5 blur-3xl rounded-full" />

            <motion.h2
              whileHover={{ scale: 1.05 }}
              className="script text-[13vw] sm:text-6xl md:text-9xl text-sage drop-shadow-lg relative z-10 leading-none"
            >
              Hashimi
            </motion.h2>

            <div className="relative flex items-center justify-center shrink-0">
              <div className="h-px w-6 md:w-24 bg-sage/20 hidden md:block" />
              <div className="relative mx-1 md:mx-4">
                <Heart className="text-sage/40 w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 animate-pulse" fill="currentColor" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-sage/20 blur-xl rounded-full"
                />
              </div>
              <div className="h-px w-6 md:w-24 bg-sage/20 hidden md:block" />
            </div>

            <motion.h2
              whileHover={{ scale: 1.05 }}
              className="script text-[13vw] sm:text-6xl md:text-9xl text-sage drop-shadow-lg relative z-10 leading-none"
            >
              Zerlin
            </motion.h2>
          </div>

          <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-sage/40 to-transparent mx-auto mt-8" />
        </motion.div>

        {/* Top Envelope Graphic - Centered at the top */}
        <div className="flex justify-center w-full mb-8 mt-16 md:mt-32">
          {!isOpened ? (
            <div className="w-full max-w-3xl relative h-80 md:h-[450px]" />
          ) : (
            <motion.div
              layoutId="envelope-box"
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-3xl relative cursor-default"
              style={{ height: "clamp(340px, 60vw, 520px)" }}
            >
              {/* ── Ambient glow behind envelope ── */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-8 top-1/2 h-40 bg-sage/30 blur-[60px] rounded-full pointer-events-none z-0"
              />

              {/* ── Envelope Body ── */}
              <div className="absolute bottom-0 left-0 right-0 h-[68%] md:h-[72%] rounded-b-[2.5rem] overflow-hidden z-10 shadow-[0_20px_60px_-10px_rgba(61,34,21,0.5)]">
                {/* Rich umber base */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#5C3320] to-[#3D2215]" />
                {/* Subtle linen texture */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                {/* Satin sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                {/* Bottom fold crease line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                {/* Side fold lines */}
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/8" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-white/8" />
                {/* Official invite stamp at bottom */}
                <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                  <div className="w-16 h-px bg-[#C9B99A]/40" />
                  <p className="serif italic text-[#C9B99A]/50 text-[10px] tracking-[0.4em] uppercase">Official Invite · 2026</p>
                  <div className="w-16 h-px bg-[#C9B99A]/40" />
                </div>
              </div>

              {/* ── Opened V-Flap (pointing up) ── */}
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none overflow-hidden"
                style={{ bottom: isSmallScreen ? "67.5%" : "71.5%", height: isSmallScreen ? "42%" : "46%" }}
              >
                {/* Outer flap — umber */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)", background: "linear-gradient(160deg, #3D2215 0%, #5C3320 60%, #4A2918 100%)" }}
                >
                  <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)", background: "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
                </div>
                {/* Inner flap lining — terracotta reveal */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(3% 100%, 50% 8%, 97% 100%)", background: "linear-gradient(170deg, #C4714A 0%, #A84C2C 100%)" }}
                >
                  <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />
                </div>
                {/* Flap crease shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* ── Invitation Card Rising from envelope ── */}
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: isSmallScreen ? -58 : -90, opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-4 right-4 md:left-16 md:right-16 z-20"
                style={{ bottom: isSmallScreen ? "40%" : "52%", top: "auto" }}
              >
                {/* Card shadow */}
                <div className="absolute -bottom-3 left-4 right-4 h-8 bg-black/20 blur-xl rounded-full" />

                {/* Card itself */}
                <div className="relative bg-[#F5EFE0] rounded-2xl shadow-[0_-20px_60px_rgba(61,34,21,0.3),0_4px_20px_rgba(0,0,0,0.1)] border border-[#C9B99A]/30">
                  {/* Decorative layers (clipped to rounded corners) */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    {/* Linen texture */}
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    {/* Warm ambient glow inside card */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#C4714A]/10 blur-3xl rounded-full" />

                    {/* Outer border line */}
                    <div className="absolute inset-[10px] border border-[#9C8470]/25 rounded-xl" />
                    {/* Inner border line */}
                    <div className="absolute inset-[16px] border border-[#C4714A]/15 rounded-lg" />

                    {/* Corner botanical ornaments */}
                    {[["top-3 left-3", "rotate-0"], ["top-3 right-3", "rotate-90"], ["bottom-3 left-3", "-rotate-90"], ["bottom-3 right-3", "rotate-180"]].map(([pos, rot], i) => (
                      <div key={i} className={`absolute ${pos} w-7 h-7`}>
                        <svg viewBox="0 0 28 28" fill="none" className={`w-full h-full ${rot} opacity-40`}>
                          <path d="M2 2 C2 2, 14 2, 14 14" stroke="#9C8470" strokeWidth="0.8" fill="none" />
                          <path d="M2 2 C8 2, 2 8, 2 14" stroke="#9C8470" strokeWidth="0.8" fill="none" />
                          <circle cx="4" cy="4" r="1.2" fill="#C4714A" opacity="0.5" />
                          <path d="M6 2 C6 2, 6 6, 10 6" stroke="#C4714A" strokeWidth="0.6" fill="none" opacity="0.5" />
                        </svg>
                      </div>
                    ))}

                    {/* Shimmer sweep */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 4, delay: 2, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12"
                    />
                  </div>

                  {/* Card content (NOT clipped; prevents text cropping on mobile) */}
                  <div className="relative z-10 px-5 pt-9 pb-6 md:px-12 md:py-8 flex flex-col items-center text-center gap-2.5 md:gap-4">
                    {/* Top ornamental divider */}
                    <div className="flex items-center gap-3 w-full max-w-[200px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#9C8470]/50" />
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      >
                        <svg viewBox="0 0 16 16" className="w-3 h-3 opacity-50" fill="#C4714A">
                          <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                        </svg>
                      </motion.div>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#9C8470]/50" />
                    </div>

                    {/* Monogram wax seal */}
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#C4714A] to-[#6B3D28] shadow-[0_4px_16px_rgba(196,113,74,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center border-2 border-[#C9B99A]/30"
                      >
                        <span className="serif text-white font-bold text-lg md:text-2xl tracking-tight drop-shadow">H&Z</span>
                      </motion.div>
                      {/* Seal ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="absolute -inset-2 rounded-full border border-dashed border-[#9C8470]/30"
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-0.5">
                      <p className="text-[8px] md:text-[10px] uppercase tracking-[0.35em] md:tracking-[0.5em] text-[#9C8470] font-bold">You are cordially invited to</p>
                      <h3 className="serif text-[22px] md:text-4xl text-[#3D2215] font-light tracking-[0.06em] md:tracking-[0.08em]">The Wedding of</h3>
                    </div>

                    {/* Names */}
                    <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-5 max-w-full px-2">
                      <span className="script text-[32px] md:text-5xl text-[#C4714A] drop-shadow-sm leading-[1.15]">Hashimi</span>
                      <Heart size={14} className="text-[#9C8470]/60 shrink-0" fill="currentColor" />
                      <span className="script text-[32px] md:text-5xl text-[#C4714A] drop-shadow-sm leading-[1.15]">Zerlin</span>
                    </div>

                    {/* Date & venue line */}
                    <div className="flex items-center gap-2 md:gap-4 text-[#6B3D28]/70 w-full">
                      <div className="h-px flex-1 bg-[#C9B99A]/40" />
                      <div className="flex flex-col items-center">
                        <span className="serif italic text-[11px] md:text-sm tracking-wider">23 May 2026</span>
                        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#9C8470] mt-0.5 whitespace-nowrap">Waters Edge · Grand Ballroom</span>
                      </div>
                      <div className="h-px flex-1 bg-[#C9B99A]/40" />
                    </div>

                    {/* Bottom ornamental divider */}
                    <div className="flex items-center gap-3 w-full max-w-[200px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#9C8470]/50" />
                      <svg viewBox="0 0 16 16" className="w-3 h-3 opacity-40" fill="#C4714A">
                        <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                      </svg>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#9C8470]/50" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Envelope front bottom flaps (cover lower half of card) ── */}
              <div className="absolute bottom-0 left-0 right-0 h-[68%] md:h-[72%] z-30 rounded-b-[2.5rem] overflow-hidden pointer-events-none">
                {/* Left diagonal fold */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(0 0, 50% 55%, 0 100%)", background: "linear-gradient(135deg, #47291A 0%, #3D2215 100%)" }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/6 to-transparent" />
                </div>
                {/* Right diagonal fold */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(100% 0, 50% 55%, 100% 100%)", background: "linear-gradient(225deg, #47291A 0%, #3D2215 100%)" }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-bl from-white/6 to-transparent" />
                </div>
                {/* Centre crease shadow */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(45% 50%, 50% 55%, 55% 50%, 50% 48%)", background: "rgba(0,0,0,0.3)" }}
                />
                {/* Overall top-edge depth shadow */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/25 to-transparent" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Bento Grid Layout - Flipped Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10 relative">

          {/* Details Flip Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full h-full col-span-1"
          >
            <FlipCard
              containerClassName="w-full h-[220px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full relative overflow-hidden bg-[#3D2215] flex flex-col justify-center items-center text-center p-6 group">
                  {/* Botanical Background Pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/floral-paper.png')] pointer-events-none" />
                  {/* Corner glow accents */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#C4714A]/25 to-transparent blur-2xl" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#A84C2C]/25 to-transparent blur-2xl" />

                  <div className="relative z-10 space-y-4">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="text-[#C9B99A] opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <Info size={32} />
                    </motion.div>
                    <div>
                      <p className="serif italic text-[10px] md:text-sm text-[#C9B99A] mb-1 uppercase tracking-[0.3em]">Explore</p>
                      <h3 className="serif text-2xl md:text-4xl text-white tracking-[0.1em] font-light">The Details</h3>
                    </div>
                    <div className="w-8 h-px bg-[#C9B99A]/60 mx-auto group-hover:w-16 transition-all duration-700" />
                  </div>
                </div>
              }
              back={
                <>
                  <h4 className="serif text-xl md:text-3xl text-sage mb-3 md:mb-6">Ceremony Details</h4>
                  <div className="space-y-1.5 md:space-y-4 text-[10px] md:text-sm text-zinc-600 w-full px-1 md:px-4">
                    <div className="flex justify-between border-b border-sage/20 pb-1 md:pb-2">
                      <span className="font-bold tracking-widest uppercase text-[8px] md:text-xs">Dress Code</span>
                      <span className="serif italic text-[10px] md:text-sm">Formal Attire</span>
                    </div>
                    <div className="flex justify-between border-b border-sage/20 pb-1 md:pb-2">
                      <span className="font-bold tracking-widest uppercase text-[8px] md:text-xs">Gifts</span>
                      <span className="serif italic text-[10px] md:text-sm">Monetary</span>
                    </div>
                    <div className="flex justify-between border-b border-sage/20 pb-1 md:pb-2">
                      <span className="font-bold tracking-widest uppercase text-[8px] md:text-xs">Photography</span>
                      <span className="serif italic text-[10px] md:text-sm">Welcome</span>
                    </div>
                    <div className="flex justify-between border-b border-sage/20 pb-1 md:pb-2">
                      <span className="font-bold tracking-widest uppercase text-[8px] md:text-xs">Language</span>
                      <span className="serif italic text-[10px] md:text-sm">Sinhala / English</span>
                    </div>
                    <div className="flex justify-between pb-1 md:pb-2">
                      <span className="font-bold tracking-widest uppercase text-[8px] md:text-xs">Country</span>
                      <span className="serif italic text-[10px] md:text-sm">🇱🇰 Sri Lanka</span>
                    </div>
                  </div>
                </>
              }
            />
          </motion.div>

          {/* Save the Date Flip Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full col-span-1"
          >
            <FlipCard
              containerClassName="w-full h-[220px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full bg-[#F5EFE0] p-2 md:p-8 flex flex-col items-center justify-center text-center space-y-2 md:space-y-4 relative group">
                  {/* Subtle Paper Texture Overlay */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-40 pointer-events-none" />

                  {/* Letterpress Look */}
                  <div className="relative z-10 space-y-2 md:space-y-8 scale-[0.9] md:scale-100">
                    <div className="space-y-1">
                      <span className="serif italic text-[14px] md:text-2xl text-sage/70">Save the Date</span>
                      <div className="w-full h-px bg-sage/20" />
                    </div>

                    <div className="flex flex-col items-center">
                      <p className="text-[8px] md:text-xs uppercase tracking-[0.4em] text-zinc-400 font-black mb-1 md:mb-2">Saturday</p>
                      <div className="relative inline-block px-6 md:px-8 py-1 md:py-2 border-y border-sage/30">
                        <p className="serif text-5xl md:text-8xl font-medium text-sage leading-none">23</p>
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-1 -right-1 text-[#A84C2C]"
                        >
                          <Sparkles size={12} className="md:w-4 md:h-4" />
                        </motion.div>
                      </div>
                      <p className="serif text-sm md:text-2xl font-light tracking-[0.2em] mt-2 md:mt-3">MAY</p>
                    </div>

                    <div className="pt-1">
                      <p className="text-[7px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-sage/40">Twenty Twenty Six</p>
                    </div>
                  </div>

                  {/* "Torn Paper" Edge Effect at the bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-paper clip-path-[polygon(0%_100%,_5%_80%,_10%_100%,_15%_80%,_20%_100%,_25%_80%,_30%_100%,_35%_80%,_40%_100%,_45%_80%,_50%_100%,_55%_80%,_60%_100%,_65%_80%,_70%_100%,_75%_80%,_80%_100%,_85%_80%,_90%_100%,_95%_80%,_100%_100%)] opacity-50" />
                </div>
              }
              back={
                <>
                  <Heart size={20} className="text-sage mb-2 md:mb-6 mx-auto opacity-70 md:w-8 md:h-8" />
                  <p className="serif text-[14px] md:text-2xl italic text-sage mb-2 md:mb-4 leading-relaxed">Save the date <br /> to celebrate our union.</p>
                  <p className="text-[8px] md:text-xs text-zinc-500 uppercase tracking-widest leading-loose">
                    Ensure to mark your calendar.<br />Formal invitation to follow.
                  </p>
                </>
              }
            />
          </motion.div>

          {/* RSVP Flip Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full h-full col-span-1"
          >
            <FlipCard
              containerClassName="w-full h-[220px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full bg-[#F5EFE0] p-6 flex flex-col justify-center items-center text-center relative group overflow-hidden">
                  {/* Wax Seal Circle Background Shadow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sage/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-6">
                    <p className="serif italic text-lg md:text-2xl text-sage/60 group-hover:scale-110 transition-transform">Kindly</p>

                    {/* Wax Seal Implementation */}
                    <div className="relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="absolute inset-0 border border-sage/10 rounded-full border-dashed"
                      />
                      <div className="w-16 h-16 md:w-28 md:h-28 bg-sage rounded-full flex items-center justify-center shadow-xl border-4 border-sage/50 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                        <p className="serif text-white font-bold text-3xl md:text-6xl tracking-tighter drop-shadow-md">H&Z</p>
                      </div>
                    </div>

                    <h3 className="serif text-2xl md:text-4xl tracking-[0.3em] font-medium text-sage">RSVP</h3>
                  </div>
                </div>
              }
              back={
                <>
                  <CheckCircle2 size={24} className="text-sage mb-2 md:mb-4 mx-auto opacity-70 md:w-8 md:h-8" />
                  <h4 className="serif text-xl md:text-3xl text-sage mb-2 md:mb-4">Are you attending?</h4>
                  <p className="text-[8px] md:text-xs text-zinc-500 uppercase tracking-widest mb-4 md:mb-8">
                    Please let us know by<br />May 1st, 2026
                  </p>
                  <div className="w-full flex gap-2 md:gap-4 px-2 md:px-4">
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#2D2D2D" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-sage text-white py-2 md:py-3 rounded-xl text-[8px] md:text-xs uppercase tracking-widest font-bold transition-colors"
                    >Yes</motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(90, 99, 68, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 border border-sage text-sage py-2 md:py-3 rounded-xl text-[8px] md:text-xs uppercase tracking-widest font-bold transition-colors"
                    >No</motion.button>
                  </div>
                </>
              }
            />
          </motion.div>

          {/* FAQ Flip Card (Celestial style) */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
            className="w-full h-full col-span-1 flex items-center justify-center"
          >
            <FlipCard
              containerClassName="w-full h-[220px] md:h-[350px] lg:h-[350px] flex items-center justify-center"
              rounded="rounded-full"
              className="w-36 h-36 md:w-56 md:h-56 shadow-2xl"
              front={
                <div className="w-full h-full relative group flex flex-col items-center justify-center bg-sage border-4 border-white/20 overflow-hidden">
                  {/* Moving Gradient Sphere Inside */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="absolute w-full h-full bg-gradient-to-tr from-[#A84C2C]/40 via-transparent to-[#C9B99A]/20 blur-xl"
                  />

                  <div className="relative z-10 text-white space-y-2">
                    <p className="serif italic text-[8px] md:text-sm opacity-80 mb-1">Curious?</p>
                    <h3 className="serif text-xl md:text-5xl tracking-widest uppercase font-light">FAQS</h3>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="mx-auto flex justify-center pt-2 md:pt-4"
                    >
                      <HelpCircle size={32} />
                    </motion.div>
                  </div>

                  {/* Floating Rings Effect */}
                  <div className="absolute inset-4 rounded-full border border-white/10 group-hover:border-white/30 transition-colors" />
                </div>
              }
              back={
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-paper">
                  <HelpCircle size={28} className="text-sage mb-2 opacity-70" />
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-2">Parking?</p>
                  <p className="serif text-xs italic mb-4">Yes, free parking available.</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-2">Indoors?</p>
                  <p className="serif text-xs italic">Partial outdoors.</p>
                </div>
              }
            />
          </motion.div>

          {/* Venue Flip Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full h-full col-span-2 lg:col-span-2"
          >
            <FlipCard
              containerClassName="w-full h-[300px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full relative group">
                  <img
                    src="https://www.watersedge.lk/wp-content/uploads/2018/04/Ballroom-2-768x512.jpg"
                    alt="Venue"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Advanced Frosted Glass Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/60 backdrop-blur-md p-4 md:p-8 border border-white/60 rounded-2xl group-hover:bg-white/80 transition-all duration-700 shadow-xl">
                    <p className="serif text-[8px] md:text-xs uppercase tracking-[0.4em] text-sage/80 mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-sage/30" />
                      The Location
                    </p>
                    <h3 className="serif text-2xl md:text-5xl text-sage leading-tight drop-shadow-sm font-medium">Waters Edge<br />Grand Ballroom</h3>
                  </div>

                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-sage flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-lg">
                    <MapPin className="text-sage animate-bounce" size={16} />
                    <p className="serif text-[10px] md:text-sm tracking-[0.2em] font-bold uppercase">Waters Edge</p>
                  </div>
                </div>
              }
              back={
                <>
                  <MapPin size={24} className="text-sage mb-4 md:mb-6 opacity-70 md:w-9 md:h-9" />
                  <h4 className="serif text-2xl md:text-4xl text-sage mb-2 md:mb-4">Waters Edge Grand Ballroom</h4>
                  <p className="text-[10px] md:text-sm text-zinc-500 uppercase tracking-widest leading-loose mb-4 md:mb-6">
                    Waters Edge<br />Grand Ballroom
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open("https://maps.app.goo.gl/3EQ7xzj3EX9T2xEx6", "_blank")}
                    className="px-6 py-2 md:px-8 md:py-3 bg-sage text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >View Map</motion.button>
                </>
              }
            />
          </motion.div>

          {/* Couple Image / Timeline Flip Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full h-full col-span-2 lg:col-span-2"
          >
            <FlipCard
              containerClassName="w-full h-[300px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full relative group overflow-hidden">
                  <img
                    src="https://t3.ftcdn.net/jpg/01/65/52/08/360_F_165520839_6E1bLjjMeUEYqdiyKgerqLPiKUDsMHgI.jpg"
                    alt="Timeline"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Dynamic Film Strip Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      className="bg-white/10 backdrop-blur-lg p-6 rounded-full border border-white/20"
                    >
                      <Clock size={32} className="text-white" />
                    </motion.div>
                    <p className="serif text-white text-3xl md:text-5xl italic tracking-widest mt-6 drop-shadow-lg">
                      Event Timeline
                    </p>
                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />)}
                    </div>
                  </div>

                  {/* Decorative Side Lines */}
                  <div className="absolute top-0 bottom-0 left-4 w-px bg-white/20" />
                  <div className="absolute top-0 bottom-0 left-6 w-px bg-white/10" />
                  <div className="absolute top-0 bottom-0 right-4 w-px bg-white/20" />
                  <div className="absolute top-0 bottom-0 right-6 w-px bg-white/10" />
                </div>
              }
              back={
                <div className="w-full h-full flex flex-col justify-center items-center px-4 md:px-8">
                  <Clock size={24} className="text-sage mb-4 md:mb-6 opacity-70 md:w-8 md:h-8" />
                  <h4 className="serif text-2xl md:text-3xl text-sage mb-4 md:mb-8">Timeline</h4>

                  <div className="w-full max-w-sm space-y-4 md:space-y-6 text-left">
                    <div className="flex items-start gap-2 md:gap-4">
                      <span className="serif text-sage font-bold text-[10px] md:text-base w-12 md:w-20 text-right shrink-0 pt-1">7:00 PM</span>
                      <div className="w-px h-full bg-sage/30 relative mt-2 -ml-[1px] md:-ml-2 shrink-0">
                        <div className="absolute top-0 -left-[3px] w-2 h-2 rounded-full bg-sage" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Ceremony</p>
                        <p className="serif text-[10px] md:text-xs italic text-zinc-500">Exchange of Vows</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:gap-4">
                      <span className="serif text-sage font-bold text-[10px] md:text-base w-12 md:w-20 text-right shrink-0 pt-1">7:30 PM</span>
                      <div className="w-px h-12 md:h-16 bg-sage/30 relative -ml-[1px] md:-ml-2 shrink-0">
                        <div className="absolute top-0 -left-[3px] w-2 h-2 rounded-full bg-sage" />
                      </div>
                      <div className="-mt-1">
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Cocktails</p>
                        <p className="serif text-[10px] md:text-xs italic text-zinc-500">Drinks & Photos</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:gap-4">
                      <span className="serif text-sage font-bold text-[10px] md:text-base w-12 md:w-20 text-right shrink-0 pt-1">8:30 PM</span>
                      <div className="w-px h-full bg-transparent relative mt-2 -ml-[1px] md:-ml-2 shrink-0">
                        <div className="absolute top-0 -left-[3px] w-2 h-2 rounded-full bg-sage" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Reception</p>
                        <p className="serif text-[10px] md:text-xs italic text-zinc-500">Dinner & Dancing</p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>

        </div>

        {/* Our Love Story Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-32 space-y-12 md:space-y-20 p-8 md:p-16 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-sage/20 to-transparent" />

          <div className="text-center space-y-4">
            <Heart className="text-sage/40 w-8 h-8 mx-auto" fill="currentColor" />
            <h2 className="serif text-4xl md:text-7xl text-sage font-light italic">Our Story</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400 font-bold">The Journey of Us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {[
              { year: "2020", title: "First Met", desc: "A chance encounter that changed everything.", icon: <Heart className="w-5 h-5" /> },
              { year: "2022", title: "The Proposal", desc: "Underneath the stars, she said yes!", icon: <Heart className="w-5 h-5" /> },
              { year: "2026", title: "The Big Day", desc: "Beginning our forever, together.", icon: <Heart className="w-5 h-5" /> }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="text-center space-y-4 relative group"
              >
                <div className="w-12 h-12 rounded-full bg-sage/10 text-sage mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <span className="serif text-2xl text-sage/60 italic">{item.year}</span>
                  <h4 className="serif text-2xl text-zinc-800 font-medium tracking-wide">{item.title}</h4>
                  <p className="serif text-sm italic text-zinc-500 leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-0 right-0 w-64 h-64 bg-sage/5 rounded-full blur-3xl -mb-32 -mr-32" />
        </motion.div>

        {/* Footer Info */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={isOpened ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 2 }}
          className="text-center pt-12 pb-12 space-y-6"
        >
          <div className="flex items-center justify-center gap-6 text-sage/40">
            <div className="h-px w-16 bg-current" />
            <span className="text-xs uppercase tracking-[0.6em] font-medium">Est. 2026</span>
            <div className="h-px w-16 bg-current" />
          </div>
          <p className="serif italic text-zinc-500 text-xl max-w-lg mx-auto leading-relaxed">
            "Love is not just something you feel, it's something you do."
          </p>
          <p className="serif text-sage/60 text-sm italic">We can't wait to celebrate with you</p>
        </motion.footer>

      </motion.main>

      {/* Decorative Floating Elements & Overlays */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1] overflow-hidden">
        {/* Animated Light Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(164,178,165,0.1)_0%,transparent_70%)]" />

        {/* Organic Floating Blobs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 45, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60rem] h-[60rem] bg-sage/5 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[15%] -right-[15%] w-[70rem] h-[70rem] bg-sage/10 rounded-full blur-[160px]"
        />

        {/* Falling Petals & Hearts Layer */}
        {[...Array(30)].map((_, i) => {
          const isHeart = i % 2 === 0;
          const randomDelay = Math.random() * 20;
          const randomDuration = 15 + Math.random() * 20;
          const size = isHeart ? Math.random() * 15 + 10 : Math.random() * 24 + 16;

          return (
            <motion.div
              key={`falling-decor-${i}`}
              className="absolute pointer-events-none blur-[1px] md:blur-none"
              initial={{
                top: "-10%",
                left: `${Math.random() * 100}%`,
                rotate: 0,
                scale: 0.5,
                opacity: 0
              }}
              animate={{
                top: "110%",
                left: [`${Math.random() * 100}%`, `${Math.random() * 100 + (Math.random() - 0.5) * 20}%`, `${Math.random() * 100}%`],
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                scale: [0.5, 1, 0.8],
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: "linear"
              }}
            >
              {isHeart ? (
                <Heart className="text-sage" fill="currentColor" size={size} />
              ) : (
                <RealisticPetal size={size} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
