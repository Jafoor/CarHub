// libs/database/transaction.go
package database

import (
	"gorm.io/gorm"
)

// TxOperation represents a function that runs inside a DB transaction
type TxOperation func(tx *gorm.DB) error

// ExecuteTransaction runs the given operation in a transaction
func ExecuteTransaction(op TxOperation) error {
	return WriteDB.Transaction(func(tx *gorm.DB) error {
		return op(tx)
	})
}