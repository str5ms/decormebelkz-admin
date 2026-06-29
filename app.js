const API_URL =
"https://script.google.com/macros/s/AKfycbwv0jTKV2cWw-wB9DyhncSr3P3I32yIbtHwsr_mGYfjesHaXmsL4QzBEwXMsWM-l6AGiw/exec";

let allLeads = [];

async function loadLeads() {

    const tbody = document.querySelector("#leadsTable tbody");

    tbody.innerHTML = `
    <tr>
        <td colspan="7" class="loading">
            Загрузка заявок...
        </td>
    </tr>`;

    try{

        const response = await fetch(API_URL);

        allLeads = await response.json();

        allLeads.sort((a,b)=>
            new Date(b.createdAt)-new Date(a.createdAt)
        );

        updateStats();

        renderTable(allLeads);

    }

    catch(error){

        tbody.innerHTML=`
        <tr>
            <td colspan="7">
                Не удалось загрузить заявки
            </td>
        </tr>`;

        console.error(error);

    }

}

function renderTable(leads){

    const tbody=document.querySelector("#leadsTable tbody");

    tbody.innerHTML="";

    if(leads.length===0){

        tbody.innerHTML=`
        <tr>
            <td colspan="7">
                Пока нет заявок
            </td>
        </tr>`;

        return;

    }

    leads.forEach(lead=>{

        const phone=lead.phone.replace(/\D/g,"");

        tbody.innerHTML+=`

<tr>

<td>

${formatDate(lead.createdAt)}

</td>

<td>

<strong>${lead.name}</strong>

</td>

<td>

<a href="tel:${phone}">
${lead.phone}
</a>

</td>

<td>

${lead.project||"-"}

</td>

<td>

${lead.budget||"-"}

</td>

<td>

${lead.message||"-"}

</td>

<td>

<div class="actions">

<a
class="call"
href="tel:${phone}"
title="Позвонить">

📞

</a>

<a
class="wa"
href="https://wa.me/${phone}"
target="_blank"
title="WhatsApp">

💬

</a>

</div>

</td>

</tr>

`;

    });

}

function formatDate(date){

    if(!date) return "-";

    return new Date(date).toLocaleString("ru-RU",{

        day:"2-digit",

        month:"2-digit",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit"

    });

}

function updateStats(){

    document.getElementById("totalLeads").textContent=allLeads.length;

    const today=new Date();

    const todayString=today.toDateString();

    const todayCount=allLeads.filter(lead=>

        new Date(lead.createdAt).toDateString()===todayString

    ).length;

    document.getElementById("todayLeads").textContent=todayCount;

    const weekAgo=new Date();

    weekAgo.setDate(today.getDate()-7);

    const weekCount=allLeads.filter(lead=>

        new Date(lead.createdAt)>=weekAgo

    ).length;

    document.getElementById("weekLeads").textContent=weekCount;

    const monthCount=allLeads.filter(lead=>{

        const d=new Date(lead.createdAt);

        return d.getMonth()===today.getMonth()
        && d.getFullYear()===today.getFullYear();

    }).length;

    document.getElementById("monthLeads").textContent=monthCount;

}

function searchLeads(){

    const value=document
    .getElementById("search")
    .value
    .toLowerCase();

    const filtered=allLeads.filter(lead=>{

        return (

            lead.name.toLowerCase().includes(value)

            ||

            lead.phone.toLowerCase().includes(value)

            ||

            lead.project.toLowerCase().includes(value)

            ||

            lead.message.toLowerCase().includes(value)

        );

    });

    renderTable(filtered);

}

document
.getElementById("search")
.addEventListener("input",searchLeads);

document
.getElementById("refresh")
.addEventListener("click",loadLeads);

loadLeads();

setInterval(loadLeads,30000);
