from flask import Flask, request, jsonify, send_from_directory
from layasom import LayaSOM

app = Flask(__name__, static_folder='web', static_url_path='')


@app.route('/')
def home():
    return send_from_directory('web', 'index.html')


@app.route('/api/v1/question', methods=['POST'])
def question():
    layasom_instance = LayaSOM()
    data = request.get_json()
    
    if not data:
        return jsonify({
            "error": "Invalid JSON",
            "message": "Request body must be a JSON object"
        }), 400
    
    state = data.get('state')
    choices = data.get('choices')
    
    if not isinstance(state, str):
        return jsonify({
            "error": "Invalid state",
            "message": "state must be a string"
        }), 400
    
    if not isinstance(choices, dict):
        return jsonify({
            "error": "Invalid choices",
            "message": "choices must be an array of question objects"
        }), 400
    
    result = layasom_instance.question(state, choices)
    
    return jsonify({
        "data": result,
        "timestamp": __import__('datetime').datetime.now().isoformat()
    })


if __name__ == '__main__':
    app.run(debug=True)