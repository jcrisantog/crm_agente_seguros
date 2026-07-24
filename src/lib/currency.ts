export function formatCurrency(value: string | number | null | undefined): string {
    const numericValue = typeof value === "number" ? value : Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

    return `$${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeValue)}`;
}
