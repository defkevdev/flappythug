import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import diamondImg from './diamond.png'; // เพิ่มบรรทัดนี้

// IntroTerminal แบบใหม่
function IntroTerminal({ onStart }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#181818',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          background: '#222',
          border: '2px solid #0f0',
          borderRadius: 16,
          padding: '48px 32px 32px 32px',
          boxShadow: '0 0 24px #000a',
          minWidth: 400,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#00ff00',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: 64,
            letterSpacing: 8,
            marginBottom: 32,
            textShadow: '0 0 16px #0f0, 0 0 8px #0f0, 0 0 2px #0f0',
            userSelect: 'none',
            lineHeight: 1.1,
          }}
        >
          FLAPPY<br />THUG
        </div>
        {/* ข้อความเครดิต */}
        <div
          style={{
            marginBottom: 28,
            color: '#00ff6a',
            fontSize: 18,
            fontFamily: 'monospace',
            opacity: 0.7,
            textShadow: '0 0 6px #00ff6a',
            letterSpacing: 1,
          }}
        >
          by 404SkillNotFound (kev)
        </div>
        <button
          onClick={onStart}
          style={{
            marginTop: 0,
            padding: '18px 56px',
            fontSize: 28,
            borderRadius: 12,
            border: 'none',
            background: '#00ff00',
            color: '#181818',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 12px #0007',
            letterSpacing: 2,
            transition: 'background 0.2s',
            textShadow: '0 0 2px #0f0',
          }}
        >
          Play Now
        </button>
      </div>
    </div>
  );
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 32; // ลดขนาดจาก 40 เหลือ 32
const GRAVITY = 1.2;
const JUMP_HEIGHT = 60;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 3;

// กระสุน
const BULLET_SPEED = 10;
const BULLET_RADIUS = 7;

// Object ศัตรู
const ENEMY_SIZE = 36;
const ENEMY_TYPES = ['star', 'triangle', 'square'];

function getRandomPipeY() {
  return Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;
}
function getRandomEnemyY() {
  return Math.floor(Math.random() * (GAME_HEIGHT - ENEMY_SIZE - 40)) + 20;
}
function getRandomEnemyType() {
  return ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
}
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function App() {
  
  
  // 1. ประกาศ useState/useEffect ทั้งหมดไว้บนสุดของฟังก์ชัน
  // เพิ่ม state สำหรับ intro
  const [showIntro, setShowIntro] = useState(true);
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([{ x: GAME_WIDTH, y: getRandomPipeY() }]);
  const [score, setScore] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem('flappyThugHighScore')) || 0
  );

  // Mouse aiming
  const [mouse, setMouse] = useState({ x: 200, y: 300 });

  // กระสุน
  const [bullets, setBullets] = useState([]);

  // Enemy objects
  const [enemies, setEnemies] = useState([]);

  // ข้อความสนับสนุน (UI)
  const [showDonateMsg, setShowDonateMsg] = useState(false);

  // เพชร
  const [diamonds, setDiamonds] = useState([]); // <<--- ให้เหลือแค่บรรทัดนี้

