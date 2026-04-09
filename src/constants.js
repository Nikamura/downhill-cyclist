// Internal resolution (pixel art scale)
export const GAME_W = 160;
export const GAME_H = 240;
export const SCALE = 3;

// Road
export const ROAD_LEFT = 32;
export const ROAD_RIGHT = 128;
export const LANE_COUNT = 3;
export const LANE_WIDTH = (ROAD_RIGHT - ROAD_LEFT) / LANE_COUNT;

// Player — downhill physics
export const PLAYER_SPEED = 1.5;
export const BASE_SCROLL_SPEED = 1.2;   // ~30 km/h starting speed

// Physics model:
//   gravity pull (constant downhill force)
//   air drag (proportional to speed², limits terminal velocity)
//   pedaling (hold UP to add force — you maniac)
//   braking (strong deceleration)
export const GRAVITY_ACCEL = 0.006;      // constant downhill pull per frame
export const AIR_DRAG = 0.00004;         // drag coefficient (force = drag * v²)
export const PEDAL_ACCEL = 0.012;        // additional accel when pedaling
export const BRAKE_DECEL = 0.06;         // brake force per frame
export const MIN_SPEED = 0.3;            // can't fully stop on a hill

// Speed conversion: internal scroll units → km/h
// 1.0 scroll = ~25 km/h, so max ~250+ km/h for the truly insane
export const SPEED_TO_KMH = 25;

// Pedestrians
export const PED_SPAWN_INTERVAL_MIN = 20; // frames (tighter at high speed)
export const PED_SPAWN_INTERVAL_MAX = 90;
export const PED_ANC_CHANCE = 0.3;
export const PED_WANDER_SPEED = 0.3;

// Bell
export const BELL_RANGE = 60;
export const BELL_COOLDOWN = 30;

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
  speedNormal: '#44ff44',
  speedFast: '#ffaa00',
  speedInsane: '#ff2222',
};
