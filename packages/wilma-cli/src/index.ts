#!/usr/bin/env node
import { select, input, password } from "@inquirer/prompts";
import {
  WilmaClient,
  listTenants,
  type MessageFolder,
  type TenantInfo,
  type WilmaProfile,
  type StudentInfo,
} from "@wilmai/wilma-client";
import {
  clearConfig,
  getConfigPath,
  loadConfig,
  obfuscateSecret,
  revealSecret,
  saveConfig,
  type StoredProfile,
} from "./config.js";

const ACTIONS = [
  { value: "news", name: "List news" },
  { value: "exams", name: "List exams" },
  { value: "messages", name: "List messages" },
  { value: "exit", name: "Exit" },
];

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "config" && args[1] === "clear") {
    await clearConfig();
    console.log(`Cleared config at ${getConfigPath()}`);
    return;
  }

  const config = await loadConfig();
  if (args.length) {
    await handleCommand(args, config);
    return;
  }

  await runInteractive(config);
}

async function chooseProfile(
  config: { profiles: StoredProfile[]; lastProfileId?: string | null }
): Promise<WilmaProfile | null> {
  if (config.profiles.length) {
    const choices = config.profiles.map((p) => ({
      value: p.id,
      name: `${p.username} @ ${p.tenantUrl} ${p.lastStudentName ? `(${p.lastStudentName})` : ""}`.trim(),
    }));
    choices.push({ value: "new", name: "Use a new login" });

    const selected = await selectOrCancel({
      message: "Choose a saved profile or create a new one",
      choices,
      default: config.lastProfileId ?? undefined,
    });
    if (selected === null) return null;

    if (selected !== "new") {
      const stored = config.profiles.find((p) => p.id === selected);
      if (!stored) {
        throw new Error("Stored profile not found");
      }
      const secret = revealSecret(stored.passwordObfuscated);
      if (!secret) {
        throw new Error("Stored password could not be decoded");
      }
      const selectedStudent = await chooseStudentFromProfile(stored, {
        baseUrl: stored.tenantUrl,
        username: stored.username,
        password: secret,
      });
      if (!selectedStudent) {
        return null;
      }
      stored.lastUsedAt = new Date().toISOString();
      stored.lastStudentNumber = selectedStudent?.studentNumber ?? null;
      stored.lastStudentName = selectedStudent?.name ?? null;
      config.lastProfileId = stored.id;
      await saveConfig(config);
      return {
        baseUrl: stored.tenantUrl,
        username: stored.username,
        password: secret,
        studentNumber: selectedStudent?.studentNumber ?? undefined,
      };
    }
  }

  const tenant = await selectTenant();
  if (!tenant) return null;
  const username = await inputOrCancel({ message: "Wilma username" });
  if (username === null) return null;
  const passwordValue = await passwordOrCancel({ message: "Wilma password" });
  if (passwordValue === null) return null;

  const profileBase: WilmaProfile = {
    baseUrl: tenant.url,
    username,
    password: passwordValue,
  };

  const students = await WilmaClient.listStudents(profileBase);
  const student = await chooseStudent(students);
  if (!student) return null;

  const finalProfile: WilmaProfile = {
    ...profileBase,
    studentNumber: student?.studentNumber ?? undefined,
  };

  const stored: StoredProfile = {
    id: `${tenant.url}|${username}`,
    tenantUrl: tenant.url,
    username,
    passwordObfuscated: obfuscateSecret(passwordValue),
    students: students.map((s) => ({ studentNumber: s.studentNumber, name: s.name })),
    lastStudentNumber: student?.studentNumber ?? null,
    lastStudentName: student?.name ?? null,
    lastUsedAt: new Date().toISOString(),
  };

  config.profiles = config.profiles.filter((p) => p.id !== stored.id).concat(stored);
  config.lastProfileId = stored.id;
  await saveConfig(config);

  return finalProfile;
}

