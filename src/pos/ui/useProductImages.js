import { useEffect, useReducer } from 'react';
import { db } from '../data/db';

// Photos live in their own table. Only the ones on screen are read (one bulkGet), and a small
// in-memory cache keeps scrolling smooth without holding thousands of images in RAM.
const cache = new Map();
const CAP = 400;
const keyOf = (p) => `${p.id}:${p.imgHash}`;

export function useProductImages(products) {
  const [ver, bump] = useReducer((x) => x + 1, 0);
  const sig = products.map((p) => (p.hasImage ? keyOf(p) : '')).join('|');
  useEffect(() => {
    const need = products.filter((p) => p.hasImage && !cache.has(keyOf(p)));
    if (!need.length) return undefined;
    let dead = false;
    db.images.bulkGet(need.map((p) => p.id)).then((rows) => {
      rows.forEach((r, i) => cache.set(keyOf(need[i]), r?.data || ''));
      while (cache.size > CAP) cache.delete(cache.keys().next().value);
      if (!dead) bump();
    });
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, ver]);

  // the sync engine fires this when photos arrive from the cloud
  useEffect(() => {
    const h = () => { for (const [k, v] of cache) if (!v) cache.delete(k); bump(); };
    window.addEventListener('pos-images', h);
    return () => window.removeEventListener('pos-images', h);
  }, []);
  return (p) => (p?.hasImage ? cache.get(keyOf(p)) || '' : '');
}
