import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { HomeAssistant } from "../homeassistant-frontend/src/types";
import { DynalitePresetData } from "./common";

export interface DynaliteEditPresetDialogParams extends DynalitePresetData {
  hass: HomeAssistant;
  number?: string;
  excluded?: string[];
  onSave: (params: DynaliteEditPresetDialogParams) => void;
}

export const loadDynaliteEditPresetDialog = () =>
  import(/* webpackChunkName: "dynalite-edit-preset-dialog" */ "./dynalite-edit-preset-dialog");

export const showDynaliteEditPresetDialog = (
  element: HTMLElement,
  dialogParams: DynaliteEditPresetDialogParams
) => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dynalite-edit-preset-dialog",
    dialogImport: loadDynaliteEditPresetDialog,
    dialogParams,
  });
};
