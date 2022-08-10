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
  class?: string;
  duration?: string;
  tilt?: string;
  nodefault?: boolean;
  channel?: { [key: string]: DynaliteChannelData };
  preset?: { [key: string]: DynalitePresetData };
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
  // some things are modified (e.g. presets and channels presented as strings)
  number: string;
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

export function dynaliteCopy<T>(src: T): T {
  return JSON.parse(JSON.stringify(src));
}

export function underscore(src: string): string {
  return "_" + src;
}
