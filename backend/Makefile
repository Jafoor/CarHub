# ================================
# 🚗 CarHub Backend Makefile
# ================================

# --- Configuration ---
APP_NAME=carhub
MAIN_FILE=main.go

DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=carhub
DB_HOST=localhost
DB_PORT=5432
DB_SSL=disable

MIGRATIONS_DIR=./migrations
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSL}

# --- Colors for logging ---
YELLOW=\033[1;33m
GREEN=\033[1;32m
RED=\033[1;31m
NC=\033[0m

# ================================
# 🧱 Build and Run
# ================================

build:
	@echo "$(YELLOW)🚀 Building $(APP_NAME)...$(NC)"
	@go build -o bin/$(APP_NAME) $(MAIN_FILE)
	@echo "$(GREEN)✅ Build complete.$(NC)"

run:
	@echo "$(YELLOW)🏃 Running $(APP_NAME)...$(NC)"
	@go run $(MAIN_FILE)

dev:
	@echo "$(YELLOW)🔥 Starting development server with Air...$(NC)"
	@air

clean:
	@echo "$(YELLOW)🧹 Cleaning...$(NC)"
	@rm -rf bin
	@echo "$(GREEN)✅ Cleaned.$(NC)"

# ================================
# 🗄️ Database Migrations
# ================================

migrate-up:
	@echo "$(YELLOW)📦 Running database migrations...$(NC)"
	@migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" up
	@echo "$(GREEN)✅ Migrations applied.$(NC)"

migrate-down:
	@echo "$(YELLOW)⏪ Rolling back last migration...$(NC)"
	@migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" down 1
	@echo "$(GREEN)✅ Rolled back.$(NC)"

migrate-force:
	@echo "$(YELLOW)⚙️  Forcing migration version (use with care)...$(NC)"
	@migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" force $(version)

migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "$(RED)❌ Please specify migration name, e.g. make migrate-create name=create_users_table$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)🧩 Creating migration: $(name)...$(NC)"
	@migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(name)
	@echo "$(GREEN)✅ Migration created.$(NC)"

# ================================
# 🧪 Testing
# ================================

test:
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	@go test ./... -v
	@echo "$(GREEN)✅ All tests passed.$(NC)"

# ================================
# 🐳 Docker Helpers (optional)
# ================================

docker-up:
	@echo "$(YELLOW)🐳 Starting PostgreSQL container...$(NC)"
	@docker compose up -d db

docker-down:
	@echo "$(YELLOW)🛑 Stopping PostgreSQL container...$(NC)"
	@docker compose down

# ================================
# 💡 Utility
# ================================

help:
	@echo "Available commands:"
	@echo "  make build              - Build the app"
	@echo "  make run                - Run the app"
	@echo "  make clean              - Clean build artifacts"
	@echo "  make migrate-up         - Apply all migrations"
	@echo "  make migrate-down       - Rollback last migration"
	@echo "  make migrate-create name=<migration_name> - Create new migration"
	@echo "  make test               - Run tests"
	@echo "  make docker-up          - Start PostgreSQL in Docker"
	@echo "  make docker-down        - Stop PostgreSQL container"
