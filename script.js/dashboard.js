if (!auth || !db) {
  console.error("Firebase auth or db not defined");
}

function toNumber(v) {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace("%", ""));
  return isNaN(n) ? 0 : n;
}

// Profile render
function renderProfile(data) {
  const full = ((data.firstName || "") + " " + (data.lastName || "")).trim();
  document.getElementById("fullName").textContent = full || "—";
  document.getElementById("welcomeName").textContent = `Welcome, ${data.firstName || ""}`;
  document.getElementById("email").textContent = data.email || "—";
  document.getElementById("mobile").textContent = data.mobile || "—";
  document.getElementById("interest").textContent = data.interest || "—";
  document.getElementById("location").textContent = data.location || "—";
  document.getElementById("cgpa").textContent = data.cgpa ? data.cgpa.toFixed(2) : "—";
  document.getElementById("tenthPercentage").textContent = data.tenthPercent || "—";
  document.getElementById("twelfthPercentage").textContent = data.twelfthPercent || "—";
  document.getElementById("twelfthStream").textContent = data.twelfthStream || "—";
}

// Aptitude block
function renderAptitudeFromUser(data) {
  const container = document.getElementById("aptitudeStatus");
  container.innerHTML = "";

  if (!data.testCompleted) {
    container.innerHTML = `<p>Your aptitude test is pending.</p>
      <a class="btn" href="aptitude-test.html">Take Aptitude Test</a>`;
    document.getElementById("aptitudeAction").textContent = "Take Aptitude";
    return;
  }

  const score = data.aptitudeScore ?? "—";
  const total = data.totalQuestions ?? 0;
  const percent = total > 0 ? ((score / total) * 100).toFixed(2) : "—";

  container.innerHTML = `
    <p><strong>Score:</strong> ${score} / ${total}</p>
    <p><strong>Percentage:</strong> ${percent}%</p>
  `;
  document.getElementById("aptitudeAction").textContent = "";
}

// Career recommendations
function renderCareerRecommendations(interest, cgpa) {
  const list = document.getElementById("careerRecommendations");
  list.innerHTML = "";

  let arr = [];
  const g = cgpa || 0;

  const MAP = {
    "Engineering": g >= 9
      ? ["Computer Science", "AI/ML"]
      : g >= 8
      ? ["Cybersecurity", "Electronics"]
      : ["Mechanical", "Civil"],

    "Medicine": g >= 9
      ? ["MBBS", "Cardiology"]
      : g >= 8
      ? ["BDS", "Pharmacy"]
      : ["Nursing", "Physiotherapy"],

    "Commerce": g >= 9
      ? ["Finance", "International Business"]
      : g >= 8
      ? ["Marketing", "HR Management"]
      : ["Accounting", "Retail Management"],

    "Arts": g >= 9
      ? ["Fine Arts", "Literature"]
      : g >= 8
      ? ["History", "Political Science"]
      : ["Sociology", "Education"]
  };

  arr = MAP[interest] || [`${interest} - Option 1`, `${interest} - Option 2`];

  arr.forEach(branch => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div>
        <strong>${branch}</strong>
        <div class="muted small">Career path suggestion</div>
      </div>
    `;
    list.appendChild(el);
  });
}

// Stream mapping
const streamDisplayMapping = {
  "engg": "Engineering",
  "med": "Medical",
  "law": "Law",
  "comm": "Commerce"
};
const streamMapping = {
  "engineering": "engg",
  "medical": "med",
  "law": "law",
  "commerce": "comm"
};

// College recommendations
async function fetchCollegeRecommendations(userData) {
  const collegesList = document.getElementById("college-list");
  if (!collegesList) {
    console.warn("college-list element not found in DOM.");
    return;
  }

  try {
    const userStreamCode = streamMapping[userData.interest.toLowerCase()] || userData.interest.toLowerCase();
    const collegeSnapshot = await db.collection("colleges").get();
    const colleges = collegeSnapshot.docs.map(doc => doc.data());

    const filtered = colleges.filter(college => {
      return (
        college.stream.toLowerCase() === userStreamCode &&
        Number(userData.cgpa) >= Number(college.minCgpa) &&
        college.location.toLowerCase() === userData.location.toLowerCase()
      );
    });

    if (filtered.length === 0) {
      collegesList.innerHTML = "<p>No recommended colleges found based on your profile.</p>";
    } else {
      collegesList.innerHTML = filtered.map(college => {
        const streamFull = streamDisplayMapping[college.stream.toLowerCase()] || college.stream;
        return `
          <div class="college-card">
            <h3>${college.name}</h3>
            <p><strong>Stream:</strong> ${streamFull}</p>
            <p><strong>Address:</strong> ${college.address}</p>
            <p><strong>Eligibility:</strong> ${college.eligibility}</p>
            <p><strong>Location:</strong> ${college.location}</p>
          </div>
        `;
      }).join("");
    }

  } catch (error) {
    console.error("Error fetching recommended colleges:", error);
    collegesList.innerHTML = "<p>Error loading colleges.</p>";
  }
}

// Deadlines
function fetchDeadlines() {
  const list = document.getElementById("deadlinesList");
  list.innerHTML = "Loading...";

  db.collection("deadlines").orderBy("date").limit(10).get()
    .then(snapshot => {
      if (snapshot.empty) {
        const deadlineDate = new Date("July 31, 2025 23:59:59");
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>College Admission Start Now 2025</strong><br>
          Last Date: ${deadlineDate.toLocaleDateString()}<br>
          ⏳ Time Left: <span id="countdown"></span>
        `;
        list.innerHTML = "";
        list.appendChild(li);

        function updateCountdown() {
          const now = new Date();
          const distance = deadlineDate - now;
          if (distance <= 0) {
            document.getElementById("countdown").textContent = "Admissions Closed";
            return;
          }
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          document.getElementById("countdown").textContent = `${days} days ${hours} hrs ${minutes} min`;
        }
        updateCountdown();
        setInterval(updateCountdown, 60000);
        return;
      }

      list.innerHTML = "";
      snapshot.forEach(doc => {
        const d = doc.data();
        const title = d.title || "Deadline";
        const date = d.date ? new Date(d.date) : null;
        const li = document.createElement("li");
        li.innerHTML = date ? `${title} — ${date.toLocaleDateString()}` : `${title} — TBD`;
        list.appendChild(li);
      });
    })
    .catch(() => {
      list.innerHTML = `<li>Failed to load deadlines</li>`;
    });
}

