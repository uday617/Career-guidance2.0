window.addEventListener("DOMContentLoaded", () => {
    const adminEmail = "admin@gmail.com";

    if (!window.auth) {
        console.error("Firebase not initialized");
        return;
    }

    //  Auth check
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        } else if (user.email !== adminEmail) {
            alert("Access denied. Admins only.");
            window.location.href = "home.html";
        } else {
            console.log("Welcome admin:", user.email);
        }
    });

    //  Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth.signOut().then(() => {
                window.location.href = "home.html";
            });
        });
    }

    //  View Registered Users → fetch from Firestore
    const viewUsersBtn = document.getElementById("viewUsersBtn");
    if (viewUsersBtn) {
        viewUsersBtn.addEventListener("click", async () => {
            const userListDiv = document.getElementById("userList");
            userListDiv.innerHTML = "<h3>Registered Users</h3>";

            try {
                const snapshot = await db.collection("users").get();

                if (snapshot.empty) {
                    userListDiv.innerHTML += "<p>No users found.</p>";
                    return;
                }

                snapshot.forEach((doc) => {
                    const user = doc.data();
                    const userCard = `
            <div class="user-card">
              <strong>Email:</strong> ${user.email || 'N/A'}<br/>
              <strong>Name:</strong> ${user.name || 'N/A'}<br/>
              <strong>UID:</strong> ${doc.id}
            </div>
          `;
                    userListDiv.innerHTML += userCard;
                });
            } catch (error) {
                console.error("Error getting users:", error);
                userListDiv.innerHTML += `<p>Error: ${error.message}</p>`;
            }
        });
    }
});
const manageAptitudeBtn = document.getElementById("manageAptitudeBtn");
if (manageAptitudeBtn) {
    manageAptitudeBtn.addEventListener("click", () => {
        window.location.href = "manage-aptitude.html";
    });
}



const collegeForm = document.querySelector(".add-college-form");
const collegeList = document.getElementById("collegeList");
const collegeFormElem = document.getElementById("collegeForm");
const submitBtn = document.getElementById("submitCollegeBtn");

// Toggle form
document.querySelector(".admin-actions button").addEventListener("click", () => {
    collegeForm.style.display = collegeForm.style.display === "none" ? "block" : "none";
});

let editId = null;

// Submit form
collegeFormElem.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("collegeName").value.trim();
    const stream = document.getElementById("stream").value.trim();
    const location = document.getElementById("location").value.trim();
    const eligibility = document.getElementById("eligibility").value.trim();
    const address = document.getElementById("address").value.trim();
    const minCgpa = parseFloat(document.getElementById("minCgpa").value.trim());
    const detailsUrl = document.getElementById("detailsUrl").value.trim();
    const applyUrl = document.getElementById("applyUrl").value.trim();

    const data = { name, stream, location, eligibility, address, minCgpa, detailsUrl, applyUrl };

    if (editId) {
        window.db.collection("colleges").doc(editId).update(data).then(() => {
            resetForm();
            loadColleges();
        });
    } else {
        window.db.collection("colleges").add(data).then(() => {
            resetForm();
            loadColleges();
        });
    }
});


function resetForm() {
    collegeFormElem.reset();
    editId = null;
    submitBtn.textContent = "Add College";
}

// Load colleges
function loadColleges() {
    collegeList.innerHTML = "";
    window.db.collection("colleges").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const college = doc.data();
            const div = document.createElement("div");
            div.className = "college-card";
            div.innerHTML = `
                <h3>${college.name}</h3>
                <p><strong>Stream:</strong> ${college.stream}</p>
                <p><strong>Location:</strong> ${college.location}</p>
                <p><strong>Address:</strong> ${college.address}</p>
                <p><strong>Eligibility:</strong> ${college.eligibility}</p>
                <p><strong>Min CGPA:</strong> ${college.minCgpa}</p>
                <div class="actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    ${college.detailsUrl ? `<button class="details-btn">View Details</button>` : ""}
                    ${college.applyUrl ? `<button class="apply-btn">Apply Now</button>` : ""}
                </div>
            `;

            div.querySelector(".edit-btn").addEventListener("click", () => {
                collegeForm.style.display = "block";
                document.getElementById("collegeName").value = college.name;
                document.getElementById("stream").value = college.stream;
                document.getElementById("location").value = college.location;
                document.getElementById("eligibility").value = college.eligibility;
                document.getElementById("address").value = college.address;
                document.getElementById("minCgpa").value = college.minCgpa;
                document.getElementById("detailsUrl").value = college.detailsUrl || "";
                document.getElementById("applyUrl").value = college.applyUrl || "";
                editId = doc.id;
                submitBtn.textContent = "Update College";
            });

            div.querySelector(".delete-btn").addEventListener("click", () => {
                if (confirm("Delete this college?")) {
                    window.db.collection("colleges").doc(doc.id).delete().then(loadColleges);
                }
            });

            if (college.detailsUrl) {
                div.querySelector(".details-btn").addEventListener("click", () => {
                    window.open(college.detailsUrl, "_blank");
                });
            }
            if (college.applyUrl) {
                div.querySelector(".apply-btn").addEventListener("click", () => {
                    window.open(college.applyUrl, "_blank");
                });
            }

            collegeList.appendChild(div);
        });
    });
}


loadColleges();

