import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export interface Settings {
  name: string;
  npc: string;
  npcPosition: string;
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
    npcPosition: "sit",
    interactionEnabled: true,
    interaction: {
      location: { x: 0, y: 0, z: 0, rotation: 0, world: "world" },
      renderDistance: 15,
    },
  },
  effects_UNSTABLE: [persistAtom],
});

export interface Texture {
  id: string;
  name: string;
  data: string;
}

export const textureSetAtom = atom<Texture[]>({
  key: "textureSet",
  default: [],
  effects_UNSTABLE: [persistAtom],
});
