/**
 * Neon Commando VR — Top-Down Run-and-Gun Military Shooter Arcade
 * Build #147 — PM 2026-08-02
 */

import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { GameSystem } from './game.js';
import { UISystem } from './ui-system.js';
import { AudioSystem } from './audio.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerSystem(GameSystem);
  world.registerSystem(UISystem);
  world.registerSystem(AudioSystem);
});
