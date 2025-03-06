const { screen, desktopCapturer } = require("electron");
// const fs = require("fs");
// const path = require("path");

// Function to capture the screen and return a hosted URL
export async function captureScreen() {

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    const options = {
        types: ["screen"],
        thumbnailSize: { width, height },
    };

    const sources = await desktopCapturer.getSources(options);
    const primarySource = sources.find(({ display_id }: any) => display_id == primaryDisplay.id);

    if (!primarySource) {
        throw new Error("No primary display source found.");
    }

    const imageBuffer = primarySource.thumbnail.toPNG();
    return imageBuffer.toString("base64")

  }
