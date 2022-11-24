import threading
import http.server
import app

specialPaths = {}

class _handler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    try:
      super().__init__(*args, directory='www', **kwargs)
    except:
      pass

  def do_GET(self):
    if self.path in specialPaths:
      specialPaths[self.path]()
    else:
      http.server.SimpleHTTPRequestHandler.do_GET(self)

  def log_message(self, format, *args):
        return

port = 0

def _startWeb(portParam : int):
  global port
  port = portParam
  httpd = http.server.HTTPServer(("0.0.0.0", port), _handler)
  print(f"HTTP Server listening on port {port}")
  while not app.stopRequested:
    httpd.handle_request()

def start(port : int):
  try:
    httpServerThread = threading.Thread(name='HTTPServer', target=_startWeb, args=[port])
    httpServerThread.start()
  except KeyboardInterrupt:
    print("uhoh")
