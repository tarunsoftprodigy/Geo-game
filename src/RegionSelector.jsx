import React from 'react';
import { motion } from 'framer-motion';
import './RegionSelector.css';

function RegionSelector({ onSelectRegion }) {
  const regions = [
    {
      id: 'europe',
      name: 'Europe',
      emoji: '🗺️',
      description: '15 Cool Countries!',
      color: '#FF6B9D'
    },
    {
      id: 'asia',
      name: 'Asia',
      emoji: '🌏',
      description: '10 Amazing Places!',
      color: '#4ECDC4'
    }
  ];

  return (
    <div className="region-selector-overlay">
      <motion.div 
        className="fun-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <motion.h1 
          className="fun-title"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🎮 Pick Your Adventure! 🌍
        </motion.h1>
        <p className="fun-subtitle">Where do you want to explore today?</p>
        
        <div className="region-cards-fun">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              className="region-card-fun"
              style={{ '--card-color': region.color }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                type: "spring",
                stiffness: 500
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectRegion(region.id)}
            >
              <motion.div 
                className="card-emoji"
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {region.emoji}
              </motion.div>
              <h2 className="card-name">{region.name}</h2>
              <p className="card-description">{region.description}</p>
              <div className="card-button">LET'S GO! 🚀</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default RegionSelector;
