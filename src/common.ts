import { mdiDevices, mdiPuzzle } from "@mdi/js";
import { Route } from "../homeassistant-frontend/src/types";

export interface Dynalite {
  config_data: any;
}

export interface DynaliteConfigResponse {
  config: any;
}

export interface LocationChangedEvent {
  detail?: { route: Route; force?: boolean };
}

export interface DynaliteAreaRowInfo {
  number: string;
  name: string;
  template: string;
  channel: string;
  preset: string;
}

export const ROUTE_AREAS = "areas";
export const ROUTE_GLOBAL_SETTINGS = "global-settings";
export const ROUTE_EDIT = "edit";
export const BASE_URL = "/dynalite";

function _fullPath(route: string) {
  return `${BASE_URL}/${route}`;
}

export const panelTabs = [
  {
    path: _fullPath(ROUTE_AREAS),
    name: "Dynalite Areas",
    iconPath: mdiPuzzle,
    iconColor: "#2D338F",
    core: true,
  },
  {
    path: _fullPath(ROUTE_GLOBAL_SETTINGS),
    name: "Global Settings",
    iconPath: mdiDevices,
    iconColor: "#2D338F",
    core: true,
  },
];
