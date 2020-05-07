import { tableActionsType, ActionButtons, Column } from './mat-table.interface';



export class Colum implements Column {
  columnDef: string;
  header: string;
  actions?: ActionButtonsClass[];
  constructor(columnDef: string, header: string, actions?: ActionButtonsClass[]) {
    this.columnDef = columnDef;
    this.header = header;
    this.actions = actions;
  }

}

export class ActionButtonsClass implements ActionButtons {
  type: tableActionsType;
  icon: string;
  matTooltip: string;
  // tslint:disable-next-line:variable-name
  aria_label?: string;
  route?: string;
  constructor(builder: ActionButtonsBuilder) {
    this.type = builder.type;
    this.icon = builder.icon;
    this.matTooltip = builder.matTooltip;
    this.aria_label = builder.ariaLabel;
    this.route = builder.route;
  }
}

export class ActionButtonsBuilder {
  private _type: tableActionsType;
  private _icon: string;
  private _matTooltip: string;
  private _ariaLabel?: string;
  private _route?: string;

  constructor() {}

  public build(): ActionButtonsClass {
    return new ActionButtonsClass(this);
  }

  public setDefaultButton(type: string, text: string) {
    this.withType(type === 'delete' ? tableActionsType.Remove : tableActionsType.Edit)
    this.withIcon(type);
    this.withMatTooltip(text)
    this.withAria_label(type);
    return this;
  }

  public withType(value: tableActionsType) {
    this._type = value;
    return this;
  }

  public withIcon(value: string) {
    this._icon = value;
    return this;
  }

  public withMatTooltip(value: string) {
    this._matTooltip = value;
    return this;
  }

  public withAria_label(value: string) {
    this._ariaLabel = value;
    return this;
  }

  public withRoute(value: string) {
    this._route = value;
    return this;
  }
  get type() {
    return this._type;
  }
  get icon() {
    return this._icon
  }
  get matTooltip() {
    return this._matTooltip;
  }
  get ariaLabel() {
    return this._ariaLabel;
  }
  get route() {
    return this._route;
  }
}