async function runInteractive(config: { profiles: StoredProfile[]; lastProfileId?: string | null }) {
  while (true) {
    const profile = await chooseProfile(config);
    if (!profile) return;
    const client = await WilmaClient.login(profile);

    let nextAction = await selectOrCancel({
      message: "What do you want to view?",
      choices: [
        ...ACTIONS.filter((a) => a.value !== "exit"),
        { value: "back", name: "Back to students" },
        { value: "exit", name: "Exit" },
      ],
    });
    if (nextAction === null) {
      continue;
    }

    while (nextAction !== "exit" && nextAction !== "back") {
      if (nextAction === "news") {
        await selectNewsToRead(client);
      }

      if (nextAction === "exams") {
        await outputExams(client, { limit: 20, json: false });
      }

      if (nextAction === "messages") {
        const folder = await selectOrCancel<MessageFolder>({
          message: "Select folder",
          choices: [
            { value: "inbox", name: "Inbox" },
            { value: "archive", name: "Archive" },
            { value: "outbox", name: "Outbox" },
            { value: "drafts", name: "Drafts" },
            { value: "appointments", name: "Appointments" },
          ],
        });
        if (folder !== null) {
          await selectMessageToRead(client, folder);
        }
      }

      nextAction = await selectOrCancel({
        message: "What next?",
        choices: [
          ...ACTIONS.filter((a) => a.value !== "exit"),
          { value: "back", name: "Back to students" },
          { value: "exit", name: "Exit" },
        ],
      });
      if (nextAction === null) {
        nextAction = "back";
      }
    }

    if (nextAction === "exit") {
      return;
    }
  }
}

async function selectTenant(): Promise<TenantInfo | null> {
  const tenants = await listTenants();
  let query = await inputOrCancel({
    message: "Search tenant by city/name (blank to list all, or type URL)",
    default: "",
  });
  if (query === null) return null;

  while (true) {
    if (query.startsWith("http://") || query.startsWith("https://")) {
      return {
        url: query.trim().replace(/\/$/, ""),
        name: query.trim(),
        municipalities: [],
      };
    }

    let filtered = tenants;
    if (query.trim()) {
      const search = query.trim().toLowerCase();
      filtered = tenants.filter((t) => tenantMatches(search, t));
    }

    const choices = filtered.slice(0, 20).map((t) => ({
      value: t.url,
      name: `${t.name ?? t.url} (${t.url})`,
    }));
    choices.push({ value: "search", name: "Search again" });
    choices.push({ value: "manual", name: "Enter URL manually" });

    const selected = await selectOrCancel({
      message: "Select tenant",
      choices,
    });
    if (selected === null) return null;

    if (selected === "search") {
      const nextQuery = await inputOrCancel({ message: "Search tenant by city/name (or type URL)" });
      if (nextQuery === null) return null;
      query = nextQuery;
      continue;
    }

    if (selected === "manual") {
      const manual = await inputOrCancel({ message: "Tenant URL" });
      if (manual === null) return null;
      return {
        url: manual.trim().replace(/\/$/, ""),
        name: manual.trim(),
        municipalities: [],
      };
    }

    const tenant = tenants.find((t) => t.url === selected);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    return tenant;
  }
}

function tenantMatches(search: string, tenant: TenantInfo): boolean {
  const needle = (search ?? "").toLowerCase();
  if (fuzzyIncludes(tenant.name ?? "", needle)) {
    return true;
  }
  if (fuzzyIncludes(tenant.url ?? "", needle)) {
    return true;
  }
  const municipalities = Array.isArray(tenant.municipalities) ? tenant.municipalities : [];
  for (const m of municipalities) {
    if (!m) continue;
    if (fuzzyIncludes(m.nameFi ?? "", needle)) return true;
    if (fuzzyIncludes(m.nameSv ?? "", needle)) return true;
  }
  return false;
}

function fuzzyIncludes(target: string, needle: string): boolean {
  const hay = (target ?? "").toLowerCase();
  if (!needle) return true;
  if (hay.includes(needle)) return true;
  let i = 0;
  for (const ch of hay) {
    if (ch === needle[i]) {
      i += 1;
      if (i >= needle.length) return true;
    }
  }
  return false;
}

