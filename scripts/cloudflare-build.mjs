import { spawnSync } from "node:child_process"

const ADAPTER_NESTED_FLAG = "CF_PAGES_NEXT_ON_PAGES_INTERNAL"

const isNestedAdapterBuild =
  process.env[ADAPTER_NESTED_FLAG] === "1" || process.env.VERCEL === "1"

const [cmd, args] = isNestedAdapterBuild
  ? ["next", ["build"]]
  : ["pnpm", ["dlx", "@cloudflare/next-on-pages@1"]]

const result = spawnSync(cmd, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: isNestedAdapterBuild
    ? process.env
    : {
        ...process.env,
        [ADAPTER_NESTED_FLAG]: "1",
      },
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 1)
