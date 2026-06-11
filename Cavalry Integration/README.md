# AutoSubs Cavalry Integration

This integration allows AutoSubs to send generated subtitles directly to Cavalry, creating dynamic data arrays that can drive procedural animations.

## Setup Instructions

1. Open **Cavalry**.
2. Go to **Window -> JavaScript Editor**.
3. Open the `AutoSubs.js` script in the JavaScript Editor (either copy-paste the code or use the open button).
4. Click the **Run** button (play icon) in the JavaScript Editor to start the server.
5. In **AutoSubs**, select **Cavalry** as your preferred integration from the status dropdown menu.
6. Once connected (status showing green), generate subtitles and click **Add to Timeline** (which changes to **Send to Cavalry**).

## Custom Rigs

When subtitles are sent, three layers will be automatically created in your scene:
* `AutoSubs_Text`: A String Array node containing the subtitle cues.
* `AutoSubs_StartSeconds`: A Value Array containing the start times in seconds.
* `AutoSubs_EndSeconds`: A Value Array containing the end times in seconds.

You can connect these layers to standard Cavalry Duplicators, Text Shapes, or Time Remap nodes to animate the text.
