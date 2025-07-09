import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static digitsOnly(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^\d+$/.test(value)) {
      return { digitsOnly: true };
    }
    return null;
  }

  static bankName(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[a-zA-Z\s&-.]+$/.test(value)) {
      return { invalidBankName: true };
    }
    return null;
  }

  static ifscCode(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[A-Z]{4}0\d{6}$/.test(value)) {
      return { invalidIFSC: true };
    }
    return null;
  }

  static bankBranch(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[a-zA-Z\s&-.]+$/.test(value)) {
      return { invalidBankBranch: true };
    }
    return null;
  }

  static bankAddress(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[a-zA-Z0-9\s,.\/-]+$/.test(value)) {
      return { invalidBankAddress: true };
    }
    return null;
  }

  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value);
    if (value && (value.length < 10 || value.length > 15)) {
      return { invalidLength: true };
    }
    return null;
  }

  static bankAccountNumber(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value);
    if (value && (value.length < 9 || value.length > 18)) {
      return { invalidLength: true };
    }
    return null;
  }

  static panCard(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(value)) {
      return { invalidPAN: true };
    }
    return null;
  }

  static aadharNumber(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value);
    if (value && !/^\d{12}$/.test(value)) {
      return { invalidAadhar: true };
    }
    return null;
  }
  static strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      if (!value) return null;
      const hasLowerCase = /[a-z]/.test(value);
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValid = hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
      return isValid ? null : { weakPassword: true };
    };
    static selectRequiredValidator(control: AbstractControl): ValidationErrors | null {
      return control.value === '' || control.value === null ? { selectRequired: true } : null;
    }
}
