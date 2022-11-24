#!/usr/bin/env python3
import webserver
import wsserver

webserver.start(8000)
wsserver.start(8001, webserver.port)
