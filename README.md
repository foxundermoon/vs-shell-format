<a class="github-button" href="https://github.com/foxundermoon/vs-shell-format" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star foxundermoon/vs-shell-format on GitHub">Star</a>

<a class="github-button" href="https://github.com/foxundermoon/vs-shell-format/issues" data-icon="octicon-issue-opened" data-size="large" data-show-count="true" aria-label="Issue foxundermoon/vs-shell-format on GitHub">Issue</a>

[Get it on the VS Code Marketplace!](https://marketplace.visualstudio.com/items?itemName=foxundermoon.shell-format)




# supported file types or languages


| language    | extension                 | describe              |
| ----------- | ------------------------- | --------------------- |
| shellscript | .sh .bash .zsh            | shell script files    |
| dockerfile  | Dockerfile                | docker files          |
| ignore      | .gitignore  .dockerignore | ignore files          |
| properties  | .properties               | java properties files |
| jvmoptions  | .vmoptions , jvm.options  | jvm options file       |
| hosts       | /etc/hosts                | hosts file            |

---

![version](https://vsmarketplacebadge.apphb.com/version-short/foxundermoon.shell-format.svg)

![donwloads](https://vsmarketplacebadge.apphb.com/downloads-short/foxundermoon.shell-format.svg)

![install](https://vsmarketplacebadge.apphb.com/installs-short/foxundermoon.shell-format.svg)

![ratings](https://vsmarketplacebadge.apphb.com/rating-short/foxundermoon.shell-format.svg)

---
## build status
[![Build Status](https://foxundermoon.visualstudio.com/vs-shell-format/_apis/build/status/vs-shell-format-CI?branchName=master)](https://foxundermoon.visualstudio.com/vs-shell-format/_build/latest?definitionId=1&branchName=master)


## release status
[![release Status](https://dev.azure.com/foxundermoon/vs-shell-format/_apis/build/status/vs-shell-format-deploy?branchName=master)](https://dev.azure.com/foxundermoon/vs-shell-format/_build/latest?definitionId=4&branchName=master)

---

![screenshot](https://github.com/foxundermoon/vs-shell-format/raw/master/image/shell_format.gif)

## usage


<kbd>shift</kbd>+<kbd>option</kbd>+<kbd>f</kbd>

<kbd>shift</kbd>+<kbd>command</kbd>+<kbd>p</kbd> then type `Format Document`

###  special for Windows
download excutable binary file
from https://github.com/mvdan/sh/releases
and config `shellformat.path`

## dependencies

- [shfmt](https://github.com/mvdan/sh#shfmt)

## custom configuration

- `shellformat.path`the shfmt fullpath example [mac,linux]: `/usr/local/bin/shfmt` [windows]: `C:\\bin\\shfmt.exe`
- `shellformat.flag`shfmt -h to see detailed usage , example: `-i 4 -p`
- `shellformat.showError` show error message when format. default true.

---

## Links

### [self source code](https://github.com/foxundermoon/vs-shell-format)

### [shfmt](https://github.com/mvdan/sh)

**Enjoy shellscript!**
