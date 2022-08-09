import { HomeAssistant } from "../homeassistant-frontend/src/types";

export interface DynaliteRowData {
  number?: string;
}

export interface DynaliteEditDialogParams {
  hass: HomeAssistant;
  name: string;
  value: DynaliteRowData;
  inputs: DynaliteInputSettings[];
  excluded?: string[];
  disabled?: string[];
  helpers?: { [key: string]: string };
  onSave: (params: DynaliteEditDialogParams) => void;
  onDelete?: (params: DynaliteEditDialogParams) => Promise<boolean>;
}
