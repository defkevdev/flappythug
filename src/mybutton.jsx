import React, { useRef, useState } from 'react';

function HomeMenu({ onStart, onSettings }) {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.5);

  // เล่นเสียงเมื่อ component โหลด
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      audioRef.current.play();
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [volume]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <audio ref={audioRef} src="sound/bg-music.mp3" />
      <h1 style={{ color: '#fff', fontSize: 48, marginBottom: 40, letterSpacing: 2 }}>
        Flappy Thug
      </h1>
      <button
        onClick={onStart}
        style={{
          padding: '16px 48px',
          fontSize: 24,
          borderRadius: 12,
          border: 'none',
          background: '#ffd700',
          color: '#222',
          fontWeight: 'bold',
          marginBottom: 24,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0007',
        }}
      >
        เริ่มเกม
      </button>
      <button
        onClick={onSettings}
        style={{
          padding: '12px 36px',
          fontSize: 20,
          borderRadius: 10,
          border: 'none',
          background: '#888',
          color: '#fff',
          fontWeight: 'bold',
          marginBottom: 32,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0005',
        }}
      >
        ตั้งค่า
      </button>
      <div style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>ปรับเสียง</div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={e => setVolume(Number(e.target.value))}
        style={{ width: 200 }}
      />
    </div>
  );
}

export default HomeMenu;
