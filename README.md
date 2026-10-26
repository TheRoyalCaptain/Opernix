# Opernix

Opernix is a Linux desktop control center for system, hardware, storage, and
network information. It checks GitHub Releases for AppImage updates.

## Run locally

```sh
npm install
npm start
```

## GitHub updates

The GitHub owner and repository are configured in `package.json` under
`build.publish`. Push a semantic version tag such as `v1.0.1`. GitHub Actions
uses the tag as the app version and publishes an AppImage plus updater metadata
to that GitHub Release. Each AppImage checks for updates at startup and every
six hours, downloads them automatically, and installs them when the app closes.
The update is active the next time the app starts. This automatic update path is
supported for the AppImage distribution.