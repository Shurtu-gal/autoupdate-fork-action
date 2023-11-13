export function isValueInEnum(value: string, enumeration: unknown): boolean {
  if (typeof enumeration !== 'object') return false;
  else return Object.values(enumeration as object).includes(value);
}
