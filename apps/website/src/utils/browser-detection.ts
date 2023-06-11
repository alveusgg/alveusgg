export function getIsSafari() {
  return (
    /Safari/.test(window.navigator.userAgent) &&
    !/Chrome|Chromium|CriOS/.test(window.navigator.userAgent)
  );
}

export function getIsIos() {
  return /iPhone|iPad|iPod/.test(window.navigator.userAgent);
}
