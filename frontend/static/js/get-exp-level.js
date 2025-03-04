document.addEventListener("DOMContentLoaded", function () {
  fetch("/get-exp-level")
    .then((response) => response.json())
    .then((data) => {
      const exp_list = document.getElementById("experience_list");
      Object.entries(data).forEach(([level, id]) => {
        let option = document.createElement("option");
        option.value = id;
        option.text = level;
        exp_list.appendChild(option);
      });

      exp_list.addEventListener("change", function () {
        exp_list.style.color = "black";
        exp_list.style.backgroundColor = "white";
      });
    })
    .catch((error) => console.error("Error:", error));

  var infoIcon = document.getElementById("info-icon");
  var popOver = document.getElementById("popover");

  infoIcon.addEventListener("click", function () {
    if (popOver.style.display === "flex") {
      popOver.style.display = "none";
    } else {
      popOver.style.display = "flex";
    }
  });
});
