import type { HomeAssistant } from "../homeassistant-frontend/src/types";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { EVENT_SHOW_DIALOG } from "./const";
import type { Dynalite } from "./common";

export interface DynaliteGateway {
  name: string;
  host: string;
  port: string;
}

export interface DynaliteSelectGatewayDialogParams {
  hass: HomeAssistant;
  dynalite: Dynalite;
  onSave: (entry_id: string) => void;
}

export const loadDynaliteSelectGatewayDialog = () =>
  import(
    /* webpackChunkName: "dynalite-select-gateway-dialog" */ "./dynalite-select-gateway-dialog"
  );

export function showDynaliteSelectGatewayDialog(
  element: HTMLElement,
  dialogParams: DynaliteSelectGatewayDialogParams
): void {
  fireEvent(element, EVENT_SHOW_DIALOG, {
    dialogTag: "dynalite-select-gateway-dialog",
    dialogImport: loadDynaliteSelectGatewayDialog,
    dialogParams,
  });
}
