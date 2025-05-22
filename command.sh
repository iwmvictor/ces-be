#!/bin/bash

docker-compose -f docker-compose.dev.yaml exec app "$@"
