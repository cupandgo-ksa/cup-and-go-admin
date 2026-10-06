# Firebase security deployment status

## Current code

The Admin page now uses Firebase Authentication behind the existing 4-digit PIN screen. The visible Admin flow stays PIN-only.

- Firebase Auth account used internally: `pos-admin@cupandgoksa.com`
- The PIN is converted to the Firebase Auth password inside the Admin app.
- On the first secure login, while the old open RTDB rules are still live, the app verifies the existing Admin PIN and creates the protected Auth account automatically.
- After that first login, any phone can use the same Admin PIN. Firebase keeps the session on trusted devices.
- A cashier can use the normal cashier PIN on a device after the owner Admin PIN has authenticated that device at least once.
- Changing the Admin PIN in Settings also updates the Firebase Auth password.
- The Admin database connection is held behind an Auth gate, so private database listeners and writes do not start before Admin authentication.

## Customer access

The live customer page already uses Firebase Email/Password accounts and UID-scoped private data.

- Products and the public shop settings remain publicly readable.
- Customer profiles are readable/writable only by their own UID.
- Customer orders/history are UID-scoped.
- Broadcast notifications use `/publicNotifications`.
- Private order notifications use `/customerPrivateNotifications/<uid>`.
- Customer chat is UID-scoped.

## Rules

`database.rules.json` is ready for the PIN-backed Admin Auth account and customer UID rules.

Do not publish the secure rules before the owner completes one successful Admin PIN login after this code update. That first login creates the internal Firebase Auth Admin account from the existing PIN.

After the first successful secure Admin login, publish `database.rules.json` to Realtime Database.

## Deployment files

`.firebaserc` points to project `cup-and-go-pos-e0ad1`.

`firebase.json` deploys `database.rules.json` as Realtime Database rules.

CLI command:

```bash
firebase deploy --only database
```
