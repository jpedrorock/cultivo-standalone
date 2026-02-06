/**
 * Utilitário de validação para formulários de registro diário
 */

export interface ValidationRule {
  min: number;
  max: number;
  label: string;
  unit: string;
}

export interface ValidationRules {
  tempC: ValidationRule;
  rhPct: ValidationRule;
  ppfd: ValidationRule;
  ph: ValidationRule;
  ec: ValidationRule;
}

export const VALIDATION_RULES: ValidationRules = {
  tempC: {
    min: -10,
    max: 50,
    label: "Temperatura",
    unit: "°C",
  },
  rhPct: {
    min: 0,
    max: 100,
    label: "Umidade Relativa",
    unit: "%",
  },
  ppfd: {
    min: 0,
    max: 2000,
    label: "PPFD",
    unit: "µmol/m²/s",
  },
  ph: {
    min: 0,
    max: 14,
    label: "pH",
    unit: "",
  },
  ec: {
    min: 0,
    max: 5,
    label: "EC",
    unit: "mS/cm",
  },
};

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Valida um valor numérico contra uma regra
 */
export function validateField(
  value: string | number | null | undefined,
  rule: ValidationRule
): ValidationError | null {
  // Valor vazio é permitido (campos opcionais)
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Verifica se é um número válido
  if (isNaN(numValue)) {
    return {
      field: rule.label,
      message: `${rule.label} deve ser um número válido`,
    };
  }

  // Verifica range
  if (numValue < rule.min || numValue > rule.max) {
    const unit = rule.unit ? ` ${rule.unit}` : "";
    return {
      field: rule.label,
      message: `${rule.label} deve estar entre ${rule.min}${unit} e ${rule.max}${unit}`,
    };
  }

  return null;
}

/**
 * Valida todos os campos de um registro diário
 */
export function validateDailyLog(data: {
  tempC?: string | number | null;
  rhPct?: string | number | null;
  ppfd?: string | number | null;
  ph?: string | number | null;
  ec?: string | number | null;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validar cada campo
  const tempError = validateField(data.tempC, VALIDATION_RULES.tempC);
  if (tempError) errors.push(tempError);

  const rhError = validateField(data.rhPct, VALIDATION_RULES.rhPct);
  if (rhError) errors.push(rhError);

  const ppfdError = validateField(data.ppfd, VALIDATION_RULES.ppfd);
  if (ppfdError) errors.push(ppfdError);

  const phError = validateField(data.ph, VALIDATION_RULES.ph);
  if (phError) errors.push(phError);

  const ecError = validateField(data.ec, VALIDATION_RULES.ec);
  if (ecError) errors.push(ecError);

  return errors;
}

/**
 * Verifica se um valor está dentro do range válido
 */
export function isValueInRange(
  value: string | number | null | undefined,
  rule: ValidationRule
): boolean {
  return validateField(value, rule) === null;
}

/**
 * Formata mensagem de erro para exibição
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0].message;
  return errors.map((e) => `• ${e.message}`).join("\n");
}