// Progression Tracker
async function fetchProgressionTracker(userId) {
  const progressContainer = document.getElementById("progressTracker");
  if (!progressContainer) return;

  try {
    let appliedCount = 0;

    // 🔹 Step 1: Try reading as array field
    const userDoc = await db.collection("users").doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (Array.isArray(userData.appliedColleges)) {
        appliedCount = userData.appliedColleges.length;
      }
    }

    // 🔹 Step 2: If no array data found, check subcollection
    if (appliedCount === 0) {
      const appliedSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("appliedColleges")
        .get();
      appliedCount = appliedSnapshot.size;
    }

    // 🔹 Step 3: Get total colleges count
    const totalSnapshot = await db.collection("colleges").get();
    const totalCount = totalSnapshot.size;

    // 🔹 Step 4: Calculate percentage
    const percent = totalCount > 0 ? ((appliedCount / totalCount) * 100).toFixed(1) : 0;

    // 🔹 Step 5: Show in UI
    progressContainer.innerHTML = `
      <p><strong>Applied:</strong> ${appliedCount} / ${totalCount} colleges</p>
      <div style="background:#eee;width:100%;height:20px;border-radius:10px;overflow:hidden;">
        <div style="background:#4caf50;width:${percent}%;height:100%;"></div>
      </div>
      <p>${percent}% completed</p>
    `;
  } catch (err) {
    console.error("Error loading progression tracker:", err);
    progressContainer.innerHTML = `<p>Unable to load progress</p>`;
  }
}


// Main auth
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  try {
    const uid = user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      renderProfile(userData);
      renderAptitudeFromUser(userData);
      renderCareerRecommendations(userData.interest || "", userData.cgpa || 0);
      fetchCollegeRecommendations(userData);
      fetchDeadlines();
      fetchProgressionTracker(uid); // ✅ Added progression tracker
    } else {
      renderProfile({});
    }
    document.getElementById("logoutBtn").addEventListener("click", () => {
      auth.signOut().then(() => window.location.href = "login.html");
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
});
