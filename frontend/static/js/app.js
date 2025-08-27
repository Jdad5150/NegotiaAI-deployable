// Reset button functionality
const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", function () {
  jobList.selectedIndex = 0;
  stateList.selectedIndex = 0;
  experienceList.selectedIndex = 0;
  checkFormReady();
  document.getElementById("prediction-result").innerText = "";
  document.getElementById("response-container-h1").style.display = "block";
  document.getElementById("response-subtitle").style.display = "block";
});
// Accessibility & UX: Enable submit button only when all dropdowns are selected
const jobList = document.getElementById("job_list");
const stateList = document.getElementById("state_list");
const experienceList = document.getElementById("experience_list");
const submitBtn = document.getElementById("submit-btn");

function checkFormReady() {
  if (
    jobList.value !== "" &&
    stateList.value !== "" &&
    experienceList.value !== ""
  ) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

jobList.addEventListener("change", checkFormReady);
stateList.addEventListener("change", checkFormReady);
experienceList.addEventListener("change", checkFormReady);

// Adding event listener to the form submission
document
  .getElementById("prediction-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Get the selected values from the dropdowns
    const state_id = stateList.options[stateList.selectedIndex].value;
    const state_title = stateList.options[stateList.selectedIndex].text;

    const job_id = jobList.options[jobList.selectedIndex].value;
    const job_title = jobList.options[jobList.selectedIndex].text;

    const experience_id =
      experienceList.options[experienceList.selectedIndex].value;
    const experience_title =
      experienceList.options[experienceList.selectedIndex].text;

    // Get the result and title elements where the response will be shown
    const resultElement = document.getElementById("prediction-result");
    const titleElement = document.getElementById("response-container-h1");
    const subtitleElement = document.getElementById("response-subtitle");

    // Get the loader element
    const loader = document.getElementById("loader");

    // Set a minimum display time for the loader (in milliseconds)
    const minDisplayTime = 2000;
    const startTime = Date.now();

    // Hide the title and subtitle, and show the loader while waiting for the response
    titleElement.style.display = "none";
    subtitleElement.style.display = "none";
    loader.style.display = "flex";
    resultElement.innerText = "";

    // Send a POST request to the backend to get the predicted salary
    fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        features: [
          parseFloat(state_id),
          parseFloat(job_id),
          parseFloat(experience_id),
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 0);
        setTimeout(() => {
          loader.style.display = "none";
          if (data.prediction) {
            const roundedPrediction = Math.round(
              data.prediction
            ).toLocaleString("en-US", { style: "currency", currency: "USD" });
            const upperBound = (
              Math.round((Math.round(data.prediction) * 1.1) / 10000) * 10000
            ).toLocaleString("en-US", { style: "currency", currency: "USD" });
            const lowerBound = (
              Math.round((Math.round(data.prediction) * 0.9) / 10000) * 10000
            ).toLocaleString("en-US", { style: "currency", currency: "USD" });
            resultElement.innerText = `${experience_title} ${job_title} in ${state_title} should make ${roundedPrediction} per year.\n\nStart your negotiation with a salary of ${upperBound} and take no less than ${lowerBound}.`;
            titleElement.style.display = "none";
            subtitleElement.style.display = "none";
          } else if (data.error) {
            resultElement.innerText = `Error: ${data.error}`;
          }
        }, remainingTime);
      })
      .catch((error) => {
        console.error("Error:", error);
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 0);
        setTimeout(() => {
          loader.style.display = "none";
          titleElement.style.display = "block";
          subtitleElement.style.display = "block";
          resultElement.innerText = "An error occurred. Please try again.";
        }, remainingTime);
      });
  });
