'use client';

import { motion } from 'framer-motion';
import { Music, Star, Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Possible icons for the particles
const icons = [Music, Star, Heart];
// Colors for the particles (Pop & Cute palette)
const colors = [
  'text-accent-pink',
  'text-accent-yellow',
  'text-accent-green',
  'text-blue-300',
  'text-purple-300'
];

interface Particle {
  id: number;
  x: number; // percentage 0-100
  size: number;
  Icon: React.ElementType;
  color: string;
  duration: number;
  delay: number;
}

export function MusicVisualizer() {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles on mount
  useEffect(() => {
    // Creating a fixed set of particles to float up repeatedly
    const newParticles: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5, // 5% to 95% width
      size: Math.random() * 20 + 10, // 10px to 30px
      Icon: icons[Math.floor(Math.random() * icons.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 4 + 4, // 4s to 8s float time
      delay: Math.random() * 5, // 0s to 5s start delay
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute bottom-[-50px] ${p.color}`}
          style={{ left: `${p.x}%` }}
          initial={{ y: 0, opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            y: -1000, 
            opacity: [0, 0.8, 0], // Fade in then out
            scale: [0.5, 1, 0.8],
            rotate: [0, 45, -45, 0], // Wiggle effect
            x: [0, 20, -20, 0] // Sway effect
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        >
          <p.Icon style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}
    </div>
  );
}
