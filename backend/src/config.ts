import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

export interface Config {
  databaseUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
  contractIds: string[];
  pollIntervalMs: number;
  corsOrigin: string | string[];
  nodeEnv: string;
  dbPoolMax: number;
}

function getContractIds(): string[] {
  const ids: string[] = [];
  const envKeys = [
    "TREASURY_CONTRACT_ID",
    "GOVERNANCE_CONTRACT_ID",
    "TOKEN_VAULT_CONTRACT_ID",
    "ACCESS_CONTROL_CONTRACT_ID",
  ];

  for (const key of envKeys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      ids.push(value.trim());
    }
  }

  return ids;
}

function parseCorsOrigin(nodeEnv: string): string | string[] {
  const rawOrigin = process.env.CORS_ORIGIN?.trim();
  if (!rawOrigin) {
    return nodeEnv === "production" ? "*" : "http://localhost:3000";
  }

  const origins = rawOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length <= 1) {
    return origins[0] || rawOrigin;
  }

  return origins;
}

export function loadConfig(): Config {
  const nodeEnv = process.env.NODE_ENV || "development";
  const databaseUrl =
    process.env.DATABASE_URL || "postgresql://localhost:5432/stellarguard";
  const sorobanRpcUrl =
    process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
  const networkPassphrase =
    process.env.NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
  const pollIntervalMs = parseInt(process.env.POLL_INTERVAL_MS || "5000", 10);
  const dbPoolMax = parseInt(process.env.DB_POOL_MAX || "10", 10);
  const contractIds = getContractIds();
  const corsOrigin = parseCorsOrigin(nodeEnv);

  if (contractIds.length === 0) {
    console.warn(
      "Warning: No contract IDs configured. Set at least one of: " +
        "TREASURY_CONTRACT_ID, GOVERNANCE_CONTRACT_ID, TOKEN_VAULT_CONTRACT_ID, ACCESS_CONTROL_CONTRACT_ID"
    );
  }

  const wildcardCors =
    corsOrigin === "*" ||
    (Array.isArray(corsOrigin) && corsOrigin.includes("*"));
  if (nodeEnv === "production" && wildcardCors) {
    console.warn(
      "Warning: CORS_ORIGIN resolves to '*' while NODE_ENV=production. Restrict CORS_ORIGIN before deploying."
    );
  }

  return {
    databaseUrl,
    sorobanRpcUrl,
    networkPassphrase,
    contractIds,
    pollIntervalMs,
    corsOrigin,
    nodeEnv,
    dbPoolMax,
  };
}

export const config = loadConfig();
