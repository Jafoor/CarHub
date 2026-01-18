#!/bin/bash

# Create Super Admin Script Wrapper
# This is a convenience wrapper for the Go script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Creating super admin..."
go run infrastructure/scripts/create_super_admin.go "$@"
