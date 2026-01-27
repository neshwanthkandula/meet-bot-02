import { chromium, BrowserContext, Page } from "playwright";
import fs from "fs";
import { BotSession } from "./types";



export async function startRecording(
  meetingId: string,
  meetingUrl: string,
  outputPath: string
): Promise<BotSession> {

  // --------------------------------------------------
  // 1. Launch persistent browser context (REQUIRED)
  // --------------------------------------------------
  const context: BrowserContext =
    await chromium.launchPersistentContext("./user-data", {
      headless: false,
      permissions: ["microphone", "camera"],
      args: [
        "--use-fake-ui-for-media-stream",
        "--disable-blink-features=AutomationControlled",
        "--autoplay-policy=no-user-gesture-required",
        "--no-sandbox",
      ],
    });

  const page: Page = context.pages()[0] || await context.newPage();

  page.on("console", (msg) => {
    console.log(`[BROWSER] ${msg.text()}`);
  });

  // --------------------------------------------------
  // 2. Navigate to Zoom meeting
  // --------------------------------------------------
  await page.goto(meetingUrl, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // --------------------------------------------------
  // 3. Join from browser (if shown)
  // --------------------------------------------------
  try {
    const joinFromBrowser = page.locator("text=Join from your browser");
    if (await joinFromBrowser.isVisible({ timeout: 8000 })) {
      await joinFromBrowser.click();
    }
  } catch {}

  // --------------------------------------------------
  // 4. Enter name (if required)
  // --------------------------------------------------
  try {
    const nameInput = page.locator("input#inputname");
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill("Meeting Assistant");
    }
  } catch {}

  // --------------------------------------------------
  // 5. Click Join
  // --------------------------------------------------
  try {
    const joinBtn = page.locator('button:has-text("Join")');
    if (await joinBtn.isVisible({ timeout: 8000 })) {
      await joinBtn.click();
    }
  } catch {}

  // --------------------------------------------------
  // 6. Stabilization delay
  // --------------------------------------------------
  await page.waitForTimeout(10000);

  // --------------------------------------------------
  // 7. Prepare recording file
  // --------------------------------------------------
  const fileStream = fs.createWriteStream(outputPath);

  await context.exposeFunction("saveChunk", (chunk: number[]) => {
    fileStream.write(Buffer.from(chunk));
  });

  // --------------------------------------------------
  // 8. Start MediaRecorder inside browser
  // --------------------------------------------------
  await page.evaluate(async () => {
  const w = window as any;

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 30 },
    audio: true,
    preferCurrentTab: true,
  } as any);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp9",
  });

  recorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      const buffer = await event.data.arrayBuffer();
      w.saveChunk(Array.from(new Uint8Array(buffer)));
    }
  };

  recorder.start(1000);
  w._recorder = recorder;
});

  return {
    meetingId,
    meetingUrl,
    context,
    page,
    fileStream,
    recordingPath: outputPath,
  };
}


export async function stopRecording(session: BotSession) {
  try {
    await session.page.evaluate(() => {
      const w = window as any;
      if (w._recorder) {
        w._recorder.stop();
      }
    });
  } catch {}

  await new Promise((res) => setTimeout(res, 2000));

  session.fileStream.end();
  await session.context.close();
}