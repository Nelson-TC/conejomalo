export function formatCurrency(value: number, locale: string = 'es-CL', currency: string = 'CLP') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
}