async function chooseStudent(students: StudentInfo[]): Promise<StudentInfo | null> {
  if (!students.length) {
    const manual = await inputOrCancel({ message: "Student number (not found automatically)" });
    if (manual === null) return null;
    return { studentNumber: manual.trim(), name: manual.trim(), href: `/!${manual.trim()}/` };
  }

  if (students.length === 1) {
    return students[0];
  }

  const selected = await selectOrCancel({
    message: "Select student",
    choices: students.map((s) => ({
      value: s.studentNumber,
      name: `${s.name} (${s.studentNumber})`,
    })),
  });
  if (selected === null) return null;

  return students.find((s) => s.studentNumber === selected) ?? null;
}

async function chooseStudentFromProfile(
  stored: StoredProfile,
  baseProfile: { baseUrl: string; username: string; password: string }
): Promise<StudentInfo | null> {
  let students: StudentInfo[] = [];
  const fresh = await WilmaClient.listStudents(baseProfile);
  if (fresh.length) {
    students = fresh;
    stored.students = fresh.map((s) => ({ studentNumber: s.studentNumber, name: s.name }));
  } else if (stored.students && stored.students.length) {
    students = stored.students.map((s) => ({
      studentNumber: s.studentNumber,
      name: s.name,
      href: `/!${s.studentNumber}/`,
    }));
  }

  const defaultStudent = stored.lastStudentNumber
    ? students.find((s) => s.studentNumber === stored.lastStudentNumber)
    : undefined;

  if (!students.length) {
    return null;
  }
  if (students.length === 1) {
    return students[0];
  }

  const selected = await selectOrCancel({
    message: "Select student",
    default: defaultStudent?.studentNumber,
    choices: students.map((s) => ({
      value: s.studentNumber,
      name: `${s.name} (${s.studentNumber})`,
    })),
  });
  if (selected === null) return null;

  return students.find((s) => s.studentNumber === selected) ?? null;
}

async function handleCommand(
  args: string[],
  config: { profiles: StoredProfile[]; lastProfileId?: string | null }
) {
  const { command, subcommand, flags } = parseArgs(args);
  if (command === "config" && subcommand === "clear") {
    await clearConfig();
    console.log(`Cleared config at ${getConfigPath()}`);
    return;
  }

  const profile = await getProfileForCommand(config);
  if (!profile) return;
  const client = await WilmaClient.login(profile);

  if (command === "kids") {
    const students = await getStudentsForCommand(profile, config);
    if (flags.json) {
      console.log(JSON.stringify(students, null, 2));
      return;
    }
    console.log("\nKids");
    students.forEach((s) => {
      console.log(`- ${s.studentNumber} ${s.name}`);
    });
    return;
  }

  if (command === "news") {
    if (subcommand === "read" && flags.id) {
      await outputNewsItem(client, Number(flags.id), flags.json);
      return;
    }
    if (flags.all) {
      await outputAllNews(profile, config, flags.limit ?? 20, flags.json);
      return;
    }
    const studentInfo = await resolveStudentForFlags(profile, config, flags.student);
    const perStudentClient = await WilmaClient.login({
      ...profile,
      studentNumber: studentInfo?.studentNumber ?? profile.studentNumber,
    });
    await outputNews(perStudentClient, {
      limit: flags.limit ?? 20,
      json: flags.json,
      label: studentInfo?.name ?? undefined,
    });
    return;
  }

  if (command === "messages") {
    if (subcommand === "read" && flags.id) {
      await outputMessageItem(client, Number(flags.id), flags.json);
      return;
    }
    if (flags.all) {
      await outputAllMessages(profile, config, {
        folder: (flags.folder as MessageFolder | undefined) ?? "inbox",
        limit: flags.limit ?? 20,
        json: flags.json,
      });
      return;
    }
    const studentInfo = await resolveStudentForFlags(profile, config, flags.student);
    const perStudentClient = await WilmaClient.login({
      ...profile,
      studentNumber: studentInfo?.studentNumber ?? profile.studentNumber,
    });
    await outputMessages(perStudentClient, {
      folder: (flags.folder as MessageFolder | undefined) ?? "inbox",
      limit: flags.limit ?? 20,
      json: flags.json,
      label: studentInfo?.name ?? undefined,
    });
    return;
  }

  if (command === "exams") {
    if (flags.all) {
      await outputAllExams(profile, config, flags.limit ?? 20, flags.json);
      return;
    }
    const studentInfo = await resolveStudentForFlags(profile, config, flags.student);
    const perStudentClient = await WilmaClient.login({
      ...profile,
      studentNumber: studentInfo?.studentNumber ?? profile.studentNumber,
    });
    await outputExams(perStudentClient, {
      limit: flags.limit ?? 20,
      json: flags.json,
      label: studentInfo?.name ?? undefined,
    });
    return;
  }

  console.log("Usage:");
  console.log("  wilma kids list [--json]");
  console.log("  wilma news list [--limit 20] [--student <id>] [--all] [--json]");
  console.log("  wilma news read <id> [--json]");
  console.log("  wilma messages list [--folder inbox] [--limit 20] [--student <id>] [--all] [--json]");
  console.log("  wilma messages read <id> [--json]");
  console.log("  wilma exams list [--limit 20] [--student <id>] [--all] [--json]");
  console.log("  wilma config clear");
}

