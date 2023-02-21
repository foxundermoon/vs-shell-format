# Change Log

Check [Keep a Changelog](https://keepachangelog.com/) for recommendations on how to structure this file.

## 7.2.5

- fix rating badge

## 7.2.4

- fix badge

## 7.2.3

- bump shfmt to 3.6.0

## 7.2.2

- Fix: substitule "${workspaceFolder}" in need install check #243

## 7.2.1

- publish by github action

## 7.2.0

- bats files support

## 7.1.1

- bump shfmt to 3.3.1

## 7.1.0

- bump shfmt to 3.2.4
- support apple m1 chip #136
- support editor config

## 7.0.1

- bump shfmt to 3.0.1 #65

## 7.0.0

- bump shfmt to 3.0.0
- add prettier and husky to project

## 6.1.3

- fix Strange file permissions for binary file [#50](https://github.com/foxundermoon/vs-shell-format/issues/50)

## 6.1.2

- fix check install bug [#46](https://github.com/foxundermoon/vs-shell-format/issues/46)

## 6.1.1

- add effect language

## 6.1.0

- Reduce output information influx [#43](https://github.com/foxundermoon/vs-shell-format/pull/43)
- azure cli support

## 6.0.1

- fix issue[#40](https://github.com/foxundermoon/vs-shell-format/issues/40) Cursor focus is stolen by update

## 6.0.0

- Let the plugin work out of the box and automatically download the shfmt of the corresponding platform.
- No longer get shfmt from PATH

## 5.0.1

- support both `-i` flag and `editor.tabSize` setting

## 5.0.0

- display format error on problems panel [#37](https://github.com/foxundermoon/vs-shell-format/issues/37)
- remove showError configuration

## 4.0.11

- resolve 1 vulnerability https://www.npmjs.com/advisories/803

## 4.0.10

- remove time on change log, record by github release

## [4.0.9] 2019-04-30

- add license [#35](https://github.com/foxundermoon/vs-shell-format/issues/35)
- shot changelog

## [4.0.8] 2019-04-30

- add github auto release

## [4.0.7] 2019-04-30

- add azure pipelines for auto deploy

## [4.0.6] 2019-04-30

- temporary disable linux auto download shfmt for ubuntu

## [4.0.5] 2019-04-09

- fix always auto downoad

## [4.0.4] 2019-01-17

- add format options supported [#24](!https://github.com/foxundermoon/vs-shell-format/pull/24)

## [4.0.3] 2019-01-17

- new gif
- add supported files for test

## [4.0.0] 2019-01-17

- fix doc ,adapter spring properties

## [3.0.0] 2019-01-16

- auto install dependencies `shfmt` for macos and linux

## [2.0.4] 2019-01-16

- add hosts、properties、.gitignore、.dockerignore、 jvmoptions file surport

## [2.0.2] 2019-01-14

- change logo

## [2.0.2] 2018-12-17

- fix #23 bug

## [2.0.0] - 2018-11-29

- replace command `shell.format.shfmt` with `editor.action.formatDocument`
- replace configuration `shellformat.runOnSave` with `wditor.formatOnSave`
- fix the [issue bug #18](https://github.com/foxundermoon/vs-shell-format/issues/18)
- add dotenv file support

## [1.1.2] - 2018-4-17

- add setting config `"shellformat.runOnSave":false`
- add Dockerfile support.

## [1.1.0] - 2017-10-07

- add setting config `"shellformat.showError":true`
- help you location error, you can set false to off the error tips.
- change format by child_process spawn . better performance when large file.
- add donate link . thank for your donate.

## [1.0.0] - 2017-04-06

- add command flag configuration

## [0.1.2] - 2017-01-07

- add icon & gif

## [0.1.1] - 2017-01-06

- fix document

## [0.1.0] - 2017-01-06

- change format base on TextDocument

## [0.0.1] - 2017-01-05

- add shell format base on file
