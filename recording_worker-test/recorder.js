const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  try {
    console.log('==============================');
    console.log('Meeting Recorder Started');
    console.log('==============================');

    const meetingUrl = process.argv[2];
    if (!meetingUrl) {
      console.error('❌ ERROR: Meeting URL not provided');
      console.error('Usage: node recorder.js <meeting-url>');
      process.exit(1);
    }

    console.log('📌 Meeting URL:', meetingUrl);

    // ----------------------------------
    // 1. Launch persistent browser
    // ----------------------------------
    console.log('🚀 Launching Chromium browser...');
    const context = await chromium.launchPersistentContext('./user-data', {
      headless: false, // MUST be false for now
      permissions: ['microphone', 'camera'],
      args: [
        '--use-fake-ui-for-media-stream',
        '--disable-blink-features=AutomationControlled',
        '--autoplay-policy=no-user-gesture-required'
      ]
    });

    console.log('✅ Browser launched');

    const page = context.pages()[0] || await context.newPage();
    console.log('🧩 Page ready');

    page.on('console', msg => {
      console.log(`🌐 BROWSER LOG: ${msg.text()}`);
    });

    // ----------------------------------
    // 2. Navigate to meeting URL
    // ----------------------------------
    console.log('🌍 Navigating to meeting...');
    await page.goto(meetingUrl, { waitUntil: 'networkidle' });
    console.log('✅ Meeting page loaded');

    // ----------------------------------
    // 3. Attempt Zoom "Join from Browser"
    // ----------------------------------
    console.log('🔍 Checking for "Join from browser"...');
    try {
      const joinFromBrowser = page.locator('text=Join from your browser');
      if (await joinFromBrowser.isVisible({ timeout: 8000 })) {
        await joinFromBrowser.click();
        console.log('✅ Clicked "Join from browser"');
      } else {
        console.log('ℹ️ "Join from browser" not visible');
      }
    } catch (err) {
      console.log('⚠️ Join-from-browser step skipped');
    }

    await page.waitForTimeout(3000);

    // ----------------------------------
    // 4. Enter name (if required)
    // ----------------------------------
    console.log('✍️ Checking for name input...');
    try {
      const nameInput = page.locator('input#inputname');
      if (await nameInput.isVisible({ timeout: 5000 })) {
        await nameInput.fill('Meeting Assistant');
        console.log('✅ Name entered');
      } else {
        console.log('ℹ️ Name input not required');
      }
    } catch {
      console.log('⚠️ Name input step skipped');
    }

    // ----------------------------------
    // 5. Click Join button
    // ----------------------------------
    console.log('🔘 Attempting to click Join button...');
    try {
      const joinBtn = page.locator('button:has-text("Join")');
      if (await joinBtn.isVisible({ timeout: 8000 })) {
        await joinBtn.click();
        console.log('✅ Clicked Join button');
      } else {
        console.log('ℹ️ Join button not visible');
      }
    } catch {
      console.log('⚠️ Join button step skipped');
    }

    // ----------------------------------
    // 6. Wait for meeting to stabilize
    // ----------------------------------
    console.log('⏳ Waiting for meeting audio/video to stabilize...');
    await page.waitForTimeout(10000);

    // ----------------------------------
    // 7. Prepare recording file
    // ----------------------------------
    const outputFile = `recording-${Date.now()}.webm`;
    console.log('💾 Recording file:', outputFile);
    const fileStream = fs.createWriteStream(outputFile);

    // ----------------------------------
    // 8. Expose saveChunk function
    // ----------------------------------
    console.log('🔗 Exposing saveChunk() to browser...');
    await context.exposeFunction('saveChunk', (chunk) => {
      fileStream.write(Buffer.from(chunk));
      console.log(`📦 Chunk received (${chunk.length} bytes)`);
    });

    // ----------------------------------
    // 9. Start recording INSIDE browser
    // ----------------------------------
    console.log('🎥 Starting recording inside browser...');
    await page.evaluate(async () => {
      console.log('Browser: Requesting display media...');

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
        preferCurrentTab: true
      });

      console.log('Browser: Media stream captured');

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const buffer = await event.data.arrayBuffer();
          // @ts-ignore
          window.saveChunk(Array.from(new Uint8Array(buffer)));
        }
      };

      recorder.start(1000);
      console.log('Browser: MediaRecorder started');

      // @ts-ignore
      window._recorder = recorder;
    });

    console.log('🟢 Recording started successfully');
    console.log('🛑 Press CTRL + C to stop recording');

    // ----------------------------------
    // 10. Graceful shutdown
    // ----------------------------------
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping recording...');

      try {
        await page.evaluate(() => {
          // @ts-ignore
          if (window._recorder) {
            window._recorder.stop();
            console.log('Browser: Recorder stopped');
          }
        });
      } catch (err) {
        console.log('⚠️ Error stopping recorder:', err);
      }

      await new Promise(res => setTimeout(res, 2000));

      fileStream.end();
      await context.close();

      console.log('✅ Recording saved and browser closed');
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {});

  } catch (err) {
    console.error('❌ FATAL ERROR:', err);
    process.exit(1);
  }
}

run();