# Firebase security deployment

Customer sign-in uses Email/Password. First registration requires name, email and a password of at least 8 characters. Returning customers sign in with email and password. Firebase Authentication handles passwords; the database and local profile cache never store them. Password reset is available.

Profiles are stored privately under customerProfiles/{auth.uid}, including a bounded, resized JPEG avatar, name and optional phone/car. Returning customers restore their own profile. Orders, history and chat are bound to the authenticated password account UID. Anonymous and phone authentication are not used.

Google login remains reserved for the verified owner account islamiclibrary2.0@gmail.com. Public menus read publicSettings instead of private settings. The authenticated Admin mirrors only the explicit public field allowlist before enabling restrictive rules.

Before publishing database rules: enable Email/Password and Google, authorize actual serving origins, deploy Admin and verify owner login/publicSettings mirror, use the Firebase Rules playground or emulator, then deploy customer/menu pages with the rules. Verify live login, order ownership, profile persistence and public menu. Existing UIDless orders remain visible to Admin; they cannot safely be linked to a newly created customer account by phone alone.

Run node tests/firebase-security.cjs and node tests/customer-account.cjs from a checkout adjusted to use the rules and source fixtures. Local tests use a modeled rules evaluator and mocked Firebase, and do not replace Firebase emulator or live verification.
