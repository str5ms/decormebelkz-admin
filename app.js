const API_URL =
"https://script.google.com/macros/s/AKfycbynFkaT0LCPYz5NiK__CWfoJ8dSQ6-8nz9ZzzgtAipnnxb51P4T8sj9d9BSe1TL3qDVgw/exec";

let allLeads = [];

/* ===========================
   Загрузка заявок
=========================== */

async function loadLeads() {

    const tbody = document.querySelector("#leadsTable tbody");

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                ⏳ Загрузка заявок...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(API_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const data = await response.json();

        allLeads = Array.isArray(data) ? data : [];

        allLeads.sort((a, b) => {

            const first = new Date(b.createdAt || 0);
            const second = new Date(a.createdAt || 0);

            return first - second;

        });

        updateStats();

        renderTable(allLeads);

    }

    catch (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    ❌ Не удалось загрузить заявки
                </td>
            </tr>
        `;

    }

}

/* ===========================
   Таблица
=========================== */

function renderTable(leads) {

    const tbody = document.querySelector("#leadsTable tbody");

    if (!leads.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    📭 Пока нет заявок
                </td>
            </tr>
        `;

        return;

    }

    let html = "";

    leads.forEach(lead => {

        const phone = (lead.phone || "")
            .replace(/\D/g, "");

        html += `

<tr>

<td>

${formatDate(lead.createdAt)}

</td>

<td>

<strong>${lead.name || "-"}</strong>

</td>

<td>

${
phone
?
`<a href="tel:${phone}">
${lead.phone}
</a>`
:
"-"
}

</td>

<td>

${lead.project || "-"}

</td>

<td>

${lead.budget || "-"}

</td>

<td>

${lead.message || "-"}

</td>

<td>

<div class="actions">

${
phone
?
`
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
rel="noopener noreferrer"
title="WhatsApp">

💬

</a>
`
:
"-"
}

</div>

</td>

</tr>

`;

    });

    tbody.innerHTML = html;

}
/* ===========================
   Формат даты
=========================== */

function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return date;
    }

    return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}

/* ===========================
   Статистика
=========================== */

function updateStats() {

    const total = allLeads.length;

    document.getElementById("totalLeads").textContent = total;

    const today = new Date();

    const todayCount = allLeads.filter(lead => {

        if (!lead.createdAt) return false;

        const d = new Date(lead.createdAt);

        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );

    }).length;

    document.getElementById("todayLeads").textContent = todayCount;

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const weekCount = allLeads.filter(lead => {

        if (!lead.createdAt) return false;

        return new Date(lead.createdAt) >= weekAgo;

    }).length;

    document.getElementById("weekLeads").textContent = weekCount;

    const monthCount = allLeads.filter(lead => {

        if (!lead.createdAt) return false;

        const d = new Date(lead.createdAt);

        return (
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );

    }).length;

    document.getElementById("monthLeads").textContent = monthCount;

}

/* ===========================
   Поиск
=========================== */

function searchLeads() {

    const value = document
        .getElementById("search")
        .value
        .trim()
        .toLowerCase();

    if (!value) {
        renderTable(allLeads);
        return;
    }

    const filtered = allLeads.filter(lead => {

        return [

            lead.name,
            lead.phone,
            lead.project,
            lead.budget,
            lead.message,
            lead.createdAt

        ].some(field =>

            String(field || "")
                .toLowerCase()
                .includes(value)

        );

    });

    renderTable(filtered);

}
/* ===========================
   Обработчики
=========================== */

const searchInput = document.getElementById("search");
const refreshButton = document.getElementById("refresh");

if (searchInput) {

    searchInput.addEventListener("input", searchLeads);

}

if (refreshButton) {

    refreshButton.addEventListener("click", loadLeads);

}

/* ===========================
   Автообновление
=========================== */

let refreshInterval = null;

function startAutoRefresh() {

    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(async () => {

        const currentSearch = searchInput
            ? searchInput.value.trim()
            : "";

        await loadLeads();

        if (currentSearch && searchInput) {

            searchInput.value = currentSearch;
            searchLeads();

        }

    }, 30000);

}

/* ===========================
   Инициализация
=========================== */

window.addEventListener("DOMContentLoaded", async () => {

    await loadLeads();

    startAutoRefresh();

});

/* ===========================
   Обновление вкладки
=========================== */

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        loadLeads();

    }

});

/* ===========================
   Глобальная обработка ошибок
=========================== */

window.addEventListener("error", (event) => {

    console.error("Ошибка:", event.error || event.message);

});

window.addEventListener("unhandledrejection", (event) => {

    console.error("Promise:", event.reason);

});
