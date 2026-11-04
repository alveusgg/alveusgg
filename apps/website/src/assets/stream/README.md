# Stream overlay assets

Static camera borders are rendered as images. Animated overlays are imported as
WebM assets and rendered with `components/content/Video`. The video loader emits
the original WebM and uses FFmpeg at build time to generate a transparent poster.
These files are served with the website's static assets.
