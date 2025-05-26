# Code Coverage

This project uses c8 for code coverage reporting with Node.js built-in test runner.

## Running Coverage

### Basic coverage report
```bash
npm run test:coverage
```

### HTML coverage report
```bash
npm run test:coverage:html
# Open coverage/index.html in browser
```

### Check coverage thresholds
```bash
npm run test:coverage:check
# Fails if coverage is below 80% for lines, functions, or branches
```

### Generate lcov report
```bash
npm run coverage:report
```

## Coverage Configuration

Configuration is in `.c8rc.json`:
- **Threshold**: 80% for lines, functions, and branches
- **Included**: All JS files in `lib/`, `public-www/`, `scripts/`
- **Excluded**: `node_modules/`, `test/`, `coverage/`, `.githooks/`, `server.js`

### Why server.js is excluded
The development server (`server.js`) is excluded from coverage because:
- It's only used for local development
- Not part of the production application
- Testing a dev server with hot-reload is not valuable
- The actual application code is in `public-www/` which is fully tested

## CI/CD Integration

### Pull Request Coverage

Every PR automatically:
1. Runs tests with coverage
2. Checks coverage thresholds
3. Comments on PR with coverage report
4. Uploads to Codecov (if configured)

### Branch Coverage

View coverage for any branch:
```bash
git checkout <branch-name>
npm run test:coverage
```

## Writing Testable Code

To improve coverage:
1. Extract logic into separate modules (like `lib/utils.js`)
2. Avoid inline scripts - use modules that can be imported
3. For DOM code, consider using jsdom or separate DOM logic from business logic

## Current Coverage Goals

- **Target**: 80% coverage for all metrics
- **Focus areas**: 
  - Server-side utilities
  - Token tracking logic
  - Build and deployment scripts