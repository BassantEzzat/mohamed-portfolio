import { STILLS, StillImage } from './images.generated';

// صور مش عايزينها في الـ gallery (مثلاً المكررة)
const EXCLUDE = new Set(['40-1']);

export const GALLERY: StillImage[] = STILLS.filter((s) => !EXCLUDE.has(s.id));