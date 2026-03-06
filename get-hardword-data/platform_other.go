//go:build !windows
// +build !windows

package main

// non-windows stub returns 0 so main.go can decide fallback
func windowsSocketFallback() int { return 0 }
