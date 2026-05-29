"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useMemo,
    type ReactNode,
    type MouseEvent as ReactMouseEvent,
    type SVGProps,
} from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, CheckCircle2, Star, Video, Camera, Heart } from 'lucide-react';
import {
    motion,
    AnimatePresence,
    type Transition,
    type VariantLabels,
    type Target,
    type TargetAndTransition,
    type Variants,
} from 'framer-motion';

function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(" ");
}

interface RotatingTextRef {
    next: () => void;
    previous: () => void;
    jumpTo: (index: number) => void;
    reset: () => void;
}

interface RotatingTextProps
    extends Omit<
        React.ComponentPropsWithoutRef<typeof motion.span>,
        "children" | "transition" | "initial" | "animate" | "exit"
    > {
    texts: string[];
    transition?: Transition;
    initial?: boolean | Target | VariantLabels;
    animate?: boolean | VariantLabels | any | TargetAndTransition;
    exit?: Target | VariantLabels;
    animatePresenceMode?: "sync" | "wait";
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: "first" | "last" | "center" | "random" | number;
    loop?: boolean;
    auto?: boolean;
    splitBy?: "characters" | "words" | "lines" | string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
    (
        {
            texts,
            transition = { type: "spring", damping: 25, stiffness: 300 },
            initial = { y: "100%", opacity: 0 },
            animate = { y: 0, opacity: 1 },
            exit = { y: "-120%", opacity: 0 },
            animatePresenceMode = "wait",
            animatePresenceInitial = false,
            rotationInterval = 2200,
            staggerDuration = 0.01,
            staggerFrom = "last",
            loop = true,
            auto = true,
            splitBy = "characters",
            onNext,
            mainClassName,
            splitLevelClassName,
            elementLevelClassName,
            ...rest
        },
        ref
    ) => {
        const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

        const splitIntoCharacters = (text: string): string[] => {
            if (typeof Intl !== "undefined" && Intl.Segmenter) {
                try {
                    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
                    return Array.from(segmenter.segment(text), (segment) => segment.segment);
                } catch (error) {
                    console.error("Intl.Segmenter failed, falling back to simple split:", error);
                    return text.split('');
                }
            }
            return text.split('');
        };

        const elements = useMemo(() => {
            const currentText: string = texts[currentTextIndex] ?? '';
            if (splitBy === "characters") {
                const words = currentText.split(/(\s+)/);
                let charCount = 0;
                return words.filter(part => part.length > 0).map((part) => {
                    const isSpace = /^\s+$/.test(part);
                    const chars = isSpace ? [part] : splitIntoCharacters(part);
                    const startIndex = charCount;
                    charCount += chars.length;
                    return { characters: chars, isSpace: isSpace, startIndex: startIndex };
                });
            }
            if (splitBy === "words") {
                return currentText.split(/(\s+)/).filter(word => word.length > 0).map((word, i) => ({
                    characters: [word], isSpace: /^\s+$/.test(word), startIndex: i
                }));
            }
            if (splitBy === "lines") {
                return currentText.split('\n').map((line, i) => ({
                    characters: [line], isSpace: false, startIndex: i
                }));
            }
            return currentText.split(splitBy).map((part, i) => ({
                characters: [part], isSpace: false, startIndex: i
            }));
        }, [texts, currentTextIndex, splitBy]);

        const totalElements = useMemo(() => elements.reduce((sum, el) => sum + el.characters.length, 0), [elements]);

        const getStaggerDelay = useCallback(
            (index: number, total: number): number => {
                if (total <= 1 || !staggerDuration) return 0;
                const stagger = staggerDuration;
                switch (staggerFrom) {
                    case "first": return index * stagger;
                    case "last": return (total - 1 - index) * stagger;
                    case "center":
                        const center = (total - 1) / 2;
                        return Math.abs(center - index) * stagger;
                    case "random": return Math.random() * (total - 1) * stagger;
                    default:
                        if (typeof staggerFrom === 'number') {
                            const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
                            return Math.abs(fromIndex - index) * stagger;
                        }
                        return index * stagger;
                }
            },
            [staggerFrom, staggerDuration]
        );

        const handleIndexChange = useCallback(
            (newIndex: number) => {
                setCurrentTextIndex(newIndex);
                onNext?.(newIndex);
            },
            [onNext]
        );

        const next = useCallback(() => {
            const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
            if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
        }, [currentTextIndex, texts.length, loop, handleIndexChange]);

        const previous = useCallback(() => {
            const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
            if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
        }, [currentTextIndex, texts.length, loop, handleIndexChange]);

        const jumpTo = useCallback(
            (index: number) => {
                const validIndex = Math.max(0, Math.min(index, texts.length - 1));
                if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
            },
            [texts.length, currentTextIndex, handleIndexChange]
        );

        const reset = useCallback(() => {
            if (currentTextIndex !== 0) handleIndexChange(0);
        }, [currentTextIndex, handleIndexChange]);

        useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

        useEffect(() => {
            if (!auto || texts.length <= 1) return;
            const intervalId = setInterval(next, rotationInterval);
            return () => clearInterval(intervalId);
        }, [next, rotationInterval, auto, texts.length]);

        return (
            <motion.span
                className={cn("inline-flex flex-wrap justify-center whitespace-pre-wrap relative align-bottom", mainClassName)}
                {...rest}
                layout
            >
                <span className="sr-only">{texts[currentTextIndex]}</span>
                <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
                    <motion.div
                        key={currentTextIndex}
                        className={cn(
                            "inline-flex flex-wrap justify-center relative w-full",
                            splitBy === "lines" ? "flex-col items-center w-full" : "flex-row items-baseline justify-center"
                        )}
                        layout
                        aria-hidden="true"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {elements.map((elementObj, elementIndex) => (
                            <span
                                key={elementIndex}
                                className={cn("inline-flex", splitBy === 'lines' ? 'w-full' : '', splitLevelClassName)}
                                style={{ whiteSpace: 'pre' }}
                            >
                                {elementObj.characters.map((char, charIndex) => {
                                    const globalIndex = elementObj.startIndex + charIndex;
                                    return (
                                        <motion.span
                                            key={`${char}-${charIndex}`}
                                            variants={{
                                                initial: initial as any,
                                                animate: animate as any,
                                                exit: exit as any
                                            }}
                                            transition={{
                                                ...transition,
                                                delay: getStaggerDelay(globalIndex, totalElements),
                                            }}
                                            className={cn("inline-block leading-none tracking-tight", elementLevelClassName)}
                                        >
                                            {char === ' ' ? '\u00A0' : char}
                                        </motion.span>
                                    );
                                })}
                            </span>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </motion.span>
        );
    }
);
RotatingText.displayName = "RotatingText";

const ShinyText: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = "" }) => (
    <span className={cn("relative overflow-hidden inline-block", className)}>
        {children}
        <span style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)',
            animation: 'shine 2s infinite linear',
            opacity: 0.5,
            pointerEvents: 'none'
        }}></span>
        <style>{`
            @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </span>
);

interface Dot {
    x: number;
    y: number;
    baseColor: string;
    targetOpacity: number;
    currentOpacity: number;
    opacitySpeed: number;
    baseRadius: number;
    currentRadius: number;
}

const InteractiveHero: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const [showFormDropdown, setShowFormDropdown] = useState<boolean>(false);

    const dotsRef = useRef<Dot[]>([]);
    const gridRef = useRef<Record<string, number[]>>({});
    const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
    const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

    const DOT_SPACING = 25;
    const BASE_OPACITY_MIN = 0.30;
    const BASE_OPACITY_MAX = 0.45;
    const BASE_RADIUS = 1;
    const INTERACTION_RADIUS = 150;
    const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
    const OPACITY_BOOST = 0.65;
    const RADIUS_BOOST = 2.5;
    const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            mousePositionRef.current = { x: null, y: null };
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        mousePositionRef.current = { x: canvasX, y: canvasY };
    }, []);

    const createDots = useCallback(() => {
        const { width, height } = canvasSizeRef.current;
        if (width === 0 || height === 0) return;

        const newDots: Dot[] = [];
        const newGrid: Record<string, number[]> = {};
        const cols = Math.ceil(width / DOT_SPACING);
        const rows = Math.ceil(height / DOT_SPACING);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * DOT_SPACING + DOT_SPACING / 2;
                const y = j * DOT_SPACING + DOT_SPACING / 2;
                const cellX = Math.floor(x / GRID_CELL_SIZE);
                const cellY = Math.floor(y / GRID_CELL_SIZE);
                const cellKey = `${cellX}_${cellY}`;

                if (!newGrid[cellKey]) {
                    newGrid[cellKey] = [];
                }

                const dotIndex = newDots.length;
                newGrid[cellKey].push(dotIndex);

                const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
                // Menggunakan warna amber/gold khas Receh48
                newDots.push({
                    x,
                    y,
                    baseColor: `rgba(245, 158, 11, ${BASE_OPACITY_MAX})`,
                    targetOpacity: baseOpacity,
                    currentOpacity: baseOpacity,
                    opacitySpeed: (Math.random() * 0.005) + 0.002,
                    baseRadius: BASE_RADIUS,
                    currentRadius: BASE_RADIUS,
                });
            }
        }
        dotsRef.current = newDots;
        gridRef.current = newGrid;
    }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        const width = container ? container.clientWidth : window.innerWidth;
        const height = container ? container.clientHeight : window.innerHeight;

        if (canvas.width !== width || canvas.height !== height ||
            canvasSizeRef.current.width !== width || canvasSizeRef.current.height !== height) {
            canvas.width = width;
            canvas.height = height;
            canvasSizeRef.current = { width, height };
            createDots();
        }
    }, [createDots]);

    const animateDots = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const dots = dotsRef.current;
        const grid = gridRef.current;
        const { width, height } = canvasSizeRef.current;
        const { x: mouseX, y: mouseY } = mousePositionRef.current;

        if (!ctx || !dots || !grid || width === 0 || height === 0) {
            animationFrameId.current = requestAnimationFrame(animateDots);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const activeDotIndices = new Set<number>();
        if (mouseX !== null && mouseY !== null) {
            const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
            const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE);
            const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE);
            for (let i = -searchRadius; i <= searchRadius; i++) {
                for (let j = -searchRadius; j <= searchRadius; j++) {
                    const checkCellX = mouseCellX + i;
                    const checkCellY = mouseCellY + j;
                    const cellKey = `${checkCellX}_${checkCellY}`;
                    if (grid[cellKey]) {
                        grid[cellKey].forEach(dotIndex => activeDotIndices.add(dotIndex));
                    }
                }
            }
        }

        dots.forEach((dot, index) => {
            dot.currentOpacity += dot.opacitySpeed;
            if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
                dot.opacitySpeed = -dot.opacitySpeed;
                dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
                dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
            }

            let interactionFactor = 0;
            dot.currentRadius = dot.baseRadius;

            if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
                const dx = dot.x - mouseX;
                const dy = dot.y - mouseY;
                const distSq = dx * dx + dy * dy;

                if (distSq < INTERACTION_RADIUS_SQ) {
                    const distance = Math.sqrt(distSq);
                    interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
                    interactionFactor = interactionFactor * interactionFactor;
                }
            }

            const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST);
            dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;

            const colorMatch = dot.baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            const r = colorMatch ? colorMatch[1] : '245';
            const g = colorMatch ? colorMatch[2] : '158';
            const b = colorMatch ? colorMatch[3] : '11';

            ctx.beginPath();
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
            ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(animateDots);
    }, [GRID_CELL_SIZE, INTERACTION_RADIUS, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

    useEffect(() => {
        handleResize();
        const handleMouseLeave = () => {
            mousePositionRef.current = { x: null, y: null };
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('resize', handleResize);
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);

        animationFrameId.current = requestAnimationFrame(animateDots);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [handleResize, handleMouseMove, animateDots]);

    const contentDelay = 0.2;
    const itemDelayIncrement = 0.1;

    const bannerVariants: Variants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: contentDelay } }
    };
    const headlineVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement } }
    };
    const subHeadlineVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } }
    };
    const actionVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3 } }
    };
    const trustVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 4 } }
    };

    return (
        <section className="relative bg-[#06070A] text-gray-300 min-h-screen flex flex-col justify-center overflow-hidden py-6 sm:py-8">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{
                background: 'linear-gradient(to bottom, transparent 0%, #06070A 95%), radial-gradient(ellipse at center, transparent 30%, #06070A 98%)'
            }}></div>

            {/* Soft gold/red spotlights (brand-consistent) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-amber-400/10 blur-[130px]" />
                <div className="absolute -bottom-72 -left-48 w-[720px] h-[720px] rounded-full bg-primary-600/10 blur-[140px]" />
                <div className="absolute -top-40 -right-40 w-[620px] h-[620px] rounded-full bg-yellow-300/5 blur-[120px]" />
            </div>

            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-6 pb-8 relative z-10">

                {/* Glowing Brand Tagline Banner */}
                <motion.div
                    variants={bannerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6"
                >
                    <ShinyText className="bg-white/5 border border-white/10 hover:border-amber-300/30 text-amber-200 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer transition-colors backdrop-blur-xl flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>500+ Pesanan Joki Sukses dengan Tingkat Kepuasan 98%</span>
                    </ShinyText>
                </motion.div>

                {/* Premium Dynamic Title */}
                <motion.h1
                    variants={headlineVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-4xl sm:text-5xl lg:text-[64px] font-display font-extrabold text-white leading-tight max-w-5xl mb-4"
                >
                    Hi, Welcome
                    <br />
                    <span className="text-white">Receh48</span>
                    <br />
                    <span className="inline-flex justify-center w-full h-[1.35em] overflow-hidden align-bottom">
                        <RotatingText
                            texts={['Specialist Joki', 'Fast Response', 'Aman & Terpercaya', '#staywithreceh']}
                            mainClassName="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                            staggerFrom={"last"}
                            initial={{ y: "-100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "110%", opacity: 0 }}
                            staggerDuration={0.01}
                            transition={{ type: "spring", damping: 18, stiffness: 250 }}
                            rotationInterval={2200}
                            splitBy="characters"
                            auto={true}
                            loop={true}
                        />
                    </span>
                </motion.h1>

                {/* Custom Brand Subtitle */}
                <motion.p
                    variants={subHeadlineVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto mb-6 leading-relaxed font-medium"
                >
                    Specialist Joki Tiket Video Call, Meet & Greet, 2-Shot, dan Konser JKT48.
                    Membantu mendapatkan slot oshi favorit kamu!
                </motion.p>

                {/* CTAs with Form Dropdown from original home page */}
                <motion.div
                    variants={actionVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl mx-auto mb-6 relative z-30"
                >
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
                        <button
                            type="button"
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-300 to-yellow-200 text-black px-8 py-3.5 rounded-xl font-bold hover:brightness-105 shadow-[0_20px_80px_-35px_rgba(255,215,130,0.85)] transition-all duration-200 flex items-center justify-center gap-2"
                            onClick={() => setShowFormDropdown(!showFormDropdown)}
                        >
                            <span>Form Pemesanan</span>
                            <svg
                                className={cn("w-4 h-4 transition-transform duration-200", showFormDropdown && "rotate-180")}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <Link
                            to="/pricelist"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white shadow-lg transition-all"
                        >
                            <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            Cek Harga Joki
                        </Link>

                        <Link
                            to="/reviews"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white shadow-lg transition-all"
                        >
                            <Star className="w-4 h-4 text-amber-300 fill-amber-300/20" />
                            <span>Lihat Review</span>
                        </Link>
                    </div>

                    {/* Dropdown Menu for Forms */}
                    <AnimatePresence>
                        {showFormDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full mt-2 w-full max-w-[280px] bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                            >
                                <Link
                                    to="/video-call"
                                    className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white/90 hover:text-amber-200 hover:bg-white/5 rounded-xl transition-all text-left"
                                >
                                    <Video className="w-4 h-4 text-amber-300 shrink-0" />
                                    <span>Form Joki Video Call</span>
                                </Link>
                                <Link
                                    to="/twoshot"
                                    className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white/90 hover:text-amber-200 hover:bg-white/5 rounded-xl transition-all text-left"
                                >
                                    <Camera className="w-4 h-4 text-amber-300 shrink-0" />
                                    <span>Form Joki 2-Shot</span>
                                </Link>
                                <Link
                                    to="/meet-greet"
                                    className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white/90 hover:text-amber-200 hover:bg-white/5 rounded-xl transition-all text-left"
                                >
                                    <Heart className="w-4 h-4 text-amber-300 shrink-0" />
                                    <span>Form Joki Meet & Greet</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Glowing Brand Badges */}
                <motion.div
                    variants={trustVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-3 justify-center"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/70 backdrop-blur-md">
                        <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>Amanah & Terpercaya</span>
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 backdrop-blur-md">
                        <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>Bayar Setelah Sukses</span>
                    </span>
                </motion.div>

            </main>
        </section>
    );
};

export default InteractiveHero;
