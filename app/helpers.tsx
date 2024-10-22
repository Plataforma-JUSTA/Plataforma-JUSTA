export function ourParseFloat(value: String) {
  if (!value) {
    return 0.0;
  }
  return parseFloat(value.toString().replace(',', '.')).toFixed(3);
};

export function isEmpty(value: any) {
  return (value == null || !value || (typeof value === "string" && value.trim().length === 0));
}
