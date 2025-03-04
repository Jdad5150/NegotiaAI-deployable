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
model = joblib.load('./shared/salary_prediction_model.pkl')

# Create the Flask app
app = Flask(__name__)

# Routes
@app.route('/get-jobs')
def get_jobs():

    """
    Returns the job titles from the shared folder as a JSON file.
    This route sends the job encoding JSON file to the client.
    """


    try:
        # Log the request
        app.logger.info("Request received for /get-jobs")

        # Send/Log the job encoding JSON file to the client
        response = send_file('../shared/title_encoding.json')
        app.logger.info("Response sent for /get-jobs")        
        return response
    
    # Handle/Log exceptions
    except Exception as e:
        app.logger.error(f"Error in /get-jobs: {str(e)}")
        return jsonify({'Error loading jobtitles': str(e)})    


@app.route('/get-exp-level')
def get_exp_level():
    """
    Returns the experience levels from the shared folder as a JSON file.
    This route sends the experience level encoding JSON file to the client.
    """


    try:
        # Log the request
        app.logger.info("Request received for /get-exp-level")

        # Send/Log the experience level encoding JSON file to the client
        response = send_file('../shared/experience_encoding.json')
        app.logger.info("Response sent for /get-exp-level")
        return response
    
    # Handle/Log exceptions
    except Exception as e:
        app.logger.error(f"Error in /get-exp-level: {str(e)}")
        return jsonify({'Error loading experience levels': str(e)})


@app.route('/get-states')
def get_states():
    """
    Returns the states from the shared folder as a JSON file.
    This route sends the state encoding JSON file to the client.
    """


    try:
        # Log the request
        app.logger.info("Request received for /get-states")

        # Send/Log the state encoding JSON file to the client
        response = send_file('../shared/state_encoding.json')
        app.logger.info("Response sent for /get-states")
        return response
    
    # Handle/Log exceptions
    except Exception as e:
        app.logger.error(f"Error in /get-states: {str(e)}")
        return jsonify({'Error loading states': str(e)})
    



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

        # Get features from the request JSON
        features = request.json['features']
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
    
    # Handle/Log exceptions
    except Exception as e:
        app.logger.error(f"Error in /predict: {str(e)}")
        return jsonify({'Prediction Error': str(e)})
    
@app.errorhandler(Exception)
def handle_exception(e):

    """
    Global error handler for unexpected errors.
    This handler catches any unhandled exceptions and returns a generic error message.
    """
    
    # Log and return the error
    app.logger.error(f"Unexpected error: {str(e)}")
    return jsonify({'error': 'An unexpected error occurred'}), 500

# Start the application
if __name__ == '__main__':
    app.run(debug=True)