import { execSync } from "node:child_process";
import net from "node:net";

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true)); // Port is still in use
    server.once("listening", () => {
      server.close(() => resolve(false)); // Port is free
    });
    server.listen(port);
  });
}

export function killProcessOnPort(port: number) {
  try {
    if (process.platform === "win32") {
      // Use a more robust approach that won't fail
      try {
        const checkCmd = `netstat -ano | findstr :${port}`;
        const output = execSync(checkCmd, { encoding: 'utf8', stdio: 'pipe' });
        if (output.trim()) {
          execSync(
            `FOR /F "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`,
            { stdio: 'pipe' }
          );
        }
      } catch {
        // Port is free, no processes to kill
      }
    } else {
      try {
        const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' });
        if (output.trim()) {
          execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'pipe' });
        }
      } catch {
        // Port is free, no processes to kill
      }
    }
  } catch (error) {
    // Completely silent - port is free
  }
}
