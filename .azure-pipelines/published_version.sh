#!/bin/sh

curl 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery' \
  -H 'origin: https://marketplace.visualstudio.com' \
  -H 'pragma: no-cache' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36' \
  -H 'content-type: application/json' \
  -H 'accept: application/json;api-version=5.1-preview.1;excludeUrls=true' \
  -H 'cache-control: no-cache' \-H 'authority: marketplace.visualstudio.com' \
  -H 'referer: https://marketplace.visualstudio.com/items?itemName=foxundermoon.shell-format' \
  --data-binary '{"assetTypes":null,"filters":[{"criteria":[{"filterType":7,"value":"foxundermoon.shell-format"}],"direction":2,"pageSize":1,"pageNumber":1,"sortBy":0,"sortOrder":0,"pagingToken":null}],"flags":71}' |
  jq '.results[0].extensions[0].versions[0].version'
