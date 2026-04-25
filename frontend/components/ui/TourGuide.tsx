'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
  };
}

export const TourGuide = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startTour = () => {
    const steps: TourStep[] = [];

    // 1. Core Layout Framework
    if (document.querySelector('#tour-header')) {
      steps.push({
        element: '#tour-header',
        popover: { 
          title: 'Welcome to Your Dashboard! 👋', 
          description: 'Here you can switch between light and dark modes, check alerts, and view your personal account profile.', 
          side: 'bottom' 
        }
      });
    }

    if (document.querySelector('#tour-sidebar')) {
      steps.push({
        element: '#tour-sidebar',
        popover: { 
          title: 'Quick Navigation 🧭', 
          description: 'Use this sidebar to jump between available scholarships, your applications, and saved documents effortlessly.', 
          side: 'right' 
        }
      });
    }

    if (document.querySelector('#tour-trust')) {
      steps.push({
        element: '#tour-trust',
        popover: { 
          title: 'Trust Score Indicator 🛡️', 
          description: 'Shows the verification status and credibility rating of the platform providers.', 
          side: 'bottom' 
        }
      });
    }

    if (document.querySelector('#tour-search')) {
      steps.push({
        element: '#tour-search',
        popover: { 
          title: 'Scholarship Search 🔍', 
          description: 'Quickly find funding opportunities by typing keywords, locations, or program categories here.', 
          side: 'bottom' 
        }
      });
    }

    // 2. Synthesize Visible Action Elements (Buttons)
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(btn => btn.offsetParent !== null && btn.innerText.trim().length > 2 && btn.id !== 'tour-guide-btn');
    
    buttons.forEach((btn, idx) => {
      if (idx > 3) return; // Limit to prevent fatigue
      if (!btn.id) btn.id = `tour-dyn-btn-${idx}`;
      steps.push({
        element: `#${btn.id}`,
        popover: { 
          title: `Feature: ${btn.innerText.trim()} ⚡`, 
          description: 'Click here to interact and manage your processes on the portal.', 
          side: 'top' 
        }
      });
    });

    // 3. Synthesize Input Vectors
    const inputs = Array.from(document.querySelectorAll('input'))
      .filter(inp => inp.offsetParent !== null && inp.type !== 'hidden');

    inputs.forEach((inp, idx) => {
      if (idx > 2) return;
      if (!inp.id) inp.id = `tour-dyn-inp-${idx}`;
      const label = inp.placeholder || inp.name || `Text Field #${idx + 1}`;
      steps.push({
        element: `#${inp.id}`,
        popover: { 
          title: `Fill in: ${label} ✍️`, 
          description: 'Provide your details in this box to process your request accurately.', 
          side: 'bottom' 
        }
      });
    });

    if (steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      steps: steps.map(step => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.side,
          align: 'center'
        }
      }))
    });

    driverObj.drive();
  };

  useEffect(() => {
    if (!mounted) return;

    const tourKey = `tour_v2_viewed_${pathname.replace(/\//g, '_')}`;
    const alreadyViewed = localStorage.getItem(tourKey);

    if (!alreadyViewed) {
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem(tourKey, 'true');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [mounted, pathname]);

  if (!mounted) return null;

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all"
      title="Restart Tour Guide"
    >
      <HelpCircle size={24} />
    </button>
  );
};
