# Permissions

## Documented model

| Concept | Documented? | Source |
| ------- | ----------- | ------ |
| Machine User keys | Yes | https://docs.arvancloud.ir/en/accounts/iam/machine-user |
| Access policies for machine users | Yes (high level) | Same page — assign access in access policies section |
| Fine-grained API permission matrix per endpoint | **UNKNOWN / NOT DOCUMENTED** in public API usage pages | — |
| IAM policies / resources | Product docs under Accounts → IAM | https://docs.arvancloud.ir/en/accounts/iam/ (browse) |

## Principle of least privilege (operational)

Until a public per-endpoint ACL matrix is documented:

1. Create a dedicated Machine User for MCP automation.
2. Grant only CDN (and optionally ECC) product access required by enabled tools.
3. Prefer read-only policies when the agent only needs inspection.
4. Do not reuse owner-level keys for agents when a narrower machine user is available.

## Edge Computing CLI note

Edge Computing CLI login docs require a machine user key with **owner access** (https://docs.arvancloud.ir/en/edge-computing/cli). That requirement is **CLI-specific** and is not assumed for CDN REST tools.
