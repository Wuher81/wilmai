import { readFile } from "node:fs/promises";
import type { TenantDiscoveryResponse, TenantInfo } from "./types.js";

const TENANT_LIST_URL = new URL("../tenant_list.json", import.meta.url);

export async function loadTenantDiscovery(): Promise<TenantDiscoveryResponse> {
  const raw = await readFile(TENANT_LIST_URL, "utf-8");
  const data = JSON.parse(raw) as TenantDiscoveryResponse;
  if (!data || !Array.isArray(data.wilmat)) {
    throw new Error("Invalid tenant list format");
  }
  return data;
}

export async function listTenants(): Promise<TenantInfo[]> {
  const data = await loadTenantDiscovery();
  return data.wilmat;
}

export async function searchTenantsByMunicipality(
  municipality: string,
  limit = 50
): Promise<TenantInfo[]> {
  const data = await loadTenantDiscovery();
  const needle = (municipality ?? "").toLowerCase();
  const results = data.wilmat.filter((tenant) => {
    const municipalities = Array.isArray(tenant.municipalities) ? tenant.municipalities : [];
    return municipalities.some((m) => {
      if (!m) {
        return false;
      }
      const nameFi = (m.nameFi ?? "").toLowerCase();
      const nameSv = (m.nameSv ?? "").toLowerCase();
      return nameFi.includes(needle) || nameSv.includes(needle);
    });
  });
  return results.slice(0, limit);
}

export async function findTenantByUrl(url: string): Promise<TenantInfo | null> {
  const data = await loadTenantDiscovery();
  const target = url.replace(/\/$/, "");
  return data.wilmat.find((t) => t.url.replace(/\/$/, "") === target) ?? null;
}
