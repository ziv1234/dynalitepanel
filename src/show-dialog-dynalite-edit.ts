import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { EVENT_SHOW_DIALOG } from "./const";
import { DynaliteEditDialogParams } from "./dynalite-edit-dialog-types";

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
