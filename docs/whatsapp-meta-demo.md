# MinuHub WhatsApp demo (Meta test number)

The demo receives text messages and voice notes through the official WhatsApp
Cloud API, lets Gemini understand the request against the real MinuHub menu,
keeps a small in-memory WhatsApp cart, and replies in Egyptian Arabic.

## 1. Meta test setup

1. Open the app in Meta for Developers and add the **WhatsApp** product.
2. In **WhatsApp > API Setup**, keep Meta's generated test phone number.
3. Add your personal WhatsApp number as an allowed test recipient and complete
   the verification code Meta sends you.
4. Copy the temporary access token, test phone-number ID, and the Graph API
   version displayed by Meta. Get the app secret from **App settings > Basic**.
5. Create your own long random webhook verification token. This is a value you
   choose; it is not supplied by Meta.

## 2. Local environment

Copy the WhatsApp variables from `.env.example` into `.env.local` and replace
their values. Use your personal number in international format without `+` for
`WHATSAPP_TEST_RECIPIENT`. Never commit `.env.local` or paste access tokens into
chat.

## 3. Public HTTPS callback

Meta cannot call `localhost`. Expose the app with an HTTPS tunnel or deploy it,
then configure this callback in **WhatsApp > Configuration**:

```text
https://YOUR-PUBLIC-HOST/api/whatsapp/webhook
```

Use the exact same `WHATSAPP_VERIFY_TOKEN`, verify the callback, then subscribe
the webhook to the `messages` field.

## 4. Try the demo

Send a text or voice note from the allowed recipient to Meta's test number, for
example:

```text
عايزة اتنين برجر كلاسيك ووريني السلة
```

The temporary Meta token expires. Replace it when Meta expires it, or create a
permanent system-user token before turning the demo into a production service.
The in-memory cart is intentionally demo-only and resets when the server restarts.
