const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

export function formatPriceOrRequest(amount: number | null): string {
  return amount === null ? "Price on request" : formatInr(amount);
}
