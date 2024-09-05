import { ZodIssue } from 'zod';

export function buildValidationErrorMessage(issues: ZodIssue[]) {
  const errors = issues.map(
    (item) => `${item.path.join('.')}: ${item.message}`,
  );

  return errors;
}
