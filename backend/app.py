
from flask import Flask, render_template, request, jsonify, send_file
import logging
import numpy as np
import joblib
import pandas as pd
import sys
import time

# Logging configuration
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


# Add console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
logging.getLogger().addHandler(console_handler)


# Load the model
model = joblib.load('salary_prediction_model.pkl')

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

# Health check endpoint (must be after app creation)
@app.route('/health')
def health():
    """
    Health check endpoint for uptime monitoring.
    Returns 200 OK if the app is running.
    """
    return jsonify({'status': 'ok'}), 200


def send_encoding_json(filename, log_route):
    """
    Helper function to send encoding JSON files and handle errors/logging.
    """
    try:
        app.logger.info(f"Request received for {log_route}")
        response = send_file(filename)
        app.logger.info(f"Response sent for {log_route}")
        return response
    except Exception as e:
        app.logger.error(f"Error in {log_route}: {str(e)}")
        return jsonify({f'Error loading {filename}': str(e)})

# Routes
@app.route('/get-jobs')
def get_jobs():
    """
    Returns the job titles from the shared folder as a JSON file.
    """
    return send_encoding_json('title_encoding.json', '/get-jobs')


@app.route('/get-exp-level')
def get_exp_level():
    """
    Returns the experience levels from the shared folder as a JSON file.
    """
    return send_encoding_json('experience_encoding.json', '/get-exp-level')


@app.route('/get-states')
def get_states():
    """
    Returns the states from the shared folder as a JSON file.
    """
    return send_encoding_json('state_encoding.json', '/get-states')
    



@app.route('/')
def home():
    """
    Renders the home page (index.html).
    This route serves the initial webpage for the user.
    """

    # Log the request
    app.logger.info("Request received for home page")
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """
    Handles the prediction request.
    This route processes the incoming data, feeds it to the model, and returns the prediction.
    """


    try:
        # Validate request JSON
        if not request.is_json:
            app.logger.error("/predict: Request content-type is not application/json")
            return jsonify({'error': 'Request must be JSON'}), 400

        req_json = request.get_json()
        if not req_json or 'features' not in req_json:
            app.logger.error("/predict: Missing 'features' in request JSON")
            return jsonify({'error': "Missing 'features' in request JSON"}), 400

        features = req_json['features']
        if not isinstance(features, list) or len(features) != 3:
            app.logger.error(f"/predict: 'features' must be a list of 3 elements. Got: {features}")
            return jsonify({'error': "'features' must be a list of 3 elements: [state, title, experience]"}), 400

        app.logger.info(f"Request received for /predict: {features}")

        # Prepare the features for the model and convert to a DataFrame        
        input_features = {
            'state': features[0],
            'title': features[1],
            'experience': features[2]
        }
        features_df = pd.DataFrame([input_features])

        # Measure the time taken for model inference
        model_inference_start_time = time.time() # Start time
        prediction = model.predict(features_df) # Model inference
        model_inference_end_time = time.time() # End time

        # Calculate and log the model inference time
        model_inference_time = model_inference_end_time - model_inference_start_time
        app.logger.info(f"Model inference time: {model_inference_time: .4f} seconds")

        # Log the prediction
        app.logger.info(f"Response sent for /predict: Model Input: {features}, Prediction: {prediction.tolist()}")        

        # Return the prediction as a JSON
        return jsonify({'prediction': prediction.tolist()})
    except Exception as e:
        app.logger.error(f"Error in /predict: {str(e)}")
        return jsonify({'error': 'Prediction failed'}), 500
    
@app.errorhandler(Exception)
def handle_exception(e):

    """
    Global error handler for unexpected errors.
    This handler catches any unhandled exceptions and returns a generic error message.
    """
    
    # Log the error internally, but do not expose details to the client
    app.logger.error(f"Unexpected error: {str(e)}")
    return jsonify({'error': 'An unexpected error occurred. Please try again later.'}), 500

# Start the application
if __name__ == '__main__':
    app.run()