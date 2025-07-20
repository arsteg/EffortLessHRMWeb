import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
  static noSpacesNumbersOrSymbolsValidator(control: any) {
    const value = control.value;
    if (/\d/.test(value) || /\s/.test(value) || /[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return { invalidName: true };
    }
    return null;
  }
  static appliedLessThanMaxValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const appliedControl = group.get('appliedAmount');
      const maxControl = group.get('maximumAmount');

      if (!appliedControl || !maxControl) return null;

      const applied = +appliedControl.value;
      const max = +maxControl.value;

      if (applied > max) {
        appliedControl.setErrors({ appliedExceedsMax: true });
      } else {
        const errors = appliedControl.errors;
        if (errors) {
          delete errors['appliedExceedsMax'];
          if (!Object.keys(errors).length) {
            appliedControl.setErrors(null);
          } else {
            appliedControl.setErrors(errors);
          }
        }
      }

      return null;
    };
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
    static passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
      const passwordControl = group.get('password');
      const confirmControl = group.get('passwordConfirm');
    
      if (!passwordControl || !confirmControl) return null;
    
      const password = passwordControl.value ?? '';
      const confirmPassword = confirmControl.value ?? '';
    
      
      if (!password || !confirmPassword) {
        confirmControl.setErrors(null); // remove stale errors
        return null;
      }
    
      if (password !== confirmPassword) {
        confirmControl.setErrors({ notMatching: true });
        return { notMatching: true };
      } else {
        // Only clear the error if no other errors exist
        if (confirmControl.hasError('notMatching')) {
          confirmControl.setErrors(null);
        }
        return null;
      }
    }
    static email(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
      if (!value) return null;
      const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return pattern.test(value) ? null : { invalidEmail: true };
    }
    static noLeadingOrTrailingSpaces(control: AbstractControl): { [key: string]: any } | null {
      const value = control.value;
      if (typeof value === 'string' && (value.startsWith(' ') || value.endsWith(' '))) {
        return { spacesNotAllowed: true };
      }
      return null;
    }
  // Custom validator for shift name
 
  static labelValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (!value || /^\s*$/.test(value)) {
      return { required: true };
    }
    const valid = /^(?=.*[a-zA-Z])[a-zA-Z\s(),\-/]*$/.test(value);
    return valid ? null : { invalidLabel: true };
  }
}
