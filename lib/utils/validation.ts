export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && !value) {
    return 'This field is required';
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    return `Minimum length is ${rules.minLength} characters`;
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Maximum length is ${rules.maxLength} characters`;
  }
  
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }
  
  if (value && rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') return result;
    if (!result) return 'Invalid value';
  }
  
  return null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): { isValid: boolean; errors: Record<keyof T, string | null> } {
  const errors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
  let isValid = true;
  
  for (const field in rules) {
    const error = validateField(data[field], rules[field]);
    errors[field] = error;
    if (error) isValid = false;
  }
  
  return { isValid, errors };
} 