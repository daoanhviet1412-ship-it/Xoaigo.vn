export type PendingStatus = "PENDING" | "RELEASED" | "REVERSED";
export type PendingTransaction = {
  id: string; merchant: string; orderRef: string; merchantDebit: number;
  customerPending: number; appPending: number; createdAt: string;
  status: PendingStatus; reversedAt?: string;
};
export const PENDING_CONTROL_KEY = "xoai-pending-control-v1";
export function readPendingTransactions(): PendingTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(PENDING_CONTROL_KEY) || "[]");
    return Array.isArray(value) ? value.filter((row) =>
      row && typeof row.id === "string" && typeof row.orderRef === "string" &&
      Number.isSafeInteger(row.merchantDebit) && Number.isSafeInteger(row.customerPending) &&
      Number.isSafeInteger(row.appPending) && ["PENDING","RELEASED","REVERSED"].includes(row.status)
    ) : [];
  } catch { return []; }
}
export function writePendingTransactions(rows: PendingTransaction[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(PENDING_CONTROL_KEY, JSON.stringify(rows));
}
export function summarizePending(rows: PendingTransaction[]) {
  const active = rows.filter((row) => row.status !== "REVERSED");
  const pending = active.filter((row) => row.status === "PENDING");
  const customerPending = pending.reduce((sum, row) => sum + row.customerPending, 0);
  const appPending = pending.reduce((sum, row) => sum + row.appPending, 0);
  const merchantDebit = active.reduce((sum, row) => sum + row.merchantDebit, 0);
  const allocated = active.reduce((sum, row) => sum + row.customerPending + row.appPending, 0);
  const mismatches = active.filter((row) => row.merchantDebit !== row.customerPending + row.appPending);
  return { customerPending, appPending, totalPending: customerPending + appPending, merchantDebit, allocated, variance: merchantDebit - allocated, mismatchCount: mismatches.length, transactionCount: rows.length, pendingCount: pending.length };
}
