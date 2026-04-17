// CSV export utilities with Excel-compatible UTF-8 BOM

function escapeCell(val: any): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV(rows: Record<string, any>[], headers?: string[]): string {
  if (!rows.length) return headers ? headers.join(",") : "";
  const keys = headers ?? Object.keys(rows[0]);
  const headerLine = keys.join(",");
  const lines = rows.map(r => keys.map(k => escapeCell(r[k])).join(","));
  return [headerLine, ...lines].join("\r\n");
}

export function downloadCSV(filename: string, csv: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
