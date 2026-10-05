# Firebase deployment status

The live RTDB rules have not yet been replaced. Do not publish database.rules.json until the owner's existing phone POS is running the updated private Admin HTML and its Firebase UID has been approved.

## Admin access

The private Admin file preserves the existing PIN screen and PIN editing. It uses a separate persistent anonymous Firebase identity named cng-admin. This identity alone grants no access. On first open it displays a non-secret Device ID (Firebase UID). The owner must approve that exact device through the authenticated Firebase Console at /_security/admins/<UID>/active = true. Client writes to the allowlist are denied. Never authorize a visitor/menu/customer UID or a browser test identity as the owner's phone. Google owner access remains as an optional recovery rule, not an Admin login UI.

Publish only after enrollment and verify the phone's PIN/cloud connection, public menu and customer paths. Resetting application storage requires device re-enrollment. A new file copied to another device creates a separate identity and must be approved separately.

## Customer access

Customer accounts use email/password, private profiles, UID-scoped orders/history/chat and private notifications. Queries require orderByChild('ownerUid').equalTo(auth.uid). Account names/photos are editable; passwords stay in Firebase Auth. Checkout maps each item to its database productKey. Rules validate real product ID/name/price, availability, bounded positive integer quantities, valid Cash/Card choice, customer source and allowed fields. Customers cannot alter submitted order status, edit others' records, forge admin chat messages, change products or shop settings. Customer pending cancellation is limited to 60 seconds. Admin recomputes accepted and archived totals from line items.

Menu/homepage read publicSettings and products, not private settings/PINs. Menu rating auth uses a separate cng-menu-ratings identity and does not grant POS access. Admin mirrors only whitelisted public settings. Public broadcasts and UID-private notifications use separate paths.

## Tests

node tests/firebase-security.cjs
node tests/customer-account.cjs

These are modeled permission and mocked client tests, not Firebase emulator tests. Rules Playground additionally compiled the current draft and allowed unauthenticated product reads while denying unauthenticated root reads and unapproved device root reads. No real customer credentials, purchase or account creation were tested.
