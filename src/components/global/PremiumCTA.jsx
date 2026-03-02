import React from 'react';
import { motion } from 'framer-motion';
import styles from './css/premiumCTA.module.css';

const PremiumCTA = ({ 
  textEs, 
  textEn, 
  href = '#', 
  variant = 'primary', // 'primary' | 'ghost'
  showIcon = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.a
      href={href}
      className={`${styles.premiumCTA} ${styles[variant]} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* SVG Frame Mágico */}
      <svg 
        className={styles.svgFrame} 
        viewBox="0 0 200 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-pink)" />
            <stop offset="50%" stopColor="var(--md-purple)" />
            <stop offset="100%" stopColor="var(--md-blue)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Frame principal */}
        <rect 
          x="2" 
          y="2" 
          width="196" 
          height="56" 
          rx="28" 
          stroke="url(#magicGradient)" 
          strokeWidth="2"
          fill="none"
          className={styles.frameRect}
          filter="url(#glow)"
        />
        
        {/* Highlights animados (4 esquinas) */}
        <motion.circle
          cx="30"
          cy="30"
          r="3"
          fill="var(--md-yellow)"
          className={styles.highlight}
          animate={isHovered ? {
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.circle
          cx="170"
          cy="30"
          r="3"
          fill="var(--md-mint)"
          className={styles.highlight}
          animate={isHovered ? {
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        />
      </svg>

      {/* Contenido del botón */}
      <span className={styles.content}>
        {showIcon && (
          <motion.span 
            className={styles.iconLeft}
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.6 }}
          >
            ✦
          </motion.span>
        )}
        <span className={styles.text}>
          {textEs || textEn}
        </span>
        <motion.span 
          className={styles.iconRight}
          animate={isHovered ? { x: 4 } : { x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          →
        </motion.span>
      </span>

      {/* Shimmer effect */}
      <motion.div 
        className={styles.shimmer}
        animate={isHovered ? { x: ['0%', '200%'] } : { x: '0%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.a>
  );
};

export default PremiumCTA;
