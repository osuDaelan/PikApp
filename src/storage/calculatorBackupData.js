import { MAX_KNOWN } from "../features/calculator/levelData.js";
import { MAX_NUMERIC_INPUT } from "../shared/numericInput.js";

export const CALCULATOR_FIELDS = ["level", "stepsInput", "flowersInput", "dSteps", "dFlowers", "coinsNow", "totalStepsMode"];
export const CALCULATOR_BACKUP_URL = "/__pikapp_local/calculator-progress";

export function calculatorSnapshot(source) {
  return Object.fromEntries(CALCULATOR_FIELDS.map(field => [field, source[field]]));
}

export function validCalculatorSnapshot(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length === CALCULATOR_FIELDS.length
    && CALCULATOR_FIELDS.every(field => field === "totalStepsMode"
      ? typeof value[field] === "boolean"
      : Number.isSafeInteger(value[field]) && value[field] >= 0 && value[field] <= MAX_NUMERIC_INPUT)
    && value.level >= 1 && value.level <= MAX_KNOWN;
}

export function validCalculatorBackup(value) {
  return value && value.version === 1 && Number.isSafeInteger(value.savedAt) && value.savedAt > 0
    && validCalculatorSnapshot(value.calculator);
}
