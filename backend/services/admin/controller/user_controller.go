package controller

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/database"
	"github.com/jafoor/carhub/libs/models"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/admin/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminUserController struct {
	repo     repository.AdminRepository
	roleRepo repository.AdminRoleRepository
}

func NewAdminUserController() *AdminUserController {
	return &AdminUserController{
		repo:     repository.NewAdminRepository(),
		roleRepo: repository.NewAdminRoleRepository(),
	}
}

type CreateAdminInput struct {
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	Email     string  `json:"email"`
	Phone     *string `json:"phone,omitempty"`
	Password  string  `json:"password"`
	RoleIDs   []uint  `json:"role_ids"`
}

type UpdateAdminUserInput struct {
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	Phone     *string `json:"phone"`
	IsActive  *bool   `json:"is_active"`
	RoleIDs   []uint  `json:"role_ids"`
}

// CreateAdminUser creates a new admin user
func (c *AdminUserController) CreateAdminUser(ctx *fiber.Ctx) error {
	var input CreateAdminInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err)
	}

	if input.FirstName == "" || input.LastName == "" || input.Email == "" || input.Password == "" || len(input.RoleIDs) == 0 {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Missing required fields", nil)
	}
	
	if len(input.Password) < 6 {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Password must be at least 6 characters", nil)
	}

	// Check if email already exists
	existing, err := c.repo.FindByEmailUnscoped(input.Email)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Database error", err)
	}
	if existing != nil {
		return utils.ErrorResponse(ctx, http.StatusConflict, "Email already exists", nil)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to hash password", err)
	}

	admin := &models.Admin{
		FirstName:       input.FirstName,
		LastName:        input.LastName,
		Email:           input.Email,
		Phone:           input.Phone,
		PasswordHash:    string(hashedPassword),
		PasswordChanged: false, // Initial password
		IsActive:        true,
	}

	// Use transaction to create admin and assign role
	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// Create Admin
		if err := c.repo.Create(tx, admin); err != nil {
			return err
		}

		// Assign Roles
		for _, roleID := range input.RoleIDs {
			// Verify role exists
			role, err := c.roleRepo.FindByID(roleID)
			if err != nil || role == nil {
				return fiber.NewError(http.StatusBadRequest, "Invalid Role ID: "+strconv.Itoa(int(roleID)))
			}

			if err := c.repo.AssignRoleToAdmin(tx, admin.ID, roleID); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create admin user", err)
	}

	return utils.SuccessResponse(ctx, "Admin user created successfully", admin)
}

// ListAdminUsers retrieves admins with pagination, filtering, and search
func (c *AdminUserController) ListAdminUsers(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")
	email := ctx.Query("email", "")
	phone := ctx.Query("phone", "")
	isActive := ctx.Query("is_active")
	roleID := ctx.Query("role_id")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	filters := make(map[string]interface{})
	if email != "" {
		filters["email"] = email
	}
	if phone != "" {
		filters["phone"] = phone
	}
	if isActive != "" {
		active, err := strconv.ParseBool(isActive)
		if err == nil {
			filters["is_active"] = active
		}
	}
	if roleID != "" {
		id, err := strconv.Atoi(roleID)
		if err == nil {
			filters["role_id"] = uint(id)
		}
	}

	admins, total, err := c.repo.List(offset, limit, filters, search)
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to fetch admins", err)
	}

	return utils.SuccessResponse(ctx, "Admins retrieved successfully", fiber.Map{
		"data":  admins,
		"meta": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// UpdateAdminUser updates admin details (excluding email/password)
func (c *AdminUserController) UpdateAdminUser(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	var input UpdateAdminUserInput
	if err := ctx.BodyParser(&input); err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid input", err)
	}

	// Transaction not strictly needed for single update, but good for consistency if we add more
	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		admin, err := c.repo.FindByID(uint(id))
		if err != nil {
			return err
		}
		if admin == nil {
			return fiber.NewError(http.StatusNotFound, "Admin not found")
		}

		if input.FirstName != "" {
			admin.FirstName = input.FirstName
		}
		if input.LastName != "" {
			admin.LastName = input.LastName
		}
		if input.Phone != nil {
			admin.Phone = input.Phone
		}
		if input.IsActive != nil {
			admin.IsActive = *input.IsActive
		}

		if len(input.RoleIDs) > 0 {
			// Clear existing roles
			if err := c.repo.ClearAdminRoles(tx, admin.ID); err != nil {
				return err
			}
			// Assign new roles
			for _, roleID := range input.RoleIDs {
				role, err := c.roleRepo.FindByID(roleID)
				if err != nil || role == nil {
					return fiber.NewError(http.StatusBadRequest, "Invalid Role ID: "+strconv.Itoa(int(roleID)))
				}
				if err := c.repo.AssignRoleToAdmin(tx, admin.ID, roleID); err != nil {
					return err
				}
			}
		}

		return c.repo.Update(tx, admin)
	})

	if err != nil {
		if err.Error() == "Admin not found" {
			return utils.ErrorResponse(ctx, http.StatusNotFound, "Admin not found", nil)
		}
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update admin", err)
	}

	return utils.SuccessResponse(ctx, "Admin updated successfully", nil)
}

// DeleteAdminUser soft deletes an admin
func (c *AdminUserController) DeleteAdminUser(ctx *fiber.Ctx) error {
	id, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid ID", nil)
	}

	err = database.ExecuteTransaction(func(tx *gorm.DB) error {
		// Check existence
		admin, err := c.repo.FindByID(uint(id))
		if err != nil {
			return err
		}
		if admin == nil {
			return fiber.NewError(http.StatusNotFound, "Admin not found")
		}

		return c.repo.Delete(tx, uint(id))
	})

	if err != nil {
		if err.Error() == "Admin not found" {
			return utils.ErrorResponse(ctx, http.StatusNotFound, "Admin not found", nil)
		}
		return utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete admin", err)
	}

	return utils.SuccessResponse(ctx, "Admin deleted successfully", nil)
}
