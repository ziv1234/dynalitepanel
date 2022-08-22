import { mdiDevices, mdiPuzzle } from "@mdi/js";

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
  class?: string;
  duration?: string;
  tilt?: string;
  nodefault?: boolean;
  channel?: { [key: string]: DynaliteChannelData };
  preset?: { [key: string]: DynalitePresetData };
  room_on?: string;
  room_off?: string;
  open?: string;
  close?: string;
  stop?: string;
  channel_cover?: string;
}

export interface DynaliteRoomData {
  room_on?: string;
  room_off?: string;
}

export interface DynaliteCoverData {
  open?: string;
  close?: string;
  stop?: string;
  channel_cover?: string;
  class?: string;
  duration?: string;
  tilt?: string;
}

export interface DynaliteTemplateData {
  room?: DynaliteRoomData;
  time_cover?: DynaliteCoverData;
}

export const DynaliteDefaultTemplates: DynaliteTemplateData = {
  room: { room_on: "1", room_off: "4" },
  time_cover: {
    open: "1",
    close: "2",
    stop: "4",
    channel_cover: "2",
    class: "blind",
    duration: "60",
    tilt: "3",
  },
};

export const enumeratedTemplates: string[][] = Object.entries(DynaliteDefaultTemplates)
  .map(([template, conf]) => Object.keys(conf).map((param) => [template, param]))
  .flat(1);

export interface DynaliteConfigData {
  host: string;
  port: string;
  name?: string;
  autodiscover?: boolean;
  default?: { fade?: string };
  active?: string;
  area?: {
    [key: string]: DynaliteAreaData;
  };
  preset?: { [key: string]: DynalitePresetData };
  template?: DynaliteTemplateData;
}

export interface DynaliteDefaultData {
  DEFAULT_NAME: string;
  DEVICE_CLASSES: string[];
  DEFAULT_PORT: string;
}

export interface Dynalite {
  config: DynaliteConfigData;
  default: DynaliteDefaultData;
  classSelection: string[][];
  completeConfig: { [key: string]: DynaliteConfigData };
  entry_id: string;
}

export interface DynaliteConfigResponse {
  config: { [key: string]: DynaliteConfigData };
  default: DynaliteDefaultData;
}

export interface DynaliteAreaRowInfo {
  // some things are modified (e.g. presets and channels presented as strings)
  dynetId: string;
  name?: string;
  template?: string;
  fade?: string;
  channel?: string;
  preset?: string;
}

export const ROUTE_AREAS = "areas";
export const ROUTE_GLOBAL_SETTINGS = "global-settings";
export const ROUTE_EDIT = "edit";
export const BASE_URL = "/dynalite";

export function dynaliteRoute(route: string) {
  return `${BASE_URL}/${route}`;
}

export const panelTabs = [
  {
    path: dynaliteRoute(ROUTE_AREAS),
    name: "Dynalite Areas",
    iconPath: mdiPuzzle,
    iconColor: "#2D338F",
    core: true,
  },
  {
    path: dynaliteRoute(ROUTE_GLOBAL_SETTINGS),
    name: "Global Settings",
    iconPath: mdiDevices,
    iconColor: "#2D338F",
    core: true,
  },
];

export function dynaliteCopy<T>(src: T): T {
  return JSON.parse(JSON.stringify(src));
}

export function capitalizeFirst(val: string): string {
  if (!val) return "";
  return val[0].toUpperCase() + val.substring(1);
}