async function getProfileForCommand(config: { profiles: StoredProfile[]; lastProfileId?: string | null }) {
  if (config.lastProfileId) {
    const stored = config.profiles.find((p) => p.id === config.lastProfileId);
    if (stored) {
      const secret = revealSecret(stored.passwordObfuscated);
      if (!secret) {
        throw new Error("Stored password could not be decoded");
      }
      const selectedStudent = await chooseStudentFromProfile(stored, {
        baseUrl: stored.tenantUrl,
        username: stored.username,
        password: secret,
      });
      stored.lastUsedAt = new Date().toISOString();
      stored.lastStudentNumber = selectedStudent?.studentNumber ?? null;
      stored.lastStudentName = selectedStudent?.name ?? null;
      await saveConfig(config);
      return {
        baseUrl: stored.tenantUrl,
        username: stored.username,
        password: secret,
        studentNumber: selectedStudent?.studentNumber ?? undefined,
      };
    }
  }
  return chooseProfile(config);
}

function parseArgs(args: string[]) {
  const [command, subcommand, ...rest] = args;
  const flags: {
    json?: boolean;
    limit?: number;
    folder?: string;
    id?: string;
    student?: string;
    all?: boolean;
  } = {};
  let i = 0;
  while (i < rest.length) {
    const arg = rest[i];
    if (arg === "--json") {
      flags.json = true;
      i += 1;
      continue;
    }
    if (arg === "--all") {
      flags.all = true;
      i += 1;
      continue;
    }
    if (arg === "--limit") {
      const value = Number(rest[i + 1]);
      if (!Number.isNaN(value)) {
        flags.limit = value;
      }
      i += 2;
      continue;
    }
    if (arg === "--student") {
      flags.student = rest[i + 1];
      i += 2;
      continue;
    }
    if (arg === "--folder") {
      flags.folder = rest[i + 1];
      i += 2;
      continue;
    }
    if (!flags.id && !arg.startsWith("--")) {
      flags.id = arg;
      i += 1;
      continue;
    }
    i += 1;
  }
  return { command, subcommand, flags };
}

async function outputNews(
  client: WilmaClient,
  opts: { limit: number; json?: boolean; label?: string }
) {
  const news = await client.news.list();
  const slice = news.slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify(slice, null, 2));
    return;
  }
  console.log(`\nNews (${news.length})`);
  slice.forEach((item) => {
    const date = item.published ? item.published.toISOString().slice(0, 10) : "";
    const prefix = opts.label ? `[${opts.label}] ` : "";
    console.log(`- ${prefix}${date} ${compactText(item.title)} (id:${item.wilmaId})`.trim());
  });
}

