# Workflow: Incident troubleshooting

1. Capture symptom (error, region, URL, time).
2. Read state: domain, NS check, DNS, SSL, caching.
3. `get_latest_troubleshoot`; if stale/missing, `create_troubleshoot` then re-read.
4. Hypothesize from evidence only.
5. Propose remediations; require explicit approval for `purge_cache` or DNS/SSL writes.
