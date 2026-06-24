# Configuration API Contract

**Purpose**: Define the HTTP API contract for the remote configuration endpoint

**Audience**: Backend developers implementing the configuration service

**Version**: 1.0.0

---

## API Endpoint

### GET /analytics-config

**Purpose**: Fetch analytics SDK configuration

**URL**: Configurable (passed to `sdk.init(url)`)

**Method**: GET

**Authentication**: Optional (implementation-specific)

---

## Request

### Headers

```http
GET /analytics-config HTTP/1.1
Host: api.example.com
Accept: application/json
User-Agent: analytics-sdk/1.0.0
```

**Required Headers**:
- `Accept: application/json`

**Optional Headers**:
- `Authorization: Bearer <token>` (if authentication required)
- `X-App-Name: <app-name>` (for multi-tenant configs)
- `X-Environment: <env>` (development, staging, production)

---

## Response

### Success Response (200 OK)

**Status Code**: 200

**Content-Type**: `application/json`

**Body Schema**:
```json
{
  "enabled": true,
  "debug": false,
  "queueTimeout": 5000,
  "maxQueueSize": 100,
  "schemaVersion": "1.0",
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
      "integrity": "sha384-...",
      "config": {
        "measurementId": "G-XXXXXXXXXX",
        "cookieDomain": "auto"
      }
    },
    {
      "provider": "clevertap",
      "enabled": false,
      "scriptUrl": "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js",
      "config": {
        "accountId": "CLEVERTAP_ACCOUNT_ID",
        "region": "us1"
      }
    }
  ],
  "enrichment": {
    "appName": "ecommerce-platform",
    "environment": "production",
    "customFields": {
      "tenant": "acme-corp"
    }
  },
  "routing": [
    {
      "eventNamePattern": "purchase",
      "providers": ["clevertap"],
      "exclude": ["google-analytics"]
    }
  ]
}
```

---

## Schema Definition

### Root Configuration Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | ✅ Yes | Master switch for all analytics |
| `debug` | boolean | No (default: false) | Enable verbose logging |
| `queueTimeout` | number | No (default: 5000) | Max time to queue events (ms) |
| `maxQueueSize` | number | No (default: 100) | Max events in queue |
| `schemaVersion` | string | No (default: "1.0") | Configuration schema version |
| `providers` | array | ✅ Yes | Array of provider configurations |
| `enrichment` | object | No | Event enrichment settings |
| `routing` | array | No | Event routing rules |

---

### Provider Configuration Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | ✅ Yes | Provider identifier (must match registered provider name) |
| `enabled` | boolean | ✅ Yes | Enable/disable this provider |
| `scriptUrl` | string | ✅ Yes | HTTPS URL to provider's CDN script |
| `integrity` | string | No | SRI hash for script verification (e.g., "sha384-...") |
| `priority` | number | No | Loading priority (lower = first, default: 0) |
| `config` | object | ✅ Yes | Provider-specific configuration |

**Provider Config (`config` field)** - Provider-specific:

**Google Analytics**:
```json
{
  "measurementId": "G-XXXXXXXXXX",
  "cookieDomain": "auto",
  "anonymizeIp": true
}
```

**CleverTap**:
```json
{
  "accountId": "CLEVERTAP_ACCOUNT_ID",
  "region": "us1"
}
```

---

### Enrichment Object (Optional)

| Field | Type | Description |
|-------|------|-------------|
| `appName` | string | Application name added to all events |
| `environment` | string | Environment name (dev, staging, prod) |
| `customFields` | object | Custom metadata added to all events |

---

### Routing Rule Object (Optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventNamePattern` | string | ✅ Yes | Event name or regex pattern |
| `providers` | string[] | ✅ Yes | Whitelist of provider names |
| `exclude` | string[] | No | Blacklist of provider names |

**Routing Logic**:
- If event matches pattern: Send only to whitelisted providers (minus excluded)
- If no routing rules match: Send to all enabled providers

