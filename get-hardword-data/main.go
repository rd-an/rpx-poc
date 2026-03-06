package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"runtime/debug"
	"strings"
)

// Note: we use a best-effort approach. On Linux gopsutil exposes PhysicalID.
// On Windows we fallback to reading registry for processor count per socket.

func main() {
	out := make(map[string]interface{})

	// kernel version
	out["kernel_version"] = getKernelVersion()

	// gather CPU info (logical, physical, sockets)
	logical := runtime.NumCPU()
	physCores, sockets := gatherCPUInfo()
	out["logical_cpus"] = logical
	out["physical_cores"] = physCores

	// Windows platform-specific socket fallback handled in gatherCPUInfo / platform file

	// if still 0, try estimation: sockets = max(1, physCores / typical_cores_per_socket)
	if sockets == 0 {
		if physCores > 0 {
			// assume at least 1 socket; can't reliably deduce cores-per-socket, so set 1
			sockets = 1
		} else {
			sockets = 1
		}
	}
	out["sockets"] = sockets

	// hyperthreading detection: logical > physical cores
	ht := false
	if physCores > 0 && logical > physCores {
		ht = true
	}
	out["hyperthreading"] = ht

	// include runtime info
	out["goos"] = runtime.GOOS
	if info, ok := debug.ReadBuildInfo(); ok && info.Main.Path != "" {
		out["module"] = info.Main.Path
	}

	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	_ = enc.Encode(out)
}

func getKernelVersion() string {
	if runtime.GOOS == "windows" {
		// try PowerShell to get a friendly OS name, build number and UBR (Update Build Revision)
		psCmd := `$os=Get-CimInstance Win32_OperatingSystem; $cv=Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion'; $ubr=$cv.UBR; if($ubr){$ubrs='.'+$ubr}else{$ubrs=''}; $os.Caption + " (Build " + $os.BuildNumber + $ubrs + "), Version " + $os.Version + $ubrs`
		out, err := exec.Command("powershell", "-NoProfile", "-Command", psCmd).Output()
		if err == nil {
			s := strings.TrimSpace(string(out))
			if s != "" {
				return s
			}
		}
		// fallback to ver
		out, err = exec.Command("cmd", "/C", "ver").Output()
		if err == nil {
			return strings.TrimSpace(string(out))
		}
		return "Windows (unknown version)"
	}
	// assume unix-like
	// try distribution friendly name from /etc/os-release
	pretty := ""
	if data, err := os.ReadFile("/etc/os-release"); err == nil {
		for _, line := range strings.Split(string(data), "\n") {
			if strings.HasPrefix(line, "PRETTY_NAME=") {
				v := strings.TrimPrefix(line, "PRETTY_NAME=")
				pretty = strings.Trim(v, `" `)
				break
			}
		}
	}
	// fallback to lsb_release
	if pretty == "" {
		if out, err := exec.Command("lsb_release", "-ds").Output(); err == nil {
			pretty = strings.Trim(strings.TrimSpace(string(out)), `"`)
		}
	}
	// kernel
	kernel := ""
	if out, err := exec.Command("uname", "-r").Output(); err == nil {
		kernel = strings.TrimSpace(string(out))
	}
	if pretty != "" && kernel != "" {
		return fmt.Sprintf("%s, kernel %s", pretty, kernel)
	}
	if kernel != "" {
		return fmt.Sprintf("kernel %s", kernel)
	}
	if pretty != "" {
		return pretty
	}
	// fallback read /proc/version
	f, err := os.Open("/proc/version")
	if err == nil {
		defer f.Close()
		s := bufio.NewScanner(f)
		if s.Scan() {
			return s.Text()
		}
	}
	return "unknown"
}

// gatherCPUInfo returns (physicalCores, sockets)
func gatherCPUInfo() (int, int) {
	if runtime.GOOS == "windows" {
		// try wmic
		out, err := exec.Command("wmic", "cpu", "get", "NumberOfCores,NumberOfLogicalProcessors,SocketDesignation", "/format:csv").Output()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(out)), "\n")
			phys := 0
			sockets := 0
			for _, ln := range lines {
				ln = strings.TrimSpace(ln)
				if ln == "" || strings.HasPrefix(ln, "Node") || strings.HasPrefix(ln, "Node,") {
					continue
				}
				parts := strings.Split(ln, ",")
				// expected: Node,NumberOfCores,NumberOfLogicalProcessors,SocketDesignation
				if len(parts) >= 4 {
					// parts[1]=NumberOfCores
					if parts[1] != "" {
						// parse int
						var n int
						fmtS := strings.TrimSpace(parts[1])
						_, err := fmt.Sscan(fmtS, &n)
						if err == nil {
							phys += n
						}
					}
					// socket designation at parts[3]
					if parts[3] != "" {
						sockets++
					}
				}
			}
			if phys == 0 {
				phys = runtime.NumCPU()
			}
			if sockets == 0 {
				sockets = windowsSocketFallback()
				if sockets == 0 {
					sockets = 1
				}
			}
			return phys, sockets
		}
		// fallback: use registry-based socket count and estimate phys cores
		sockets := windowsSocketFallback()
		if sockets == 0 {
			sockets = 1
		}
		phys := runtime.NumCPU()
		if phys > 1 {
			phys = phys / 2 // rough estimate
		}
		if phys < 1 {
			phys = 1
		}
		return phys, sockets
	}

	// linux/unix: parse /proc/cpuinfo
	data, err := os.ReadFile("/proc/cpuinfo")
	if err != nil {
		// fallback
		return runtime.NumCPU(), 1
	}
	text := string(data)
	lines := strings.Split(text, "\n")
	physicalIDs := map[string]struct{}{}
	corePairs := map[string]struct{}{}
	currPhys := ""
	currCore := ""
	for _, l := range lines {
		l = strings.TrimSpace(l)
		if l == "" {
			if currPhys == "" {
				currPhys = "0"
			}
			if currCore == "" {
				currCore = "0"
			}
			physicalIDs[currPhys] = struct{}{}
			corePairs[currPhys+"_"+currCore] = struct{}{}
			currPhys = ""
			currCore = ""
			continue
		}
		if !strings.Contains(l, ":") {
			continue
		}
		parts := strings.SplitN(l, ":", 2)
		k := strings.TrimSpace(parts[0])
		v := strings.TrimSpace(parts[1])
		switch k {
		case "physical id":
			currPhys = v
		case "core id":
			currCore = v
		}
	}
	phys := len(corePairs)
	sockets := len(physicalIDs)
	if phys == 0 {
		phys = runtime.NumCPU()
	}
	if sockets == 0 {
		sockets = 1
	}
	return phys, sockets
}
