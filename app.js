const API_URL =
"https://script.google.com/macros/s/AKfycbwv0jTKV2cWw-wB9DyhncSr3P3I32yIbtHwsr_mGYfjesHaXmsL4QzBEwXMsWM-l6AGiw/exec";

async function loadLeads() {
  try {
    const response = await fetch(API_URL);

    const leads = await response.json();

    const tbody =
      document.querySelector("#leadsTable tbody");

    tbody.innerHTML = "";

    leads.reverse().forEach(lead => {
      tbody.innerHTML += `
        <tr>
          <td>${lead.createdAt}</td>
          <td>${lead.name}</td>
          <td>${lead.phone}</td>
          <td>${lead.project}</td>
          <td>${lead.budget}</td>
          <td>${lead.message}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error(error);
  }
}

loadLeads();
