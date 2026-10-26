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
`build.publish`. Push a version tag matching the version in `package.json` (for
example `v1.0.0`). The included GitHub Actions workflow publishes the AppImage
and update metadata. In-app updates are supported for the AppImage distribution.