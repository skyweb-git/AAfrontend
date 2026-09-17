"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { API_URL } from "../config";

// Color mapping for Tailwind classes - ensures colors are properly included in build
const COLOR_MAP = {
  // Background colors (with opacity)
  red: { bg: 'bg-brand/10', border: 'border-brand/30', solid: 'bg-brand' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', solid: 'bg-orange-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', solid: 'bg-amber-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', solid: 'bg-yellow-500' },
  lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/30', solid: 'bg-lime-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', solid: 'bg-green-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', solid: 'bg-emerald-500' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', solid: 'bg-teal-500' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', solid: 'bg-cyan-500' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', solid: 'bg-sky-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', solid: 'bg-blue-500' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', solid: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', solid: 'bg-violet-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', solid: 'bg-purple-500' },
  fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', solid: 'bg-fuchsia-500' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', solid: 'bg-pink-500' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', solid: 'bg-rose-500' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', solid: 'bg-slate-500' },
  gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', solid: 'bg-gray-500' },
  zinc: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', solid: 'bg-zinc-500' },
  neutral: { bg: 'bg-neutral-500/10', border: 'border-neutral-500/30', solid: 'bg-neutral-500' },
  stone: { bg: 'bg-stone-500/10', border: 'border-stone-500/30', solid: 'bg-stone-500' },
  white: { bg: 'bg-white', border: 'border-white/30', solid: 'bg-white' },
  black: { bg: 'bg-black/10', border: 'border-black/30', solid: 'bg-black' },
};

// Text color mapping
const TEXT_COLOR_MAP = {
  red: 'text-brand-800',
  orange: 'text-orange-800',
  amber: 'text-amber-800',
  yellow: 'text-yellow-800',
  lime: 'text-lime-800',
  green: 'text-green-800',
  emerald: 'text-emerald-800',
  teal: 'text-teal-800',
  cyan: 'text-cyan-800',
  sky: 'text-sky-800',
  blue: 'text-blue-800',
  indigo: 'text-indigo-800',
  violet: 'text-violet-800',
  purple: 'text-purple-800',
  fuchsia: 'text-fuchsia-800',
  pink: 'text-pink-800',
  rose: 'text-rose-800',
  slate: 'text-slate-800',
  gray: 'text-gray-800',
  zinc: 'text-zinc-800',
  neutral: 'text-neutral-800',
  stone: 'text-stone-800',
  white: 'text-white',
  black: 'text-black',
};

// Badge background mapping
const BADGE_BG_MAP = {
  red: 'bg-brand-100',
  orange: 'bg-orange-100',
  amber: 'bg-amber-100',
  yellow: 'bg-yellow-100',
  lime: 'bg-lime-100',
  green: 'bg-green-100',
  emerald: 'bg-emerald-100',
  teal: 'bg-teal-100',
  cyan: 'bg-cyan-100',
  sky: 'bg-sky-100',
  blue: 'bg-blue-100',
  indigo: 'bg-indigo-100',
  violet: 'bg-violet-100',
  purple: 'bg-purple-100',
  fuchsia: 'bg-fuchsia-100',
  pink: 'bg-pink-100',
  rose: 'bg-rose-100',
  slate: 'bg-slate-100',
  gray: 'bg-gray-100',
  zinc: 'bg-zinc-100',
  neutral: 'bg-neutral-100',
  stone: 'bg-stone-100',
  white: 'bg-white',
  black: 'bg-black',
};

const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAnnouncement();
  }, []);

  const fetchActiveAnnouncement = async () => {
    try {
      // 1. Check in-memory promise coalescer
      if (window.__activeAnnouncementPromise) {
        const data = await window.__activeAnnouncementPromise;
        if (data.success && data.data) {
          setAnnouncement(data.data);
        }
        return;
      }

      // 2. Initiate request and coalesce
      window.__activeAnnouncementPromise = (async () => {
        const response = await fetch(`${API_URL}/announcements/active`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })();

      const data = await window.__activeAnnouncementPromise;
      if (data.success && data.data) {
        setAnnouncement(data.data);
      }

      // Clear the promise coalescer after a short delay (1s) so subsequent navigations fetch fresh data
      setTimeout(() => {
        window.__activeAnnouncementPromise = null;
      }, 1000);
    } catch (error) {
      window.__activeAnnouncementPromise = null; // Clear on error
      console.error("Error fetching announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Store in session storage so it stays closed for this session
    sessionStorage.setItem("announcement_closed", "true");
  };

  // Check if user previously closed this session
  useEffect(() => {
    const isClosed = sessionStorage.getItem("announcement_closed");
    if (isClosed) {
      setIsVisible(false);
    }
  }, []);

  if (loading || !announcement || !isVisible || !announcement.isActive) {
    return null;
  }

  const {
    badge,
    message,
    link,
    backgroundColor = "gray",
    textColor = "gray-800",
    badgeColor = "white",
    badgeTextColor = "gray-800"
  } = announcement;

  // Normalize color names (remove -800, -500 suffixes if present)
  const normalizeColor = (color) => {
    if (color.startsWith("#")) return null;
    return color.replace(/-800$/, "").replace(/-500$/, "").replace(/-100$/, "");
  };

  const normalizedBg = normalizeColor(backgroundColor) || backgroundColor;
  const normalizedText = normalizeColor(textColor) || textColor;
  const normalizedBadge = normalizeColor(badgeColor) || badgeColor;

  // Get colors from mapping or use hex fallback
  const colors = COLOR_MAP[normalizedBg] || COLOR_MAP.gray;
  const textClass = TEXT_COLOR_MAP[normalizedText] || TEXT_COLOR_MAP.gray;
  const badgeBg = BADGE_BG_MAP[normalizedBadge] || BADGE_BG_MAP.white;

  // Handle hex colors
  const bgStyle = backgroundColor.startsWith("#")
    ? { backgroundColor, opacity: 0.1 }
    : {};
  const textStyle = textColor.startsWith("#")
    ? { color: textColor }
    : {};
  const badgeBgStyle = badgeColor.startsWith("#")
    ? { backgroundColor: badgeColor }
    : {};
  const badgeTextStyle = badgeTextColor.startsWith("#")
    ? { color: badgeTextColor }
    : {};

  const content = (
    <div
      className={`flex items-center space-x-2.5 border rounded-full px-1 py-1 text-sm ${colors.bg} ${colors.border} ${textClass}`}
      style={bgStyle}
    >
      <div
        className={`border rounded-2xl px-3 py-1 ${badgeBg} ${colors.border}`}
        style={badgeBgStyle}
      >
        <p className={`text-xs font-semibold ${badgeTextColor.startsWith("#") ? "" : TEXT_COLOR_MAP[normalizeColor(badgeTextColor)] || "text-gray-800"}`} style={badgeTextStyle}>
          {badge || "New"}
        </p>
      </div>
      <p className={`pr-2 text-sm ${textClass}`} style={textStyle}>
        {message}
      </p>
    </div>
  );

  return (
    <div className="w-full bg-gray-900 py-2 px-4 flex items-center justify-center relative">
      <div className="flex items-center justify-center">
        {link ? (
          <a 
            href={link} 
            className="hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="absolute right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label="Close announcement"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
