/** RFC 4180 cell, with a guard against spreadsheet formulas. */
export function csvCell(value: unknown): string {
	let text = value == null ? '' : String(value);
	if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
	if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
	return text;
}

export function csvRow(values: unknown[]): string {
	return values.map(csvCell).join(',');
}
