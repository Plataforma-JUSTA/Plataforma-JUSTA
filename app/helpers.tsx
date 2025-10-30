export function ourParseFloat(value: String) {
  if (!value) {
    return 0.0;
  }
  return parseFloat(value.toString().replace(',', '.')).toFixed(3);
};

export function isEmpty(value: any) {
  return (value == null || !value || (typeof value === "string" && value.trim().length === 0));
}

export function addDotsToNumber(number: any) {
  return parseInt(number, 10).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

export function parseImageUrlsInText(text: string) {
  const imgUrlRegex = /(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg))/gi;
  const markdown = text.replaceAll(imgUrlRegex, (match) => {
    return `![image](${match})`;
  });
  return markdown;
}

export function humanizeNumber(number: number) {
  const value = parseInt(number, 10);
  if (value >= 1_000_000_000) {
    return `R$ ${parseInt(value / 1_000_000_000, 10)} bi`;
  } else if (value >= 1_000_000) {
    return `R$ ${parseInt(value / 1_000_000, 10)} mi`;
  }
  return `R$ ${value}`;
}
