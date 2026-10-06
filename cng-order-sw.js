/* Deploy beside the admin HTML, over HTTPS. No private customer data is cached. */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const key = event.notification.data?.orderKey || '';
  const target = new URL('./index.html', self.location.href);
  if (key) target.searchParams.set('order', key);
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for (const client of windows) {
      if (new URL(client.url).pathname === target.pathname) {
        await client.focus();client.postMessage({type:'OPEN_ORDER',orderKey:key});return;
      }
    }
    await self.clients.openWindow(target.href);
  })());
});
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:'AIzaSyAoYsT80oNc505TgobYwTv0T7YfUF_fWRs',projectId:'cup-and-go-pos-e0ad1',messagingSenderId:'600197868931',appId:'1:600197868931:web:22ef6fbe0a809afd161ab6'});
firebase.messaging().onBackgroundMessage(payload => {
  if (payload.notification) return; // FCM displays notification messages itself.
  const data = payload.data || {};
  return self.registration.showNotification(data.title || 'New Cup And Go order', {
    body:data.body || 'Open Admin to review the order.',
    tag:'cng-'+(data.orderKey || 'test'),data:{orderKey:data.orderKey || ''},renotify:true
  });
});
