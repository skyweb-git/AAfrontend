"use client"; 

import React, { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

function NavHeader({ onAccountClick }) {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [hoveredPath, setHoveredPath] = useState(null);
  const location = useLocation();

  const navItems = useMemo(() => [
    { to: '/art', label: 'Art' },
    { to: '/', label: 'Artist' },
    { to: '/events', label: 'Events' },
    { to: '/art-district', label: 'ArtDistrict' }
  ], []);

  // Set initial position for active link
  React.useEffect(() => {
    const activeItem = navItems.find(item => item.to && location.pathname === item.to);
    if (activeItem) {
      // Find the active tab element and set its position
      const activeTab = document.querySelector(`[href="${activeItem.to}"]`);
      if (activeTab) {
        const tabLi = activeTab.closest('li');
        if (tabLi) {
          const { width } = tabLi.getBoundingClientRect();
          setPosition({
            width,
            opacity: 1,
            left: tabLi.offsetLeft,
          });
        }
      }
    }
  }, [location.pathname, navItems]);

  return (
    <ul
      className="relative mx-auto flex flex-nowrap items-center gap-1 rounded-full border border-gray-200/80 bg-white/95 backdrop-blur-xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden"
      onMouseLeave={() => {
        setHoveredPath(null);
        const activeItem = navItems.find(item => item.to && location.pathname === item.to);
        if (activeItem) {
          const activeTab = document.querySelector(`[href="${activeItem.to}"]`);
          if (activeTab) {
            const tabLi = activeTab.closest('li');
            if (tabLi) {
              const { width } = tabLi.getBoundingClientRect();
              setPosition({ width, opacity: 1, left: tabLi.offsetLeft });
            }
          }
        } else {
          setPosition((pv) => ({ ...pv, opacity: 0 }));
        }
      }}
    >
      {navItems.map((item) => (
        <Tab 
          key={item.to || item.label}
          setPosition={setPosition}
          to={item.to}
          onClick={item.onClick}
          isActive={item.to && location.pathname === item.to}
          hoveredPath={hoveredPath}
          setHoveredPath={setHoveredPath}
        >
          {item.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({
  children,
  setPosition,
  to,
  onClick,
  isActive,
  hoveredPath,
  setHoveredPath,
}) => {
  const ref = useRef(null);
  
  // Update position when tab becomes active
  React.useEffect(() => {
    if (isActive && ref.current) {
      const { width } = ref.current.getBoundingClientRect();
      setPosition({
        width,
        opacity: 1,
        left: ref.current.offsetLeft,
      });
    }
  }, [isActive, setPosition]);

  const tabId = to || children;

  let textColorClass = "text-gray-700 hover:text-gray-900";
  if (hoveredPath === null) {
    if (isActive) {
      textColorClass = "text-white font-semibold";
    }
  } else {
    if (hoveredPath === tabId) {
      textColorClass = "text-white font-semibold";
    } else if (isActive) {
      textColorClass = "text-brand font-semibold";
    }
  }

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;

        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
        setHoveredPath(tabId);
      }}
      className="relative z-10 block cursor-pointer px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap md:px-6 md:py-3 md:text-[13.5px]"
    >
      {to ? (
        <Link 
          to={to}
          className={`relative z-20 block transition-colors duration-200 ${textColorClass}`}
        >
          {children}
        </Link>
      ) : (
        <button 
          onClick={onClick}
          className={`relative z-20 block transition-colors duration-200 ${textColorClass}`}
        >
          {children}
        </button>
      )}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={position}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      className="absolute z-0 top-[5px] bottom-[7px] m-0 p-0 list-none leading-none rounded-full bg-brand shadow-md"
    />
  );
};

export default NavHeader;
