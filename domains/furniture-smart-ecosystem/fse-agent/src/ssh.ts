import { Client } from "ssh2";

export interface SshOptions {
  host: string;
  port: number;
  user: string;
  password?: string;
  privateKey?: string;
}

export function sshExec(options: SshOptions, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client.on("ready", () => {
      client.exec(command, (err, stream) => {
        if (err) {
          client.end();
          reject(err);
          return;
        }
        let stdout = "";
        let stderr = "";
        stream.on("data", (data: Buffer) => {
          stdout += data.toString();
        });
        stream.stderr.on("data", (data: Buffer) => {
          stderr += data.toString();
        });
        stream.on("close", (code: number) => {
          client.end();
          if (code !== 0) {
            reject(new Error(`SSH command exited with code ${code}: ${stderr}`));
          } else {
            resolve(stdout);
          }
        });
      });
    });
    client.on("error", reject);
    client.connect({
      host: options.host,
      port: options.port,
      username: options.user,
      password: options.password,
      privateKey: options.privateKey,
      readyTimeout: 10000,
    });
  });
}
