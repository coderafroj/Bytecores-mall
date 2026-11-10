import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixelLib from 'react-facebook-pixel';
import ClarityLib from '@microsoft/clarity';

const TrackingProvider = ({ children }) => {
  const location = useLocation();
  
  // Safely unwrap the modules for Vite production builds
  const ReactPixel = ReactPixelLib.default || ReactPixelLib;
  const Clarity = ClarityLib.default || ClarityLib;

  // The POS (/pos) shows customer phone numbers and shop financials: never track it.
  const isPos = location.pathname.startsWith('/pos');

  useEffect(() => {
    if (isPos) return;
    // Initialize Meta Pixel
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
    if (PIXEL_ID && ReactPixel.init) {
      const options = {
        autoConfig: true,
        debug: false,
      };
      ReactPixel.init(PIXEL_ID, undefined, options);
    }

    // Initialize Microsoft Clarity
    const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (CLARITY_ID && Clarity.init) {
      Clarity.init(CLARITY_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPos]);

  useEffect(() => {
    if (isPos) return;
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
    if (PIXEL_ID && ReactPixel.pageView) {
      ReactPixel.pageView();
    }
  }, [location]);

  return <>{children}</>;
};

export default TrackingProvider;
