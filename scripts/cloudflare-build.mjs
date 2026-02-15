import { spawnSync } from "node:child_process"

const isNestedVercelBuild = process.env.VERCEL === "1"

const command = isNestedVercelBuild
  ? ["next", ["build"]]
  : ["pnpm", ["dlx", "@cloudflare/next-on-pages@1"]]

const [cmd, args] = command
const result = spawnSync(cmd, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 1)
