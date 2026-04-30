# Test Configuration Guide

How to replicate the Jest test setup used in `auth-microservice` on another Node.js/TypeScript
microservice in the Dolcelina stack.

---

## Prerequisites

Install the required packages (they are likely already in the base template):

```bash
yarn add jest supertest
```

> `jest` and `supertest` should already be present in `package.json` as they are standard in this
> stack. Confirm with `yarn list jest`.

---

## 1. Jest Configuration

Create `jest.config.js` at the **project root** (same level as `package.json`):

```js
// jest.config.js
module.exports = {
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'node',
            roots: ['<rootDir>/test/unit'],
            testMatch: ['**/*.test.js'],
            clearMocks: true,
        },
        {
            displayName: 'integration',
            testEnvironment: 'node',
            roots: ['<rootDir>/test/integration'],
            testMatch: ['**/*.test.js'],
            clearMocks: true,
        },
    ],
};
```

**Why two projects?**

- `unit` — tests individual functions in isolation with all infra mocked out
- `integration` — tests wiring between modules (e.g., routes, middleware chains) without starting
  the real server

---

## 2. Test Folder Structure

```
test/
├── unit/
│   ├── constants/
│   │   └── *.test.js
│   ├── utils/
│   │   └── *.test.js
│   ├── controllers/
│   │   └── <controller-name>/
│   │       └── <controller-name>.controller.test.js
│   └── services/
│       └── *.test.js
└── integration/
    └── config/
        └── route-config.test.js
```

Mirror the `src/` folder structure inside `test/unit/` so tests are easy to locate.

---

## 3. NPM Scripts

Add these scripts to `package.json`:

```json
"scripts": {
    "start": "nodemon .",
    "build": "tsc && copyfiles -u 1 src/resources/** dist/",
    "prod": "node dist/index.js",
    "test": "yarn build && jest --runInBand",
    "test:unit": "yarn build && jest --runInBand --selectProjects unit",
    "test:unit:coverage": "yarn build && jest --runInBand --selectProjects unit --coverage",
    "test:integration": "yarn build && jest --runInBand --selectProjects integration",
    "test:watch": "yarn build && jest --watch --selectProjects unit"
}
```

**Why `yarn build` before every test run?** Tests run against compiled JavaScript in `dist/`. The
TypeScript source must be compiled first. `--runInBand` forces serial execution which prevents race
conditions on the shared `dist/` folder.

---

## 4. Make `src/index.ts` Test-Safe

The entry point must **not** start the server (Redis, MongoDB, DB connections) when Jest imports it.
Gate the bootstrap call behind a `NODE_ENV` check and export `app` explicitly:

```ts
// src/index.ts
require('dotenv').config();
import express from 'express';
// ... other imports ...

export const app = express();

setAppConfig(app);
setMiddlewares(app, express);
setRoutesConfig(app);

const bootstrap = () => {
    appStart(server, app);
    initMongoDB();
    // any other infra startup calls
};

// ✅ This is the critical guard — without it, every Jest import triggers
// real DB/Redis connections and tests fail with ConnectionTimeoutError
if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}

export default app;
```

---

## 5. Mock Patterns

All tests in this stack import from `dist/` (compiled output). Paths in `jest.mock()` must point to
`dist/`, not `src/`.

### 5.1 Mock `@amora95/commons`

This package provides JWT helpers, HTTP response helpers, and shared constants. Always mock it
completely to avoid any cryptographic or network side effects:

```js
jest.mock('@amora95/commons', () => ({
    createJWT: jest.fn(),
    getTokenData: jest.fn(),
    getTokenInfo: jest.fn(),
    avoidNanParseInt: jest.fn(v => v),
    dbConstants: { status: { active: 'active', inactive: 'inactive', pending: 'pending' } },
    httpCodes: { ok: 200, bad_request: 400, not_found: 404, conflict: 409, server_error: 500 },
    responseCodes: { ok: 'OK' },
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    sendServerError: jest.fn(),
    webConstants: { commonValues: { unknown: 'unknown' } },
    webErrors: {
        // add only the error codes your controller uses
        auth02: { code: 'auth02' },
        auth03: { code: 'auth03' },
        auth04: { code: 'auth04' },
        auth05: { code: 'auth05' },
        srv01: { code: 'srv01' },
    },
}));
```

