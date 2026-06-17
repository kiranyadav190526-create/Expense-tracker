let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let editId = null;
let chart;

const form = document.getElementById("form");
const list = document.getElementById("transactionList");

const labelInput = document.getElementById("label");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");

function saveData(){
localStorage.setItem(
"transactions",
JSON.stringify(transactions)
);
}

form.addEventListener("submit",(e)=>{

e.preventDefault();

const transaction={
id:editId || Date.now(),
label:labelInput.value,
amount:+amountInput.value,
type:typeInput.value,
category:categoryInput.value,
date:dateInput.value
};

if(editId){
transactions=transactions.map(t=>
t.id===editId ? transaction : t
);
editId=null;
}else{
transactions.push(transaction);
}

saveData();
form.reset();
render();

});

function editTransaction(id){

const t=transactions.find(
item=>item.id===id
);

labelInput.value=t.label;
amountInput.value=t.amount;
typeInput.value=t.type;
categoryInput.value=t.category;
dateInput.value=t.date;

editId=id;
}

function deleteTransaction(id){

transactions=
transactions.filter(
item=>item.id!==id
);

saveData();
render();
}

function updateSummary(){

const income=
transactions
.filter(t=>t.type==="income")
.reduce((a,b)=>a+b.amount,0);

const expense=
transactions
.filter(t=>t.type==="expense")
.reduce((a,b)=>a+b.amount,0);

document.getElementById("income").textContent=`₹${income}`;
document.getElementById("expense").textContent=`₹${expense}`;
document.getElementById("balance").textContent=`₹${income-expense}`;

}

function updateChart(){

const categories={};

transactions
.filter(t=>t.type==="expense")
.forEach(t=>{

categories[t.category]=
(categories[t.category]||0)+t.amount;

});

if(chart){
chart.destroy();
}

chart=new Chart(
document.getElementById("chart"),
{
type:"pie",
data:{
labels:Object.keys(categories),
datasets:[{
data:Object.values(categories)
}]
}
}
);

}

function render(){

list.innerHTML="";

const filtered=
transactions.filter(t=>{

const searchMatch=
t.label.toLowerCase()
.includes(
searchInput.value.toLowerCase()
);

const categoryMatch=
filterCategory.value==="all" ||
t.category===filterCategory.value;

return searchMatch && categoryMatch;

});

document.getElementById("empty")
.style.display=
filtered.length ? "none" : "block";

filtered.forEach(t=>{

const li=document.createElement("li");

li.className=
`transaction ${
t.type==="income"
?"income-item"
:"expense-item"
}`;

li.innerHTML=`
<div>
<b>${t.label}</b><br>
${t.category} | ${t.date}
</div>

<strong>₹${t.amount}</strong>

<div class="actions">
<button class="edit-btn"
onclick="editTransaction(${t.id})">
Edit
</button>

<button class="delete-btn"
onclick="deleteTransaction(${t.id})">
Delete
</button>
</div>
`;

list.appendChild(li);

});

updateSummary();
updateChart();

}

searchInput.addEventListener("input",render);
filterCategory.addEventListener("change",render);

document
.getElementById("exportCSV")
.addEventListener("click",()=>{

let csv=
"Label,Amount,Type,Category,Date\n";

transactions.forEach(t=>{
csv+=`${t.label},${t.amount},${t.type},${t.category},${t.date}\n`;
});

const blob=
new Blob([csv],{type:"text/csv"});

const a=
document.createElement("a");

a.href=
URL.createObjectURL(blob);

a.download=
"transactions.csv";

a.click();

});

document
.getElementById("darkMode")
.onclick=()=>{

document.body
.classList.toggle("dark");

localStorage.setItem(
"darkMode",
document.body.classList.contains("dark")
);

};

if(localStorage.getItem("darkMode")==="true"){
document.body.classList.add("dark");
}

render();
