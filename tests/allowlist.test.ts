import { describe, it, expect } from "vitest";
import {
  findAllowedOp,
  loadAllowlist,
  normalizePath,
  pathMatchesTemplate,
} from "../src/openapi/allowlist.js";

describe("openapi allowlist", () => {
  it("matches braced and colon path params", () => {
    expect(pathMatchesTemplate("/domains/{domain}/dns-records/{id}", "/domains/ex.com/dns-records/abc")).toBe(
      true,
    );
    expect(pathMatchesTemplate("/regions/:region/servers/:id", "/regions/ir-thr-c2/servers/uuid")).toBe(
      true,
    );
    expect(pathMatchesTemplate("/domains/{domain}", "/domains/ex.com/extra")).toBe(false);
  });

  it("loads CDN allowlist and accepts known op", () => {
    const al = loadAllowlist("cdn");
    expect(al.operations.length).toBeGreaterThan(100);
    expect(findAllowedOp(al, "GET", "/domains")).toBeTruthy();
    expect(findAllowedOp(al, "GET", normalizePath("domains/example.com"))).toBeTruthy();
    expect(findAllowedOp(al, "POST", "/not-a-real-path")).toBeUndefined();
  });

  it("loads CaaS and Edge allowlists", () => {
    expect(loadAllowlist("caas").operations.length).toBeGreaterThan(200);
    expect(findAllowedOp(loadAllowlist("edge"), "POST", "/edge-computes/deploy")).toBeTruthy();
  });
});
