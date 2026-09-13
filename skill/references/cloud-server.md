# Cloud Server (ECC)

**OpenAPI:** [iaas/1.0](https://www.arvancloud.ir/api/iaas/1.0) · [iaas/3.0.0](https://www.arvancloud.ir/api/iaas/3.0.0)

| Tool | Base | Path |
| ---- | ---- | ---- |
| `list_servers` / `get_server` / `create_server` | `napi.../ecc/v1` | `/regions/{region}/servers` |
| `list_images` | ecc/v1 | `/regions/{region}/images` |
| `list_networks` | ecc/v1 | `/regions/{region}/networks` |
| `power_on_server` / `power_off_server` / `reboot_server` | ecc/v1 | `/servers/{id}/power-on` etc. |
| `list_flavors` / `list_servers_v3` | `ecc.{region}.arvanapis.ir/v3` | `/flavors`, `/servers` |

DBaaS (same IaaS 1.0 file): `list_database_flavors`, `create_database` (`datastoreType`, `flavorRef`).

Never invent region codes or UUIDs.
