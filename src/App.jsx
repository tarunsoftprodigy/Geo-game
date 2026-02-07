import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RegionSelector from './RegionSelector';
import europeMapData from './map_data.json';
import asiaMapData from './asia_map_data.json';
import './App.css';

// Region configurations
const REGION_CONFIG = {
  europe: {
    viewbox: "-12 -70 55 35",
    mapData: europeMapData,
    colors: {
      "France": "#FF61D2",
      "Germany": "#4D96FF",
      "Italy": "#6BCB77",
      "Spain": "#FFD93D",
      "United Kingdom": "#FF9F43",
      "Poland": "#00D2D3",
      "Netherlands": "#54A0FF",
      "Belgium": "#A155E1",
      "Switzerland": "#FF5252",
      "Austria": "#1DD1A1",
      "Czechia": "#F368E0",
      "Portugal": "#FECA57",
      "Greece": "#48DBFB",
      "Sweden": "#FFCC00",
      "Norway": "#778BEB"
    }
  },
  asia: {
    viewbox: "50 -55 92 60",
    mapData: asiaMapData,
    colors: {
      "China": "#FF6B6B",
      "India": "#4ECDC4",
      "Japan": "#FF61D2",
      "South Korea": "#95E1D3",
      "Indonesia": "#F38181",
      "Thailand": "#AA96DA",
      "Vietnam": "#FCBAD3",
      "Philippines": "#A8D8EA",
      "Malaysia": "#FFD93D",
      "Bangladesh": "#6BCB77"
    }
  }
};

