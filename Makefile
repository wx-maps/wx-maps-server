#repo_name := wxmaps
repo_name := rickrrr
image := wx-maps-server
image_name := $(repo_name)/$(image)

.PHONY: build publish

all: build publish

build:
	docker build -t $(image_name) .

publish:
	docker push $(image_name)
