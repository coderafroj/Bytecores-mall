import { useSyncExternalStore } from 'react';
import { sync } from '../sync/engine';

// false when Clerk is not configured, or when it failed to load (e.g. first start with no internet)
export const hasClerk = () => !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && !globalThis.__posNoClerk;
export const useSyncState = () => useSyncExternalStore(sync.subscribe, sync.getSnapshot);
