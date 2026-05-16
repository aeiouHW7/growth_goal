import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

export interface Config {
  server: {
    port: number;
  };
  wol: {
    mac: string;
    broadcast: string;
    port: number;
  };
  ssh: {
    host: string;
    port: number;
    user: string;
    password?: string;
    privateKey?: string;
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadConfig(path?: string): Config {
  const configPath = path ?? resolve(__dirname, "..", "config.yaml");
  const raw = readFileSync(configPath, "utf-8");
  const config = yaml.load(raw) as Config;

  // Resolve relative privateKey path against config file directory
  if (config.ssh.privateKey && !config.ssh.privateKey.startsWith("/")) {
    config.ssh.privateKey = resolve(dirname(configPath), config.ssh.privateKey);
  }

  return config;
}
