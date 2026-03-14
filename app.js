let spend = 0;
let budget = 0;

function setBudget() {
  budget = Number(document.getElementById("budgetInput").value);
  updateDashboard();
}

function updateDashboard() {

  document.getElementById("spend").innerText = "$" + spend;

  if (budget > 0) {

    let percent = (spend / budget) * 100;

    if (percent >= 100) {
      document.getElementById("budgetStatus").innerText = "Over Budget!";
      document.getElementById("budgetStatus").style.color = "red";
    }

    else if (percent >= 80) {
      document.getElementById("budgetStatus").innerText = "Warning: Near Budget";
      document.getElementById("budgetStatus").style.color = "orange";
    }

    else {
      document.getElementById("budgetStatus").innerText = "You are within budget";
      document.getElementById("budgetStatus").style.color = "green";
    }

  }

}

function simulateSpend() {

  spend = spend + Math.floor(Math.random() * 20);

  updateDashboard();

}

setInterval(simulateSpend, 4000);

const ctx = document.getElementById("spendChart");

new Chart(ctx, {
  type: "line",

  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    datasets: [{
      label: "Cloud Spend ($)",
      data: [120, 200, 150, 300, 250, 180, 220],
      borderWidth: 3
    }]
  },

  options: {
    responsive: true
  }
});
updateDashboard();
