/** Core domain model: a rebuilt double-entry ledger plus the source lists. */

export type AccountClass = "asset" | "liability" | "equity" | "income" | "expense";

export interface Account {
  name: string; // full name incl. parent path ("Utilities:Electric")
  type: string; // QBD ACCNTTYPE (BANK, AR, AP, INC, EXP, ...)
  cls: AccountClass;
  number?: string;
  description?: string;
}

export interface NameRecord {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string[];
  balance?: number | null; // cents, from list export if present
}

export interface Item {
  name: string;
  type: string;
  description?: string;
  price?: number | null;
  account?: string;
}

export interface TxnLine {
  account: string;
  debit: number; // cents, >= 0
  credit: number; // cents, >= 0
  memo?: string;
  name?: string; // customer/vendor on the split line
}

export interface Transaction {
  id: string; // Trans # if present, else synthesized
  type: string; // Invoice, Check, Bill, Deposit, ...
  date: string; // ISO yyyy-mm-dd
  num?: string; // doc number (check #, invoice #)
  name?: string; // primary name on the transaction
  memo?: string;
  lines: TxnLine[];
}

export interface Ledger {
  accounts: Map<string, Account>;
  customers: NameRecord[];
  vendors: NameRecord[];
  items: Item[];
  transactions: Transaction[];
  /** account names that appear in transactions but not in the chart import */
  impliedAccounts: string[];
  warnings: ParseWarning[];
}

export interface ParseWarning {
  severity: "info" | "warn" | "error";
  where: string; // file/section
  line?: number;
  message: string;
}

/** QBD Trial Balance report, parsed. */
export interface TrialBalanceReport {
  asOf?: string; // best-effort from title rows
  rows: { account: string; debit: number | null; credit: number | null }[];
  totalDebit: number | null;
  totalCredit: number | null;
}

export const QBD_ACCOUNT_CLASS: Record<string, AccountClass> = {
  BANK: "asset",
  AR: "asset",
  OCASSET: "asset",
  FIXASSET: "asset",
  OASSET: "asset",
  AP: "liability",
  CCARD: "liability",
  OCLIAB: "liability",
  LTLIAB: "liability",
  EQUITY: "equity",
  INC: "income",
  EXINC: "income",
  EXP: "expense",
  EXEXP: "expense",
  COGS: "expense",
};

export function classifyAccountType(qbType: string): AccountClass {
  return QBD_ACCOUNT_CLASS[qbType.toUpperCase().trim()] ?? "expense";
}

export function isBalanceSheet(cls: AccountClass): boolean {
  return cls === "asset" || cls === "liability" || cls === "equity";
}
