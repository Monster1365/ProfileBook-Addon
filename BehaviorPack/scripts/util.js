import { world } from "@minecraft/server";
export function getProfiles() {
  const raw = world.getDynamicProperty("profiles");
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

export function saveProfiles(profiles) {
  world.setDynamicProperty("profiles", JSON.stringify(profiles));
}
