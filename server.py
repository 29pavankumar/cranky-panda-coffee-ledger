#!/usr/bin/env python3
"""
Simple Zero-Dependency HTTP Server for Brand Store POS & Inventory Ledger
Runs on Python 3.x and automatically serves the dashboard.
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Suppress spammy log outputs for smooth terminal experience
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def run():
    global PORT
    while PORT < 3020:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                url = f"http://localhost:{PORT}"
                print("=" * 65)
                print("  ✨ BRAND STORE POS & INVENTORY LEDGER DASHBOARD ✨")
                print("=" * 65)
                print(f"  Local Dashboard URL:  {url}")
                print(f"  Serving Directory:    {DIRECTORY}")
                print("=" * 65)
                print("  Press Ctrl+C to stop the local server.\n")

                # Try opening browser automatically
                try:
                    webbrowser.open(url)
                except Exception:
                    pass

                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e):
                PORT += 1
            else:
                raise e

if __name__ == "__main__":
    run()
