#!/usr/bin/env python3
import webserver
import wsserver
import signal
import os

if os.name == 'nt':  # can't get ctrl+C to work on Windows
  signal.signal(signal.SIGINT, signal.SIG_DFL)

webserver.start(8000)
wsserver.start(8001, webserver.port) # on linux let wssserver attempt to shutdown webserver when appropriate