> Only declare the keys your module actually uses. Adding extras has no cost; missing a key causes
> `undefined` access errors at runtime.

### 5.2 Mock `SequelizeService`

The service is a singleton. Mock `getInstance` to return an in-memory `db` object shaped like the
real Sequelize models:

```js
jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: {
        getInstance: jest.fn(),
    },
}));

// Inside each test that needs DB:
const { SequelizeService } = require('../../../../dist/services/sequelize-service');

SequelizeService.getInstance.mockResolvedValue({
    db: {
        user: {
            findByPk: jest.fn().mockResolvedValue({ id: 'abc', dataValues: { id: 'abc' } }),
            findAndCountAll: jest.fn(),
            create: jest.fn(),
        },
        // add other model namespaces as needed
    },
});
```

### 5.3 Mock Mongoose Models

Each Mongoose model is a named default export. Use `__esModule: true` when mocking ES module default
exports:

```js
jest.mock('../../../../dist/models/mongoose/Session', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

const Session = require('../../../../dist/models/mongoose/Session').default;
```

### 5.4 Mock Redis (`db-config`)

```js
jest.mock('../../../../dist/config/db-config', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
}));
```

### 5.5 Mock `webclient-helper`

**Always mock this** in controller tests. It performs a network lookup on import and will cause the
entire app bootstrap chain to run if left unmocked:

```js
jest.mock('../../../../dist/utils/webclient-helper', () => ({
    getBasicWebData: jest.fn(() => ({
        userIp: '127.0.0.1',
        userOs: 'test-os',
        userAgent: 'test-agent',
    })),
}));
```

### 5.6 Mock `OpenbaoVaultClient` (from `@amora95/commons`)

When testing code that reads secrets from Vault, mock the client via `@amora95/commons`:

```js
const mockGetSecret = jest.fn();

jest.mock('@amora95/commons', () => ({
    // ... other keys ...
    OpenbaoVaultClient: {
        getInstance: jest.fn(() => ({
            getSecret: mockGetSecret,
        })),
    },
}));
```

> **Variable naming**: Jest hoists `jest.mock()` calls above `require()` and `import`. Any variable
> referenced inside a `jest.mock()` factory **must** start with `mock` (e.g., `mockGetSecret`) or
> Jest will throw a "variable used before declaration" error.

### 5.7 Mock `axios`

```js
jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn(),
}));

const axios = require('axios');
axios.post.mockResolvedValue({ data: { id_token: 'fake-token' } });
```

### 5.8 Mock `argon2`

```js
jest.mock('argon2', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    verify: jest.fn().mockResolvedValue(true),
}));
```

---

## 6. Controller Unit Test Template

