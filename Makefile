# Configurable variables
REMOTE_HOST := webhost1.hosting.netent.co.nz
REMOTE_PATH := /var/www/html/paulwillard.nz
REMOTE_USER := paul
URL := https://www.paulwillard.nz
BLOGNAME := Paul Willard NZ
SHELL := /bin/bash

SCRIPT_NAME := make

NNAME := $(shell node --eval "console.log(encodeURIComponent('$(BLOGNAME)'))")
NURL := $(shell node --eval "console.log(encodeURIComponent('$(URL)'))")
NFEED := $(shell node --eval "console.log(encodeURIComponent('$(URL)/sitemap.xml'))")

PINGOURL := $(shell printf "http://pingomatic.com/ping/?title=%s&blogurl=%s&rssurl=%s&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on&chk_newsgator=on&chk_myyahoo=on&chk_pubsubcom=on&chk_blogdigger=on&chk_weblogalot=on&chk_newsisfree=on&chk_topicexchange=on&chk_google=on&chk_tailrank=on&chk_skygrid=on&chk_collecta=on&chk_superfeedr=on" "$(NNAME)" "$(NURL)" "$(NFEED)")
GOOGLEURL := $(shell printf "http://www.google.com/webmasters/tools/ping?sitemap=%s" "$(NFEED)")
BINGURL := $(shell printf "http://www.bing.com/webmaster/ping.aspx?siteMap=%s" "$(NFEED)")

.PHONY: all help install stamp stamp-service-worker rsync ping-search-engines ping push deploy serve

all: help

help:
	@echo 'Static site helper for paulwillard.nz'
	@echo ''
	@echo 'Usage:'
	@echo '$(SCRIPT_NAME) [single option]'
	@echo ''
	@echo 'Options'
	@echo '     help        Show this help screen'
	@echo '     serve       Start a local test server on http://127.0.0.1:8123/'
	@echo '     stamp       Update the service worker cache revision'
	@echo '     rsync       Sync this static site to the live host'
	@echo '     ping        Notify sitemap ping endpoints'
	@echo '     deploy      Run rsync, then notify sitemap ping endpoints'
	@echo '     push        Alias for deploy'
	@echo '     install     Alias for deploy'

install: deploy

serve:
	@python3 -m http.server 8123

stamp-service-worker:
	@perl -0pi -e "s/const SITE_REVISION = '[^']+';/const SITE_REVISION = '$$(date +%Y%m%d%H%M%S)';/" sw.js

stamp: stamp-service-worker

rsync:
	@rsync -avz --delete \
		--exclude '.codex/' \
		--exclude '.git/' \
		--exclude 'Makefile' \
		--exclude 'Screenshot*' \
		./ $(REMOTE_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/

ping-search-engines:
	@echo "Pinging ping-o-matic, Google, and Bing"
	@curl --silent "$(PINGOURL)" > /dev/null
	@curl --silent "$(GOOGLEURL)" > /dev/null
	@curl --silent "$(BINGURL)" > /dev/null

ping: ping-search-engines

deploy: stamp-service-worker rsync ping-search-engines

push: deploy
