import { chromium, BrowserContext, Page } from "playwright";
import fs from "fs";
import { BotSession } from "./types";

export async function startRecording(
  meetingId: string,
  meetingUrl: string,
  outputPath: string
): Promise<BotSession> {

  // --------------------------------------------------
  // 1. Launch persistent context
  // --------------------------------------------------
  const context: BrowserContext =
    await chromium.launchPersistentContext("./user-data", {
      headless: false,
      permissions: ["microphone", "camera"],
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
      ],
    });

  const page: Page = context.pages()[0] || await context.newPage();

  page.on("console", (msg) => {
    console.log("[BROWSER]", msg.text());
  });

  // --------------------------------------------------
  // 2. Navigate to Google Meet
  // --------------------------------------------------
  await page.goto(meetingUrl, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // --------------------------------------------------
  // 3. Enter name if required
  // --------------------------------------------------
  try {
    const nameInput = page.locator(
      'input[aria-label*="name"], input[placeholder*="name"]'
    ).first();

    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.fill("Meeting Assistant");
    }
  } catch {}

  // --------------------------------------------------
  // 4. Turn off mic & camera
  // --------------------------------------------------
  try {
    const micBtn = page.locator('[aria-label*="microphone"]').first();
    if (await micBtn.isVisible({ timeout: 3000 })) {
      await micBtn.click();
    }

    const camBtn = page.locator('[aria-label*="camera"]').first();
    if (await camBtn.isVisible({ timeout: 3000 })) {
      await camBtn.click();
    }
  } catch {}

  // --------------------------------------------------
  // 5. Click Join / Ask to join
  // --------------------------------------------------
  const joinSelectors = [
    'button:has-text("Join now")',
    'button:has-text("Ask to join")',
    '[aria-label="Join now"]',
  ];

  for (const sel of joinSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 3000 })) {
        await btn.click();
        break;
      }
    } catch {}
  }

  // --------------------------------------------------
  // 6. Wait until REALLY inside the meeting
  // --------------------------------------------------
  await new Promise<void>((resolve, reject) => {
    let done = false;

    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };

    const timeout = setTimeout(() => {
      if (!done) {
        reject(new Error("Timed out waiting to join Google Meet"));
      }
    }, 120000);

    page
      .waitForSelector('button[aria-label="Chat with everyone"]', {
        timeout: 120000,
      })
      .then(() => {
        clearTimeout(timeout);
        finish();
      })
      .catch(() => {});

    page
      .waitForSelector('button[aria-label="Show everyone"]', {
        timeout: 120000,
      })
      .then(() => {
        clearTimeout(timeout);
        finish();
      })
      .catch(() => {});
  });

  console.log("✅ Bot joined Google Meet");

  await page.bringToFront();
  await page.waitForTimeout(2000);

  // --------------------------------------------------
  // 7. Prepare recording output
  // --------------------------------------------------
  const fileStream = fs.createWriteStream(outputPath);

  await context.exposeFunction("saveChunk", (chunk: number[]) => {
    fileStream.write(Buffer.from(chunk));
  });

  // --------------------------------------------------
  // 8. Start MediaRecorder
  // --------------------------------------------------
  await page.evaluate(async () => {
    const w = window as any;

    document.body.addEventListener(
      "click",
      async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 25 },
          audio: true,
          preferCurrentTab: true,
        } as any);

        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp8,opus",
        });

        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            const buf = await e.data.arrayBuffer();
            w.saveChunk(Array.from(new Uint8Array(buf)));
          }
        };

        recorder.start(1000);
        w._recorder = recorder;
      },
      { once: true }
    );
  });

  // Trigger user gesture
  await page.mouse.click(10, 10);

  console.log("🎥 Recording started");

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
      if (w._recorder && w._recorder.state !== "inactive") {
        w._recorder.stop();
      }
    });
  } catch {}

  await new Promise((res) => setTimeout(res, 2000));
  session.fileStream.end();
  await session.context.close();
}
