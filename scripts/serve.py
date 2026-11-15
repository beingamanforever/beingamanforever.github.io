#!/usr/bin/env python3
"""Serve _site locally the way GitHub Pages does, so clean URLs work: /research finds research.html."""
import http.server
import os
import sys
from functools import partial

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_site")


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path, _, query = self.path.partition("?")
        if not os.path.exists(self.translate_path(path)) and os.path.exists(self.translate_path(path + ".html")):
            self.path = path + ".html" + ("?" + query if query else "")
        return super().send_head()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 3456
print(f"http://127.0.0.1:{port}")
http.server.ThreadingHTTPServer(("127.0.0.1", port), partial(CleanURLHandler, directory=ROOT)).serve_forever()
