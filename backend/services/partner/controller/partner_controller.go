// services/partner/controller/partner_controller.go
package controller

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/jafoor/carhub/libs/utils"
	"github.com/jafoor/carhub/services/partner/service"
)

type PartnerController struct {
	service service.PartnerService
}

func NewPartnerController(s service.PartnerService) *PartnerController {
	return &PartnerController{service: s}
}

func (pc *PartnerController) Signup(c *fiber.Ctx) error {
	var input service.SignupInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "invalid request", nil)
	}

	resp, err := pc.service.Signup(input)
	if err != nil {
		switch err.Error() {
		case "email_already_registered":
			return utils.ErrorResponse(c, http.StatusConflict, "Email already registered.", nil)
		case "signup_failed", "database_error", "password_hash_failed":
			return utils.ErrorResponse(c, http.StatusInternalServerError, "Something went wrong.", nil)
		default:
			return utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		}
	}

	return utils.SuccessResponse(c, "OTP sent to your email. Please verify.", resp)
}