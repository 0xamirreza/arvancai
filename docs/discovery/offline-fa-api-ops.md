# Offline FA docs — extracted API operations
Source root: `../arvancloud-docs/fa` (official docs.arvancloud.ir crawl)
Note: crawled HTML sometimes splits `https://` as `https : //`; extractor normalizes this.

| Method | Path / URL pattern | Offline page | Sample body (truncated) |
| ------ | ------------------ | ------------ | ----------------------- |
| PATCH | `/cdn/4.0/domains/{domain}/acceleration` | `cdn/acceleration/index.html` | {"status":"on","extensions":["css"]} |
| PATCH | `/cdn/4.0/domains/{domain}/image-resize` | `cdn/acceleration/index.html` | {"status":"on"} |
| PATCH | `/cdn/4.0/domains/{domain}/load-balancers/settings` | `cdn/advanced-settings/index.html` | {"method":"cluster_chash","next_upstream_tcp":"on","protocol":"https","keepalive":"on","max_fails":5,"fail_timeout":"10s"} |
| POST | `/cdn/4.0/domains/{domain}/log-forwarders` | `cdn/analytics/logging/index.html` | {"name":"API Log","description":"","type":"access","connection_type":"arvan_s3","data_format":{"method":true,"scheme":true,"domain":true,"re |
| POST | `/cdn/4.0/domains/{domain}/metric-exporters` | `cdn/analytics/metric-exporter/index.html` |  |
| GET | `/cdn/4.0/metric-exporters` | `cdn/analytics/metric-exporter/index.html` |  |
| GET | `/cdn/4.0/domains/{domain}/metric-exporters/{metricExporterId}` | `cdn/analytics/metric-exporter/index.html` |  |
| GET | `/cdn-metrics/v1/metrics/arvancloud.ir/id/{endPointId}` | `cdn/analytics/metric-exporter/index.html` |  |
| GET | `/cdn-metrics/v1/metrics/` | `cdn/analytics/metric-exporter/index.html` |  |
| PUT | `/cdn/4.0/domains/{domain}/metric-exporters/{metricExporterId}` | `cdn/analytics/metric-exporter/index.html` |  |
| DELETE | `/cdn/4.0/domains/{domain}/metric-exporters/{metricExporterId}` | `cdn/analytics/metric-exporter/index.html` |  |
| PATCH | `/cdn/4.0/domains/{domain}/caching` | `cdn/caching/index.html` | {"cache_status":"off"} |
| POST | `/cdn/4.0/domains/{domain}/caching/purge` | `cdn/caching/index.html` | {"purge":"individual","purge_urls":["http://example.com/purge"]} |
| POST | `/cdn/4.0/domains/{domain}/host-header-whitelists` | `cdn/cname-access/index.html` |  |
| PUT | `/cdn/4.0/domains/{domain}/host-header-whitelists/settings` | `cdn/cname-access/index.html` |  |
| GET | `/cdn/4.0/domains/{domain}/custom-pages` | `cdn/custom-pages/index.html` |  |
| POST | `/cdn/4.0/domains/{domain}/dns-records` | `cdn/dns-records/adding-records/index.html` | {"type":"A","name":"test","cloud":false,"value":[{"country":"","ip":"8.8.8.8","port":null,"weight":null}],"upstream_https":"default","ip_fil |
| POST | `/cdn/4.0/domains/{domain}/ns-keys/use-optional-keys` | `cdn/dns-records/change-default-ns/index.html` |  |
| PUT | `/cdn/4.0/domains/{domain}/ns-keys` | `cdn/dns-records/change-default-ns/index.html` | {"ns_keys":["ns1.example.com","ns2.example.com"]} |
| PUT | `/cdn/4.0/domains/{domain}/dns-records/{id}/cloud` | `cdn/dns-records/cloud/index.html` | {"cloud":true} |
| PUT | `/cdn/4.0/domains/{domain}/dns-records/dnssec/actions` | `cdn/dns-records/dnssec/index.html` | {"enable":true} |
| POST | `/cdn/4.0/domains/{domain}/dns-records/import` | `cdn/dns-records/index.html` |  |
| POST | `/cdn/4.0/domains/{domain}/cname-setup/convert` | `cdn/domain/cname-setup/index.html` |  |
| POST | `/cdn/4.0/domains/{domain}` | `cdn/domain/index.html` | {"domain":"arvandocs.ir","domain_type":"full"} |
| PUT | `/cdn/4.0/domains/{domain}/plan` | `cdn/domain/index.html` | {"plan_level":"2"} |
| POST | `/cdn/4.0/domains/{domain}/clone` | `cdn/domain/index.html` | { "from": "string"} |
| POST | `/cdn/4.0/domains/{domain}/transfer` | `cdn/domain/transfer/index.html` | {"account_id":"Destination_Account_ID"} |
| POST | `/cdn/4.0/domains/{domain}/change-status` | `cdn/domain/transfer/index.html` | {"domain":"example.com","status":"accept"} |
| PATCH | `/cdn/4.0/domains/{domain}/ssl` | `cdn/https-settings/index.html` | {"ssl_status":true} |
| POST | `/cdn/4.0/domains/{domain}/ssl/certificates` | `cdn/https-settings/index.html` |  |
| POST | `/cdn/4.0/dynamic-fields` | `cdn/list/index.html` |  |
| PATCH | `/cdn/4.0/domains/{domain}/ddos` | `cdn/security/ddos/index.html` | {"protection_mode":"cookie"} |
| POST | `/cdn/4.0/domains/{domain}/firewall/rules` | `cdn/security/firewall/index.html` | {"name":"Test Rule","note":"","is_enabled":true,"action":"allow","action_details":{"mode":1,"ttl":120,"https_only":false},"filter_expr":"((h |
| PATCH | `/cdn/4.0/domains/{domain}/firewall/settings` | `cdn/security/known-bots/index.html` | {"skip_global_firewall":true} |
| POST | `/cdn/4.0/domains/{domain}/rate-limit/rules` | `cdn/security/rate-limit/index.html` | {"is_enabled":true,"url_pattern":"example.com/**","description":"","exclude_sources":[],"rate":1,"burst":4000000,"block_duration":0,"time_du |
| PATCH | `/cdn/4.0/domains/{domain}/waf` | `cdn/security/waf/index.html` | {"mode":"off"} |
| PATCH | `/cdn/4.0/domains/{domain}/waf/packages/default?revelio` | `cdn/security/waf/index.html` | {"disabled_rules":["21001","21003","21006","21009","40026","99001","21002"]} |
| POST | `/cdn/4.0/domains/{domain}/waf/rules` | `cdn/security/waf/index.html` | {"id":null,"url_pattern":"example.com/**","sources":["192.168.1.1/32"],"description":"Test For Docs","action":"protect"} |
| GET | `/cdn/4.0/domains` | `developer-tools/api/api-usage/index.html` |  |
| GET | `/cdn/4.0/domains/{domain}/dns-records` | `developer-tools/api/api-usage/index.html` |  |
| GET | `/ecc/v1/regions/{region}/servers` | `developer-tools/api/api-usage/index.html` |  |
| GET | `/ecc/v1/regions/{region}/images` | `developer-tools/api/api-usage/index.html` |  |
| POST | `/ecc/v1/regions/{region}/servers` | `developer-tools/api/api-usage/index.html` |  |
| GET | `/vod/2.0/channels` | `developer-tools/api/api-usage/index.html` |  |
| GET | `/vod/2.0/channels/{channel-id}/videos` | `developer-tools/api/api-usage/index.html` |  |
| POST | `/vod/2.0/channels` | `developer-tools/api/api-usage/index.html` |  |
| GET | `https://s3.ir-thr-at1.arvanstorage.ir/$file` | `developer-tools/api/api-usage/index.html` |  |
| GET | `https://$bucket.s3.ir-thr-at1.arvanstorage.ir` | `developer-tools/api/api-usage/index.html` |  |
| PUT | `https://s3.ir-thr-at1.arvanstorage.ir/` | `developer-tools/api/api-usage/index.html` |  |
| GET | `https://repo.arvancloud.ir/apt/gpg.key` | `developer-tools/cli/install/index.html` |  |
| POST | `/edge-computing/1.0/edge-computes/{workerId}/routes` | `edge-computing/trigger/path/index.html` | {"domain":"myexampledomain.ir.ir","url":"/app/*","status":"active"} |
| PUT | `/edge-computing/1.0/edge-computes/{workerId}/routes/{routeId}` | `edge-computing/trigger/path/index.html` | {"url":"/app/*","status":"inactive"} |
| GET | `https://storage.arvanapis.ir/v1/buckets/{bucketName}/metrics` | `object-storage/metrics/index.html` |  |
