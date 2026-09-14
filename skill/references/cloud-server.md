# Cloud Server (ECC)

**OpenAPI:** [iaas/1.0](https://www.arvancloud.ir/api/iaas/1.0) · [iaas/3.0.0](https://www.arvancloud.ir/api/iaas/3.0.0)

Prefer **3.0** for basic inventory/create when possible (`list_servers_v3`, `list_flavors`). Use **1.0** for actions and features 3.0 lacks (power, floating IPs, volumes, SSH keys, … via named tools or `invoke_iaas_v1_api`).

| Tool | Base | Path |
| ---- | ---- | ---- |
| `list_servers` / `get_server` / `create_server` | `napi.../ecc/v1` | `/regions/{region}/servers` |
| `list_images` | ecc/v1 | `/regions/{region}/images` |
| `list_networks` | ecc/v1 | `/regions/{region}/networks` |
| `get_region_quota` | ecc/v1 | `/regions/{region}/quota` (**singular** — not `/quotas`) |
| `power_on_server` / `power_off_server` / `reboot_server` | ecc/v1 | `/servers/{id}/power-on` etc. |
| `list_flavors` / `list_servers_v3` | `ecc.{region}.arvanapis.ir/v3` | `/flavors`, `/servers` |

DBaaS (same IaaS 1.0 file): `list_database_flavors`, `create_database` (`datastoreType`, `flavorRef`).

`get_region_quota` returns **resource limits**, not wallet balance. There is no billing API — balance is panel-only.

Never invent region codes or UUIDs. Default region when the user omits one is account-specific (e.g. `ir-thr-c2`) — ask if unsure.
