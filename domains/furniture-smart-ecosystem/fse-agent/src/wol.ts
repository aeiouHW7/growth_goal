import { createSocket } from "node:dgram";

export interface WolOptions {
  mac: string;
  broadcast?: string;
  port?: number;
}

function parseMac(mac: string): Buffer {
  const hex = mac.replace(/[^a-fA-F0-9]/g, "");
  if (hex.length !== 12) {
    throw new Error(`Invalid MAC address: ${mac}`);
  }
  return Buffer.from(hex, "hex");
}

export function sendWol(options: WolOptions): Promise<void> {
  const { mac, broadcast = "255.255.255.255", port = 9 } = options;
  const macBuffer = parseMac(mac);

  // Magic Packet: 6 bytes of 0xFF + 16 repetitions of MAC
  const packet = Buffer.alloc(6 + 16 * 6, 0xff);
  for (let i = 0; i < 16; i++) {
    macBuffer.copy(packet, 6 + i * 6);
  }

  return new Promise((resolve, reject) => {
    const socket = createSocket("udp4");
    socket.on("error", (err) => {
      socket.close();
      reject(err);
    });

    socket.bind(0, () => {
      socket.setBroadcast(true);
      socket.send(packet, 0, packet.length, port, broadcast, (err) => {
        socket.close();
        if (err) reject(err);
        else resolve();
      });
    });
  });
}
