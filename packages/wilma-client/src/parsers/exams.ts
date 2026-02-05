import * as cheerio from "cheerio";
import type { Exam } from "../types.js";

export function parseExamsHtml(html: string): Exam[] {
  const $ = cheerio.load(html);
  const exams: Exam[] = [];
  let autoId = 1;
  const now = new Date();

  $("div.table-responsive.margin-bottom").each((_, block) => {
    const table = $(block).find("table.table-grey").first();
    if (!table.length) {
      return;
    }

    const rows = table.find("tr");
    if (!rows.length) {
      return;
    }

    const firstCells = $(rows.get(0)).find("td");
    if (firstCells.length < 2) {
      return;
    }

    const dateText = $(firstCells.get(0)).text().trim();
    const match = /(\d{1,2}\.\d{1,2}\.\d{4})/.exec(dateText);
    if (!match) {
      return;
    }

    const [d, m, y] = match[1].split(".").map(Number);
    // Use midday UTC to avoid timezone date shifts in JSON output
    const examDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

    const subjDesc = $(firstCells.get(1)).text().trim();
    let subject = subjDesc;
    let description: string | null = null;
    if (subjDesc.includes(":")) {
      const parts = subjDesc.split(":");
      description = parts[0].trim();
      subject = parts.slice(1).join(":").trim();
    }

    let teacher: string | null = null;
    let notes: string | null = null;

    rows.slice(1).each((_, row) => {
      const th = $(row).find("th").first();
      const td = $(row).find("td").first();
      if (!th.length || !td.length) {
        return;
      }
      const header = th.text().trim().toLowerCase();
      const value = td.text().trim();
      if (header.includes("opettaja")) {
        const names = td
          .find("a.profile-link")
          .toArray()
          .map((a) => $(a).text().trim())
          .filter(Boolean);
        teacher = names.length ? names.join(", ") : value;
      } else if (header.includes("lisätiedot") || header.includes("notes")) {
        notes = value;
      }
    });

    exams.push({
      wilmaId: autoId,
      examDate,
      subject: compactText(subject || "(N/A)"),
      description: description ? compactText(description) : null,
      teacher: teacher ? compactText(teacher) : null,
      notes: notes ? compactText(notes) : null,
      fetchedAt: now,
    });

    autoId += 1;
  });

  return exams;
}

function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
