from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/save-table": {"origins": "http://localhost:8000"}})  # Only allow CORS for this specific route and origin

@app.route('/save-table', methods=['POST'])
def save_table():
    # Extract and save the HTML content sent by the client
    table_html = request.json['table_html']
    # Do whatever you want with this data (e.g., save to file or database)
    with open('table.html', 'w') as file:
        file.write(table_html)
    # Return a response
    return jsonify(success=True, message='Table HTML saved.')

if __name__ == '__main__':
    app.run(debug=True)