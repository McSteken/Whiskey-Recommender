from flask import Flask, request, jsonify
from flask_cors import CORS
from recommandation import get_recommendations, whiskey_data

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/predict', methods=['POST'])
def predict_route():
    try:
        data = request.get_json()
        price = data.get('maxPrice', 1000)
        index = data['index']
        print(f"Received index: {index}, maxPrice: {price}")

        if index < 0 or index >= len(whiskey_data):
            raise IndexError("Index out of bounds")

        result = get_recommendations(index, price)
        return jsonify(result)

    except IndexError as e:
        print(f"IndexError: {e}")
        return jsonify({"error": "Index out of bounds"}), 400

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)