import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, AlertTriangle, Shield, Trophy, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

// Retro Sound Synthesizer using Web Audio API
const playSound = (type: "click" | "win" | "lose" | "deflect" | "hit" | "collect") => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "deflect") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "collect") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "win") {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
      notes.forEach((freq, idx) => {
        const oscNode = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscNode.type = "triangle";
        oscNode.frequency.setValueAtTime(freq, now + idx * 0.1);
        gainNode.gain.setValueAtTime(0.15, now + idx * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
        oscNode.start(now + idx * 0.1);
        oscNode.stop(now + idx * 0.1 + 0.25);
      });
    } else if (type === "lose") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.error("Web Audio failed", e);
  }
};

interface GamePlayerProps {
  miniGameId: "balatro" | "outerwilds" | "sekiro" | "hades";
}

export function GamePlayer({ miniGameId }: GamePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"ready" | "playing" | "victory" | "gameover">("ready");
  const [highScore, setHighScore] = useState(0);

  // General Reset
  const startPlaying = () => {
    playSound("click");
    setIsPlaying(true);
    setGameState("playing");
    setScore(0);
  };

  const handleGameOver = (won: boolean) => {
    if (won) {
      playSound("win");
      setGameState("victory");
    } else {
      playSound("lose");
      setGameState("gameover");
    }
    setIsPlaying(false);
  };

  return (
    <div className="w-full bg-[#0a0a0d] border border-primary/20 rounded-md p-6 shadow-2xl relative overflow-hidden group/console">
      {/* Screen Border Panel */}
      <div className="relative border-4 border-[#1c1a24] bg-[#020203] rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[360px] p-4 shadow-[inner_0_0_20px_rgba(0,0,0,0.9)]">
        
        {/* Game State Panels */}
        {gameState === "ready" && (
          <div className="text-center space-y-6 max-w-sm px-4 animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary border border-primary/30 animate-pulse">
              {miniGameId === "balatro" && <Trophy className="w-8 h-8" />}
              {miniGameId === "outerwilds" && <Sparkles className="w-8 h-8" />}
              {miniGameId === "sekiro" && <Swords className="w-8 h-8" />}
              {miniGameId === "hades" && <Swords className="w-8 h-8" />}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold tracking-wide uppercase text-foreground">
                {miniGameId === "balatro" && "Bean Balatro — Mini"}
                {miniGameId === "outerwilds" && "Outer Beans — Cosmic Drift"}
                {miniGameId === "sekiro" && "Sekiro — Parovanie"}
                {miniGameId === "hades" && "Hades II — Reflexný Súboj"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {miniGameId === "balatro" && "Zostavuj poker ruky a spájaj ich s násobičmi Fazúľových Jokerov. Cieľ: Dosiahnuť 2 000 bodov."}
                {miniGameId === "outerwilds" && "Vyhýbaj sa padajúcim asteroidom a chytaj kozmické stardust. Ovládanie myšou alebo klikaním."}
                {miniGameId === "sekiro" && "Klikaj v perfektný moment na DEFLECT a rozdrv postoj bossa. Nesmieš minúť!"}
                {miniGameId === "hades" && "Bleskový test reflexov. Klikaj na útok a uhýbaj sa Chronovým magickým vlnám."}
              </p>
            </div>

            <Button
              onClick={startPlaying}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-widest px-6 h-11 border border-primary-border shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 mr-2 fill-current" /> Spustiť Ukážku
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full h-full flex flex-col flex-1">
            {miniGameId === "balatro" && (
              <BalatroGame
                score={score}
                setScore={setScore}
                onGameOver={handleGameOver}
                highScore={highScore}
                setHighScore={setHighScore}
              />
            )}
            {miniGameId === "outerwilds" && (
              <OuterWildsGame
                score={score}
                setScore={setScore}
                onGameOver={handleGameOver}
                highScore={highScore}
                setHighScore={setHighScore}
              />
            )}
            {(miniGameId === "sekiro" || miniGameId === "hades") && (
              <SekiroGame
                score={score}
                setScore={setScore}
                onGameOver={handleGameOver}
                highScore={highScore}
                setHighScore={setHighScore}
                isHades={miniGameId === "hades"}
              />
            )}
          </div>
        )}

        {(gameState === "victory" || gameState === "gameover") && (
          <div className="text-center space-y-6 max-w-sm px-4">
            <div className={`text-4xl font-serif font-bold uppercase tracking-wider ${
              gameState === "victory" ? "text-primary animate-bounce" : "text-destructive"
            }`}>
              {gameState === "victory" ? "Víťazstvo!" : "Koniec hry"}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {gameState === "victory" 
                ? `Výborne! Podarilo sa ti dokončiť hernú ukážku so skóre: ${score}!`
                : `Hra skončila. Skús to znova a prekonaj svoj rekord.`}
            </p>

            <div className="bg-[#0c0b0f] border border-border p-4 rounded-md font-mono text-xs flex justify-around">
              <div>
                <span className="text-muted-foreground uppercase block text-[10px]">Tvoje Skóre</span>
                <span className="text-lg font-bold text-foreground">{score}</span>
              </div>
              <div className="border-r border-border h-8 self-center" />
              <div>
                <span className="text-muted-foreground uppercase block text-[10px]">Najlepšie Skóre</span>
                <span className="text-lg font-bold text-primary">{Math.max(highScore, score)}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={startPlaying}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs uppercase tracking-widest px-6"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Hrať znova
              </Button>
              <Button
                variant="outline"
                onClick={() => setGameState("ready")}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Koniec
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Retro D-Pad and Buttons panel footer */}
      <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-ping" />
          <span>FHP CRT CONSOLE v1.0.4</span>
        </div>
        <div className="flex gap-3">
          <span className="border border-border px-2 py-0.5 rounded-sm bg-[#0e0d13]">A (Select)</span>
          <span className="border border-border px-2 py-0.5 rounded-sm bg-[#0e0d13]">B (Back)</span>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// 1. BEAN BALATRO MINI GAME
// -----------------------------------------------------
function BalatroGame({ score, setScore, onGameOver, highScore, setHighScore }: any) {
  const cardsPool = [
    { value: 14, suit: "♥", label: "A" },
    { value: 13, suit: "♥", label: "K" },
    { value: 12, suit: "♥", label: "Q" },
    { value: 11, suit: "♥", label: "J" },
    { value: 10, suit: "♥", label: "10" },
    { value: 9, suit: "♦", label: "9" },
    { value: 8, suit: "♣", label: "8" },
    { value: 7, suit: "♠", label: "7" },
    { value: 14, suit: "♠", label: "A" },
    { value: 13, suit: "♦", label: "K" },
    { value: 10, suit: "♠", label: "10" }
  ];

  const [hand, setHand] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [discardsRemaining, setDiscardsRemaining] = useState(2);
  const [handsRemaining, setHandsRemaining] = useState(3);
  const [jokerMultiplier, setJokerMultiplier] = useState(1);

  // Generate Initial Hand
  useEffect(() => {
    dealHand();
  }, []);

  const dealHand = () => {
    playSound("click");
    const shuffled = [...cardsPool].sort(() => 0.5 - Math.random());
    setHand(shuffled.slice(0, 8));
    setSelectedIndices([]);
  };

  const toggleSelectCard = (index: number) => {
    playSound("click");
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      if (selectedIndices.length < 5) {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };

  const handleDiscard = () => {
    if (discardsRemaining <= 0) return;
    playSound("hit");
    const newHand = [...hand];
    const shuffledPool = [...cardsPool].sort(() => 0.5 - Math.random());
    
    selectedIndices.forEach(idx => {
      newHand[idx] = shuffledPool.pop();
    });
    
    setHand(newHand);
    setSelectedIndices([]);
    setDiscardsRemaining(prev => prev - 1);
  };

  const handlePlayHand = () => {
    if (selectedIndices.length === 0) return;
    playSound("collect");
    
    const selectedCards = selectedIndices.map(idx => hand[idx]);
    
    // Simple Poker hand evaluation
    const values = selectedCards.map(c => c.value).sort((a,b) => a-b);
    const suits = selectedCards.map(c => c.suit);
    
    let handName = "Vysoká Karta";
    let baseChips = 10;
    let baseMult = 1;

    const counts: Record<number, number> = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const countArr = Object.values(counts).sort((a,b) => b-a);
    
    const isFlush = suits.every(s => s === suits[0]) && selectedCards.length === 5;
    
    // Check straight
    let isStraight = false;
    if (selectedCards.length === 5) {
      isStraight = true;
      for (let i = 0; i < values.length - 1; i++) {
        if (values[i+1] - values[i] !== 1) isStraight = false;
      }
    }

    if (isFlush && isStraight) {
      handName = "Čistá Postupka";
      baseChips = 200;
      baseMult = 8;
    } else if (countArr[0] === 4) {
      handName = "Štvorica";
      baseChips = 120;
      baseMult = 6;
    } else if (countArr[0] === 3 && countArr[1] === 2) {
      handName = "Full House";
      baseChips = 80;
      baseMult = 4;
    } else if (isFlush) {
      handName = "Farba (Flush)";
      baseChips = 70;
      baseMult = 4;
    } else if (isStraight) {
      handName = "Postupka (Straight)";
      baseChips = 60;
      baseMult = 3;
    } else if (countArr[0] === 3) {
      handName = "Trojica";
      baseChips = 50;
      baseMult = 2;
    } else if (countArr[0] === 2 && countArr[1] === 2) {
      handName = "Dva Páry";
      baseChips = 30;
      baseMult = 2;
    } else if (countArr[0] === 2) {
      handName = "Pár";
      baseChips = 20;
      baseMult = 1.5;
    }

    // Multiply by Fazula Jokers
    const jokersCount = 3; // Mock active jokers
    const jokerMultBonus = jokersCount * 2; 
    const finalMult = Math.round(baseMult * (1 + jokerMultBonus * 0.1) * 10) / 10;
    const pointsWon = Math.round(baseChips * finalMult);

    const nextScore = score + pointsWon;
    setScore(nextScore);

    // Render alert or brief notice
    alert(`Zahraná ruka: ${handName}!\nZískané žetóny: ${baseChips} x ${finalMult} mult = +${pointsWon} bodov!`);

    // Check game logic
    const nextHands = handsRemaining - 1;
    setHandsRemaining(nextHands);

    if (nextScore >= 2000) {
      if (nextScore > highScore) setHighScore(nextScore);
      onGameOver(true);
    } else if (nextHands <= 0) {
      if (nextScore > highScore) setHighScore(nextScore);
      onGameOver(false);
    } else {
      dealHand();
    }
  };

  return (
    <div className="w-full flex flex-col flex-1 justify-between p-2">
      {/* Game info header */}
      <div className="flex justify-between items-center bg-[#0d0c11] border border-border p-3 rounded-md mb-2">
        <div className="flex gap-4">
          <div>
            <span className="text-[9px] block text-muted-foreground uppercase">Skóre</span>
            <span className="text-sm font-bold text-primary font-mono">{score} / 2000</span>
          </div>
          <div>
            <span className="text-[9px] block text-muted-foreground uppercase">Ruky</span>
            <span className="text-sm font-bold text-foreground font-mono">{handsRemaining}</span>
          </div>
          <div>
            <span className="text-[9px] block text-muted-foreground uppercase">Zrušenia</span>
            <span className="text-sm font-bold text-foreground font-mono">{discardsRemaining}</span>
          </div>
        </div>

        {/* Bean Jokers */}
        <div className="flex gap-1.5">
          <div className="border border-amber-500/20 bg-amber-500/5 px-2 py-1 rounded text-[8px] font-mono text-amber-400">
            BEAN JOKER (+4 Mult)
          </div>
          <div className="border border-amber-500/20 bg-amber-500/5 px-2 py-1 rounded text-[8px] font-mono text-amber-400">
            JELLY BEAN (x1.5 Mult)
          </div>
        </div>
      </div>

      {/* Cards Area */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-4">
        {hand.map((card, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const isRed = card.suit === "♥" || card.suit === "♦";
          return (
            <div
              key={idx}
              onClick={() => toggleSelectCard(idx)}
              className={`aspect-[2/3] border rounded-md p-2 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary border-primary text-primary-foreground -translate-y-2 shadow-lg shadow-primary/30"
                  : "bg-[#0e0d14] border-border text-foreground hover:border-primary/50"
              }`}
            >
              <div className="text-sm font-bold font-mono">{card.label}</div>
              <div className={`text-center text-xl ${isSelected ? "text-primary-foreground" : isRed ? "text-red-500" : "text-muted-foreground"}`}>
                {card.suit}
              </div>
              <div className="text-right text-sm font-bold font-mono">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handlePlayHand}
          disabled={selectedIndices.length === 0}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 uppercase font-mono tracking-widest text-xs"
        >
          Hrať Ruku ({selectedIndices.length})
        </Button>
        <Button
          onClick={handleDiscard}
          disabled={selectedIndices.length === 0 || discardsRemaining <= 0}
          variant="outline"
          className="flex-1 border-border text-muted-foreground hover:text-foreground h-11 uppercase font-mono tracking-widest text-xs"
        >
          Zahodiť ({discardsRemaining}x)
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// 2. COSMIC BEAN DRIFT MINI GAME
// -----------------------------------------------------
function OuterWildsGame({ score, setScore, onGameOver, highScore, setHighScore }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shields, setShields] = useState(3);
  const shipPosRef = useRef(150); // X coordinate of the ship
  const particlesRef = useRef<any[]>([]); // Falling stardust and asteroids
  const isPlayingRef = useRef(true);

  // Setup loop
  useEffect(() => {
    isPlayingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;

    const spawnEntity = () => {
      if (Math.random() < 0.08) {
        // Spawn Asteroid (obstacle) or Bean (collectible)
        const isCollect = Math.random() < 0.35;
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: -20,
          speed: 2 + Math.random() * 3,
          radius: isCollect ? 6 : 10 + Math.random() * 10,
          isCollect
        });
      }
    };

    const update = () => {
      if (!isPlayingRef.current) return;

      // Spawn
      spawnEntity();

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background space stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      for (let i = 0; i < 15; i++) {
        ctx.fillRect((i * 45) % canvas.width, (nowTime() + i * 80) % canvas.height, 1.5, 1.5);
      }

      // Draw Space Ship
      const shipY = canvas.height - 35;
      const shipX = shipPosRef.current;

      ctx.fillStyle = "#c97d2e"; // FHP Warm orange
      ctx.beginPath();
      ctx.moveTo(shipX, shipY - 12);
      ctx.lineTo(shipX - 10, shipY + 8);
      ctx.lineTo(shipX + 10, shipY + 8);
      ctx.closePath();
      ctx.fill();

      // Engine glow
      ctx.fillStyle = Math.random() > 0.5 ? "#f59e0b" : "#ef4444";
      ctx.beginPath();
      ctx.moveTo(shipX - 4, shipY + 10);
      ctx.lineTo(shipX + 4, shipY + 10);
      ctx.lineTo(shipX, shipY + 16);
      ctx.closePath();
      ctx.fill();

      // Update Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.y += p.speed;

        // Draw particle
        if (p.isCollect) {
          ctx.fillStyle = "#10b981"; // Green stardust
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          ctx.strokeStyle = "rgba(16,185,129,0.3)";
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          ctx.fillStyle = "#4b5563"; // Gray Asteroid
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Collision Check
        const dist = Math.hypot(p.x - shipX, p.y - shipY);
        if (dist < p.radius + 10) {
          if (p.isCollect) {
            playSound("collect");
            setScore((s: number) => {
              const next = s + 100;
              if (next >= 1500) {
                isPlayingRef.current = false;
                setTimeout(() => onGameOver(true), 100);
              }
              return next;
            });
          } else {
            playSound("hit");
            setShields((sh) => {
              const next = sh - 1;
              if (next <= 0) {
                isPlayingRef.current = false;
                setTimeout(() => onGameOver(false), 100);
              }
              return next;
            });
          }
          return false; // Remove particle
        }

        // Keep inside boundary
        return p.y < canvas.height + 30;
      });

      frameId = requestAnimationFrame(update);
    };

    const nowTime = () => new Date().getTime() / 15;

    frameId = requestAnimationFrame(update);

    return () => {
      isPlayingRef.current = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    shipPosRef.current = Math.max(15, Math.min(x, rect.width - 15));
  };

  const handleLeftPress = () => {
    shipPosRef.current = Math.max(15, shipPosRef.current - 25);
    playSound("click");
  };

  const handleRightPress = () => {
    const canvasWidth = canvasRef.current?.width || 300;
    shipPosRef.current = Math.min(canvasWidth - 15, shipPosRef.current + 25);
    playSound("click");
  };

  return (
    <div className="w-full flex flex-col flex-1 justify-between items-center p-2">
      {/* Game info header */}
      <div className="w-full flex justify-between items-center bg-[#0d0c11] border border-border p-3 rounded-md mb-2">
        <div>
          <span className="text-[9px] block text-muted-foreground uppercase">Vesmírny Prach</span>
          <span className="text-sm font-bold text-primary font-mono">{score} / 1500</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase mr-1">Štíty:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <Shield
              key={i}
              className={`w-4 h-4 ${i < shields ? "text-primary fill-primary" : "text-border"}`}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border border-border rounded-md overflow-hidden bg-black flex-1 w-full max-h-[220px]">
        <canvas
          ref={canvasRef}
          width={360}
          height={210}
          onMouseMove={handleMouseMove}
          className="w-full h-full cursor-crosshair block"
        />
        <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground font-mono pointer-events-none bg-black/40 px-1.5 py-0.5 rounded">
          Prejdi myšou pre smerovanie lode
        </div>
      </div>

      {/* On-screen Controls */}
      <div className="flex gap-4 w-full mt-3">
        <Button
          onClick={handleLeftPress}
          variant="outline"
          className="flex-1 border-border font-mono text-xs uppercase"
        >
          ← Doľava
        </Button>
        <Button
          onClick={handleRightPress}
          variant="outline"
          className="flex-1 border-border font-mono text-xs uppercase"
        >
          Doprava →
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// 3. SEKIRO REFLEX PARING MINI GAME (RHYTHM DUEL)
// -----------------------------------------------------
function SekiroGame({ score, setScore, onGameOver, highScore, setHighScore, isHades }: any) {
  const [enemyPosture, setEnemyPosture] = useState(0);
  const [playerPosture, setPlayerPosture] = useState(0);
  const [actionLabel, setActionLabel] = useState<string>("SÚSTREĎ SA...");
  const [isAlert, setIsAlert] = useState(false);
  const [isDeathblowReady, setIsDeathblowReady] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const attackWindowStartRef = useRef<number>(0);
  const attackActiveRef = useRef(false);

  // Start Enemy Attack Cycle
  useEffect(() => {
    scheduleNextAttack();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleNextAttack = () => {
    setActionLabel("Čakaj na útok...");
    setIsAlert(false);
    attackActiveRef.current = false;

    const delay = 1500 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      triggerAttack();
    }, delay);
  };

  const triggerAttack = () => {
    setIsAlert(true);
    attackActiveRef.current = true;
    attackWindowStartRef.current = Date.now();
    setActionLabel(isHades ? "UHNIS SA!" : "ODRAZ / DEFLECT!");

    // Attack expires if not deflected within 450ms
    timerRef.current = setTimeout(() => {
      if (attackActiveRef.current) {
        handleMissedParry();
      }
    }, 450);
  };

  const handleMissedParry = () => {
    playSound("hit");
    attackActiveRef.current = false;
    setIsAlert(false);
    setActionLabel(isHades ? "Zásah Chronom!" : "Zásah Mečom!");
    
    setPlayerPosture(prev => {
      const next = prev + 30;
      if (next >= 100) {
        setTimeout(() => onGameOver(false), 200);
      } else {
        setTimeout(scheduleNextAttack, 1000);
      }
      return next;
    });
  };

  const handleDeflectClick = () => {
    if (!attackActiveRef.current) {
      // Clicked too early (pre-emptive click penalty)
      playSound("click");
      setActionLabel("Zbrklý pokus!");
      setPlayerPosture(prev => Math.min(100, prev + 10));
      return;
    }

    const reactionTime = Date.now() - attackWindowStartRef.current;
    attackActiveRef.current = false;
    setIsAlert(false);

    if (reactionTime >= 60 && reactionTime <= 380) {
      // Perfect Parry!
      playSound("deflect");
      setActionLabel(isHades ? "Perfektný Úskok!" : "Dokonalé Parovanie!");
      
      setEnemyPosture(prev => {
        const next = prev + 25;
        if (next >= 100) {
          setIsDeathblowReady(true);
          setActionLabel(isHades ? "VYČERPANÝ! KLIKNI PRE VÍŤAZNÝ ÚDER" : "POSTUR ZLOMENÁ! KLIKNI PRE DEATHBLOW");
        } else {
          setTimeout(scheduleNextAttack, 1000);
        }
        return next;
      });
      setScore((s: number) => s + 200);
    } else {
      // Blocked but not perfect parry
      playSound("hit");
      setActionLabel(isHades ? "Pomalý úskok!" : "Obyčajný Blok!");
      setPlayerPosture(prev => {
        const next = prev + 15;
        if (next >= 100) {
          setTimeout(() => onGameOver(false), 200);
        } else {
          setTimeout(scheduleNextAttack, 1000);
        }
        return next;
      });
      setEnemyPosture(prev => Math.min(100, prev + 5));
    }
  };

  const handleExecuteDeathblow = () => {
    playSound("win");
    setIsDeathblowReady(false);
    setScore((s: number) => s + 500);
    setTimeout(() => onGameOver(true), 300);
  };

  return (
    <div className="w-full flex flex-col flex-1 justify-between p-2">
      {/* Postures and HP bars */}
      <div className="w-full space-y-2 mb-2">
        {/* Boss bar */}
        <div className="bg-[#0d0c11] border border-border p-2.5 rounded-md">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-mono mb-1">
            <span>{isHades ? "Titan Chronos" : "Samuraj Genichiro"}</span>
            <span className="text-primary font-bold">Posture {enemyPosture}%</span>
          </div>
          <div className="h-2.5 w-full bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 shadow-[0_0_8px_rgba(201,125,46,0.8)]"
              style={{ width: `${enemyPosture}%` }}
            />
          </div>
        </div>

        {/* Player bar */}
        <div className="bg-[#0d0c11] border border-border p-2.5 rounded-md">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-mono mb-1">
            <span>Tvoj Postoj (Hráč)</span>
            <span className={playerPosture > 70 ? "text-destructive font-bold" : "text-foreground"}>
              Limit {playerPosture}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-border/40 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                playerPosture > 70 ? "bg-destructive" : "bg-foreground"
              }`}
              style={{ width: `${playerPosture}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duel Screen Arena */}
      <div className="relative border border-border rounded-md overflow-hidden bg-black flex-1 w-full min-h-[140px] flex flex-col items-center justify-center">
        {isAlert && (
          <div className="absolute inset-0 bg-red-950/20 animate-pulse border border-red-500/50 pointer-events-none" />
        )}
        
        {/* Retro visual representations */}
        <div className="flex items-center gap-16 select-none my-4">
          <div className="text-center font-mono">
            <div className="text-3xl">🥷</div>
            <div className="text-[9px] text-muted-foreground mt-1">VLK</div>
          </div>
          <div className="text-center font-mono relative">
            {isAlert && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white font-serif font-bold text-xs uppercase tracking-widest px-2.5 py-1 rounded shadow-lg border border-red-400 animate-bounce">
                危 危
              </div>
            )}
            <div className="text-4xl">{isHades ? "⏳" : "👹"}</div>
            <div className="text-[9px] text-muted-foreground mt-1">{isHades ? "CHRONOS" : "BOSS"}</div>
          </div>
        </div>

        <div className={`text-xs font-mono tracking-widest ${isAlert ? "text-red-400 font-bold" : "text-muted-foreground"}`}>
          {actionLabel}
        </div>
      </div>

      {/* Main trigger button */}
      <div className="mt-3 w-full">
        {isDeathblowReady ? (
          <Button
            onClick={handleExecuteDeathblow}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-sm font-bold uppercase tracking-widest h-12 shadow-[0_0_15px_rgba(220,38,38,0.7)] animate-bounce"
          >
            {isHades ? "DORUČIŤ RANU OSUDU" : "SHINOBI DEATHBLOW!"}
          </Button>
        ) : (
          <Button
            onClick={handleDeflectClick}
            className={`w-full font-mono text-sm font-bold uppercase tracking-widest h-12 transition-all ${
              isAlert 
                ? "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                : "bg-card hover:bg-card/80 text-foreground border border-border"
            }`}
          >
            {isHades ? "UHNÚŤ SA (Space)" : "ODRAZIŤ ÚTOK (Space)"}
          </Button>
        )}
      </div>
    </div>
  );
}
