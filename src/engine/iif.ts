/**
 * Parser for QuickBooks Desktop IIF list exports.
 *
 * IIF is tab-delimited. Header rows begin with "!" and declare the columns
 * for the section that follows:
 *
 *   !ACCNT	NAME	ACCNTTYPE	DESC	ACCNUM	...
 *   ACCNT	Checking	BANK		1000
 *   !CUST	NAME	BADDR1	BADDR2	...	BALANCE	...
 *   CUST	Acme Corp	123 Main St	...
 *
 * A single export can contain several sections. Real-world files carry
 * quirks: repeated header rows, trailing tabs, Windows-1252 characters,
 * HDR metadata rows, ENDGRP markers. Everything unknown is skipped with a
 * warning rather than failing the parse — the reconciliation step is the
 * safety net, not the parser.
 */
import { parseDelimited, findColumn } from "./table";
import { parseAmount } from "./money";
import { Account, NameRecord, Item, ParseWarning, classifyAccountType } from "./types";

export interface IifResult {
  accounts: Account[];
  customers: NameRecord[];
  vendors: NameRecord[];
  items: Item[];
  otherSections: string[];
  warnings: ParseWarning[];
}

export function parseIif(text: string, fileLabel = "IIF"): IifResult {
  const rows = parseDelimited(text, "\t");
  const result: IifResult = {
    accounts: [],
    customers: [],
    vendors: [],
    items: [],
    otherSections: [],
    warnings: [],
  };
  let headers: Record<string, string[]> = {};

  const warn = (severity: ParseWarning["severity"], line: number, message: string) =>
    result.warnings.push({ severity, where: fileLabel, line: line + 1, message });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const tag = (row[0] || "").trim();
    if (tag === "") continue;
    if (tag.startsWith("!")) {
      const section = tag.slice(1).toUpperCase();
      headers[section] = row.map((c) => c.trim().toUpperCase());
      if (!["ACCNT", "CUST", "VEND", "INVITEM", "HDR", "TRNS", "SPL", "ENDTRNS", "CLASS", "CTYPE", "VTYPE", "EMP", "OTHERNAME"].includes(section)) {
        result.otherSections.push(section);
      }
      continue;
    }
    const section = tag.toUpperCase();
    const header = headers[section];
    if (!header) {
      if (section !== "ENDTRNS" && section !== "HDR" && section !== "ENDGRP") {
        warn("info", i, `Row of unknown section "${section}" skipped`);
      }
      continue;
    }
    const get = (...names: string[]) => {
      const idx = findColumn(header, ...names);
      return idx >= 0 && idx < row.length ? row[idx].trim() : "";
    };

    switch (section) {
      case "ACCNT": {
        const name = get("NAME");
        if (!name) {
          warn("warn", i, "ACCNT row without NAME skipped");
          break;
        }
        const type = get("ACCNTTYPE") || "EXP";
        result.accounts.push({
          name,
          type,
          cls: classifyAccountType(type),
          number: get("ACCNUM") || undefined,
          description: get("DESC") || undefined,
        });
        break;
      }
      case "CUST": {
        const name = get("NAME");
        if (!name) break;
        result.customers.push({
          name,
          company: get("COMPANYNAME", "COMPANY") || undefined,
          email: get("EMAIL") || undefined,
          phone: get("PHONE1", "PHONE") || undefined,
          address: [get("BADDR1"), get("BADDR2"), get("BADDR3"), get("BADDR4"), get("BADDR5")].filter(Boolean),
          balance: parseAmount(get("BALANCE")),
        });
        break;
      }
      case "VEND": {
        const name = get("NAME");
        if (!name) break;
        result.vendors.push({
          name,
          company: get("COMPANYNAME", "COMPANY") || undefined,
          email: get("EMAIL") || undefined,
          phone: get("PHONE1", "PHONE") || undefined,
          address: [get("ADDR1"), get("ADDR2"), get("ADDR3"), get("ADDR4"), get("ADDR5")].filter(Boolean),
          balance: parseAmount(get("BALANCE")),
        });
        break;
      }
      case "INVITEM": {
        const name = get("NAME");
        if (!name) break;
        result.items.push({
          name,
          type: get("INVITEMTYPE") || "SERV",
          description: get("DESC") || undefined,
          price: parseAmount(get("PRICE")),
          account: get("ACCNT") || undefined,
        });
        break;
      }
      default:
        // known-but-unused sections (CLASS, EMP, ...) are fine to skip silently
        break;
    }
  }

  // de-duplicate on name (repeated header/export runs happen in the wild)
  const dedupe = <T extends { name: string }>(arr: T[]): T[] => {
    const seen = new Set<string>();
    return arr.filter((x) => {
      const k = x.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  result.accounts = dedupe(result.accounts);
  result.customers = dedupe(result.customers);
  result.vendors = dedupe(result.vendors);
  result.items = dedupe(result.items);
  return result;
}
