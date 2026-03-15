alert("app.js connected");          const supabaseUrl =https//dcukvzsmlnmjvscyjjrp.supabase.co 
const supabaseKey = sb_publishable_ViJZqXoZCScCHK327ZQigQ_Bs8MXQ8M


const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let budget = 0;



function setBudget(){

const input = document.getElementById("budgetInput").value;

budget = Number(input);

localStorage.setItem("budget", budget);

document.getElementById("budgetDisplay").innerText = "Budget: $" + budget;

}



async function addSpend(){

const amount = Number(document.getElementById("spendInput").value);

if(!amount) return alert("Enter spend amount");

await supabase
.from("spend")
.insert([{ amount: amount }]);

document.getElementById("spendInput").value="";

loadDashboard();

}



async function loadDashboard(){

const { data } = await supabase
.from("spend")
.select("*")
.order("id",{ascending:false});

let total = 0;

let weekTotal = 0;

let list = "";

const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate()-7);



data.forEach(row=>{

total += row.amount;

const date = new Date(row.created_at);

if(date > weekAgo){

weekTotal += row.amount;

}

list += `<li>$${row.amount} - ${date.toLocaleDateString()}</li>`;

});


document.getElementById("totalSpend").innerText="$"+total;

document.getElementById("weeklySpend").innerText="Weekly Spend: $"+weekTotal;

document.getElementById("history").innerHTML=list;

checkAlerts(total);

}



function checkAlerts(total){

if(!budget){

budget = Number(localStorage.getItem("budget"));

}

if(!budget) return;



let percent = (total/budget)*100;

if(percent>=100){

document.getElementById("alertBox").innerText="⚠ Budget Exceeded";

}

else if(percent>=80){

document.getElementById("alertBox").innerText="⚠ 80% Budget Used";

}

else{

document.getElementById("alertBox").innerText="Budget Safe";

}

}



function loadBudget(){

const saved = localStorage.getItem("budget");

if(saved){

budget = Number(saved);

document.getElementById("budgetDisplay").innerText="Budget: $"+budget;

}

}



loadBudget();

loadDashboard();


