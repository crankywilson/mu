import threading
import http.server
import app
from typing import Union, Optional, Dict
from http.cookies import SimpleCookie

def sendResponse(handler : http.server.SimpleHTTPRequestHandler, resp:Union[str,bytes], cookie:Optional[SimpleCookie]=None):
  handler.send_response(200)
  handler.send_header("Content-type", "text/html")
  if cookie is not None:
    for morsel in cookie.values():
      handler.send_header("Set-Cookie", morsel.OutputString())
  handler.end_headers()

  if isinstance(resp, str):
    resp = resp.encode()
  handler.wfile.write(resp)


def redirect(handler : http.server.SimpleHTTPRequestHandler, newPath:str, cookie:Optional[SimpleCookie]=None):
  handler.send_response(302)
  handler.send_header('Location', newPath)
  if cookie is not None:
    for morsel in cookie.values():
      handler.send_header("Set-Cookie", morsel.OutputString())
  handler.end_headers()


def handleRoot(handler : http.server.SimpleHTTPRequestHandler):
  cookie = SimpleCookie(handler.headers.get('Cookie'))
  if "t" in cookie:
    tok=cookie["t"].value
    p, g = app.playerAndGameForToken(tok)
    if p is not None and g.started:
      return redirect(handler, '/play')
  
  return redirect(handler, '/setup')

specialPaths = {
  "/":      handleRoot
}

class _handler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    try:
      self.extensions_map[''] = 'text/html'
      super().__init__(*args, directory='webroot', **kwargs)
    except:
      pass

  def do_GET(self):
    path = self.path.split('?')[0]
    if path in specialPaths:
      specialPaths[path](self)
    else:
      http.server.SimpleHTTPRequestHandler.do_GET(self)

  def end_headers(self):
    self.send_my_headers()
    http.server.SimpleHTTPRequestHandler.end_headers(self)

  def send_my_headers(self):
    if self.path.startswith("/js/") or self.path == '/play':
      self.send_header("Expires", "0")

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
