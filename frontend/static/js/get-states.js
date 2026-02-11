document.addEventListener("DOMContentLoaded", function () {
  fetch("/get-states")
    .then((response) => response.json())
    .then((data) => {
      const state_list = document.getElementById("state_list");
      Object.entries(data).forEach(([state, id]) => {
        let option = document.createElement("option");
        option.value = id;
        option.text = state;
        state_list.appendChild(option);
      });
    })
    .catch((error) => console.error("Error:", error));
});
