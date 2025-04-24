# Project Setup Guide

## Prerequisites

### ONLY FOR WINDOWS

#### FFmpeg Installation (Required for Audio Transcription)

1. Open PowerShell or Command Prompt as administrator
2. Install FFmpeg using Windows Package Manager:
   ```
   winget install ffmpeg
   ```
3. Verify the installation by checking the version:
   ```
   ffmpeg --version
   ```

#### Audio Transcription Setup

For proper audio transcription functionality, ensure your default recording device is set to "Stereo Mix":

1. Go to Sound Settings
2. Navigate to "More Sound Settings"
3. Select the "Recording" tab
4. Set "Stereo Mix" as the default device
5. Enable the "Listen" checkbox for Stereo Mix

## Installation

### Important Note About Electron Version

This application requires a specific version of Electron:

```
npm install electron@35.0.0 --save-dev
```

Check your Electron version with:
```
npm list electron
```

Using this particular version is necessary for certain hidden functionality in the application.

## Running in Production Mode

1. Start the React development server:
   ```
   npm run dev:react
   ```

2. In another terminal window, build the Electron app:
   ```
   npm run build:electron
   ```

3. Run the Electron application:
   ```
   npm run dev:electron
   ```

## Building the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Build the Electron application for Windows:
   ```
   npm run dist:win
   ```

This will create the distributable Windows application.