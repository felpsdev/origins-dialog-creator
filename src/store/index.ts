import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export interface Settings {
  name: string;
  npc: string;
  interactionEnabled: boolean;
  interaction: {
    location: {
      x: number;
      y: number;
      z: number;
      rotation: number;
      world: string;
    };
    renderDistance: number;
  };
}

export const settingsAtom = atom<Settings>({
  key: "settings",
  default: {
    name: "",
    npc: "",
    interactionEnabled: true,
    interaction: {
      location: { x: 0, y: 0, z: 0, rotation: 0, world: "world" },
      renderDistance: 15,
    },
  },
  effects_UNSTABLE: [persistAtom],
});
