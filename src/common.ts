import { mdiDevices, mdiPuzzle } from "@mdi/js";
import { Route } from "../homeassistant-frontend/src/types";

export interface DynaliteChannelData {
  name?: string;
  fade?: string;
  type?: string;
}

export interface DynalitePresetData {
  name?: string;
  fade?: string;
  level?: string;
}

export interface DynaliteAreaData {
  name?: string;
  template?: string;
  fade?: string;
  nodefault?: boolean;
  channel?: { [key: string]: DynaliteChannelData };
  preset?: { [key: string]: DynalitePresetData };
}

export interface DynaliteConfigData {
  host: string;
  port: string;
  name?: string;
  autodiscover?: boolean;
  default?: { fade?: string };
  active?: string;
  area: {
    [key: string]: DynaliteAreaData;
  };
  preset?: { [key: string]: DynalitePresetData };
}

export interface DynaliteDefaultData {
  DEFAULT_NAME: string;
}

export interface Dynalite {
  config: DynaliteConfigData;
  default: DynaliteDefaultData;
}

export interface DynaliteConfigResponse {
  config: DynaliteConfigData[];
  default: DynaliteDefaultData;
}

export interface DynaliteEntryIdentifier {
  host: string;
  port: string;
}

export interface LocationChangedEvent {
  // XXX TBD
  detail?: { route: Route; force?: boolean };
}

export interface DynaliteAreaRowInfo {
  // XXX TBD move to area?
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
