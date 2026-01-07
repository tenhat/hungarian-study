'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MusicVisualizer } from './music-visualizer';

interface BGMPlayerProps {
  src?: string;
  initialVolume?: number;
}

export function BGMPlayer({ 
  src = '/sounds/bgm.mp3',
  initialVolume = 0.5 
}: BGMPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = initialVolume;
    
    // Attempt autoplay if initial state is playing
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("Autoplay blocked by browser policy, trying muted:", e);
          // Fallback to muted autoplay
          audio.muted = true;
          setIsMuted(true);
          const mutedPromise = audio.play();
          if (mutedPromise !== undefined) {
             mutedPromise.catch(e2 => {
                console.error("Muted autoplay also failed:", e2);
                setIsPlaying(false);
             });
          }
        });
      }
    }
    
    const handleCanPlay = () => setIsLoading(false);
    
    if (audio.readyState >= 3) {
      setIsLoading(false);
    }
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [initialVolume]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        console.error("Autoplay failed:", e);
        // Might need user interaction
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  // if (hasError) return null; // Do not hide, show error state instead

  return (
    <div className="fixed top-6 left-6 z-40">
      <audio ref={audioRef} src={src} loop />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative group"
      >
        <Button
          onClick={togglePlay}
          disabled={isLoading || hasError}
          className={cn(
            "rounded-full w-12 h-12 p-0 shadow-lg transition-all duration-300",
            hasError ? "bg-red-50 text-red-400 cursor-not-allowed" :
            isPlaying 
              ? "bg-accent-pink text-white hover:bg-accent-pink/90 hover:scale-105" 
              : "bg-white text-text/40 hover:text-text hover:bg-white/90"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : hasError ? (
            <div className="relative group/error">
              <VolumeX className="w-5 h-5" />
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/error:opacity-100 transition-opacity pointer-events-none">
                Audio Error
              </div>
            </div>
          ) : (
            <div className="relative">
              <Music className={cn(
                "w-5 h-5 transition-transform duration-500",
                isPlaying && "animate-bounce"
              )} />
              {/* Animated Notes */}
              <AnimatePresence>
                {isPlaying && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], y: -20, x: 10, scale: 1 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Music className="w-3 h-3 text-accent-yellow" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], y: -15, x: -10, scale: 0.8 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                      className="absolute -top-3 -left-1"
                    >
                      <Music className="w-2 h-2 text-accent-green" />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </Button>

        {/* Mute Control Mini Button (Visible on Hover/Playing/Muted) */}
        <AnimatePresence>
          {(isPlaying || !isMuted || isMuted) && (
            <motion.button
              initial={{ opacity: 0, scale: 0, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: -10 }}
              onClick={toggleMute}
              className={cn(
                "absolute -right-2 -bottom-2 rounded-full p-1.5 shadow-md border transition-colors duration-300",
                isMuted 
                  ? "bg-red-100 text-red-500 border-red-200 animate-pulse" 
                  : "bg-white text-text/60 hover:text-text border-gray-100"
              )}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Background Visualizer Effects */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <MusicVisualizer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
