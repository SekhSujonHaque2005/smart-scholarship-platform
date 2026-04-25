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
          title: 'Main Control Header', 
          description: 'Access system settings, appearance adjustments, and support services.', 
          side: 'bottom' 
        }
      });
    }

    if (document.querySelector('#tour-sidebar')) {
      steps.push({
        element: '#tour-sidebar',
        popover: { 
          title: 'Navigation Panel', 
          description: 'Switch between applications, funding ledgers, and configuration parameters.', 
          side: 'right' 
        }
      });
    }

    if (document.querySelector('#tour-trust')) {
      steps.push({
        element: '#tour-trust',
        popover: { 
          title: 'Trust & Integrity Index', 
          description: 'Calculates institutional standing based on engagement success.', 
          side: 'bottom' 
        }
      });
    }

    if (document.querySelector('#tour-search')) {
      steps.push({
        element: '#tour-search',
        popover: { 
          title: 'Discovery Hub', 
          description: 'Narrow outcomes via targeted keyword indexing routines.', 
          side: 'bottom' 
        }
      });
    }

    // 2. Synthesize Visible Action Elements (Buttons)
    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(btn => btn.offsetParent !== null && btn.innerText.trim().length > 2 && btn.id !== 'tour-guide-btn');
    
    buttons.forEach((btn, idx) => {
      if (idx > 5) return; // Limit to prevent fatigue
      if (!btn.id) btn.id = `tour-dyn-btn-${idx}`;
      steps.push({
        element: `#${btn.id}`,
        popover: { 
          title: `Action: ${btn.innerText.trim()}`, 
          description: 'Triggers immediate platform process execution.', 
          side: 'top' 
        }
      });
    });

    // 3. Synthesize Input Vectors
    const inputs = Array.from(document.querySelectorAll('input'))
      .filter(inp => inp.offsetParent !== null && inp.type !== 'hidden');

    inputs.forEach((inp, idx) => {
      if (idx > 3) return;
      if (!inp.id) inp.id = `tour-dyn-inp-${idx}`;
      const label = inp.placeholder || inp.name || `Data Entry #${idx + 1}`;
      steps.push({
        element: `#${inp.id}`,
        popover: { 
          title: `Entry: ${label}`, 
          description: 'Input required values to update query models.', 
          side: 'bottom' 
        }
      });
    });

    if (steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.8)',
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
