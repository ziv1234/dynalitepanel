import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/components/ha-dialog";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-header-bar";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { mdiDotsVertical } from "@mdi/js";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "@material/mwc-list";
import "@material/mwc-button";
import { DynaliteInput } from "./dynalite-input";
import { ifDefined } from "lit/directives/if-defined";
import { DynaliteEditDialogParams } from "./dynalite-edit-dialog-types";

@customElement("dynalite-edit-dialog")
export class DynaliteEditDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @state() private _params?: DynaliteEditDialogParams;

  @state() private _isNew = false;

  @state() private _hasChanged = false;

  @state() private _helpers: { [key: string]: string } = {};

  @queryAll("dynalite-input") _inputElements?: DynaliteInput[];

  public async showDialog(params: DynaliteEditDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = Object.assign({}, params); // XXX TBD check if needed
    this._isNew = !("number" in this._params.value);
    this._genHelpers();
    console.log("show %s", this._isNew);
  }

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    console.log("XXX render edit dialog len=%s", this._inputElements?.length);
    console.dir(this._inputElements);
    const canSave =
      this._hasChanged &&
      this._inputElements?.length == this._params.inputs.length &&
      Array.from(this._inputElements).every((elem) => elem.isValid());
    return html`
      <ha-dialog open .heading=${"abcde"} @closed=${this._close}>
        <div slot="heading">
          <ha-header-bar>
            <span slot="title">
              ${this._isNew
                ? `New ${this._params.name}`
                : `Edit ${this._params.name} ` + this._params.value.number}
            </span>
            ${this._params.onDelete
              ? html` <span slot="actionItems">
                  <ha-button-menu
                    @action=${this._handleAction}
                    @closed=${(ev) => {
                      ev.stopPropagation();
                    }}
                    corner="BOTTOM_START"
                    fixed
                  >
                    <ha-icon-button
                      slot="trigger"
                      label="Additional Actions"
                      .path=${mdiDotsVertical}
                    ></ha-icon-button>
                    <mwc-list-item class="warning"> Delete ${this._params.name} </mwc-list-item>
                  </ha-button-menu>
                </span>`
              : html``}
          </ha-header-bar>
        </div>
        <div class="wrapper">
          <ha-card outlined>
            <div class="content">
              ${this._params.inputs.map(
                (inp) => html`
                  <dynalite-input
                    .settings=${inp}
                    .value=${this._params?.value[inp.nameVal]}
                    ?disabled=${this._params?.disabled?.includes(inp.nameVal)}
                    .excluded=${inp.nameVal == "number" ? this._params?.excluded : undefined}
                    helper=${ifDefined(this._helpers[inp.nameVal])}
                    @dynalite-input=${this._handleChange}
                  ></dynalite-input>
                `
              )}
            </div>
          </ha-card>
        </div>
        <mwc-button slot="primaryAction" @click=${this._save} ?disabled=${!canSave}
          >Save</mwc-button
        >
        <mwc-button slot="secondaryAction" @click=${this._close}>Cancel</mwc-button>
      </ha-dialog>
    `;
  }

  private _handleChange(ev) {
    console.dir(ev);
    const detail = ev.detail;
    const target = detail.target as string;
    let value = detail.value;
    if (target == "level" && value != "") {
      value = value / 100;
    }
    console.log("XXX TBD handle change name=%s value=%s", target, value);
    if (!this._params?.value) return;
    this._params.value[target] = value;
    this._hasChanged = true;
    this.requestUpdate();
    if (target == "number") this._genHelpers();
  }

  private async _handleAction(ev) {
    console.log("handleAction");
    console.dir(ev);
    const index = ev.detail.index;
    switch (index) {
      case 0: {
        if (await this._params!.onDelete!(this._params!)) this._close();
        break;
      }
      default: {
        console.error("invalid index %s", index);
      }
    }
  }

  private _close(): void {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  private _save(): void {
    console.log("saving");
    console.dir(this._params);
    this._params?.onSave(this._params);
    this._close();
  }

  private _genHelpers(): void {
    const res: { [key: string]: string } = {};
    if (this._params?.value.number) {
      for (const key in this._params?.helpers) {
        res[key] = this._params.helpers[key].replace("NUMBER", this._params.value.number);
      }
    } else {
      for (const key in this._params?.helpers) {
        if (!this._params?.helpers[key].includes("NUMBER")) {
          res[key] = this._params!.helpers[key];
        }
      }
    }
    console.log("gen helpers");
    console.dir(res);
    this._helpers = res;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        ha-header-bar {
          --mdc-theme-on-primary: var(--primary-text-color);
          --mdc-theme-primary: var(--mdc-theme-surface);
          flex-shrink: 0;
        }
        ha-dialog {
          --dialog-content-position: static;
          --dialog-content-padding: 0;
          --dialog-z-index: 6;
        }
        .content {
          display: block;
          padding: 20px 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dynalite-edit-dialog": DynaliteEditDialog;
  }
}
