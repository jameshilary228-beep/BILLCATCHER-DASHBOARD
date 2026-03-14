let spend = 0;
let budget = 1500;


function updateDashboard(){

let percent = (spend / budget) * 100;

document.getElementById("spendAmount").innerText = "$" + spend;

let barPercent = Math.min(percent,100);
document.getElementById("budgetBar").style.width = barPercent + "%";

if(percent > 100){
document.getElementById("budgetStatus").innerText = "⚠ Budget exceeded";
document.getElementById("budgetStatus").style.color = "red";
}

}

setInterval(function(){

spend = spend + Math.floor(Math.random()*5);

let spike = Math.floor(Math.random()*100);

if(spike > 85){
document.getElementById("budgetStatus").innerText = "⚠ Cost spike detected today";
}

updateDashboard();

},2000);



const ctx = document.getElementById('spendChart').getContext('2d');

const spendChart = new Chart(ctx, {
type: 'line',
data: {
labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
datasets: [{
label: 'Cloud Spend ($)',
data: [1100,1200,1250,1300,1400,1450,1500],
borderColor: '#4ade80',
backgroundColor: 'rgba(74,222,128,0.2)',
tension: 0.4
}]
},
options: {
plugins:{
legend:{
display:false
}
}
}
});



document.getElementById("setBudgetBtn").addEventListener("click", function(){

let newBudget = document.getElementById("budgetInput").value
if(newBudget){
budget = Number(newBudget);
localStorage.setItem("budget", budget);
updateDashboard();
}

});
window.onload = function(){

document.getElementById("budgetInput").value = budget;

}
