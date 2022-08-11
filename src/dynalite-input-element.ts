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
    console.dir(ev);
    const detail = ev.detail;
    const target = detail.target;
    const value = detail.value;
    console.log("XXX TBD handle change name=%s value=%s", target, value);
    this.result![target] = value;
    this.hasElementChanged = true;
    this.requestUpdate();
  }
}
