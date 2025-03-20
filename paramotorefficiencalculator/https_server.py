import http.server
import ssl

# Define the server address and port
server_address = ('', 4443)  # Use any available port

# Create a simple HTTP request handler
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# Wrap the server socket with SSL
httpd.socket = ssl.wrap_socket(httpd.socket,
                               keyfile='key.pem',
                               certfile='cert.pem',
                               server_side=True)

print("Serving on https://localhost:4443")
httpd.serve_forever()