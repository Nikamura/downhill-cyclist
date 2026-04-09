// Internal resolution (pixel art scale)
export const GAME_W = 160;
export const GAME_H = 240;
export const SCALE = 3;

// Road layout — narrow bike path with wide sidewalks
export const BIKE_PATH_WIDTH = 16;  // ~2 bicycle widths
export const BIKE_LEFT = Math.floor((GAME_W - BIKE_PATH_WIDTH) / 2);
export const BIKE_RIGHT = BIKE_LEFT + BIKE_PATH_WIDTH;
export const BIKE_CENTER = BIKE_LEFT + BIKE_PATH_WIDTH / 2;

// Sidewalks on both sides (where pedestrians walk)
export const SIDEWALK_WIDTH = 20;
export const SIDEWALK_L_LEFT = BIKE_LEFT - SIDEWALK_WIDTH;
export const SIDEWALK_L_RIGHT = BIKE_LEFT;
export const SIDEWALK_R_LEFT = BIKE_RIGHT;
export const SIDEWALK_R_RIGHT = BIKE_RIGHT + SIDEWALK_WIDTH;

// Player — downhill physics
export const PLAYER_SPEED = 1.5;
export const BASE_SCROLL_SPEED = 1.2;

export const GRAVITY_ACCEL = 0.006;
export const AIR_DRAG = 0.00004;
export const PEDAL_ACCEL = 0.012;
export const BRAKE_DECEL = 0.06;
export const MIN_SPEED = 0.3;

export const SPEED_TO_KMH = 25;

// Pedestrians
export const PED_SPAWN_INTERVAL_MIN = 20;
export const PED_SPAWN_INTERVAL_MAX = 90;
export const PED_ANC_CHANCE = 0.3;
export const PED_WALK_SPEED = 0.4;       // walking along sidewalk
export const PED_WANDER_CHANCE = 0.003;   // per-frame chance to start drifting into bike lane
export const PED_WANDER_SPEED = 0.2;      // lateral drift speed

// Bell
export const BELL_RANGE = 60;
export const BELL_COOLDOWN = 30;

// Colors
export const COLORS = {
  bikePath: '#888898',
  bikePathLine: '#aaaa99',
  bikePathEdge: '#fff',
  sidewalk: '#c4b08a',
  sidewalkLine: '#b0a07a',
  grass: '#5a7a3a',
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
