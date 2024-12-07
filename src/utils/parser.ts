function value(value: string | null): string | number | boolean | null {
  if (value === null || value === "null") return null;

  if (!Number.isNaN(parseFloat(value as string)))
    return parseFloat(value as string);

  if (value === "true") return true;
  if (value === "false") return false;

  return value;
}

function transform(value: string | number | boolean | null) {
  if (value === null) return "null";

  if (typeof value === "number") {
    return value.toString();
  }

  if (value === true) return "true";
  if (value === false) return "false";

  return `${value}`;
}

export default { value, transform };
