import { HomeAssistant } from "../homeassistant-frontend/src/types";
import { DynaliteInputSettings } from "./dynalite-input-settings";

export interface DynaliteRowData {
  number?: string;
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
  onDelete?: (number: string) => void;
}
