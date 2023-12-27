export interface ExpenseCategory {
    type: string;
    label: string;
    isMandatory: boolean;
}

export interface ExpenseCategoryField {
    expenseCategory: string;
    fields: {
        fieldName: string;
        fieldType: string;
        expenseApplicationFieldValues: { value: string }[];
      }[];
}

export interface UpdateExpenseCategoryField{
    fields: any[]
}

export interface ExpenseApplicationField {
    expenseApplicationField: string;
    fieldValue: any[];
}

export interface AddTemplate {
    policyLabel: string;
    approvalType: string;
    downloadableFormats: string[];
    advanceAmount: boolean;
    applyforSameCategorySamedate: boolean
}

export interface ApplicableCategories {
    expenseTemplate: string;
    expenseCategory: string[];
}

export interface TemplateAssignment {
    user: string;
    approver: string;
    expenseTemplate: string;
    effectiveDate: Date;
}
