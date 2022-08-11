import { mdiDelete, mdiDotsVertical } from "@mdi/js";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "../homeassistant-frontend/src/components/ha-dialog";
import "../homeassistant-frontend/src/components/ha-settings-row";
import "../homeassistant-frontend/src/components/ha-textfield";
import "../homeassistant-frontend/src/components/ha-card";
import "../homeassistant-frontend/src/components/ha-button-menu";
import "../homeassistant-frontend/src/components/ha-icon-button";
import "../homeassistant-frontend/src/components/ha-header-bar";
import "../homeassistant-frontend/src/components/ha-svg-icon";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { haStyle } from "../homeassistant-frontend/src/resources/styles";
import "@material/mwc-list";
import "@material/mwc-button";
import { DynaliteInput } from "./dynalite-input";
import { DynaliteEditDialogParams, DynaliteRowData } from "./dynalite-edit-dialog-types";
import { DynaliteInputElement } from "./dynalite-input-element";

@customElement("dynalite-edit-dialog")
export class DynaliteEditDialog extends DynaliteInputElement<DynaliteRowData> {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public narrow = false;

  @state() private _params?: DynaliteEditDialogParams;

  protected result = {};

  protected settings = {};

  @state() private _isNew = false;

  @queryAll("dynalite-input") _inputElements?: DynaliteInput[];

  public async showDialog(params: DynaliteEditDialogParams): Promise<void> {
    this.hass = params.hass;
    this._params = params;
    this.result = params.value;
    this.settings = params.inputs;
    this.excluded = { number: params.excluded };
    this.disabled = (params.disabled as any) || [];
    this._isNew = !("number" in this._params.value);
    this._genHelpers();
    console.log("show %s", this._isNew);
  }

  protected render(): TemplateResult | void {
    if (!this._params) return html``;
    console.log("XXX render edit dialog len=%s", this._inputElements?.length);
    console.dir(this._inputElements);
    this._inputElements?.forEach((el) => {
      console.log("aa %s", el.isValid());
    });
    const canSave =
      this.hasChanged &&
      this._inputElements?.length &&
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
                    @closed=${this._onButtonClose}
                    corner="BOTTOM_START"
                    fixed
                  >
                    <ha-icon-button
                      slot="trigger"
                      label="Additional Actions"
                      .path=${mdiDotsVertical}
                    ></ha-icon-button>
                    <mwc-list-item class="warning" graphic="icon">
                      Delete ${this._params.name}
                      <ha-svg-icon slot="graphic" .path=${mdiDelete} class="warning"> </ha-svg-icon>
                    </mwc-list-item>
                  </ha-button-menu>
                </span>`
              : html``}
          </ha-header-bar>
        </div>
        <div class="wrapper">
          <ha-card outlined>
            <div class="content">
              ${Object.keys(this._params.inputs).map((field) => this.genInputElement(field as any))}
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

  private _onButtonClose(ev) {
    ev.stopPropagation();
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
      Object.keys(this._params.helpers!).forEach((key) => {
        res[key] = this._params!.helpers![key].replace("NUMBER", this._params!.value.number!);
      });
    } else {
      for (const key in this._params?.helpers) {
        if (!this._params?.helpers[key].includes("NUMBER")) {
          res[key] = this._params!.helpers[key];
        }
      }
    }
    console.log("gen helpers");
    console.dir(res);
    this.helpers = res;
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
