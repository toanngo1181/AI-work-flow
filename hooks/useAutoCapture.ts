import { useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';

export const useAutoCapture = (nodesLength: number) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Manual Trigger
  const captureNow = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    setIsCapturing(true);
    
    // Wait a bit for images/fonts to settle
    await new Promise(r => setTimeout(r, 1000));

    try {
      const dataUrl = await toPng(element, { 
        backgroundColor: '#f8fafc',
        pixelRatio: 2, // High Res
        cacheBust: true,
      });
      setCapturedImage(dataUrl);
      setShowModal(true);
    } catch (err) {
      console.error('Auto capture failed', err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { 
    capturedImage, 
    showModal, 
    setShowModal, 
    captureNow, 
    isCapturing 
  };
};