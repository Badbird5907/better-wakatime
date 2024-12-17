# Better Wakatime

BetterWakatime is a WIP (work-in-progress) complete re-implementation of the WakaTime for Visual Studio Code extension, with full compatibility with existing WakaTime servers.
This extension is both lighter on performance compared to the original extension, and has less bloat.

This extension also supports multiple servers, allowing you to send coding data to multiple wakatime servers.

# Installation
1. [Download](https://github.com/Badbird5907/better-wakatime/releases/tag/0.0.1) the .vsix file from the GitHub Release
2. Go to `Extensions > ...` (See below image)
4. Click on Install from VSIX
5. Select the .vsix file you downloaded
6. Open the Command Pallette
7. Go to `Preferences: Open User Settings (JSON)`
8. Add (and configure) the following sinppet

```json
{
  "better-wakatime.apiConfig": [
        {
            "apiUrl": "https://wakatime.example.com/api",
            "apiKey": "api-key"
        },
        {
            "apiUrl": "https://wakapi.dev/api",
            "apiKey": "another-api-key"
        }
    ],
}
```
