import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';
import Clarity from '@microsoft/clarity';

const TrackingProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize Meta Pixel
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
    if (PIXEL_ID) {
      const options = {
        autoConfig: true,
        debug: false,
      };
      ReactPixel.init(PIXEL_ID, undefined, options);
    }

    // Initialize Microsoft Clarity
    const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (CLARITY_ID) {
      Clarity.init(CLARITY_ID);
    }
  }, []);

  useEffect(() => {
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
    if (PIXEL_ID) {
      ReactPixel.pageView();
    }
  }, [location]);

  return <>{children}</>;
};

export default TrackingProvider;
