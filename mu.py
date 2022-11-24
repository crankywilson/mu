#!/usr/bin/env python3
import webserver
import wsserver
import signal

signal.signal(signal.SIGINT, signal.SIG_DFL)

webserver.start(8000)
wsserver.start(8001, webserver.port)
