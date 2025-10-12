package logger

import (
	"os"

	"github.com/rs/zerolog"
)

var Log zerolog.Logger = zerolog.New(os.Stdout).With().Timestamp().Logger()

func Debug() *zerolog.Event {
	return Log.Debug()
}

func Info() *zerolog.Event {
	return Log.Info()
}

func Warn() *zerolog.Event {
	return Log.Warn()
}

func Error() *zerolog.Event {
	return Log.Error()
}
