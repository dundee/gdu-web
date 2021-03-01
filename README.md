# go DiskUsage(withWeb=true)

Experimental fork of [gdu](https://github.com/dundee/gdu) with web interface.


## Installation

    go get -u github.com/dundee/gdu-web


## Usage

```
  gdu [directory_to_scan] [flags]
  gdu [command]

Available Commands:
  disks       Show all mounted disks
  help        Help about any command
  interactive Run in interactive mode
  version     Print the version number of gdu
  web         Run in web mode

Flags:
  -h, --help                  help for gdu
  -i, --ignore-dirs strings   Absolute paths to ignore (separated by comma) (default [/proc,/dev,/sys,/run])
  -l, --log-file string       Path to a logfile (default "/dev/null")
  -c, --no-color              Do not use colorized output
  -x, --no-cross              Do not cross filesystem boundaries
  -p, --no-progress           Do not show progress in non-interactive mode
  -a, --show-apparent-size    Show apparent size
```
