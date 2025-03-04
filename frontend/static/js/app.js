// Adding event listener to the form submission
document
  .getElementById("prediction-form")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get the selected values from the dropdowns
    const state = document.getElementById("state_list");
    const state_id = state.options[state.selectedIndex].value; // Get selected state's ID
    const state_title = state.options[state.selectedIndex].text; // Get selected state's name

    const job = document.getElementById("job_list");
    const job_id = job.options[job.selectedIndex].value; // Get selected job's ID
    const job_title = job.options[job.selectedIndex].text; // Get selected job's title

    const experience = document.getElementById("experience_list");
    const experience_id = experience.options[experience.selectedIndex].value; // Get selected experience level's ID
    const experience_title = experience.options[experience.selectedIndex].text; // Get selected experience level's title

    // Get the result and title elements where the response will be shown
    const resultElement = document.getElementById("prediction-result");
    const titleElement = document.getElementById("response-container-h1");
    const subtitleElement = document.getElementById("response-subtitle");

    // Get the loader element
    const loader = document.getElementById("loader");

    // Set a minimum display time for the loader (in milliseconds)
    const minDisplayTime = 2000;

    // Capture the start time to calculate how long the loader has been displayed
    const startTime = Date.now();

    // Hide the title and subtitle, and show the loader while waiting for the response
    titleElement.style.display = "none";
    subtitleElement.style.display = "none";
    loader.style.display = "flex";
    resultElement.innerText = ""; // Clear any previous result text

    // Send a POST request to the backend to get the predicted salary
    fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Sending JSON data
      },
      body: JSON.stringify({
        features: [
          parseFloat(state_id), // Convert state ID to float for the backend
          parseFloat(job_id), // Convert job ID to float for the backend
          parseFloat(experience_id), // Convert experience level ID to float
        ],
      }),
    })
      .then((response) => response.json()) // Parse the response as JSON
      .then((data) => {
        // Calculate the time elapsed since the request started
        const elapsedTime = Date.now() - startTime;

        // Calculate how much longer the loader should stay visible, ensuring a minimum display time
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 0);

        // Hide the loader after the required time, and display the result
        setTimeout(() => {
          loader.style.display = "none"; // Hide loader

          // If the response contains a prediction, display it
          if (data.prediction) {
            // Round the prediction and format it as currency
            const roundedPrediction = Math.round(
              data.prediction
            ).toLocaleString("en-US", { style: "currency", currency: "USD" });

            // Calculate the upper and lower bounds for negotiation
            const upperBound = (
              Math.round((Math.round(data.prediction) * 1.1) / 10000) * 10000
            ).toLocaleString("en-US", { style: "currency", currency: "USD" });
            const lowerBound = (
              Math.round((Math.round(data.prediction) * 0.9) / 10000) * 10000
            ).toLocaleString("en-US", { style: "currency", currency: "USD" });

            // Display the final result with salary predictions and negotiation advice
            resultElement.innerText = `${experience_title} ${job_title} in ${state_title} should make ${roundedPrediction} per year.\n\nStart your negotiation with a salary of ${upperBound} and take no less than ${lowerBound}.`;

            // Hide the title and subtitle once the result is displayed
            titleElement.style.display = "none";
            subtitleElement.style.display = "none";
          } else if (data.error) {
            // If there's an error in the response, display it
            resultElement.innerText = `Error: ${data.error}`;
          }
        }, remainingTime);
      })
      .catch((error) => {
        // If there’s a problem with the request (e.g., network issues), display an error message
        console.error("Error:", error);

        // Calculate how much longer the loader should stay visible, ensuring a minimum display time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 0);

        // After the required time, hide the loader and show the error message
        setTimeout(() => {
          loader.style.display = "none";
          titleElement.style.display = "block";
          subtitleElement.style.display = "block";
          resultElement.innerText = "An error occurred. Please try again.";
        }, remainingTime);
      });
  });