function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [placed, setPlaced] = useState([]);
  const [showWin, setShowWin] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Get current region config
  const config = selectedRegion ? REGION_CONFIG[selectedRegion] : null;
  const mapData = config?.mapData;
  const VIEWBOX = config?.viewbox;
  const COUNTRY_COLORS = config?.colors;
  
  const targetCountries = mapData ? Object.keys(mapData.countries) : [];
  const totalCountries = targetCountries.length;

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setPlaced([]);
    setShowWin(false);
  };

  const handleSnap = (name) => {
    if (!placed.includes(name)) {
      setPlaced(prev => [...prev, name]);
      setFeedback({ text: `YAY! ${name.toUpperCase()}!`, type: 'success' });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleError = () => {
    setFeedback({ text: "OOPS! MISS!", type: 'error' });
    setTimeout(() => setFeedback(null), 1000);
  };

  useEffect(() => {
    if (placed.length === totalCountries && totalCountries > 0) {
      setTimeout(() => setShowWin(true), 800);
    }
  }, [placed.length, totalCountries]);

  const reset = () => {
    setPlaced([]);
    setShowWin(false);
  };

  const changeRegion = () => {
    setSelectedRegion(null);
    setPlaced([]);
    setShowWin(false);
  };

  // Show region selector if no region selected
  if (!selectedRegion) {
    return <RegionSelector onSelectRegion={handleRegionSelect} />;
  }

  const countriesList = targetCountries.sort();

  return (
    <div className="game-layout">
      {/* 
        LOGICAL FIX: Map is now first in DOM.
        In CSS we will use row-reverse to move it back to the right visually.
      */}
      <main className="main-view">
        <div className="header-stats">
          <div className="glass-pill">
            <span className="pill-value">{placed.length} / {totalCountries}</span>
          </div>
        </div>

        <div className="map-container">
          <svg viewBox={VIEWBOX} className="main-svg">
            {mapData.base_map.map((country, idx) => (
              <path 
                key={idx} 
                d={country.path} 
                className="country-base"
              />
            ))}

            {/* Drop zone borders for unplaced countries */}
            {targetCountries.filter(name => !placed.includes(name)).map(name => {
              const data = mapData.countries[name];
              const path = typeof data === 'string' ? data : data.path;
              return (
                <path 
                  key={`dropzone-${name}`}
                  d={path} 
                  className="country-dropzone"
                  style={{ 
                    fill: 'none',
                    stroke: "#9a9a9a",
                    strokeWidth: '0.05',
                    strokeDasharray: '1 0.5',
                    opacity: 0.6
                  }}
                />
              );
            })}

            {/* Placed countries */}
            {placed.map(name => {
              const data = mapData.countries[name];
              const path = typeof data === 'string' ? data : data.path;
              return (
                <motion.path 
                  key={`placed-${name}`}
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  d={path} 
                  className="country-active"
                  style={{ 
                    fill: COUNTRY_COLORS[name] ,
                  }}
                />
              );
            })}
          </svg>
        </div>
      </main>

      <aside className="sidebar">
        <h1>MAP FUN!</h1>
        <p className="description">
          Drag the colorful countries to the map!
        </p>
        
        <div className="country-grid">
          {countriesList.map(name => (
            <DraggableCountry 
              key={name} 
              name={name} 
              data={mapData.countries[name]} 
              color={COUNTRY_COLORS[name] || "#ccc"}
              isPlaced={placed.includes(name)}
              onSnap={() => handleSnap(name)}
              onError={handleError}
              viewbox={VIEWBOX}
            />
          ))}
        </div>

        <div className="sidebar-button-container">
        <button className="reset-button" onClick={reset}>START OVER</button>
        <button className="change-region-button" onClick={changeRegion}>CHANGE REGION</button>
        </div>
      </aside>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: -100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="feedback-toast"
            style={{ background: feedback.type === 'success' ? '#22c55e' : '#ef4444' }}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWin && (
          <motion.div className="win-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="modal-content" initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }}>
              <h2>⭐ AMAZING! ⭐</h2>
              <p>You found all {totalCountries} countries!</p>
              <button className="reset-button" onClick={reset}>PLAY AGAIN!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DraggableCountry({ name, data, color, isPlaced, onSnap, onError, viewbox }) {
  const path = typeof data === 'string' ? data : data.path;
  const bounds = typeof data === 'object' ? data.bounds : null;
  const viewBox = bounds ? `${bounds.x - 1} ${bounds.y - 1} ${bounds.width + 2} ${bounds.height + 2}` : viewbox;
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDragEnd = (event, info) => {
  setIsDragging(false);
  
  if (!bounds) {
    onError();
    return;
  }

  const mapElement = document.querySelector('.main-svg');
  if (!mapElement) return;

  const rect = mapElement.getBoundingClientRect();
  const [vbX, vbY, vbW, vbH] = viewbox.split(' ').map(Number);
  const scaleX = vbW / rect.width;
  const scaleY = vbH / rect.height;

  const dropX = vbX + (info.point.x - rect.left) * scaleX;
  const dropY = vbY + (info.point.y - rect.top) * scaleY;

  const buffer = 2;
  if (dropX >= bounds.x - buffer && 
      dropX <= (bounds.x + bounds.width) + buffer &&
      dropY >= bounds.y - buffer && 
      dropY <= (bounds.y + bounds.height) + buffer) {
    onSnap();
  } else {
    onError();
  }
};

  return (
    <>
      <div className={`drag-card ${isPlaced ? 'placed' : ''}`}>
        <motion.div
          drag
          dragSnapToOrigin
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDrag={(e, info) => setPosition(info.point)}
          onDragEnd={handleDragEnd}
          whileDrag={{ 
            scale: 1.05,
            cursor: 'grabbing',
            opacity: 0
          }}
          style={{ width: '100%', height: '80px' }}
        >
          <svg viewBox={viewBox} className="country-icon">
            <path d={path} style={{ fill: color }} />
          </svg>
        </motion.div>
      </div>
      
      {isDragging && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          left: position.x - 40,
          top: position.y - 40,
          width: '100px',
          height: '100px',
          pointerEvents: 'none',
          zIndex: 99999
        }}>
          <svg viewBox={viewBox} style={{ width: '100%', height: '100%' }}>
            <path d={path} style={{ fill: color }} />
          </svg>
        </div>,
        document.body
      )}
    </>
  );
}

export default App;