---

## Example Responses

### Minimal Configuration

```json
{
  "enabled": true,
  "providers": []
}
```

**Effect**: SDK initializes but no providers are enabled (analytics disabled)

---

### Single Provider (Google Analytics)

```json
{
  "enabled": true,
  "debug": false,
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
      "config": {
        "measurementId": "G-ABC123XYZ"
      }
    }
  ]
}
```

---

### Multi-Provider with Routing

```json
{
  "enabled": true,
  "debug": false,
  "providers": [
    {
      "provider": "google-analytics",
      "enabled": true,
      "scriptUrl": "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
      "config": {
        "measurementId": "G-ABC123XYZ"
      }
    },
    {
      "provider": "clevertap",
      "enabled": true,
      "scriptUrl": "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js",
      "config": {
        "accountId": "CT-ACCOUNT-123",
        "region": "us1"
      }
    }
  ],
  "routing": [
    {
      "eventNamePattern": "^purchase$",
      "providers": ["clevertap"],
      "exclude": ["google-analytics"]
    }
  ]
}
```

**Behavior**: 
- "purchase" events → CleverTap only
- All other events → Both providers

---

## Error Responses

### 404 Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Configuration not found",
  "code": "CONFIG_NOT_FOUND"
}
```

**SDK Behavior**: Falls back to cached config or safe defaults (all providers disabled)

---

### 500 Internal Server Error

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

**SDK Behavior**: Falls back to cached config or safe defaults

---

### 401 Unauthorized

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**SDK Behavior**: Falls back to cached config or safe defaults

---

## Validation Rules

### Server-Side Validation

The configuration API SHOULD validate:

1. **Schema Compliance**:
   - All required fields present
   - Field types match schema
   - URLs are valid HTTPS

2. **Business Rules**:
   - At least one provider exists (even if disabled)
   - Provider identifiers are valid
   - Script URLs are from allowed domains

3. **Security**:
   - Script URLs must be HTTPS
   - Script URLs must be from whitelisted domains
   - No malicious patterns in config

**Invalid Configuration Response**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid configuration",
  "code": "INVALID_CONFIG",
  "details": [
    {
      "field": "providers[0].scriptUrl",
      "message": "Script URL must use HTTPS"
    }
  ]
}
```

---

## Client-Side Validation

The SDK validates:

1. **Schema**: Using Zod schema validation
2. **HTTPS URLs**: All script URLs must start with "https://"
3. **Non-empty required fields**: `enabled`, `providers` array, etc.

**Invalid Config Behavior**: 
- Log validation errors
- Use cached config or safe defaults
- Emit `onConfigLoaded` hook with error details

---

## Caching and Staleness

### Cache-Control Headers

**Recommended**:
```http
Cache-Control: no-cache, must-revalidate
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
```

**SDK Behavior**:
- Respects `Cache-Control` headers
- Always validates with server (no-cache)
- Uses ETag for conditional requests (if supported)

---

### Conditional Requests (Optional)

**Client Request**:
```http
GET /analytics-config HTTP/1.1
If-None-Match: "abc123"
```

**Server Response** (if not modified):
```http
HTTP/1.1 304 Not Modified
```

**SDK Behavior**: Uses cached config

---

## Multi-Tenant Support

### Tenant Identification

**Option 1: Header-based**
```http
GET /analytics-config HTTP/1.1
X-Tenant-ID: acme-corp
```

**Option 2: Query parameter**
```http
GET /analytics-config?tenant=acme-corp HTTP/1.1
```

**Option 3: Subdomain**
```http
GET https://acme-corp.api.example.com/analytics-config HTTP/1.1
```

**Response**: Tenant-specific configuration

---

## Environment-Specific Configs

### Strategy 1: Different URLs

```typescript
// Development
sdk.init('https://api-dev.example.com/analytics-config');

// Production
sdk.init('https://api.example.com/analytics-config');
```

---

### Strategy 2: Environment Header

