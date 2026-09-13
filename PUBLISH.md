# Publish arvancai to npm

## Prerequisites

- npm account (https://www.npmjs.com)
- Node.js ≥ 20
- This repository: https://github.com/0xamirreza/arvancai
- Package name in `package.json`: `"arvancai"`

## 403 / 2FA

npm requires **2FA** or a **granular access token** with publish permissions.

### Option A — interactive OTP

1. Enable 2FA (Authenticator app): https://www.npmjs.com/settings/~/security  
2. Relogin: `npm logout && npm login`  
3. Publish with OTP:

```bash
npm publish --access public --otp=123456
```

### Option B — granular token

1. https://www.npmjs.com/settings/~/tokens → Granular Access Token  
2. Packages: **Read and write**, scope **All packages** (needed for first publish)  
3. Enable **Bypass 2FA** if available and required for your account  
4. Configure and publish:

```bash
npm config set //registry.npmjs.org/:_authToken=npm_XXX
npm whoami
npm publish --access public
```

Never commit or paste tokens into chat. Revoke leaked tokens immediately.

For CI, prefer [Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers/).

## Full flow

```bash
git clone https://github.com/0xamirreza/arvancai.git
cd arvancai
npm install
npm run build
npm test
npm publish --access public

npm install -g arvancai
which arvancai
```

## After publish — MCP config

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

See [README.md](README.md).
