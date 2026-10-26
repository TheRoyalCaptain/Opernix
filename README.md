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
`build.publish`. Push a semantic version tag such as `v1.0.3`. GitHub Actions
uses the tag as the app version and publishes an AppImage plus updater metadata
to that GitHub Release. Each AppImage checks for updates at startup and every
six hours, downloads them automatically, and installs them when the app closes.
The update is active the next time the app starts. This automatic update path is
supported for the AppImage distribution.

## Changelog

### v1.0.3

- Added automatic system-information refresh with a user-selectable interval from 1 to 300 seconds.
- Saved the selected refresh interval locally so it is restored on next launch.

### v1.0.2

- Removed Electron's default File, Edit, View, and Window menu from the Ubuntu window.
- Added this changelog and release-note policy.

### v1.0.1

- Published the first installable Linux AppImage.
- Added system, hardware, storage, and network information views.
- Added GitHub Release update checks and automatic AppImage updates.

## Release notes policy

For every app update, add a versioned changelog entry here that lists the user-
visible changes. Commit and push the update to `main`, then push a matching
`vX.Y.Z` tag. GitHub Actions builds the AppImage and updater metadata from that
tag and attaches them to the GitHub Release.