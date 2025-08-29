window.addEventListener("DOMContentLoaded", () => {
  const collegeContainer = document.getElementById("collegeContainer");

  db.collection("colleges").get().then(snapshot => {
    if (snapshot.empty) {
      collegeContainer.innerHTML = `<p>No colleges found.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "college-card";
      card.innerHTML = `
        <h2>${data.name}</h2>
        <p><strong>Stream:</strong> ${data.stream}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Eligibility:</strong> ${data.eligibility}</p>
      `;
      collegeContainer.appendChild(card);
    });
  }).catch(err => {
    collegeContainer.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  });
});