async function outputNewsItem(client: WilmaClient, id: number, json?: boolean) {
  const item = await client.news.get(id);
  if (json) {
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  console.log(`\n${item.title}`);
  if (item.subtitle) console.log(item.subtitle);
  if (item.published) console.log(item.published.toISOString());
  if (item.content) console.log(`\n${formatContent(item.content)}`);
}

async function outputExams(
  client: WilmaClient,
  opts: { limit: number; json?: boolean; label?: string }
) {
  const exams = await client.exams.list();
  const slice = exams.slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify(slice, null, 2));
    return;
  }
  console.log(`\nExams (${exams.length})`);
  slice.forEach((exam) => {
    const date = exam.examDate.toISOString().slice(0, 10);
    const prefix = opts.label ? `[${opts.label}] ` : "";
    console.log(`- ${prefix}${date} ${compactText(exam.subject)}`);
  });
}

async function outputMessages(
  client: WilmaClient,
  opts: { folder: MessageFolder; limit: number; json?: boolean; label?: string }
) {
  const messages = await client.messages.list(opts.folder);
  const slice = messages.slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify(slice, null, 2));
    return;
  }
  console.log(`\nMessages (${messages.length})`);
  slice.forEach((msg) => {
    const date = msg.sentAt.toISOString().slice(0, 10);
    const prefix = opts.label ? `[${opts.label}] ` : "";
    console.log(`- ${prefix}${date} ${compactText(msg.subject)} (id:${msg.wilmaId})`);
  });
}

async function outputMessageItem(client: WilmaClient, id: number, json?: boolean) {
  const msg = await client.messages.get(id);
  if (json) {
    console.log(JSON.stringify(msg, null, 2));
    return;
  }
  console.log(`\n${msg.subject}`);
  if (msg.senderName) console.log(`From: ${msg.senderName}`);
  console.log(`Sent: ${msg.sentAt.toISOString()}`);
  if (msg.content) console.log(`\n${formatContent(msg.content)}`);
}

async function selectNewsToRead(client: WilmaClient) {
  const news = await client.news.list();
  if (!news.length) return;
  const choices = news.slice(0, 30).map((item) => {
    const date = item.published ? item.published.toISOString().slice(0, 10) : "";
    return {
      value: String(item.wilmaId),
      name: `${date} ${compactText(item.title)}`.trim(),
    };
  });
  choices.unshift({ value: "back", name: "Back" });
  const selected = await selectOrCancel({
    message: "Read which news item?",
    choices,
  });
  if (!selected || selected === "back") return;
  await outputNewsItem(client, Number(selected), false);
}

async function selectMessageToRead(client: WilmaClient, folder: MessageFolder) {
  const messages = await client.messages.list(folder);
  if (!messages.length) return;
  const choices = messages.slice(0, 30).map((msg) => {
    const date = msg.sentAt.toISOString().slice(0, 10);
    return {
      value: String(msg.wilmaId),
      name: `${date} ${compactText(msg.subject)}`.trim(),
    };
  });
  choices.unshift({ value: "back", name: "Back" });
  const selected = await selectOrCancel({
    message: "Read which message?",
    choices,
  });
  if (!selected || selected === "back") return;
  await outputMessageItem(client, Number(selected), false);
}

async function selectOrCancel<T>(opts: Parameters<typeof select>[0]): Promise<T | null> {
  try {
    return (await select(opts)) as T;
  } catch (err) {
    if (isPromptCancel(err)) {
      return null;
    }
    throw err;
  }
}

async function inputOrCancel(opts: Parameters<typeof input>[0]): Promise<string | null> {
  try {
    return await input(opts);
  } catch (err) {
    if (isPromptCancel(err)) {
      return null;
    }
    throw err;
  }
}

async function passwordOrCancel(opts: Parameters<typeof password>[0]): Promise<string | null> {
  try {
    return await password(opts);
  } catch (err) {
    if (isPromptCancel(err)) {
      return null;
    }
    throw err;
  }
}

