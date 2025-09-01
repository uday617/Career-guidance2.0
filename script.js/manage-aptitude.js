window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aptitudeForm");
  const questionList = document.getElementById("questionList");
  const submitBtn = document.querySelector("button[type='submit']");

  let editId = null;

  //  Load and group questions by stream
  function loadQuestions() {
    questionList.innerHTML = "<h3>All Questions</h3>";

    db.collection("aptitude_tests").get().then((snapshot) => {
      if (snapshot.empty) {
        questionList.innerHTML += "<p>No questions found.</p>";
        return;
      }

      const grouped = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const stream = data.stream;

        if (!grouped[stream]) grouped[stream] = [];
        grouped[stream].push({ id: doc.id, data });
      });

      Object.keys(grouped).forEach((stream) => {
        const streamCard = document.createElement("div");
        streamCard.className = "stream-card";
        streamCard.innerHTML = `<h2>Stream: ${stream}</h2>`;

        grouped[stream].forEach(({ id, data }) => {
          const qCard = document.createElement("div");
          qCard.className = "question-card";
          qCard.innerHTML = `
            <p><strong>Question:</strong> ${data.question}</p>
            <ul>
              <li>A: ${data.options.A}</li>
              <li>B: ${data.options.B}</li>
              <li>C: ${data.options.C}</li>
              <li>D: ${data.options.D}</li>
            </ul>
            <p><strong>Correct Answer:</strong> ${data.correct}</p>
            <div class="actions">
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Delete</button>
            </div>
          `;

          // Edit logic
          qCard.querySelector(".edit-btn").addEventListener("click", () => {
            document.getElementById("stream").value = data.stream;
            document.getElementById("question").value = data.question;
            document.getElementById("optionA").value = data.options.A;
            document.getElementById("optionB").value = data.options.B;
            document.getElementById("optionC").value = data.options.C;
            document.getElementById("optionD").value = data.options.D;
            document.getElementById("correctOption").value = data.correct;
            editId = id;
            submitBtn.textContent = "Update Question";
          });

          // Delete logic
          qCard.querySelector(".delete-btn").addEventListener("click", () => {
            if (confirm("Delete this question?")) {
              db.collection("aptitude_tests").doc(id).delete().then(loadQuestions);
            }
          });

          streamCard.appendChild(qCard);
        });

        questionList.appendChild(streamCard);
      });
    });
  }

  //  Form Submission 
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const stream = document.getElementById("stream").value.trim();
    const question = document.getElementById("question").value.trim();
    const optionA = document.getElementById("optionA").value.trim();
    const optionB = document.getElementById("optionB").value.trim();
    const optionC = document.getElementById("optionC").value.trim();
    const optionD = document.getElementById("optionD").value.trim();
    const correct = document.getElementById("correctOption").value.trim();

    const data = {
      stream,
      question,
      options: { A: optionA, B: optionB, C: optionC, D: optionD },
      correct,
    };

    if (editId) {
      db.collection("aptitude_tests").doc(editId).update(data).then(() => {
        resetForm();
        loadQuestions();
      });
    } else {
      db.collection("aptitude_tests").add(data).then(() => {
        resetForm();
        loadQuestions();
      });
    }
  });

  function resetForm() {
    form.reset();
    editId = null;
    submitBtn.textContent = "Add Question";
  }

  loadQuestions();
});
