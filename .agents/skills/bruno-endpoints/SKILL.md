---
name: bruno-endpoints
description: >
  Add or update Bruno requests for the ONG Gabriel API in bruno/.
  Use when creating or changing an API route, or when the user asks for a
  Bruno request, collection, or the local, dev, or prod environment.
---

# Bruno endpoints

The collection is `bruno/`, OpenCollection YAML. Bruno opens that folder. Requests call `{{baseUrl}}`. The active environment supplies the host.

## Environments

| File | Name | `baseUrl` |
| --- | --- | --- |
| `bruno/environments/local.yml` | `local` | `http://127.0.0.1:8000` |
| `bruno/environments/dev.yml` | `dev` | shared dev origin, empty until it exists |
| `bruno/environments/prod.yml` | `prod` | production origin, empty until it exists |

`local` is the collection default. In the Bruno app, switch with the environment dropdown. From `bruno/`, the CLI is `bru run --env local`, `--env dev`, or `--env prod`.

Only `baseUrl` changes between environments. No trailing slash. Do not put a host in a request URL.

Secrets are a variable with `secret: true` and an empty `value` in git. Never read `.env` to fill one.

## Add a request

1. Match the route that was just added or changed. One file per operation.
2. Put it in a resource folder: `bruno/<resource>/<verb>-<name>.yml`. Create `folder.yml` if the folder is new.
3. Reuse the next patterns. Set `info.seq` to the next integer in that folder.
4. Assert the status code the test expects. Assert a stable response field when the route has one.
5. Update the same file when the route changes. Do not add a second file for the same operation.

Public request:

```yaml
info:
  name: Health
  type: http
  seq: 1

http:
  method: GET
  url: "{{baseUrl}}/health"
  auth: inherit

runtime:
  scripts:
    - type: tests
      code: |-
        test("status is 200", function () {
          expect(res.status).to.equal(200);
        });

settings:
  encodeUrl: true
```

JSON body: under `http.body`, set `type: json` and `data` to the JSON string. Path params go in `http.params` with `type: path`. Query params use `type: query`.

Folder marker:

```yaml
info:
  name: health
  type: folder
  seq: 1
```

Authenticated routes use `auth: inherit` until the API defines auth. Then set auth on `bruno/opencollection.yml` with `{{token}}` (or the cookie the API actually uses) and store the token as a secret variable. Do not invent the auth scheme.

Do not add `.bru` files. Do not commit response dumps, tokens, or cookies.
