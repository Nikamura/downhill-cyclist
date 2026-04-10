// Internal resolution (pixel art scale)
export const GAME_W = 160;
export const GAME_H = 240;
export const SCALE = 3;

// Layout: [grass | sidewalk | bike | CAR ROAD (2 lanes) | bike | sidewalk | grass]
export const SIDEWALK_W = 14;
export const BIKE_W = 12;
export const CAR_W = 48; // two lanes, 24px each
export const CAR_LANE_W = CAR_W / 2;

const TOTAL_W = SIDEWALK_W + BIKE_W + CAR_W + BIKE_W + SIDEWALK_W;
const START_X = Math.floor((GAME_W - TOTAL_W) / 2);

// Left sidewalk
export const SIDE_L_LEFT = START_X;
export const SIDE_L_RIGHT = SIDE_L_LEFT + SIDEWALK_W;

// Left bike path
export const BIKE_L_LEFT = SIDE_L_RIGHT;
export const BIKE_L_RIGHT = BIKE_L_LEFT + BIKE_W;
export const BIKE_L_CENTER = BIKE_L_LEFT + BIKE_W / 2;

// Car road (center) — two lanes
export const CAR_LEFT = BIKE_L_RIGHT;
export const CAR_RIGHT = CAR_LEFT + CAR_W;
export const CAR_CENTER = CAR_LEFT + CAR_W / 2; // yellow divider line

// Lane centers for car spawning
export const CAR_LANE_DOWN_CENTER = CAR_LEFT + CAR_LANE_W / 2;   // same direction (left lane)
export const CAR_LANE_UP_CENTER = CAR_CENTER + CAR_LANE_W / 2;   // oncoming (right lane)

// Right bike path
export const BIKE_R_LEFT = CAR_RIGHT;
export const BIKE_R_RIGHT = BIKE_R_LEFT + BIKE_W;
export const BIKE_R_CENTER = BIKE_R_LEFT + BIKE_W / 2;

// Right sidewalk
export const SIDE_R_LEFT = BIKE_R_RIGHT;
export const SIDE_R_RIGHT = SIDE_R_LEFT + SIDEWALK_W;

// Full playable width (includes grass)
export const PLAY_LEFT = 4;
export const PLAY_RIGHT = GAME_W - 4;

// Grass slope physics
export const GRASS_SLOPE_FORCE = 0.35;    // lateral drift towards road
export const GRASS_WOBBLE_AMP = 0.5;      // random lateral instability
export const GRASS_FRICTION = 0.003;      // extra rolling resistance on grass
export const GRASS_SHAKE_BASE = 0.8;      // base screen shake on grass

// Player — downhill physics
export const PLAYER_SPEED = 1.0;
export const BASE_SCROLL_SPEED = 1.2;

export const GRAVITY_ACCEL = 0.006;
export const AIR_DRAG = 0.00004;
export const PEDAL_ACCEL = 0.012;
export const BRAKE_DECEL = 0.06;
export const MIN_SPEED = 0.3;

export const SPEED_TO_KMH = 25;

// Pedestrians (both sidewalks)
export const PED_SPAWN_INTERVAL_MIN = 20;
export const PED_SPAWN_INTERVAL_MAX = 90;
export const PED_ANC_CHANCE = 0.3;
export const PED_WALK_SPEED = 0.4;
export const PED_WANDER_CHANCE = 0.003;
export const PED_WANDER_SPEED = 0.2;

// Cars
export const CAR_SPAWN_INTERVAL_MIN = 50;
export const CAR_SPAWN_INTERVAL_MAX = 140;
export const CAR_SPEED_MIN_KMH = 60;
export const CAR_SPEED_MAX_KMH = 130;
// Oncoming cars (opposite lane)
export const ONCOMING_SPEED_MIN_KMH = 50;
export const ONCOMING_SPEED_MAX_KMH = 110;

// Potholes (sidewalk hazard)
export const POTHOLE_SPAWN_CHANCE = 0.008;
export const POTHOLE_SIZE = 3;

// Ramps (bike lane jumps)
export const RAMP_SPAWN_INTERVAL_MIN = 200;
export const RAMP_SPAWN_INTERVAL_MAX = 450;
export const RAMP_MIN_SPEED_KMH = 15;
export const JUMP_DURATION_BASE = 35;
export const JUMP_DURATION_SPEED_FACTOR = 0.5;
export const JUMP_MAX_HEIGHT = 8;

// Birds
export const BIRD_SPAWN_INTERVAL_MIN = 120;
export const BIRD_SPAWN_INTERVAL_MAX = 280;
export const BIRD_SPEED_MIN = 1.0;
export const BIRD_SPEED_MAX = 2.5;

// World wrapping (horizontal globe)
export function wrapX(x) {
  return ((x % GAME_W) + GAME_W) % GAME_W;
}

export function wrappedDx(x1, x2) {
  let dx = Math.abs(x1 - x2);
  if (dx > GAME_W / 2) dx = GAME_W - dx;
  return dx;
}

// Bell
export const BELL_RANGE = 60;
export const BELL_COOLDOWN = 30;

// Colors
export const COLORS = {
  bikePath: '#888898',
  bikePathEdge: '#fff',
  sidewalk: '#c4b08a',
  sidewalkLine: '#b0a07a',
  carRoad: '#444450',
  carRoadLine: '#dddd44',
  carRoadEdge: '#fff',
  carLaneDash: '#888',
  grass: '#5a7a3a',
  curb: '#9a8a6a',
  pothole: '#3a3020',
  potholeRim: '#6a6040',
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
