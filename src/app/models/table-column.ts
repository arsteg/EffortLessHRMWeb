export interface TableColumn {
    key: string;
    name: string;
    isAction?: boolean;
    isCheckbox?: boolean;
    sortable?: boolean;
    icons?: Icons[];
    valueFn?: Function;
    options?: ActionOption[];
}

export interface Icons {
    name: string;
    value: any;
    class?: string
}

export interface ActionOption {
    label: string;
    icon: string;
    visibility: string;
    cssClass: string;
    hideCondition: Function;
}