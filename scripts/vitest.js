import { realpathSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Starts Vitest from the real path of the working directory. A Windows
// terminal can start in `e:\` instead of `E:\` (VS Code and Git Bash do), and
// Vitest then loads itself under both spellings: every test file fails with
// "failed to find the current suite". The real path carries the drive letter
// as Windows stores it. Elsewhere it changes nothing. The arguments pass
// through, so `node scripts/vitest.js run --coverage` works like `vitest`.
const root = realpathSync.native(process.cwd())
process.chdir(root)

await import(pathToFileURL(join(root, 'node_modules/vitest/vitest.mjs')).href)
