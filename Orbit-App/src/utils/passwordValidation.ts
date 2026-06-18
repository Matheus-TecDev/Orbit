export const passwordRuleMessage =
  "A senha deve ter entre 8 e 26 caracteres, com maiúscula, minúscula, número e caractere especial.";

export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8 || password.length > 26) {
    return passwordRuleMessage;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return passwordRuleMessage;
  }

  return null;
}
