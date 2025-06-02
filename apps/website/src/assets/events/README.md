# Event video assets

All video assets used for events on the site should ideally be the event's outro
animation, though the intro animation can be used if there was no outro.

## Videos

The video assets are pre-processed with a variant of `ffmpeg -i
in.mp4 -c:v libx264 -b:v <bitrate> -an out.mp4`, where bitrate hovers around
8000k (aiming for 30MB or smaller file size), to get them into a standard
codec, strip out audio data and any metadata we don't need, before they are
added to version control.

Once pre-processed, the videos are then uploaded to the Alveus.gg Cloudflare
Stream account. Default settings can be used for the upload once processed (no
MP4 downloads, no signed URLs, no creator, no public details).

## Posters

Posters can be created from the pre-processed video assets by using `ffmpeg
-i in.mp4 -an -vframes 1 out.png`, to capture the first frame of the video.

These are stored in this directory to be imported in
[`src/data/events.tsx`](../../data/events.tsx) and rendered on the events page
before the Cloudflare Stream embed loads.
