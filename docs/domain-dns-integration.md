# Atlantis Domain / DNS Manager

Status: dev implementation
Provider: GoDaddy Domains API
Last updated: 2026-05-24

Atlantis now has an app-owned Domain / DNS Manager for GoDaddy-backed domain maintenance. The goal is for Atlantis, and eventually Ultron as Atlantis Project Manager, to maintain Atlantis DNS through controlled app APIs instead of raw manual credential handling.

## Scope

Current implementation supports:

- GoDaddy production API credential storage
- GoDaddy connection test
- domain listing
- DNS record listing
- manual DNS record create/repair
- saved Atlantis domain profile
- saved profile check
- saved profile repair
- local DNS audit trail
- authenticated remote control actions for future Ultron maintenance
- Atlantis-native HTTPS on a configurable local port using the saved TLS certificate

This is implemented in the dev/source Atlantis app. It has not been promoted into the packaged live app yet.

## Security Model

GoDaddy credentials are Atlantis-native credentials:

- `GODADDY_API_KEY`
- `GODADDY_API_SECRET`

Credential rules:

- Values are set through Settings -> Credentials.
- Values are stored in Atlantis' credentials store.
- Electron `safeStorage` encryption is used when available.
- The credentials file is still forced to mode `0600`.
- Secret values are never returned to the renderer.
- `getSecret()` remains main-process only.
- Ultron must operate through Atlantis control actions, not direct GoDaddy credentials.

Credential store:

- `src/main/credentials-service.js`
- default path: `~/.atlantis/credentials.json`

## Saved Profile

The saved Atlantis DNS profile records the intended DNS state for the Atlantis endpoint.

Stored fields:

- provider
- domain
- record type
- record name
- record value
- TTL
- updated timestamp

Store file:

- Atlantis user data: `domain-dns.json`
- dev fallback: `.atlantis-userdata/domain-dns.json`
- test override: `ATLANTIS_USER_DATA_ROOT`

The profile store must not contain GoDaddy API keys or secrets.

## Native HTTPS Runtime

Atlantis can serve the owned domain without Caddy/nginx by using its saved Let's Encrypt certificate directly.

Recommended Mac mini live shape:

- `ATLANTIS_PUBLIC_ORIGIN=https://atlantis.psyoplabs.co`
- `ATLANTIS_WEB_HTTPS=1`
- `ATLANTIS_WEB_READ_HOST=0.0.0.0`
- `ATLANTIS_WEB_READ_PORT=3443`
- `ATLANTIS_WEB_REDIRECT_PORT=0`

The router should map public `443` to the Mac's internal `3443` when possible. That keeps Atlantis inside the app boundary while avoiding root-only binding on local port `443`. `ATLANTIS_WEB_REDIRECT_PORT` remains available for environments that can bind port `80`, but it should be disabled on macOS unless the OS/router path explicitly supports it.

Tailscale Funnel may remain as a fallback/admin path, but normal friend web access should use the owned domain and Atlantis invite/session login.

## Settings UI

Location:

- Settings -> Domain / DNS

Available actions:

- Test connection
- Load domains
- Save Atlantis domain profile
- Check saved profile
- Repair saved profile
- List selected records
- Create / repair a manual record
- View DNS audit trail

Expected first setup:

1. Create a GoDaddy production API key in the GoDaddy developer portal.
2. Open Atlantis dev.
3. Settings -> Credentials.
4. Set `GODADDY_API_KEY`.
5. Set `GODADDY_API_SECRET`.
6. Settings -> Domain / DNS.
7. Test connection.
8. Load domains.
9. Select a domain and enter the Atlantis subdomain record.
10. Save profile.
11. Check profile.
12. Repair profile only after confirming the target record/value is correct.

## Main Process API

Service file:

- `src/main/domain-dns-service.js`

Core functions:

- `getStatus()`
- `testConnection()`
- `listDomains()`
- `listRecords(domain, type, name)`
- `upsertRecord(payload)`
- `setProfile(payload)`
- `checkProfile()`
- `repairProfile(actor)`
- `listAudit(limit)`

GoDaddy client behavior:

- `GET /v1/domains`
- `GET /v1/domains/{domain}/records`
- `GET /v1/domains/{domain}/records/{type}/{name}`
- `PUT /v1/domains/{domain}/records/{type}/{name}`

The GoDaddy `PUT` record endpoint replaces records at the selected type/name. Use the saved profile flow for Atlantis-owned records so the intended value is explicit.

## Renderer IPC

Exposed via `src/main/preload.js`:

- `getDomainDnsStatus()`
- `testDomainDnsConnection()`
- `listDomainDnsDomains()`
- `listDomainDnsRecords(domain, type, name)`
- `upsertDomainDnsRecord(payload)`
- `setDomainDnsProfile(payload)`
- `checkDomainDnsProfile()`
- `repairDomainDnsProfile()`
- `listDomainDnsAudit(limit)`

These methods return metadata and DNS records only. They never return GoDaddy credential values.

## Remote Control Actions

Authenticated control actions are exposed through Atlantis' existing `/api/control/action` path when the web relay write token is configured.

Supported action names:

- `domainDnsStatus`
- `domainDnsTestConnection`
- `domainDnsListDomains`
- `domainDnsListRecords`
- `domainDnsUpsertRecord`
- `domainDnsSetProfile`
- `domainDnsCheckProfile`
- `domainDnsRepairProfile`
- `domainDnsListAudit`

Expected Ultron use:

- inspect status
- check saved profile
- repair saved profile if drift is detected and the action is authorized
- report audit trail

Ultron should not request or store raw GoDaddy credentials.

## Audit Trail

DNS events are written to the local `domain-dns.json` store.

Tracked event fields:

- id
- timestamp
- provider
- action
- actor
- domain
- record type
- record name
- record count
- status

The audit trail intentionally excludes API key/secret values.

## Promotion Notes

Before dev-to-live promotion:

- Restart dev Atlantis and verify Settings -> Domain / DNS renders.
- Verify credential slots appear.
- Verify connection test with real credentials.
- Verify saved profile writes to user data, not repo files.
- Verify profile check detects in-sync and drift states.
- Verify repair changes only the intended record.
- Verify `/api/read/snapshot` includes `domainDns` metadata without secrets.
- Verify remote control actions require the Atlantis write token.
- Verify HTTPS starts on a non-root configured port before routing public `443` to it.

Live packaging note:

Credentials and user-data files are local runtime state. Code promotion moves the feature, but GoDaddy credentials may need to be re-entered or migrated depending on the packaged app's user-data path.

## Test Coverage

Current tests:

- input normalization
- GoDaddy domain list request construction
- GoDaddy replace-record request construction
- saved profile persistence
- non-secret audit event persistence

Command:

```bash
node --test test/domain-dns-service.test.js
node --test test/*.test.js
```

Latest verification:

- `node --test test/*.test.js` passed 33/33 on 2026-05-24.
- Existing warning: typeless ESM tests are reparsed as modules. This warning predates this feature and does not indicate a test failure.
