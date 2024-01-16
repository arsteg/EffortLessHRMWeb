export interface ExpenseCategory {
    type: string;
    label: string;
    isMandatory: boolean;
}

export interface AdvanceCategory {
 
    label: string;

   
}


export interface AdvanceTemplate {
     
    policyLabel:string;
    approvalType:string;
    approvalLevel:string;
    expenseCategories:{
        expenseCategory: string
      }[];
   
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
    expenseCategories: [{
        expenseCategory: string,
        isMaximumAmountPerExpenseSet: false,
        maximumAmountPerExpense: 0,
        isMaximumAmountWithoutReceiptSet: false,
        maximumAmountWithoutReceipt: 0,
        maximumExpensesCanApply: 0,
        isTimePeroidSet: false,
        timePeroid: string,
        expiryDay: 0,
        isEmployeeCanAddInTotalDirectly: false,
        ratePerDay: 0
      }]
}

export interface TemplateAssignment {
    user: string;
    secondaryApprover: string;
    primaryApprover: string;
    expenseTemplate: string;
    effectiveDate: Date;
}
