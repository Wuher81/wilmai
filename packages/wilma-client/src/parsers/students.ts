import * as cheerio from "cheerio";

export interface StudentInfo {
  studentNumber: string;
  name: string;
  href: string;
}

const NAV_KEYWORDS = [
  "messages",
  "viestit",
  "schedule",
  "lukujärjestys",
  "gradebook",
  "assessments",
  "exams",
  "attendance",
  "poissaolot",
  "printouts",
  "news",
];

export function parseStudentsFromHome(html: string): StudentInfo[] {
  const $ = cheerio.load(html);
  const students = new Map<string, StudentInfo>();

  $("a[href^='/!']").each((_, anchor) => {
    const href = $(anchor).attr("href") ?? "";
    const match = /\/!(\d+)\//.exec(href);
    if (!match) {
      return;
    }

    const studentNumber = match[1];
    const cloned = $(anchor).clone();
    cloned.find("small, span.lem").remove();
    const text = cloned.text().trim();
    if (!text) {
      return;
    }

    const lower = text.toLowerCase();
    if (NAV_KEYWORDS.some((kw) => lower.includes(kw))) {
      return;
    }

    if (!students.has(studentNumber)) {
      students.set(studentNumber, {
        studentNumber,
        name: text,
        href,
      });
    }
  });

  return [...students.values()];
}
