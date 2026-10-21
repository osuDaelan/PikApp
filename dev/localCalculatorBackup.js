import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CALCULATOR_BACKUP_URL, validCalculatorBackup } from "../src/storage/calculatorBackupData.js";

export function createCalculatorBackupFile(root) {
  const directory = join(root, ".local");
  const path = join(directory, "calculator-progress.json");
  let queue = Promise.resolve();
  async function read() {
    try {
      const record = JSON.parse(await readFile(path, "utf8"));
      if (!validCalculatorBackup(record)) throw new Error("Invalid calculator backup");
      return record;
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  return {
    read,
    write(record) {
      if (!validCalculatorBackup(record)) return Promise.reject(new Error("Invalid calculator backup"));
      const work = queue.then(async () => {
        const previous = await read();
        if (previous && previous.savedAt > record.savedAt) {
          const error = new Error("A newer local backup already exists");
          error.status = 409;
          throw error;
        }
        await mkdir(directory, { recursive: true });
        // Atomic replacement keeps an interrupted write from truncating the save.
        await writeFile(`${path}.tmp`, `${JSON.stringify(record, null, 2)}\n`, "utf8");
        // Windows scanners can briefly lock a just-written file. Retry atomic
        // replacement without deleting the previous known-good backup.
        for (let attempt = 0; ; attempt++) {
          try { await rename(`${path}.tmp`, path); break; }
          catch (error) {
            if (attempt >= 4 || !["EPERM", "EACCES", "EBUSY"].includes(error.code)) throw error;
            await delay(25 * 2 ** attempt);
          }
        }
      });
      queue = work.catch(() => {});
      return work;
    },
  };
}

export function isLocalBackupRequest(headers) {
  try {
    const url = new URL(`http://${headers.host}`);
    return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      && (!headers.origin || headers.origin === url.origin)
      && headers["sec-fetch-site"] !== "cross-site";
  } catch { return false; }
}

export default function localCalculatorBackup() {
  return {
    name: "pikapp-local-calculator-backup",
    apply: "serve",
    configResolved(config) {
      // Register before Vite compiles its filesystem deny matcher.
      config.server.fs.deny.push("**/.local/**");
    },
    configureServer(server) {
      const file = createCalculatorBackupFile(server.config.root);
      // Never expose the private backup through Vite's static file server.
      server.watcher.unwatch(join(server.config.root, ".local", "**"));
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== CALCULATOR_BACKUP_URL) return next();
        const reply = (status, value) => {
          res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
          res.end(JSON.stringify(value));
        };
        if (!isLocalBackupRequest(req.headers)) return reply(403, { error: "Local same-origin requests only" });
        try {
          if (req.method === "GET") return reply(200, await file.read());
          if (req.method !== "POST") return reply(405, { error: "Use GET or POST" });
          if (req.headers["content-type"]?.split(";")[0] !== "application/json") {
            return reply(415, { error: "JSON required" });
          }
          let body = "";
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 8192) return reply(413, { error: "Backup too large" });
          }
          let record;
          try { record = JSON.parse(body); } catch { return reply(400, { error: "Invalid JSON" }); }
          if (!validCalculatorBackup(record)) return reply(400, { error: "Invalid calculator data" });
          // Store only the recognized fields, never arbitrary request metadata.
          await file.write({ version: 1, savedAt: record.savedAt, calculator: record.calculator });
          reply(200, { saved: true });
        } catch (error) {
          reply(error.status || 500, { error: error.status === 409 ? error.message : "Local backup unavailable" });
        }
      });
    },
  };
}
