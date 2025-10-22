import React from 'react'

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Main gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black to-black/10" />
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{backgroundColor: 'rgba(2, 45, 33, 0.05)'}} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: 'rgba(2, 45, 33, 0.05)'}} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="h-full w-full bg-[linear-gradient(rgba(2,45,33,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(2,45,33,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      
      {/* Animated SVG curves */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(2, 45, 33, 0)" />
            <stop offset="50%" stopColor="rgba(2, 45, 33, 0.3)" />
            <stop offset="100%" stopColor="rgba(2, 45, 33, 0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 300 Q300 250 600 300 T1200 300"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M0 500 Q300 450 600 500 T1200 500"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse delay-500"
        />
      </svg>
    </div>
  )
}

export default AnimatedBackground