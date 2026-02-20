# Resilience360 Mobile Release Guide (Android AAB + iOS TestFlight)

This guide is customized for this project:
- App name: Resilience360
- Capacitor app ID: com.resilience360.app
- Web build folder: dist
- Main prep script: npm run mobile:prepare

## 1) Prerequisites

### Accounts
- Google Play Console account
- Apple Developer Program account

### Tooling
- Node.js + npm
- Android Studio (latest stable)
- Xcode (latest stable, macOS required for iOS archive/upload)

### Project state
- Android shell exists in android
- iOS shell exists in ios
- Capacitor config exists in capacitor.config.ts

## 2) Production setup checklist (before store builds)

- [ ] Backend API is deployed on a public HTTPS URL (do not use localhost)
- [ ] Frontend hosting is deployed on HTTPS, or API endpoints are absolute in production
- [ ] App behavior verified in production mode (alerts, maps, image upload, guidance routes)
- [ ] App icons and app name verified
- [ ] Privacy policy URL prepared (required by stores)
- [ ] Terms/support contact ready

## 3) Release prep commands (every release)

Run from project root:

1. npm install
2. npm run mobile:prepare

What this does:
- Builds latest web assets
- Syncs assets/plugins into Android and iOS native projects

## 4) Android release (AAB for Google Play)

### 4.1 Versioning
In Android Studio:
- Open android
- App module -> build.gradle
- Increase versionCode (must increase each release)
- Update versionName (example: 1.0.1)

### 4.2 Signing key (one-time)
If you do not already have a release keystore:

- Build -> Generate Signed Bundle/APK
- Choose Android App Bundle
- Create new key store
- Save keystore safely (with backups)

Important:
- Never lose this keystore
- Store passwords in a secure password manager

### 4.3 Build AAB
In Android Studio:
- Build -> Generate Signed Bundle/APK -> Android App Bundle
- Select release key
- Build variant: release
- Output file: app-release.aab

### 4.4 Play Console upload
- [ ] Create app in Play Console (first time)
- [ ] Fill app content forms (Data Safety, Ads, Target audience, etc.)
- [ ] Upload app-release.aab to Internal testing first
- [ ] Test on real devices
- [ ] Promote to Closed/Open/Production as needed

### Android signing checklist
- [ ] versionCode increased
- [ ] versionName updated
- [ ] Release keystore used
- [ ] AAB generated successfully
- [ ] Internal test passed
- [ ] Crash-free smoke test completed

## 5) iOS release (TestFlight)

## 5.1 Versioning
In Xcode:
- Open ios/App/App.xcworkspace
- Target App -> General
- Increase Version (example: 1.0.1)
- Increase Build number (must increase each upload)

### 5.2 Signing & capabilities
- Team selected in Signing & Capabilities
- Bundle identifier matches project convention (com.resilience360.app)
- Automatic signing enabled (or manual signing configured correctly)

### 5.3 Archive and upload
In Xcode:
- Product -> Archive
- In Organizer -> Distribute App
- Upload to App Store Connect

### 5.4 TestFlight flow
In App Store Connect:
- [ ] Build appears under TestFlight
- [ ] Complete export compliance and metadata
- [ ] Add internal testers first
- [ ] Run sanity tests (login/alerts/maps/uploads)
- [ ] Add external testers after internal validation (optional)

### iOS signing checklist
- [ ] Version increased
- [ ] Build number increased
- [ ] Correct signing team selected
- [ ] Archive succeeds
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight internal test passed

## 6) Fast rollback strategy

For each release, keep:
- Previous AAB artifact
- Previous iOS build notes
- Release note log with commit hash/date

If a critical issue appears:
- Android: halt rollout or roll back staged rollout
- iOS: expire problematic TestFlight build and submit fixed build

## 7) Recommended release notes template

Use this for both stores:

- New: District-level Risk Atlas actions and local advisory workflow
- Improved: UI responsiveness, typography hierarchy, micro-interactions
- Fixed: Stability updates for map overlays and mobile shell sync

## 8) Operational checks after publish

- [ ] Install from Play/TestFlight on at least 2 physical devices each
- [ ] Verify API-connected features on mobile network (not only Wi-Fi)
- [ ] Confirm app launches offline for cached content (PWA assets)
- [ ] Confirm map and alert sections open without crashes
- [ ] Confirm upload flows (camera/gallery) handle permission prompts correctly

## 9) Useful project commands

- npm run mobile:prepare
- npm run cap:open:android
- npm run cap:open:ios
- npm run cap:sync

## 10) Notes specific to this app

This app uses server-backed AI and guidance routes. For mobile production:
- Do not rely on localhost:8787
- Ensure production API endpoints are reachable over HTTPS
- Validate CORS and upload size limits in your production server
