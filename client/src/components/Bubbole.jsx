import React from 'react'

const Bubbole = ({ count = 14 }) => {
  const bubbles = Array.from({ length: count }, (_, i) => {
    const size = 8 + ((i * 13) % 34);
    const left = (i * 71) % 100;
    const duration = 9 + ((i * 7) % 10);
    const delay = (i * 1.7) % 10;
    return (
      <span
        key={i}
        className="bubbles"
        style={{
          width: size,
          height: size,
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{bubbles}</div>
}

export default Bubbole