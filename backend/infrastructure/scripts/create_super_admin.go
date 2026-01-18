package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
	"syscall"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"

	"github.com/jafoor/carhub/libs/config"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/logger"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/services/admin/repository"
	"gorm.io/gorm"
)

func main() {
	var (
		email     = flag.String("email", "", "Admin email address")
		password  = flag.String("password", "", "Admin password (will prompt if not provided)")
		firstName = flag.String("first-name", "", "Admin first name")
		lastName  = flag.String("last-name", "", "Admin last name")
		phone     = flag.String("phone", "", "Admin phone number (optional)")
	)
	flag.Parse()

	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.Connect(database.DBConfig{
		WriteDSN: config.App.WriteDBUrl,
		ReadDSN:  config.App.ReadDBUrl,
	})

	// Get required fields
	if *email == "" {
		fmt.Print("Enter email: ")
		fmt.Scanln(email)
		if *email == "" {
			logger.Error().Msg("Email is required")
			os.Exit(1)
		}
	}

	if *password == "" {
		fmt.Print("Enter password: ")
		bytePassword, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			logger.Error().Err(err).Msg("Failed to read password")
			os.Exit(1)
		}
		*password = string(bytePassword)
		fmt.Println() // New line after password input
		if *password == "" {
			logger.Error().Msg("Password is required")
			os.Exit(1)
		}
	}

	if *firstName == "" {
		fmt.Print("Enter first name: ")
		fmt.Scanln(firstName)
		if *firstName == "" {
			logger.Error().Msg("First name is required")
			os.Exit(1)
		}
	}

	if *lastName == "" {
		fmt.Print("Enter last name: ")
		fmt.Scanln(lastName)
		if *lastName == "" {
			logger.Error().Msg("Last name is required")
			os.Exit(1)
		}
	}

	// Normalize email
	emailLower := strings.ToLower(strings.TrimSpace(*email))

	// Create repositories
	adminRepo := repository.NewAdminRepository()
	roleRepo := repository.NewAdminRoleRepository()

	// Check if admin already exists
	existingAdmin, err := adminRepo.FindByEmail(emailLower)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to check existing admin")
		os.Exit(1)
	}
	if existingAdmin != nil {
		logger.Error().Msgf("Admin with email %s already exists", emailLower)
		os.Exit(1)
	}

	// Find super_admin role
	superAdminRole, err := roleRepo.FindByName("super_admin")
	if err != nil {
		logger.Error().Err(err).Msg("Failed to find super_admin role")
		os.Exit(1)
	}
	if superAdminRole == nil {
		logger.Error().Msg("super_admin role not found. Please run migrations first.")
		os.Exit(1)
	}

	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to hash password")
		os.Exit(1)
	}

	// Create admin
	admin := &models.Admin{
		FirstName:     strings.TrimSpace(*firstName),
		LastName:       strings.TrimSpace(*lastName),
		Email:          emailLower,
		Phone:          getPhonePtr(*phone),
		PasswordHash:   string(passwordHash),
		EmailVerified:  true,
		IsActive:       true,
		PasswordChanged: false,
	}

	// Execute in transaction
	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// Create admin
		if err := adminRepo.Create(tx, admin); err != nil {
			return fmt.Errorf("failed to create admin: %w", err)
		}

		// Assign super_admin role
		type AdminUserRole struct {
			AdminID uint `gorm:"primaryKey"`
			RoleID  uint `gorm:"primaryKey"`
		}
		adminUserRole := AdminUserRole{
			AdminID: admin.ID,
			RoleID:  superAdminRole.ID,
		}
		if err := tx.Table("admin_user_roles").Create(&adminUserRole).Error; err != nil {
			return fmt.Errorf("failed to assign super_admin role: %w", err)
		}

		return nil
	})

	if err != nil {
		logger.Error().Err(err).Msg("Failed to create super admin")
		os.Exit(1)
	}

	logger.Info().
		Str("email", admin.Email).
		Str("name", fmt.Sprintf("%s %s", admin.FirstName, admin.LastName)).
		Uint("admin_id", admin.ID).
		Msg("✅ Super admin created successfully!")
}

func getPhonePtr(phone string) *string {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return nil
	}
	return &phone
}
