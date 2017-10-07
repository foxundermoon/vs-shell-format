# shell-format
![version](https://vsmarketplacebadge.apphb.com/version-short/foxundermoon.shell-format.svg)
![install](https://vsmarketplacebadge.apphb.com/installs-short/foxundermoon.shell-format.svg)
![ratings](https://vsmarketplacebadge.apphb.com/rating-short/foxundermoon.shell-format.svg)


![screenshot](https://github.com/foxundermoon/vs-shell-format/raw/master/image/shell_format.gif)

this is a shell script format vscode extension base [shfmt](https://github.com/mvdan/sh)

please  install shfmt before install this extension

`go get -u github.com/mvdan/sh/cmd/shfmt` 

or download excutable binary  file 

from https://github.com/mvdan/sh/releases  
and config `shellformat.path` **do not require golang**
## Features
shellscript code  format

<kbd>shift</kbd>+<kbd>option</kbd>+<kbd>f</kbd> 

format current shell document

or

<kbd>shift</kbd>+<kbd>command</kbd>+<kbd>p</kbd> then type `format shell with shfmt`

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

## Release Notes
## [1.1.0] - 2017-10-07
- add setting  config  `"shellformat.showError":true`
- help you location  error, you can set false to off the error tips.
- change format by child_process spawn . better performance when large file.
- add donate link . thank for your donate.
## [1.0.0] - 2017-04-06
- add command flag configuration
### [0.1.2] - 2017-01-07
- add icon & gif

### [0.1.1] - 2017-01-06
- fix document

### [0.1.0] - 2017-01-06
- change format base on TextDocument

### [0.0.1] - 2017-01-05
- add shell format base on file 





-----------------------------------------------------------------------------------------------------------

## Links

### [gitRepos](https://github.com/foxundermoon/vs-shell-format)
### [shfmt](https://github.com/mvdan/sh)


**Enjoy shellscript!**

# donate
Your donation makes `shell-format` better:

## PayPal

[![](https://github.com/foxundermoon/vs-shell-format/raw/master/image/donate-paypal.jpg)](https://www.paypal.me/foxmn)



###    Alipay(支付宝) / Wechat(微信)

[![ Alipay(支付宝) / Wechat(微信)](https://github.com/foxundermoon/vs-shell-format/raw/master/image/donate.jpg)](https://github.com/foxundermoon/vs-shell-format/raw/master/image/donate.jpg)