// วาง useEffect นี้ตรงนี้!
useEffect(() => {
  if (gameOver || showIntro) return;
  let timeoutId;

  function spawnDiamond() {
    setDiamonds((old) => {
      let maxX = -Infinity;
      let targetPipe = null;
      pipes.forEach((pipe) => {
        if (pipe.x > maxX) {
          maxX = pipe.x;
          targetPipe = pipe;
        }
      });
      if (targetPipe) {
        return [
          ...old,
          {
            x: targetPipe.x + PIPE_WIDTH / 2,
            y: targetPipe.y + PIPE_GAP / 2,
            id: Math.random().toString(36).slice(2),
          },
        ];
      }
      return old;
    });
    timeoutId = setTimeout(spawnDiamond, Math.random() * 5000 + 5000);
  }

  timeoutId = setTimeout(spawnDiamond, Math.random() * 5000 + 5000);

  return () => clearTimeout(timeoutId);
}, [gameOver, showIntro, pipes]); // เพิ่ม pipes

  const [diamondEffect, setDiamondEffect] = useState(null);

  // ผลของการโดนกระสุนศัตรู
  const [enemyHitEffect, setEnemyHitEffect] = useState(null); // <--- เพิ่ม

  const gameRef = useRef();

  // Bird gravity and movement
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setBirdY((prev) => {
        const nextY = prev + velocity;
        if (nextY < 0) return 0;
        if (nextY + BIRD_SIZE > GAME_HEIGHT) {
          setGameOver(true);
          return GAME_HEIGHT - BIRD_SIZE;
        }
        return nextY;
      });
      setVelocity((v) => v + GRAVITY);
    }, 24);
    return () => clearInterval(interval);
  }, [velocity, gameOver]);

  // Pipes movement
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setPipes((oldPipes) => {
        let newPipes = oldPipes
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          newPipes.push({ x: GAME_WIDTH, y: getRandomPipeY() });
        }
        return newPipes;
      });
    }, 24);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Enemy spawn & movement
  useEffect(() => {
    if (gameOver) return;
    // ปรับความยากเมื่อคะแนนเกิน 200
    const isHard = score >= 200;
    const maxEnemies = isHard
      ? Math.min(4 + Math.floor((score - 200) / 25), 6) // สูงสุด 6 ตัว
      : Math.min(1 + Math.floor(score / 20), 4);        // สูงสุด 4 ตัว
    const baseInterval = isHard
      ? Math.max(500 - (score - 200) * 2, 90)           // ถี่ขึ้น
      : Math.max(900 - score * 5, 220);

    const spawnInterval = setInterval(() => {
      setEnemies((old) => {
        if (old.length >= maxEnemies) return old;
        return [
          ...old,
          {
            x: GAME_WIDTH + ENEMY_SIZE,
            y: getRandomEnemyY(),
            type: getRandomEnemyType(),
            id: Math.random().toString(36).slice(2),
          },
        ];
      });
    }, baseInterval);
    return () => clearInterval(spawnInterval);
  }, [gameOver, score]);

  // Enemy movement
  useEffect(() => {
    if (gameOver) return;
    const isHard = score >= 200;
    const speedUp = isHard ? 1.2 : 1;
    const interval = setInterval(() => {
      setEnemies((old) =>
        old
          .map((e) => ({
            ...e,
            x: e.x - (3.5 + score * 0.02) * speedUp,
          }))
          .filter((e) => e.x + ENEMY_SIZE > 0)
      );
    }, 24);
    return () => clearInterval(interval);
  }, [gameOver, score]);

  // Bullet movement
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setBullets((old) =>
        old
          .map((b) => ({
            ...b,
            x: b.x + b.vx,
            y: b.y + b.vy,
          }))
          .filter(
            (b) =>
              b.x > -BULLET_RADIUS &&
              b.x < GAME_WIDTH + BULLET_RADIUS &&
              b.y > -BULLET_RADIUS &&
              b.y < GAME_HEIGHT + BULLET_RADIUS
          )
      );
    }, 16);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Collision detection & scoring (ผ่านท่อ)
  useEffect(() => {
    if (gameOver) return;
    pipes.forEach((pipe) => {
      // Bird within pipe X range
      if (
        pipe.x < 80 && pipe.x + PIPE_WIDTH > 40 // Bird X position
      ) {
        // Bird hits pipe
        if (
          birdY < pipe.y || birdY + BIRD_SIZE > pipe.y + PIPE_GAP
        ) {
          setGameOver(true);
        }
      }
      // Score
      if (pipe.x + PIPE_WIDTH === 40) {
        setScore((s) => s + 2); // ได้ 2 คะแนนเมื่อผ่านท่อ
      }
    });
  }, [pipes, birdY, gameOver]);

  // Collision: bullet vs enemy, enemy vs bird
  useEffect(() => {
    if (gameOver) return;
    setEnemies((enemiesOld) =>
      enemiesOld.filter((enemy) => {
        // ชนกับ bird?
        const birdCenter = { x: 40 + BIRD_SIZE / 2, y: birdY + BIRD_SIZE / 2 };
        const enemyCenter = { x: enemy.x + ENEMY_SIZE / 2, y: enemy.y + ENEMY_SIZE / 2 };
        if (distance(birdCenter.x, birdCenter.y, enemyCenter.x, enemyCenter.y) < (BIRD_SIZE + ENEMY_SIZE) / 2) {
          setGameOver(true);
          return false;
        }
        // ชนกับกระสุน?
        const hitBulletIndex = bullets.findIndex(
          (b) =>
            distance(b.x, b.y, enemyCenter.x, enemyCenter.y) <
            ENEMY_SIZE / 2 + BULLET_RADIUS
        );
        if (hitBulletIndex !== -1) {
          setScore((s) => s + 5); // ได้ 5 คะแนนเมื่อยิงศัตรู
          setEnemyHitEffect({ x: enemyCenter.x, y: enemyCenter.y, ts: Date.now() });
          setBullets((bulletsOld) => bulletsOld.filter((_, i) => i !== hitBulletIndex));
          return false;
        }
        return true;
      })
    );
  }, [bullets, enemies, birdY, gameOver]);

  // ตรวจจับชนเพชร
  useEffect(() => {
    if (gameOver || showIntro) return;
    setDiamonds((old) => {
      let hit = null;
      const newDiamonds = old.filter((d) => {
        const dx = d.x - (40 + BIRD_SIZE / 2);
        const dy = d.y - (birdY + BIRD_SIZE / 2);
        if (Math.sqrt(dx * dx + dy * dy) < (BIRD_SIZE / 2 + 18)) {
          hit = d;
          return false;
        }
        return true;
      });
      if (hit) {
        setScore((s) => s + 20);
        setDiamondEffect({ x: hit.x, y: hit.y, ts: Date.now() });
      }
      return newDiamonds;
    });
  }, [birdY, diamonds, gameOver, showIntro]);

  // เพิ่มฟังก์ชัน handleShoot
  function handleShoot(e) {
    if (gameOver || showIntro) return;
    const rect = gameRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const birdX = 40 + BIRD_SIZE / 2;
    const birdYCenter = birdY + BIRD_SIZE / 2;
    const dx = mouseX - birdX;
    const dy = mouseY - birdYCenter;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const vx = (dx / len) * BULLET_SPEED;
    const vy = (dy / len) * BULLET_SPEED;
    setBullets((old) => [
      ...old,
      {
        x: birdX,
        y: birdYCenter,
        vx,
        vy,
        id: Math.random().toString(36).slice(2),
      },
    ]);
  }

  // Jump & restart control
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === 'Space') {
        if (gameOver) {
          // รีสตาร์ทเกม
          setScore(0);
          setBirdY(GAME_HEIGHT / 2);
          setVelocity(0);
          setPipes([{ x: GAME_WIDTH, y: getRandomPipeY() }]);
          setEnemies([]);
          setBullets([]);
          setDiamonds([]);
          setDiamondEffect(null);
          setEnemyHitEffect(null);
          setGameOver(false);
        } else {
          // กระโดด
          setVelocity(-JUMP_HEIGHT / 6);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  // เพิ่ม useEffect นี้ไว้ใต้ useState ต่างๆ
useEffect(() => {
  if (score > highScore) {
    setHighScore(score);
    localStorage.setItem('flappyThugHighScore', score);
  }
}, [score, highScore]);

  // ห้ามมี useState/useEffect หลังบรรทัดนี้
  if (showIntro) {
    return <IntroTerminal onStart={() => setShowIntro(false)} />;
  }

  return (
    <>
      <div
        className="App"
        style={{
          background: '#222',
          height: GAME_HEIGHT,
          width: GAME_WIDTH,
          margin: '40px auto',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          border: '4px solid #444',
          boxShadow: '0 0 24px #000a',
          userSelect: 'none',
        }}
        tabIndex={0}
        ref={gameRef}
        onMouseMove={(e) => {
          if (!gameRef.current) return;
          const rect = gameRef.current.getBoundingClientRect();
          setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseDown={handleShoot}
      >
        {/* Bird */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: birdY,
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            background: 'gold',
            borderRadius: '50%',
            border: '3px solid #000',
            boxShadow: '0 2px 8px #0007',
            zIndex: 2,
          }}
        />
        {/* Gun direction line */}
        <svg
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 1 }}
        >
          <line
            x1={40 + BIRD_SIZE / 2}
            y1={birdY + BIRD_SIZE / 2}
            x2={mouse.x}
            y2={mouse.y}
            stroke="#0ff"
            strokeWidth="4"
            strokeDasharray="10 8"
          />
        </svg>
        {/* Bullets */}
        {bullets.map((b) => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: b.x - BULLET_RADIUS,
              top: b.y - BULLET_RADIUS,
              width: BULLET_RADIUS * 2,
              height: BULLET_RADIUS * 2,
              background: '#fff',
              borderRadius: '50%',
              border: '2px solid #0ff',
              boxShadow: '0 0 8px #0ffb',
              zIndex: 3,
            }}
          />
        ))}
        {/* Enemies */}
        {enemies.map((enemy) => (
  <svg
    key={enemy.id}
    x={enemy.x}
    y={enemy.y}
    width={ENEMY_SIZE}
    height={ENEMY_SIZE}
    style={{
      position: 'absolute',
      left: enemy.x,
      top: enemy.y,
      zIndex: 10,
      filter: 'drop-shadow(0 0 8px #0ff8)'
    }}
  >
    {enemy.type === 'star' && (
      <polygon
        points="18,2 22,14 35,14 24,21 28,33 18,26 8,33 12,21 1,14 14,14"
        fill="#ffd700"
        stroke="#fff"
        strokeWidth="2"
      />
    )}
    {enemy.type === 'triangle' && (
      <polygon
        points="18,4 32,32 4,32"
        fill="#0ff"
        stroke="#fff"
        strokeWidth="2"
      />
    )}
    {enemy.type === 'square' && (
      <rect
        x="6"
        y="6"
        width="24"
        height="24"
        fill="#f44"
        stroke="#fff"
        strokeWidth="2"
        rx="5"
      />
    )}
  </svg>
))}
        {/* Pipes */}
        {pipes.map((pipe, idx) => (
          <React.Fragment key={idx}>
            {/* Top pipe */}
            <div
              style={{
                position: 'absolute',
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.y,
                background: '#0a0',
                border: '2px solid #030',
                borderRadius: '8px 8px 0 0',
                zIndex: 0,
              }}
            />
            {/* Bottom pipe */}
            <div
              style={{
                position: 'absolute',
                left: pipe.x,
                top: pipe.y + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - pipe.y - PIPE_GAP,
                background: '#0a0',
                border: '2px solid #030',
                borderRadius: '0 0 8px 8px',
                zIndex: 0,
              }}
            />
          </React.Fragment>
        ))}
        {/* Diamonds */}
        {diamonds.map((d) => (
  <img
    key={d.id}
    src={diamondImg}
    alt="diamond"
    style={{
      position: 'absolute',
      left: d.x - 18,
      top: d.y - 18,
      width: 36,
      height: 36,
      zIndex: 5,
      filter: 'drop-shadow(0 0 8px #0ff8)',
      pointerEvents: 'none',
      userSelect: 'none',
    }}
    draggable={false}
  />
))}

        {/* effect +20 ตอนเก็บเพชร */}
        {diamondEffect && Date.now() - diamondEffect.ts < 700 && (
          <div
            style={{
              position: 'absolute',
              left: diamondEffect.x - 10,
              top: diamondEffect.y - 32,
              color: '#00ffe7',
              fontWeight: 'bold',
              fontSize: 24,
              textShadow: '0 0 8px #00ffe7, 0 0 2px #fff',
              zIndex: 100,
              pointerEvents: 'none',
              animation: 'fadeUp 0.7s',
            }}
          >
            +20
          </div>
        )}

        {/* effect +5 ตอนยิงถูกศัตรู */}
        {enemyHitEffect && Date.now() - enemyHitEffect.ts < 600 && (
          <div
            style={{
              position: 'absolute',
              left: enemyHitEffect.x - 10,
              top: enemyHitEffect.y - 32,
              color: '#ff0',
              fontWeight: 'bold',
              fontSize: 24,
              textShadow: '0 0 8px #ff0, 0 0 2px #fff',
              zIndex: 100,
              pointerEvents: 'none',
              animation: 'fadeUp 0.6s',
            }}
          >
            +5
          </div>
        )}

        {/* Score */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: '#fff',
            fontSize: 32,
            fontWeight: 'bold',
            textShadow: '2px 2px 8px #000',
            zIndex: 10,
          }}
        >
          {score}
          <div style={{ fontSize: 18, fontWeight: 'normal', marginTop: 4 }}>
            Highest: {highScore}
          </div>
        </div>
        {/* Game Over */}
        {gameOver && (
          <div
            style={{
              position: 'absolute',
              top: GAME_HEIGHT / 2 - 60,
              left: 0,
              width: '100%',
              textAlign: 'center',
              color: '#fff',
              fontSize: 36,
              fontWeight: 'bold',
              textShadow: '2px 2px 8px #000',
              background: '#000a',
              padding: 24,
              borderRadius: 16,
              zIndex: 20,
            }}
          >
            GAME OVER<br />
            <span style={{ fontSize: 20 }}>Click or press Space to restart</span>
          </div>
        )}

        {/* ข้อความสนับสนุน (UI) */}
        {showDonateMsg && (
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              zIndex: 3000,
              background: 'rgba(24,24,24,0.97)',
              borderRadius: 16,
              padding: '24px 28px 18px 28px',
              color: '#fff',
              boxShadow: '0 4px 32px #000a',
              minWidth: 320,
              maxWidth: 340,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.6,
              border: '2px solid #ffdd00',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#ffdd00', fontSize: 22, marginBottom: 8 }}>
              สนับสนุนค่าไฟเพื่อเป็นกำลังใจให้ผมได้ที่
            </div>
            <div style={{ margin: '8px 0', fontWeight: 'bold', fontSize: 20 }}>
              บัญชีไทยพาณิชย์ SCB : <span style={{ color: '#00ff6a' }}>4058454859</span>
            </div>
            <div style={{ margin: '8px 0', fontSize: 16 }}>
              หรือโดเนทผ่านลิงค์นี้<br />
              <a
                href="https://buymeacoffee.com/kevstarzzz"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00ffea', textDecoration: 'underline', wordBreak: 'break-all' }}
              >
                https://buymeacoffee.com/kevstarzzz
              </a>
            </div>
            <div style={{ color: '#00ff6a', fontWeight: 'bold', marginTop: 10, fontSize: 18 }}>
              ขอบคุณมากครับ
            </div>
            <button
              onClick={() => setShowDonateMsg(false)}
              style={{
                marginTop: 18,
                padding: '8px 28px',
                fontSize: 16,
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(90deg, #ffdd00 0%, #ff8800 100%)',
                color: '#222',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 12px #0007',
                letterSpacing: 1,
                transition: 'background 0.2s',
              }}
            >
              ปิด
            </button>
          </div>
        )}
      </div>

      {/* วิธีเล่นและปุ่มควบคุม */}
      <div
        style={{
          width: GAME_WIDTH,
          margin: '16px auto 0 auto',
          background: '#181818',
          color: '#fff',
          borderRadius: 12,
          padding: '18px 24px 14px 24px',
          fontSize: 18,
          boxShadow: '0 2px 12px #0007',
          textAlign: 'left',
          lineHeight: 1.7,
          border: '2px solid #333',
          maxWidth: '95vw',
        }}
      >
        <b>วิธีเล่น:</b><br />
        - กด <b>Space</b> เพื่อกระโดด<br />
        - คลิกเมาส์เพื่อยิงศัตรู<br />
        - เล็งด้วยเมาส์ (เส้นสีฟ้า)<br />
        - เก็บเพชรเพื่อคะแนนพิเศษ<br />
        - ถ้าตาย กด <b>Space</b> หรือคลิกที่หน้าจอเพื่อเริ่มใหม่<br />
      </div>

      {/* ปุ่ม Buy me a coffee / donation */}
      {!showIntro && (
        <button
          style={{
            position: 'fixed',
            right: 32,
            bottom: 32,
            zIndex: 2000,
            background: 'linear-gradient(90deg, #ffdd00 0%, #ff8800 100%)',
            color: '#222',
            border: 'none',
            borderRadius: 24,
            fontWeight: 'bold',
            fontSize: 20,
            padding: '12px 32px',
            boxShadow: '0 2px 16px #ffdd0088, 0 0 2px #ff8800',
            cursor: 'pointer',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.2s, color 0.2s',
          }}
          onClick={() => setShowDonateMsg(true)}
        >
          ☕ buy me a coffee / donation
        </button>
      )}
    </>
  );
}

export default App;