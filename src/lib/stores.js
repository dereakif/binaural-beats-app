// src/lib/stores.js
import { writable } from 'svelte/store';

export const tracks = writable([]);

export const currentTrack = writable({
  name: 'New Track',
  segments: [],
});