export default function registerServiceWorker(path: string, scope = "/") {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(path, {
        scope: scope,
      })
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      });
  }
}
