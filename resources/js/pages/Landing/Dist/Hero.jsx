import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export function Hero({ onContactClick, onLoginClick }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0.8]);
  // "curtain" clip that grows upward as you scroll to cover the video
  const curtainClip = useTransform(scrollYProgress, [0, 1], ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Background motion layer */}
      <motion.video
        autoPlay
        muted
        loop
        playsInline
        className="landingHeroVideo"
        style={{
          y,
          scale,
          opacity,
        }}
      >
        <source src="/storage/assets/background.mp4" type="video/mp4" />
      </motion.video>

      {/* Curtain that slides up as you scroll to "close" over the video */}
      <motion.div
        className="absolute inset-0"
        style={{
          clipPath: curtainClip,
          background: 'linear-gradient(180deg, rgba(10,10,10,0.9), rgba(10,10,10,1))',
          zIndex: 5,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-white"
          >
            CV AJAT
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onLoginClick}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            Login
          </motion.button>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            >
              Building Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Future Together
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              Premier construction project management solutions for modern
              infrastructure
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <button
                onClick={onContactClick}
                className="group px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
              >
                Start Your Project
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={() => {
                  document
                    .getElementById('services')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="pb-8 text-center"
        >
          <div className="inline-block animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
