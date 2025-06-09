import React from 'react';

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
          borderRadius: 12,
          padding: '48px 32px 32px 32px',
          boxShadow: '0 0 24px #000a',
          minWidth: 400,
          textAlign: 'center',
        }}
      >
        <pre
          style={{
            color: '#0f0',
            fontSize: 36,
            fontWeight: 'bold',
            letterSpacing: 4,
            marginBottom: 32,
            textShadow: '0 0 8px #0f08',
            userSelect: 'none',
          }}
        >
{`
███████╗██╗      █████╗ ██████╗ ██████╗ ██╗   ██╗    ████████╗██╗  ██╗██╗   ██╗ ██████╗ 
██╔════╝██║     ██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝    ╚══██╔══╝██║  ██║██║   ██║██╔═══██╗
█████╗  ██║     ███████║██████╔╝██████╔╝ ╚████╔╝        ██║   ███████║██║   ██║██║   ██║
██╔══╝  ██║     ██╔══██║██╔══██╗██╔══██╗  ╚██╔╝         ██║   ██╔══██║██║   ██║██║   ██║
██║     ███████╗██║  ██║██║  ██║██║  ██║   ██║          ██║   ██║  ██║╚██████╔╝╚██████╔╝
╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝          ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ 
`}
        </pre>
        <button
          onClick={onStart}
          style={{
            marginTop: 24,
            padding: '16px 48px',
            fontSize: 24,
            borderRadius: 10,
            border: 'none',
            background: '#0f0',
            color: '#181818',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0007',
            letterSpacing: 2,
            transition: 'background 0.2s',
          }}
        >
          เริ่มเกม
        </button>
      </div>
    </div>
  );
}

export default IntroTerminal;