#!/usr/bin/env sh

#https://github.com/Neilpang/get.acme.sh

_exists() {
  cmd="$1"
  if [ -z "$cmd" ]; 
  then
    echo "Usage: _exists cmd"
    return 1
  fi
  if type command >/dev/null 2>&1 ; then
    command -v $cmd >/dev/null 2>&1
  else
    type $cmd >/dev/null 2>&1
  fi
  ret="$?"
  return $ret
}

if _exists curl && [ "${ACME_USE_WGET:-0}" = "0" ]; then
  curl https://raw.githubusercontent.com/Neilpang/acme.sh/master/acme.sh | \
INSTALLONLINE=1  sh
elif _exists wget ; then
  wget -O -  https://raw.githubusercontent.com/Neilpang/acme.sh/master/acme.sh |\
INSTALLONLINE=1  sh
else
  echo "Sorry, you must have curl or wget installed first."
  echo "Please install either of them and try again."
fi