# Create Super Admin Script

This script creates a super admin user in the CarHub backend system.

## Prerequisites

1. Database migrations must be run first (the `super_admin` role is created in migration `000005_create_admin_roles_permissions.up.sql`)
2. Environment variables must be configured (`.env` file with database connection details)
3. Go dependencies must be installed: `go mod tidy`

## Installation

The script requires `golang.org/x/term` package. Install it with:

```bash
go get golang.org/x/term
```

Or run `go mod tidy` which will automatically add it.

## Usage

### Interactive Mode (Recommended)

Run the script without arguments and it will prompt you for all required fields:

```bash
make create-super-admin
```

Or directly:

```bash
go run infrastructure/scripts/create_super_admin.go
```

### Command Line Arguments Mode

You can also provide all arguments via command line flags:

```bash
make create-super-admin-args \
  email="admin@example.com" \
  password="SecurePassword123" \
  first_name="Admin" \
  last_name="User" \
  phone="+1234567890"
```

Or directly:

```bash
go run infrastructure/scripts/create_super_admin.go \
  -email="admin@example.com" \
  -password="SecurePassword123" \
  -first-name="Admin" \
  -last-name="User" \
  -phone="+1234567890"
```

### Available Flags

- `-email`: Admin email address (required)
- `-password`: Admin password (required, will prompt if not provided)
- `-first-name`: Admin first name (required)
- `-last-name`: Admin last name (required)
- `-phone`: Admin phone number (optional)

## What the Script Does

1. Validates that the admin email doesn't already exist
2. Finds the `super_admin` role (created by migration)
3. Hashes the password using bcrypt
4. Creates the admin user with:
   - Email verified: `true`
   - Is active: `true`
   - Password changed: `false`
5. Assigns the `super_admin` role to the admin user
6. All operations are performed in a database transaction for safety

## Security Notes

- Passwords are hashed using bcrypt before storage
- If password is not provided via flag, the script will prompt for it securely (hidden input)
- The script checks for existing admins to prevent duplicates
- All database operations are transactional

## Troubleshooting

### Error: "super_admin role not found"
- Make sure migrations have been run: `make migrate-up`

### Error: "Admin with email X already exists"
- The email is already registered. Use a different email or check existing admins.

### Error: "Failed to connect to database"
- Check your `.env` file has correct database connection strings (`WRITE_DB_URL` and `READ_DB_URL`)
