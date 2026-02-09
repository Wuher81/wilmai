import { WilmaSession } from "./session.js";
import type { Exam, Message, MessageFolder, NewsItem, OverviewData, WilmaProfile, StudentInfo } from "./types.js";
import { parseWilmaTimestamp } from "./parsers/dates.js";
import { parseMessagesList, parseMessageDetailHtml } from "./parsers/messages.js";
import {
  parseNewsDetailHtml,
  parseNewsDetailJson,
  parseNewsList,
  parseNewsListHtml,
} from "./parsers/news.js";
import { parseExamsHtml } from "./parsers/exams.js";
import { parseOverview } from "./parsers/overview.js";
import { parseStudentsFromHome } from "./parsers/students.js";

export class WilmaClient {
  private session: WilmaSession;

  private constructor(session: WilmaSession) {
    this.session = session;
  }

  static async login(profile: WilmaProfile): Promise<WilmaClient> {
    const session = new WilmaSession(profile.baseUrl, {
      studentNumber: profile.studentNumber ?? null,
      debug: profile.debug ?? false,
    });
    await session.login(profile.username, profile.password);
    return new WilmaClient(session);
  }

  static async listStudents(profile: WilmaProfile): Promise<StudentInfo[]> {
    const session = new WilmaSession(profile.baseUrl);
    await session.login(profile.username, profile.password);
    const resp = await session.get("/");
    const html = await resp.text();
    return parseStudentsFromHome(html);
  }

  messages = {
    list: async (folder: MessageFolder = "inbox"): Promise<Message[]> => {
      const folderPaths: Record<MessageFolder, string> = {
        inbox: "/messages/list",
        archive: "/messages/list/archive",
        outbox: "/messages/list/outbox",
        drafts: "/messages/list/drafts",
        appointments: "/messages/list/appointments",
      };

      const path = folderPaths[folder] ?? "/messages/list";
      const resp = await this.session.get(path);
      const text = await resp.text();
      const data = safeJson(text);
      return parseMessagesList(data, folder);
    },

    get: async (messageId: number): Promise<Message> => {
      const resp = await this.session.get(`/messages/${messageId}`);
      const contentType = resp.headers.get("content-type")?.toLowerCase() ?? "";
      const text = await resp.text();

      if (contentType.includes("application/json")) {
        const data = safeJson(text) as Record<string, unknown>;
        return {
          wilmaId: messageId,
          subject: String(data["Subject"] ?? data["subject"] ?? ""),
          sentAt: parseWilmaTimestamp(data["TimeStamp"] ?? data["timestamp"]),
          folder: String(data["Folder"] ?? "unknown"),
          senderId: (data["SenderId"] as number | undefined) ?? null,
          senderType: (data["SenderType"] as number | undefined) ?? null,
          senderName: (data["Sender"] ?? data["sender"]) as string | null,
          sendersJson: (data["Senders"] ?? data["senders"]) as Record<string, unknown> | null,
          status: (data["Status"] as number | undefined) ?? null,
          content: (data["Content"] ?? data["content"]) as string | null,
          fetchedAt: new Date(),
        };
      }

      return parseMessageDetailHtml(text, messageId);
    },
  };

  news = {
    list: async (): Promise<NewsItem[]> => {
      const resp = await this.session.get("/news");
      const text = await resp.text();
      const data = safeJson(text);
      if (Array.isArray(data)) {
        return parseNewsList(data);
      }
      return parseNewsListHtml(text);
    },

    get: async (newsId: number): Promise<NewsItem> => {
      const resp = await this.session.get(`/news/${newsId}`);
      const contentType = resp.headers.get("content-type")?.toLowerCase() ?? "";
      const text = await resp.text();
      if (!contentType.includes("text/html")) {
        const data = safeJson(text) as Record<string, unknown>;
        if (Object.keys(data).length) {
          return parseNewsDetailJson(newsId, data);
        }
      }
      return parseNewsDetailHtml(text, newsId);
    },
  };

  exams = {
    list: async (opts?: { start?: string; end?: string }): Promise<Exam[]> => {
      const params = new URLSearchParams();
      if (opts?.start) {
        params.set("start", opts.start);
      }
      if (opts?.end) {
        params.set("end", opts.end);
      }
      const query = params.toString();
      const path = query ? `/exams/calendar?${query}` : "/exams/calendar";
      const resp = await this.session.get(path);
      const text = await resp.text();
      return parseExamsHtml(text);
    },
  };

  overview = {
    get: async (): Promise<OverviewData> => {
      const resp = await this.session.get("/overview");
      const text = await resp.text();
      return parseOverview(safeJson(text));
    },
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
