# Nimiq web client network buffer panic (repro)

Minimal Vite project demonstrating the `mpsc bounded channel requires buffer > 0` panic in `@nimiq/core@2.2.0` and verifying the fix.

## The Bug

When the web client from `@nimiq/core@2.2.0` starts without explicitly setting `network_buffer_size`, the worker panics:

```
2025-11-06T19:16:25.994000000Z ERROR panic | thread '<unnamed>' panicked at 'mpsc bounded channel requires buffer > 0': network-libp2p/src/network.rs:328
```

Root cause: `ClientConfiguration.build()` doesn't set `network_buffer_size`, defaulting to `0` in `network-libp2p`.

## Branches

- **`main`**: Uses `@nimiq/core@2.2.0` from npm → Shows the panic
- **`fix/wasm-patch`**: Uses patched WASM from core-rs → Panic fixed, client connects

## Testing the Bug (main branch)

```bash
git checkout main
pnpm install
pnpm dev
```

Open http://localhost:5173, click "Connect to Nimiq", check console → **panic occurs** ❌

## Testing the Fix (fix/wasm-patch branch)

```bash
git checkout fix/wasm-patch
pnpm install
pnpm dev
```

Open http://localhost:5173, click "Connect to Nimiq", check console → **no panic, client connects** ✓

## The Fix

Applied in `core-rs-albatross/web-client/src/client/lib.rs`:

```rust
config.network.network_buffer_size = NetworkSettings::default_network_buffer_size();
```

Ensures bounded channel buffer is 1024 (non-zero) instead of 0.
