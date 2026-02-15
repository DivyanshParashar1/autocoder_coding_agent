import path from "path";
import fs from "fs";

export function ensureWorkspaceRoot(root) {
  const resolved = path.resolve(root);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

export function resolveWorkspacePath(root, targetPath) {
  const base = path.resolve(root);
  const resolved = path.resolve(base, targetPath || ".");
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    throw new Error("Attempt to access outside workspace root");
  }
  return resolved;
}
