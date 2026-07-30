package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"strconv"
	"strings"
	"sync/atomic"
	"syscall"
	"time"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("missing application command")
	}

	publicPort := envOrDefault("PORT", "80")
	applicationPort := envOrDefault("APPLICATION_PORT", "8081")
	startupTimeout := durationFromEnv("STARTUP_TIMEOUT_SECONDS", 120*time.Second)

	command := exec.Command(os.Args[1], os.Args[2:]...)
	command.Env = childEnvironment(applicationPort)
	command.Stdout = os.Stdout
	command.Stderr = os.Stderr

	if err := command.Start(); err != nil {
		log.Fatalf("could not start application: %v", err)
	}

	var applicationExited atomic.Bool
	target, _ := url.Parse("http://127.0.0.1:" + applicationPort)
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ErrorHandler = func(writer http.ResponseWriter, _ *http.Request, err error) {
		log.Printf("proxy error: %v", err)
		http.Error(writer, "backend temporarily unavailable", http.StatusBadGateway)
	}

	handler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if !waitForApplication(request.Context(), applicationPort, startupTimeout, &applicationExited) {
			http.Error(writer, "backend startup did not complete", http.StatusServiceUnavailable)
			return
		}
		proxy.ServeHTTP(writer, request)
	})

	server := &http.Server{
		Addr:              ":" + publicPort,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	childDone := make(chan int, 1)
	go func() {
		err := command.Wait()
		applicationExited.Store(true)
		exitCode := 0
		if err != nil {
			var exitError *exec.ExitError
			if errors.As(err, &exitError) {
				exitCode = exitError.ExitCode()
			} else {
				exitCode = 1
			}
			log.Printf("application exited: %v", err)
		}
		childDone <- exitCode
		_ = server.Shutdown(context.Background())
	}()

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-signals
		shutdownContext, cancel := context.WithTimeout(context.Background(), 25*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownContext)
		if command.Process != nil {
			_ = command.Process.Signal(syscall.SIGTERM)
		}
	}()

	log.Printf("startup proxy listening on port %s; application port is %s", publicPort, applicationPort)
	err := server.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Printf("startup proxy failed: %v", err)
		if command.Process != nil {
			_ = command.Process.Kill()
		}
	}

	select {
	case exitCode := <-childDone:
		os.Exit(exitCode)
	default:
		if command.Process != nil {
			_ = command.Process.Signal(syscall.SIGTERM)
		}
		os.Exit(0)
	}
}

func waitForApplication(
	ctx context.Context,
	port string,
	timeout time.Duration,
	applicationExited *atomic.Bool,
) bool {
	deadline := time.Now().Add(timeout)
	address := net.JoinHostPort("127.0.0.1", port)

	for time.Now().Before(deadline) {
		if applicationExited.Load() {
			return false
		}

		connection, err := net.DialTimeout("tcp", address, 300*time.Millisecond)
		if err == nil {
			_ = connection.Close()
			return true
		}

		select {
		case <-ctx.Done():
			return false
		case <-time.After(250 * time.Millisecond):
		}
	}

	return false
}

func childEnvironment(applicationPort string) []string {
	environment := make([]string, 0, len(os.Environ())+2)
	for _, variable := range os.Environ() {
		if strings.HasPrefix(variable, "PORT=") || strings.HasPrefix(variable, "SERVER_PORT=") {
			continue
		}
		environment = append(environment, variable)
	}

	return append(environment, "PORT="+applicationPort, "SERVER_PORT="+applicationPort)
}

func durationFromEnv(name string, fallback time.Duration) time.Duration {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}

	seconds, err := strconv.Atoi(value)
	if err != nil || seconds <= 0 {
		log.Printf("invalid %s=%q; using %s", name, value, fallback)
		return fallback
	}

	return time.Duration(seconds) * time.Second
}

func envOrDefault(name string, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.LUTC)
	log.SetPrefix(fmt.Sprintf("vercel-launcher[%d] ", os.Getpid()))
}
