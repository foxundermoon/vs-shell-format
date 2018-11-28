# shell-format
![version](https://vsmarketplacebadge.apphb.com/version-short/foxundermoon.shell-format.svg)
![install](https://vsmarketplacebadge.apphb.com/installs-short/foxundermoon.shell-format.svg)
![ratings](https://vsmarketplacebadge.apphb.com/rating-short/foxundermoon.shell-format.svg)


![screenshot](https://github.com/foxundermoon/vs-shell-format/raw/master/image/shell_format.gif)

this is a shell script format vscode extension base [shfmt](https://github.com/mvdan/sh)

please  install shfmt before install this extension

`go get -u mvdan.cc/sh/cmd/shfmt`

or download excutable binary  file 

from https://github.com/mvdan/sh/releases  
and config `shellformat.path` **do not require golang**

if macos also can use
`brew install shfmt`


## Features
shellscript code  format also support Dockerfile.

<kbd>shift</kbd>+<kbd>option</kbd>+<kbd>f</kbd> 

format current shell document

or

<kbd>shift</kbd>+<kbd>command</kbd>+<kbd>p</kbd> then type `Format Document`

## Requirements
- ~~golang~~
- [shfmt](https://github.com/mvdan/sh#shfmt)
- Packages are available for Arch, Homebrew, NixOS and Void.

 ### you can also direct download binary excutable file  from 
  [https://github.com/mvdan/sh/releases](https://github.com/mvdan/sh/releases)
 
## advanced configuration

- `shellformat.path`the shfmt fullpath  example [mac,linux]: `/usr/local/bin/shfmt`  [windows]: `C:\\bin\\shfmt.exe`
- `shellformat.flag`shfmt -h  to see detail usage , example: `-i 4 -p`
- `shellformat.showError` show error message when format. default true.




-----------------------------------------------------------------------------------------------------------

## Links

### [gitRepos](https://github.com/foxundermoon/vs-shell-format)
### [shfmt](https://github.com/mvdan/sh)


**Enjoy shellscript!**

# donate
Your donation makes `vscode shell-format extension`  better:

eth or tokens 
`0xea176214f46d894bc7b300c6f4ccfe6e67d1962e`
## PayPal

[![](https://github.com/foxundermoon/vs-shell-format/raw/master/image/donate-paypal.jpg)](https://www.paypal.me/foxmn)