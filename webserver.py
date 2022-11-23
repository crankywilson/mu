import threading
import http.server

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

def _startWeb(port : int):
  httpd = http.server.HTTPServer(("0.0.0.0", port), _handler)
  print(f"HTTP Server listening on port {port}")
  httpd.serve_forever()

def start(port : int):
  httpServerThread = threading.Thread(name='HTTPServer', target=_startWeb, args=[port])
  httpServerThread.start()