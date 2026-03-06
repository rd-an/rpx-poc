//go:build windows
// +build windows

package main

import "golang.org/x/sys/windows/registry"

// windowsSocketFallback returns a best-effort socket count on Windows
func windowsSocketFallback() int {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, `HARDWARE\DESCRIPTION\System\CentralProcessor`, registry.READ)
	if err != nil {
		return 0
	}
	defer k.Close()
	names, err := k.ReadSubKeyNames(-1)
	if err != nil || len(names) == 0 {
		return 0
	}
	return len(names)
}
