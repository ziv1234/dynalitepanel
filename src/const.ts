export const CONF_ACTIVE = "active";
export const CONF_ACTIVE_INIT = "init";
export const CONF_ACTIVE_OFF = "off";
export const CONF_ACTIVE_ON = "on";
export const CONF_ADVANCED = "advanced";
export const CONF_AREA = "area";
export const CONF_AUTODISCOVER = "autodiscover";
export const CONF_CHANNEL = "channel";
export const CONF_CHANNEL_COVER = "channel_cover";
export const CONF_CLASS = "class";
export const CONF_CLOSE = "close";
export const CONF_DURATION = "duration";
export const CONF_DYNET_ID = "dynetId";
export const CONF_FADE = "fade";
export const CONF_LIGHT = "light";
export const CONF_LEVEL = "level";
export const CONF_NAME = "name";
export const CONF_NODEFAULT = "nodefault";
export const CONF_OPEN = "open";
export const CONF_OVERRIDE_PRESETS = "overridePresets";
export const CONF_OVERRIDE_TEMPLATES = "overrideTemplates";
export const CONF_PRESET = "preset";
export const CONF_ROOM = "room";
export const CONF_ROOM_OFF = "room_off";
export const CONF_ROOM_ON = "room_on";
export const CONF_STOP = "stop";
export const CONF_SWITCH = "switch";
export const CONF_TEMPLATE = "template";
export const CONF_TILT = "tilt";
export const CONF_TILT_ENABLED = "tiltEnabled";
export const CONF_TIME_COVER = "time_cover";
export const CONF_TYPE = "type";
export const EVENT_CONFIG_CHANGED = "value-changed";
export const EVENT_DIALOG_CLOSED = "dialog-closed";
export const EVENT_SHOW_DIALOG = "show-dialog";
export const TEMPLATE_MANUAL = "Manual";
export const TEMPLATE_ROOM = "On/Off Switch";
export const TEMPLATE_COVER = "Blind or Cover";
export const TYPE_BOOLEAN = "boolean";
export const TYPE_NUMBER = "number";
export const TYPE_SELECT = "select";
export const WS_GET_CONFIG = "dynalite/get-config";
export const WS_SAVE_CONFIG = "dynalite/save-config";
export const AREA_GENERAL_PARAMS = [CONF_NAME, CONF_TEMPLATE, CONF_FADE, CONF_NODEFAULT];
export const ROOM_PARAMS = [CONF_ROOM_ON, CONF_ROOM_OFF];
export const TIME_COVER_GENERAL_PARAMS = [CONF_DURATION, CONF_TILT, CONF_CLASS];
export const TIME_COVER_ADVANCED_PARAMS = TIME_COVER_GENERAL_PARAMS.concat([
  CONF_OPEN,
  CONF_CLOSE,
  CONF_STOP,
  CONF_CHANNEL_COVER,
]);
