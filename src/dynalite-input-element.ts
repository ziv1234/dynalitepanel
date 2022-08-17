import { html, LitElement, TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined";
import "./dynalite-input";
import { DynaliteInputSettings } from "./dynalite-input-settings";

export abstract class DynaliteInputElement<T> extends LitElement {
  protected abstract result: T;

  protected hasElementChanged = false;

  protected abstract settings: { [key in keyof T]: DynaliteInputSettings };

  protected helpers?: { [key in keyof T]?: string };

  protected disabled?: (keyof T)[];

  protected excluded?: { [key in keyof T]?: string[] };

  protected genInputElement(param: keyof T): TemplateResult {
    if (this.settings[param].nameVal !== param) throw new Error("illegal param");
    return html`
      <dynalite-input
        .settings=${this.settings[param]}
        @dynalite-input=${this.handleDynaliteInputChange}
        .value=${this.result[param]}
        helper=${ifDefined(this.helpers?.[param])}
        ?disabled=${this.disabled?.includes(param)}
        .excluded=${this.excluded?.[param]}
      ></dynalite-input>
    `;
  }

  protected handleDynaliteInputChange(ev) {
    const detail = ev.detail;
    const target = detail.target;
    const value = detail.value;
    this.result![target] = value;
    this.hasElementChanged = true;
    this.requestUpdate();
  }
}
