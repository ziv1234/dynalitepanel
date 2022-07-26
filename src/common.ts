import { mdiDevices, mdiPuzzle } from "@mdi/js";
import { Route } from "../homeassistant-frontend/src/types";

export interface Dynalite {
  language: string;
  config_data: any;
  localize(string: string, replace?: Record<string, any>): string;
}

export interface DynaliteConfigResponse {
  config: any;
}

export interface LocationChangedEvent {
  detail?: { route: Route; force?: boolean };
}

export interface DynaliteAreaInfo {
  number: number;
}

export const panelTabs = [
  {
    component: "areas",
    path: "/dynalite/areas",
    name: "Dynalite Areas",
    iconPath: mdiPuzzle,
    iconColor: "#2D338F",
    core: true,
  },
  {
    component: "global-settings",
    path: "/dynalite/global-settings",
    name: "Global Settings",
    iconPath: mdiDevices,
    iconColor: "#2D338F",
    core: true,
  },
];
