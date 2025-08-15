# Directus API Test Suite

Comprehensive test suite for validating Directus CMS integration in the Afthonios e-learning platform.

## Test Structure

### 🔗 Integration Tests (`directus/directus-api.test.ts`)
- Tests all API endpoints (courses, competences, instructors, pages)
- Validates response schemas and data integrity
- Tests pagination, search, and filtering
- Error handling and edge cases

### ✅ Data Validation Tests (`directus/directus-types.test.ts`)
- TypeScript interface validation
- Translation filtering and locale handling
- Utility function testing (formatCurrency, formatDuration, etc.)
- Asset URL generation and transforms

### 🏥 Health Check Tests (`directus/directus-health.test.ts`)
- Server connectivity and CORS validation
- Environment configuration checks
- Collection access and permissions
- API response format validation

### ⚡ Performance Tests (`directus/directus-performance.test.ts`)
- Response time benchmarking
- Pagination performance
- Search query optimization
- Memory usage and concurrent request handling

## Running Tests

### All Tests
```bash
# Run all tests (local utilities only)
npm run test

# Run with integration tests enabled
RUN_INTEGRATION_TESTS=true npm run test:directus
```

### Individual Test Suites
```bash
# Health checks and connectivity
RUN_INTEGRATION_TESTS=true npx vitest run src/__tests__/directus/directus-health.test.ts

# API integration (requires proper permissions)
RUN_INTEGRATION_TESTS=true npx vitest run src/__tests__/directus/directus-api.test.ts

# Data validation and utilities
npx vitest run src/__tests__/directus/directus-types.test.ts

# Performance benchmarking
RUN_INTEGRATION_TESTS=true npx vitest run src/__tests__/directus/directus-performance.test.ts
```

## Test Results Summary

### ✅ Working Tests (17/22 passed locally)
- **Translation filtering**: Fallback logic and locale handling
- **Duration formatting**: French/English time formats (1h 30min vs 1h 30m)
- **Asset URL generation**: Base URLs and transforms
- **Metadata generation**: SEO and OpenGraph data
- **Environment validation**: URL formats and locale settings
- **Server connectivity**: Basic reachability tests
- **CORS configuration**: Cross-origin request handling

### ⚠️ Known Issues

#### **Permission Errors (Expected)**
The Directus server at `api.afthonios.com` has restricted public access:
```
403 Forbidden: You don't have permission to access fields "slug", "created_at", "updated_at", "cover_image", "duration_minutes", "level", "price_cents", "currency", "availability"
```

**Resolution**: Configure Directus public role permissions or provide authentication token.

#### **Currency Formatting (Minor)**
Locale-specific formatting differences:
- Expected: `25,00 €` (with regular space)
- Received: `25,00 €` (with non-breaking space)

This is browser/Node.js Intl implementation difference and doesn't affect functionality.

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_DIRECTUS_URL=https://api.afthonios.com
NEXT_PUBLIC_DEFAULT_LOCALE=fr
RUN_INTEGRATION_TESTS=true  # Enable API calls
```

### Directus Permissions
For full test coverage, the public role needs read access to:
- `courses` collection (all fields)
- `competences` collection (all fields)  
- `instructors` collection (all fields)
- Related translation collections

## Performance Benchmarks

When integration tests run successfully, performance targets:
- **Course list (10 items)**: < 5 seconds
- **Single course**: < 3 seconds
- **All competences**: < 4 seconds
- **Search queries**: < 6 seconds
- **Large pagination (50 items)**: < 8 seconds

## Usage in CI/CD

```yaml
# GitHub Actions example
- name: Run Directus Health Checks
  run: RUN_INTEGRATION_TESTS=true npm run test:directus
  continue-on-error: true  # Don't fail build on permission issues

- name: Run Local Tests
  run: npm run test:run
```

## Troubleshooting

### PostCSS Conflicts
If you encounter PostCSS errors:
```bash
# Temporary workaround
mv postcss.config.mjs postcss.config.mjs.bak
npm run test
mv postcss.config.mjs.bak postcss.config.mjs
```

### Network Timeouts
Increase timeout for slow connections:
```typescript
// In test file
const API_TIMEOUT = 60000; // 60 seconds
```

### Skip Integration Tests
Set environment variable to skip API calls:
```bash
unset RUN_INTEGRATION_TESTS
npm run test
```