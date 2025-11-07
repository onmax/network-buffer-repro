# Nimiq web client network buffer panic (repro)

This minimal Vite project reproduces the panic we see when the web client from `@nimiq/core@2.2.0`
starts without explicitly setting `network_buffer_size` on the configuration object.

The worker tries to create a bounded channel with a zero-sized buffer which triggers the panic:

```
2025-11-06T19:16:25.994000000Z ERROR panic | thread '<unnamed>' panicked at 'mpsc bounded channel requires buffer > 0': network-libp2p/src/network.rs:328
```

## Steps

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the dev server

   ```bash
   pnpm dev
   ```

3. Open the printed localhost URL in the browser and click **Connect to Nimiq**.

4. Observe the panic in the browser console. The app will report the error in the log box as well.

This happens because the plain configuration produced by `ClientConfiguration.build()` does not set
`network_buffer_size`, so we end up with `0` in `network-libp2p` when the client is instantiated.
