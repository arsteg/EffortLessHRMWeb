export class Base<T> {
    value: T|undefined;
    key: string;
    label: string;
    required: boolean;
    order: number;
    controlType: string;
    type: string;
    options: {key: string, value: string}[];
    class:string;
    rows:number;
    rowclass:boolean;
    readonly:string;
    rowend:boolean;
    constructor(options: {
        value?: T;
        key?: string;
        label?: string;
        required?: boolean;
        rowend?:boolean;
        order?: number;
        controlType?: string;
        type?: string;
        class?:string;
        options?: {key: string, value: string}[];
        rows?:number;
        rowclass?:boolean;
        readonly?:string;
      } = {}) {
      this.value = options.value;
      this.key = options.key || '';
      this.label = options.label || '';
      this.required = !!options.required;
      this.rowend=!!options.rowend;
      this.order = options.order === undefined ? 1 : options.order;
      this.controlType = options.controlType || '';
      this.type = options.type || '';
      this.class = options.class || '';
      this.rows = options.rows === undefined ? 1 : options.rows;
      this.options = options.options || [];     
      this.rowclass = !!options.rowclass;
      this.readonly= options.readonly || '';
    }
  }