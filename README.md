# PatternV (Fork)

Fork of [DaniGP17/PatternV](https://github.com/DaniGP17/PatternV) — all credits go to [danielgp](https://github.com/DaniGP17).

A tool to search byte patterns (IDA-style signatures) across GTA V game build dumps. This fork is **Linux-only** and includes a web interface for online scanning.


## Changes from upstream

- Linux-only (no Windows support)
- Web interface (Next.js) with shared scan history

## Usage (Web)

**You need to provide your own GTA V build dumps.** Place the `.exe` dump files in the `builds/` directory before starting the container. Without them, scanning will have nothing to search.

```bash
docker compose up -d --build
```

The web UI is available on port 3000. Configure a reverse proxy (nginx) to expose it.

## Build

```bash
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
```

Requires C++20 and a Linux environment (GCC 13+).
