## Event video assets

All the videos in this directory are pre-processed with a variant of `ffmpeg -i
in.mp4 -c:v libx264 -b:v <bitrate> -an out.mp4`, where bitrate hovers around
8000k (can be tweaked based on resulting file size), to get them into a standard
codec, strip out audio data and any metadata we don't need, before they are
added to version control.

`ffprobe file.mp4` can be used to inspect the bitrate of existing assets (note
that the requested bitrate in the `ffmpeg` command might not match the exact
resulting bitrate shown by `ffprobe`).

These will be re-processed by the
[Webpack video loader](../../../build-scripts/video-loader.cjs) during each
build to get them down to the exact resolution and bitrate the site/loader wants
for production.