```http
GET /analytics-config HTTP/1.1
X-Environment: production
```

**Response**: Environment-specific providers enabled/disabled

---

## Performance Considerations

### Response Size

**Recommended**: <10KB per response

**Optimization**:
- Minimize config verbosity
- Use compression (gzip/brotli)
- Only include necessary provider configs

---

### Response Time

**Recommended**: <500ms (preferably <200ms)

**SDK Timeout**: Default 10 seconds

---

## Security Considerations

### HTTPS Only

**Required**: Configuration API MUST use HTTPS

**Reason**: Prevent man-in-the-middle attacks on config

---

### CORS Headers

If SDK runs in browser, API MUST include CORS headers:

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Accept, Authorization
```

---

### Rate Limiting

**Recommended**: Implement rate limiting per client

**Example**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1717545660
```

---

## Polling Behavior

If SDK enables configuration polling:

**Default Interval**: 5 minutes (300,000ms)

**Request Pattern**:
```
T+0: Initial fetch
T+5min: Poll
T+10min: Poll
...
```

**Server Recommendations**:
- Use ETags to reduce bandwidth
- Implement caching
- Monitor polling frequency per client

---

## Versioning

### Schema Version

**Field**: `schemaVersion` (e.g., "1.0", "1.1", "2.0")

**Purpose**: Enable breaking changes to config schema

**SDK Behavior**:
- Check schema version
- If unsupported version: Log warning, use safe defaults
- If compatible: Parse and apply config

---

### API Versioning

**Strategy**: URL-based versioning (optional)

```http
GET /v1/analytics-config HTTP/1.1
GET /v2/analytics-config HTTP/1.1
```

**SDK**: Configured with versioned URL

---

## Testing

### Test Configuration Endpoints

**Development**:
```
https://api-dev.example.com/analytics-config
```

**Response**: Debug mode enabled, test provider configs

**Staging**:
```
https://api-staging.example.com/analytics-config
```

**Response**: Production-like config, test providers

---

### Mock Configuration (for SDK tests)

**Pattern**: Use mock server or static JSON file

```typescript
// Test mode
sdk.init('http://localhost:3000/mock-config.json');
```

**mock-config.json**:
```json
{
  "enabled": true,
  "debug": true,
  "providers": []
}
```

---

## Monitoring and Observability

### Metrics to Track

**Server-side**:
- Request count (per client, per environment)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Cache hit rate (if caching implemented)

**Logging**:
- Log all config fetches with tenant/environment
- Log validation errors
- Log unexpected schema versions

---

## Change Management

### Config Change Process

1. **Update config in dashboard/admin tool**
2. **Config API returns new version**
3. **SDK polls or app restarts**
4. **SDK applies new config**
5. **Providers reinitialize if needed**

**Backward Compatibility**: Ensure config changes don't break older SDK versions

---

## Example API Implementation (Pseudocode)

```javascript
app.get('/analytics-config', async (req, res) => {
  try {
    // 1. Authenticate (optional)
    const tenant = req.headers['x-tenant-id'] || 'default';
    const environment = req.headers['x-environment'] || 'production';
    
    // 2. Fetch config from database
    const config = await db.getConfig(tenant, environment);
    
    // 3. Validate
    if (!validateConfig(config)) {
      return res.status(400).json({ error: 'Invalid config' });
    }
    
    // 4. Return
    res.set('Cache-Control', 'no-cache, must-revalidate');
    res.json(config);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Contract Summary

| Aspect | Requirement |
|--------|-------------|
| **Protocol** | HTTPS only |
| **Method** | GET |
| **Content-Type** | application/json |
| **Response Time** | <500ms recommended |
| **Response Size** | <10KB recommended |
| **Authentication** | Optional (implementation-specific) |
| **Caching** | `Cache-Control: no-cache` |
| **Error Handling** | Return 200 (success) or 4xx/5xx (error) |
| **Validation** | Schema validation on server and client |
| **Versioning** | Schema version in response body |
