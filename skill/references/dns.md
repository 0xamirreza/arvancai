# DNS (CDN)

**Docs:** https://docs.arvancloud.ir/en/cdn/dns-records/adding-records  
**API:** `https://napi.arvancloud.ir/cdn/4.0/domains/{domain}/dns-records`

## Tools

| Task | Tool | Risk |
| ---- | ---- | ---- |
| List | `list_dns_records` | READ |
| Get one | `get_dns_record` | READ |
| Create | `create_dns_record` | WRITE |
| Update | `update_dns_record` | WRITE |
| Delete | `delete_dns_record` | DESTRUCTIVE |
| Toggle CDN proxy | `set_dns_record_cloud` | WRITE |

## Record types with documented create samples

A, AAAA, CNAME, ANAME, NS, MX, SRV, TXT, CAA, TLSA, PTR — see adding-records page for `value` shapes.

Example A record body (official sample):

```json
{
  "type": "A",
  "name": "test",
  "cloud": false,
  "value": [{ "country": "", "ip": "8.8.8.8", "port": null, "weight": null }],
  "upstream_https": "default",
  "ip_filter_mode": { "count": "single", "geo_filter": "none", "order": "none" },
  "ttl": 120
}
```

Update uses PUT `.../dns-records/{id}` (CDN Go SDK / OpenAPI-derived contract). Prefer reading the record first and sending a full replacement consistent with create fields.

## Safety

- Obtain `record_id` only from API responses.
- Editing NS records provided by ArvanCloud for the domain is restricted in product UI docs — be careful.
