// Service worker: riceve le notifiche push anche quando l'app è chiusa.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: "Carlo ed Enza", body: event.data ? event.data.text() : "" };
  }

  // Su iPhone ogni push DEVE mostrare una notifica, quindi la mostriamo sempre.
  event.waitUntil(
    self.registration.showNotification(data.title || "Carlo ed Enza", {
      body: data.body || "",
      icon: "icon-192.png",
      badge: "icon-192.png",
      data: { tab: data.tab || "chat" },
    })
  );
});

// Toccando la notifica si apre l'app sulla scheda giusta (Chat o Agenda)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const tab = (event.notification.data && event.notification.data.tab) || "chat";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list) {
          if ("focus" in c) {
            c.postMessage({ tab });
            return c.focus();
          }
        }
        return self.clients.openWindow("./?tab=" + tab);
      })
  );
});