function isPromptCancel(err: unknown): boolean {
  if (!err) return false;
  const message = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : "";
  return (
    name === "AbortError" ||
    name === "ExitPromptError" ||
    message.includes("User force closed the prompt") ||
    message.toLowerCase().includes("cancel") ||
    message.toLowerCase().includes("aborted")
  );
}

function compactText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function formatContent(value: string): string {
  const lines = value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, arr) => {
      if (line !== "") return true;
      // Keep a single blank line between blocks
      return arr[index - 1] !== "";
    });
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function getStudentsForCommand(
  profile: WilmaProfile,
  config: { profiles: StoredProfile[]; lastProfileId?: string | null }
): Promise<StudentInfo[]> {
  const stored = config.profiles.find((p) => p.id === config.lastProfileId);
  const fresh = await WilmaClient.listStudents(profile);
  if (stored) {
    stored.students = fresh.map((s) => ({ studentNumber: s.studentNumber, name: s.name }));
    await saveConfig(config);
  }
  return fresh;
}

async function resolveStudentForFlags(
  profile: WilmaProfile,
  config: { profiles: StoredProfile[]; lastProfileId?: string | null },
  student?: string
): Promise<StudentInfo | null> {
  if (student) {
    return { studentNumber: student, name: student, href: `/!${student}/` };
  }
  const stored = config.profiles.find((p) => p.id === config.lastProfileId);
  if (stored?.lastStudentNumber) {
    return {
      studentNumber: stored.lastStudentNumber,
      name: stored.lastStudentName ?? stored.lastStudentNumber,
      href: `/!${stored.lastStudentNumber}/`,
    };
  }
  const students = await getStudentsForCommand(profile, config);
  return students[0] ?? null;
}

async function outputAllNews(
  profile: WilmaProfile,
  config: { profiles: StoredProfile[]; lastProfileId?: string | null },
  limit: number,
  json?: boolean
) {
  const students = await getStudentsForCommand(profile, config);
  const results = [];
  for (const student of students) {
    const client = await WilmaClient.login({ ...profile, studentNumber: student.studentNumber });
    const news = await client.news.list();
    results.push({ student, items: news.slice(0, limit) });
  }
  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  results.forEach((entry) => {
    console.log(`\n[${entry.student.name}]`);
    entry.items.forEach((item) => {
      const date = item.published ? item.published.toISOString().slice(0, 10) : "";
      console.log(`- ${date} ${item.title} (id:${item.wilmaId})`.trim());
    });
  });
}

async function outputAllMessages(
  profile: WilmaProfile,
  config: { profiles: StoredProfile[]; lastProfileId?: string | null },
  opts: { folder: MessageFolder; limit: number; json?: boolean }
) {
  const students = await getStudentsForCommand(profile, config);
  const results = [];
  for (const student of students) {
    const client = await WilmaClient.login({ ...profile, studentNumber: student.studentNumber });
    const messages = await client.messages.list(opts.folder);
    results.push({ student, items: messages.slice(0, opts.limit) });
  }
  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  results.forEach((entry) => {
    console.log(`\n[${entry.student.name}]`);
    entry.items.forEach((msg) => {
      const date = msg.sentAt.toISOString().slice(0, 10);
      console.log(`- ${date} ${msg.subject} (id:${msg.wilmaId})`);
    });
  });
}

async function outputAllExams(
  profile: WilmaProfile,
  config: { profiles: StoredProfile[]; lastProfileId?: string | null },
  limit: number,
  json?: boolean
) {
  const students = await getStudentsForCommand(profile, config);
  const results = [];
  for (const student of students) {
    const client = await WilmaClient.login({ ...profile, studentNumber: student.studentNumber });
    const exams = await client.exams.list();
    results.push({ student, items: exams.slice(0, limit) });
  }
  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  results.forEach((entry) => {
    console.log(`\n[${entry.student.name}]`);
    entry.items.forEach((exam) => {
      const date = exam.examDate.toISOString().slice(0, 10);
      console.log(`- ${date} ${exam.subject}`);
    });
  });
}

main().catch((err) => {
  if (isPromptCancel(err)) {
    process.exit(0);
  }
  console.error("CLI error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
