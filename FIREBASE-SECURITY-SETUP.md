# Firebase security change — staged, not deployed

Project: cup-and-go-pos-e0ad1

Google sign-in has been enabled in Firebase Console. Anonymous sign-in remains disabled pending the owner's explicit approval. The production database rules and default GitHub branches have not been changed.

The security/firebase-access-20261005 branch in cup-and-go-admin, cup-and-go-menu and cup-and-go-customer contains the updated active pages. The admin branch contains database.rules.json.

The Admin uses the verified owner Google account. Public pages use publicSettings rather than settings, so PINs and cashier settings are private. Customer order reads query ownerUid; new orders use stable ownerUid/id keys. Chat and targeted notifications are private to that UID. Product ratings require authenticated identity and cannot be edited by the customer after submission.

Prerequisites before coordinated deployment:

1. Owner explicitly approves anonymous guest sign-in for customer identity and ratings.
2. Enable Anonymous sign-in, without automatic account deletion.
3. Authorize the actual serving domains cupandgo-ksa.github.io and cupandgoksa.com in Firebase Auth.
4. Test the rules in Firebase Rules playground / emulator, including owner access, unauthenticated public reads, denied private reads and writes, customer creation/cancellation, private chat, and immutable ratings.
5. Seed publicSettings using only the public field allowlist in the Admin code, before switching public pages.
6. Publish all changed active pages and restrictive database rules in a coordinated maintenance window; confirm GitHub Pages build status and verify Admin Google login and public menu live.

Existing orders, reports, settings and chats are retained. Historical customer records lacking ownerUid cannot safely be automatically linked by phone number; they stay readable in the owner's Admin. Customer local cache or browser storage deletion may change the anonymous UID and make earlier customer orders inaccessible on that device.

Validation completed so far: all inline JavaScript in the five changed HTML sources passed Node syntax checks; local modeled rules and Admin gate/projection tests passed. These are not Firebase-emulator tests and do not prove production deployment.

Do not paste or publish these rules alone while the old client files are active.
