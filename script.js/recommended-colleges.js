const collegesList = document.getElementById("college-list");

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

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    collegesList.innerHTML = "<p>Please log in to see recommendations.</p>";
    return;
  }

  try {
    // User profile
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      collegesList.innerHTML = "<p>User profile not found.</p>";
      return;
    }

    const userData = userDoc.data();
    const appliedColleges = userData.appliedColleges || [];

    // User stream
    const userStreamCode = streamMapping[userData.interest.toLowerCase()] || userData.interest.toLowerCase();

    // Fetch colleges
    const collegeSnapshot = await db.collection("colleges").get();
    const colleges = collegeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter based on profile
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
        const alreadyApplied = appliedColleges.some(c => c.id === college.id);

        return `
          <div class="college-card">
            <h3>${college.name}</h3>
            <p><strong>Stream:</strong> ${streamFull}</p>
            <p><strong>Address:</strong> ${college.address}</p>
            <p><strong>Eligibility:</strong> ${college.eligibility}</p>
            <p><strong>Location:</strong> ${college.location}</p>
            <div class="college-buttons">
              <a href="${college.detailsUrl}" target="_blank" class="btn btn-details">View Details</a>
              <a href="${college.applyUrl}" 
                 class="btn btn-apply ${alreadyApplied ? 'disabled' : ''}" 
                 onclick="applyToCollege(event, '${college.id}', '${college.name}', ${alreadyApplied}, '${college.applyUrl}')">
                 ${alreadyApplied ? 'Applied' : 'Apply Now'}
              </a>
            </div>
          </div>
        `;
      }).join("");
    }

  } catch (error) {
    console.error("Error fetching recommended colleges:", error);
    collegesList.innerHTML = "<p>Error loading colleges.</p>";
  }
});

async function applyToCollege(e, collegeId, collegeName, alreadyApplied, applyUrl) {
  e.preventDefault(); 

  const user = auth.currentUser;
  if (!user) {
    alert("Please login first.");
    return;
  }

  try {
    if (!alreadyApplied) {
      const userRef = db.collection("users").doc(user.uid);
      await userRef.update({
        appliedColleges: firebase.firestore.FieldValue.arrayUnion({
          id: collegeId,
          name: collegeName,
          appliedAt: new Date()
        })
      });
      alert(`Applied to ${collegeName}`);
    } else {
      alert("You have already applied to this college.");
    }

    //  Always redirect after click
    window.location.href = applyUrl;

  } catch (err) {
    console.error("Error applying to college:", err);
    alert("Something went wrong. Please try again.");
  }
}
