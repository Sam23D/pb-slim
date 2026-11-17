# Sign-in beyond email + password

Load this from `pb-build` when the spec asks for a password reset, email codes ("magic link"), verified emails, or Google sign-in. Email + password is the default (`data.md`). Checked on 0.40 with a local Mailpit inbox, except Google (not run).

## First: the app's name, address, and mail

Every flow below sends email. Before any of them:

1. Dashboard → Settings → Application: set **name** and **URL** (the real https address). Unset, emails say "Acme" and link to `localhost:8090`.
2. Settings → Mail: a real SMTP service (`pb-deploy`). Without it, mail fails or lands in spam.
3. Local test inbox: `docker run -d --name mailpit -p 127.0.0.1:8025:8025 -p 127.0.0.1:1025:1025 axllent/mailpit`, SMTP host `host.docker.internal`, port `1025`. Read mail at `http://localhost:8025`.

## Forgot password

```js
await pb.collection('users').requestPasswordReset(email)   // always 204, even for an unknown email
```

The email links to PocketBase's own reset page (`/_/#/auth/confirm-password-reset/…`). No screen to build. Say "If that email has an account, a reset link is on its way."

## Email code ("magic link")

Turn it on in a migration, so it ships with the app:

```js
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  users.otp.enabled = true
  users.otp.duration = 300   // seconds
  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("users")
  users.otp.enabled = false
  app.save(users)
})
```

Screen: one email field, then one code field (the email holds an 8-digit code).

```js
const { otpId } = await pb.collection('users').requestOTP(email)
// …user types the code from the email…
await pb.collection('users').authWithOTP(otpId, code)
```

Keep `otpId` in memory between the two steps. A wrong or old code fails; show `errorMessage(err)` and offer "Send a new code".

## Verified email

```js
await pb.collection('users').requestVerification(email)
```

The email links to PocketBase's own confirm page. To make it matter, add `@request.auth.verified = true` to the rules that need it, and say in the spec which actions wait for verification.

## Google (or another provider)

Not run in this pack yet. Steps: create OAuth credentials with the provider, redirect URL `https://<app address>/api/oauth2-redirect`; Dashboard → users → Options → OAuth2, add the provider. Then `await pb.collection('users').authWithOAuth2({ provider: 'google' })` from a click (it opens a popup). Needs HTTPS. Say "not checked yet" until you run it on the real address.

## Check

Run each flow you added against the Mailpit inbox: request, read the mail, finish, signed in. Then check the name and link in the email are the app's, not "Acme" or `localhost`.
