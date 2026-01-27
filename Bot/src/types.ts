import { BrowserContext, Page } from "playwright";
import fs from "fs";

export interface BotSession {
  meetingId: string;
  meetingUrl: string;
  context: BrowserContext;
  page: Page;
  fileStream: fs.WriteStream;
  recordingPath: string;
}
