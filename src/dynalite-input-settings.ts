import { TYPE_NUMBER, TYPE_SELECT } from "./const";

export class DynaliteInputSettings {
  public nameVal: string;

  public headingVal?: string;

  public descVal?: string;

  public typeVal?: string;

  public requiredVal?: boolean;

  public minVal?: number;

  public maxVal?: number;

  public stepVal?: number;

  public selectionVal?: string[][];

  public excludedVal?: string[];

  public validationMessageVal?: string;

  public suffixVal?: string;

  public transformVal: (val: string) => string = (val) => val;

  public widthVal?: string;

  public narrowWidthVal?: string;

  public constructor(name: string) {
    this.nameVal = name;
  }

  public name(value: string): DynaliteInputSettings {
    this.nameVal = value;
    return this;
  }

  public heading(value: string): DynaliteInputSettings {
    this.headingVal = value;
    return this;
  }

  public desc(value: string): DynaliteInputSettings {
    this.descVal = value;
    return this;
  }

  public type(value: string): DynaliteInputSettings {
    this.typeVal = value;
    return this;
  }

  public min(value: number): DynaliteInputSettings {
    this.minVal = value;
    return this.type(TYPE_NUMBER);
  }

  public max(value: number): DynaliteInputSettings {
    this.maxVal = value;
    return this.type(TYPE_NUMBER);
  }

  public step(value: number): DynaliteInputSettings {
    this.stepVal = value;
    return this.type(TYPE_NUMBER);
  }

  public selection(value: string[][]): DynaliteInputSettings {
    this.selectionVal = value;
    return this.type(TYPE_SELECT);
  }

  public excluded(value: string[]): DynaliteInputSettings {
    this.excludedVal = value;
    return this;
  }

  public validationMessage(value: string): DynaliteInputSettings {
    this.validationMessageVal = value;
    return this;
  }

  public required(): DynaliteInputSettings {
    this.requiredVal = true;
    return this;
  }

  public suffix(value: string): DynaliteInputSettings {
    this.suffixVal = value;
    return this;
  }

  public transform(fn: (val: string) => string) {
    this.transformVal = fn;
    return this;
  }

  public width(value: string): DynaliteInputSettings {
    this.widthVal = value;
    return this;
  }

  public narrowWidth(value: string): DynaliteInputSettings {
    this.narrowWidthVal = value;
    return this;
  }
}

export function DynaliteTextInput(name: string): DynaliteInputSettings {
  return new DynaliteInputSettings(name);
}

export function DynaliteNumberInput(name: string): DynaliteInputSettings {
  return new DynaliteInputSettings(name).type("number");
}

export function DynaliteSelectInput(name: string): DynaliteInputSettings {
  return new DynaliteInputSettings(name).type("select");
}

export function DynaliteBooleanInput(name: string): DynaliteInputSettings {
  return new DynaliteInputSettings(name).type("boolean");
}

export function DynaliteIdInput(name: string, entity: string): DynaliteInputSettings {
  return DynaliteNumberInput(name).min(1).max(255).step(1).validationMessage(`Invalid ${entity}`);
}

export function DynaliteFadeInput(name: string): DynaliteInputSettings {
  return DynaliteNumberInput(name).min(0).step(0.1).validationMessage("Invalid Fade");
}

export function DynaliteDurationInput(name: string): DynaliteInputSettings {
  return DynaliteNumberInput(name).min(1).step(1).validationMessage("Invalid Time");
}

export function DynalitePercentageInput(name: string): DynaliteInputSettings {
  return DynaliteNumberInput(name).min(0).max(100).validationMessage("Invalid value").suffix("%");
}
