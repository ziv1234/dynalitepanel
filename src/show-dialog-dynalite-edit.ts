import type { HomeAssistant } from "../homeassistant-frontend/src/types";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { EVENT_SHOW_DIALOG } from "./const";
import type { DynaliteInputSettings } from "./dynalite-input-settings";

export interface DynaliteRowData {
  dynetId?: string;
}

export interface DynaliteEditDialogParams {
  hass: HomeAssistant;
  name: string;
  value: DynaliteRowData;
  inputs: { [key: string]: DynaliteInputSettings };
  excluded?: string[];
  disabled?: string[];
  helpers?: { [key: string]: string };
  onSave: (params: DynaliteEditDialogParams) => void;
  onDelete?: (dynetId: string) => void;
}

export const loadDynaliteEditDialog = () =>
  import(/* webpackChunkName: "dynalite-edit-dialog" */ "./dynalite-edit-dialog");

export function showDynaliteEditDialog(
  element: HTMLElement,
  dialogParams: DynaliteEditDialogParams
): void {
  fireEvent(element, EVENT_SHOW_DIALOG, {
    dialogTag: "dynalite-edit-dialog",
    dialogImport: loadDynaliteEditDialog,
    dialogParams,
  });
}
