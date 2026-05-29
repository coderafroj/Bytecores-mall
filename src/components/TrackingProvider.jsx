import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixelLib from 'react-facebook-pixel';
import ClarityLib from '@microsoft/clarity';

const TrackingProvider = ({ children }) => {
  const location = useLocation();
  
  // Safely unwrap the modules for Vite production builds
  const ReactPixel = ReactPixelLib.default || ReactPixelLib;
  const Clarity = ClarityLib.default || ClarityLib;

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
    if (PIXEL_ID && ReactPixel.pageView) {
      ReactPixel.pageView();
    }
  }, [location]);

  return <>{children}</>;
};

export default TrackingProvider;
