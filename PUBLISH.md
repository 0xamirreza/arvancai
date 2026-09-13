# Publish arvancai to npm (از صفر)

## پیش‌نیاز
- حساب روی https://www.npmjs.com
- Node.js ≥ 20
- این ریپو با `"name": "arvancai"`

## خطای 403 که دیدی

```
Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

npm دیگر بدون **2FA** (یا توکن granular با Bypass 2FA) اجازهٔ publish نمی‌دهد.

### راه پیشنهادی (ساده — پابلیش دستی)

1. برو: https://www.npmjs.com/settings/0xamirreza/security  
2. **Enable 2FA** (Authenticator app).
3. دوباره لاگین کن تا سشن با 2FA باشد:

```bash
npm logout
npm login
npm whoami
```

4. پابلیش (اگر OTP خواست وارد کن):

```bash
cd "/home/arsedighi/Desktop/Dev/ArvanCloud AI/arvancloud-mcp"
npm publish --access public --otp=123456
```

(`123456` را با کد اپ authenticator عوض کن.)

### راه جایگزین (توکن)

1. https://www.npmjs.com/settings/0xamirreza/tokens → **Generate new token** → **Granular Access Token**
2. Permissions: Read and write برای packages  
3. گزینهٔ **Bypass 2FA** را اگر برای publish لازم است فعال کن.
4. توکن را ست کن:

```bash
npm config set //registry.npmjs.org/:_authToken=npm_XXXX
npm publish --access public
```

برای CI بلندمدت: [Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers/).

## هشدار bin که دیدی

قبلاً npm `bin` را حذف می‌کرد. الان `bin/arvancai.js` با shebang داخل پکیج است (`npm pack` آن را نشان می‌دهد).

## مراحل کامل

```bash
npm login
npm whoami
npm view arvancai          # 404 = آزاد

cd "/home/arsedighi/Desktop/Dev/ArvanCloud AI/arvancloud-mcp"
npm install
npm run build
npm test
npm publish --access public --otp=<CODE>

npm install -g arvancai
which arvancai
```

## بعد از پابلیش

```json
{
  "mcpServers": {
    "arvancai": {
      "command": "arvancai",
      "env": { "ARVANCLOUD_API_KEY": "<MU-KEY>" }
    }
  }
}
```

جزئیات: `README.md`
