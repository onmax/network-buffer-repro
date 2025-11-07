#!/bin/bash
set -e

echo "Patching @nimiq/core WASM files..."

# Copy patched WASM files to node_modules
cp -r public/nimiq-patch/web/* node_modules/@nimiq/core/web/

echo "✓ Patched WASM applied successfully"
