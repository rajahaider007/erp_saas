This repository uses Composer (PHP) and npm (Node) for dependencies.

Scripts added:

- `install-dependencies.sh` — Linux/macOS installer that runs `composer install`, installs Node packages and builds assets.
- `install-dependencies.ps1` — PowerShell installer for Windows.

Usage:

Linux/macOS

```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

Windows (PowerShell, run as Administrator if required)

```powershell
.\\install-dependencies.ps1
```

Notes:
- Both scripts expect `composer` and `npm` to be installed and available on PATH.
- `npm run build` is executed only if present (uses `--if-present`).
- For CI, prefer `npm ci` when `package-lock.json` exists.
