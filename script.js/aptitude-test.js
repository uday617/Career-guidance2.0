firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  const form = document.getElementById("aptitude-form");
  const questionsContainer = document.getElementById("questions-container");
  const resultDiv = document.getElementById("result");
  const streamTitle = document.getElementById("stream-title");
  const timerDiv = document.getElementById("timer");

  let correctAnswers = [];
  let totalQuestions = 0;
  let timerInterval;
  let totalTime = 30 * 60; 

  //  STEP 1: Check if user-details are filled
  firebase.firestore().collection("users").doc(userId).get().then((doc) => {
    if (!doc.exists) {
      alert("Please fill your details before taking the test.");
      window.location.href = "user-details.html";
      return;
    }

    const userData = doc.data();

    // Check for important fields
    if (!userData.firstName || !userData.lastName || !userData.interest) {
      alert("Please fill your details before taking the test.");
      window.location.href = "user-details.html";
      return;
    }

    // If test already completed, skip to location page
    if (userData.testCompleted) {
      window.location.href = "location.html";
      return;
    }

    const interestRaw = userData?.interest || "general";
    const interest = interestRaw.toLowerCase();
    streamTitle.innerText = `Aptitude Test for ${interestRaw}`;

    // Step 2: Fetch questions for that interest
    firebase.firestore().collection("aptitude_tests")
      .where("stream", "==", interest)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          questionsContainer.innerHTML = "<p>No questions available for this stream.</p>";
          return;
        }

        const questions = [];
        querySnapshot.forEach((doc) => {
          const qData = doc.data();
          questions.push(qData);
        });

        totalQuestions = questions.length;

        questions.forEach((q, index) => {
          const questionBlock = document.createElement("div");
          questionBlock.className = "question-block";
          questionBlock.innerHTML = `<h4>Q${index + 1}. ${q.question}</h4>`;

          correctAnswers.push(q.correct);

          for (let key in q.options) {
            const id = `q${index}_opt${key}`;
            const radio = `
              <div class="option">
                <input type="radio" name="q${index}" value="${key}" id="${id}">
                <label for="${id}">${q.options[key]}</label>
              </div>
            `;
            questionBlock.innerHTML += radio;
          }

          questionsContainer.appendChild(questionBlock);
        });

        // Start timer after rendering
        startTimer();
      });
  });

  function startTimer() {
    timerInterval = setInterval(() => {
      if (totalTime <= 0) {
        clearInterval(timerInterval);
        submitTest(true); // Auto submit
      } else {
        totalTime--;
        const min = String(Math.floor(totalTime / 60)).padStart(2, "0");
        const sec = String(totalTime % 60).padStart(2, "0");
        timerDiv.innerText = `Time Left: ${min}:${sec}`;
      }
    }, 1000);
  }

  function submitTest(autoSubmit = false) {
    clearInterval(timerInterval);
    let score = 0;
    let correct = 0;
    let wrong = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const selected = form.querySelector(`input[name="q${i}"]:checked`)?.value;
      if (selected) {
        if (selected === correctAnswers[i]) {
          score++;
          correct++;
        } else {
          wrong++;
        }
      } else {
        wrong++; 
      }
    }

    const cgpa = ((score / totalQuestions) * 10).toFixed(2);

    // Clear questions and show results
    questionsContainer.innerHTML = "";
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `
      <h3>Test ${autoSubmit ? 'Auto-Submitted' : 'Submitted'}!</h3>
      <p>Total Questions: ${totalQuestions}</p>
      <p>Correct Answers: ${correct}</p>
      <p>Wrong Answers: ${wrong}</p>
      <p>Score: ${score}/${totalQuestions}</p>
      <p>Estimated CGPA: <strong>${cgpa}</strong></p>
    `;

    //  Save result in Firebase
    firebase.firestore().collection("users").doc(userId).set({
      aptitudeScore: score,
      totalQuestions: totalQuestions,
      cgpa: parseFloat(cgpa),
      testCompleted: true
    }, { merge: true })
    .then(() => {
      console.log("Aptitude score saved successfully!");
    })
    .catch(err => console.error("Error saving score:", err));

    // Hide original Submit button
    const submitBtn = document.querySelector("#aptitude-form button[type='submit']");
    if (submitBtn) submitBtn.style.display = "none";

    //  Add "Next" button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.marginTop = "20px";
    nextBtn.className = "btn btn-primary";
    nextBtn.onclick = function () {
      window.location.href = "location.html";
    };
    resultDiv.appendChild(nextBtn);
  }

  // Manual Submit Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitTest(false); 
  });
});
