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
    return this.type("number");
  }

  public max(value: number): DynaliteInputSettings {
    this.maxVal = value;
    return this.type("number");
  }

  public step(value: number): DynaliteInputSettings {
    this.stepVal = value;
    return this.type("number");
  }

  public selection(value: string[][]): DynaliteInputSettings {
    this.selectionVal = value;
    return this;
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
