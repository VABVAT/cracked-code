# Project Setup Guide

## Prerequisites

### ONLY FOR WINDOWS

### Run the app as adminstrator, other anti-viruses except windows defender might flag this so you can try disabling them

### Make sure ports 3001 and 3000 are empty

### only way to quit the app is through task manager

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
1. Install Dependencies
   ```

   npm install
   ```
2. Start the React development server:
   ```
   npm run dev:react
   ```

3. In another terminal window, build the Electron app:
   ```
   npm run build:electron
   ```
4. Make sure you copy the correct .env file format
   ```

   .env must be presesnt in dist-electron and in root directory of project
   ```
5. Run the Electron application:
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
3. In the dist folder the app will be created

This will create the distributable Windows application.

## DONATE
1. You can donate via UPI - vaibhavsidana09@okhdfcbank

2. Paypal - https://www.paypal.me/VaibhavSidana