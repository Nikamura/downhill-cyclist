// Internal resolution (pixel art scale)
export const GAME_W = 160;
export const GAME_H = 240;
export const SCALE = 3;

// Road
export const ROAD_LEFT = 32;
export const ROAD_RIGHT = 128;
export const LANE_COUNT = 3;
export const LANE_WIDTH = (ROAD_RIGHT - ROAD_LEFT) / LANE_COUNT;

// Player
export const PLAYER_SPEED = 1.5;
export const BRAKE_DECEL = 0.04;
export const BASE_SCROLL_SPEED = 1.2;
export const MAX_SCROLL_SPEED = 3.5;
export const SCROLL_ACCEL = 0.001; // speed increase over time

// Pedestrians
export const PED_SPAWN_INTERVAL_MIN = 40; // frames
export const PED_SPAWN_INTERVAL_MAX = 90;
export const PED_ANC_CHANCE = 0.3; // 30% chance of ANC headphones
export const PED_WANDER_SPEED = 0.3;

// Bell
export const BELL_RANGE = 60; // pixels
export const BELL_COOLDOWN = 30; // frames

// Colors (pixel art palette)
export const COLORS = {
  road: '#555568',
  roadLine: '#8888a0',
  sidewalk: '#77885a',
  grass: '#5a7a3a',
  sky: '#87ceeb',
  player: '#e63946',
  playerWheel: '#222',
  ped: '#f4a261',
  pedANC: '#e76f51',
  headphones: '#2a9d8f',
  bell: '#ffd166',
  ui: '#eee',
  uiBg: 'rgba(0,0,0,0.6)',
};