```js
// test/unit/controllers/<name>/<name>.controller.test.js

// 1. All jest.mock() calls MUST come first (they are hoisted by Jest)
jest.mock('../../../../dist/config/db-config', () => ({
    redisClient: { get: jest.fn(), set: jest.fn() },
}));

jest.mock('../../../../dist/services/sequelize-service', () => ({
    SequelizeService: { getInstance: jest.fn() },
}));

jest.mock('../../../../dist/utils/webclient-helper', () => ({
    getBasicWebData: jest.fn(() => ({ userIp: '127.0.0.1', userOs: 'os', userAgent: 'agent' })),
}));

jest.mock('@amora95/commons', () => ({
    httpCodes: { bad_request: 400, not_found: 404 },
    responseCodes: { ok: 'OK' },
    sendClientError: jest.fn(),
    sendOkResponse: jest.fn(),
    webErrors: { srv01: { code: 'srv01' } },
}));

// 2. Require the module under test AFTER all mocks are declared
const { myAction } = require('../../../../dist/controllers/my.controller');
const { SequelizeService } = require('../../../../dist/services/sequelize-service');
const { sendClientError, sendOkResponse, webErrors, httpCodes } = require('@amora95/commons');

// 3. Test suite
describe('my.controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('myAction returns not found when resource does not exist', async () => {
        SequelizeService.getInstance.mockResolvedValue({
            db: {
                my_model: { findByPk: jest.fn().mockResolvedValue(null) },
            },
        });

        const req = { params: { id: 'missing-id' } };
        const res = {};

        await myAction(req, res);

        expect(sendClientError).toHaveBeenCalledWith(webErrors.srv01, res, httpCodes.not_found);
    });

    it('myAction returns ok when resource exists', async () => {
        const fakeRecord = { id: '1', name: 'Test', dataValues: { id: '1', name: 'Test' } };

        SequelizeService.getInstance.mockResolvedValue({
            db: {
                my_model: { findByPk: jest.fn().mockResolvedValue(fakeRecord) },
            },
        });

        const req = { params: { id: '1' } };
        const res = {};

        await myAction(req, res);

        expect(sendOkResponse).toHaveBeenCalledWith(fakeRecord.dataValues, res);
    });
});
```

---

## 7. Integration Test Template (Route Wiring)

The purpose of integration tests here is to verify that routes are mounted on the correct URL
prefixes — without starting the real server.

```js
// test/integration/config/route-config.test.js

jest.mock('../../../dist/routes/my.routes', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// mock all other route modules...

const { setRoutesConfig } = require('../../../dist/config/route-config');

describe('setRoutesConfig', () => {
    it('mounts all route modules under v1 prefixes', () => {
        const app = { use: jest.fn() };

        setRoutesConfig(app);

        expect(app.use).toHaveBeenCalledWith('/v1/my-resource/', expect.any(Function));
        // assert one expectation per route
    });
});
```

---

## 8. Running Tests

```bash
# Run all tests (unit + integration)
yarn test

# Run unit tests only
yarn test:unit

# Run integration tests only
yarn test:integration

# Run unit tests with coverage report
yarn test:unit:coverage

# Watch mode (reruns on file save, unit tests only)
yarn test:watch
```

---

## 9. Common Errors & Fixes

| Error                                                   | Cause                                                                                 | Fix                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `ConnectionTimeoutError` or `ECONNREFUSED` during tests | `bootstrap()` ran and tried to connect to Redis/DB                                    | Add the `NODE_ENV !== 'test'` guard in `index.ts`                            |
| `jest.mock variable used before initialization`         | Variable in mock factory doesn't start with `mock`                                    | Rename the variable to start with `mock` (e.g., `mockMyFn`)                  |
| `controllerHandler is not a function`                   | `webclient-helper` imported without mock — triggers app bootstrap chain               | Always add the `webclient-helper` mock in controller tests                   |
| `Cannot find module '../../../../dist/...'`             | TypeScript hasn't been compiled yet                                                   | Run `yarn build` before running tests, or use `yarn test` which builds first |
| `__esModule` related errors on default imports          | Mongoose/route module is a default export but mock doesn't declare `__esModule: true` | Add `__esModule: true` to the mock factory object                            |
| Coverage for `models/mariadb` shows 0% Functions        | `initModel` is never called in tests (Sequelize auto-generated)                       | This is expected — skip coverage enforcement on auto-generated model files   |

---

## 10. Coverage Targets

Run `yarn test:unit:coverage` to generate a report. Suggested minimums:

| Layer              | Target Stmts          | Target Branch |
| ------------------ | --------------------- | ------------- |
| `controllers/`     | ≥ 95%                 | ≥ 95%         |
| `utils/`           | ≥ 90%                 | ≥ 90%         |
| `services/`        | ≥ 90%                 | ≥ 90%         |
| `models/mongoose/` | ≥ 95%                 | ≥ 95%         |
| `models/mariadb/`  | skip (auto-generated) | skip          |
