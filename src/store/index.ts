import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export interface Settings {
  name: string;
  npc?: string;
  locationEnabled: boolean;
  location: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
}

export const settingsAtom = atom<Settings>({
  key: "settings",
  default: {
    name: "",
    locationEnabled: true,
    location: { x: 0, y: 0, z: 0, rotation: 0 },
  },
  effects_UNSTABLE: [persistAtom],
});
