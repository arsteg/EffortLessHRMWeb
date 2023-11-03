export interface ExpenseCategory{
    type: string;
    label: string;
}

export  interface ExpenseCategoryField{
    expenseCategory: string;
    fields: any[];
}

export interface ExpenseApplicationField{
    expenseApplicationField: string;
    Name: string;
    Type: string;
    Value: string;
}

export interface AddTemplate{
    policyLabel: string;
    approvalType: string;
    downloadableFormats: string[];
    advanceAmount: boolean;
    applyforSameCategorySamedate: boolean
}

export interface ApplicableCategories{
    expenseTemplate: string;
    expenseCategory: string;
}

export interface TemplateAssignment{
    user: string;
    approver: string;
    expenseTemplate: string;
    effectiveDate: Date;
}
