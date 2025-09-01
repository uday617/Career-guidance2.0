// Get references
const locationBtns = document.querySelectorAll('.location-btn');
const countrySelectContainer = document.getElementById('countrySelectContainer');
const countrySelect = document.getElementById('country');

let selectedLocationType = '';


locationBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLocationType = btn.dataset.location;

    
    locationBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (selectedLocationType === 'Abroad') {
      countrySelectContainer.style.display = 'block';
    } else {
      saveLocationAndRedirect('India');
    }
  });
});


countrySelect.addEventListener('change', () => {
  if (countrySelect.value) {
    saveLocationAndRedirect(countrySelect.value);
  }
});

// Save to Firebase and redirect
async function saveLocationAndRedirect(locationValue) {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('No user logged in.');
      return;
    }

    await firebase.firestore().collection('users').doc(user.uid).set({
      location: locationValue
    }, { merge: true });

    console.log('Location saved:', locationValue);
    window.location.href = 'recommended-colleges.html';

  } catch (error) {
    console.error('Error saving location:', error);
    alert('Error saving location. Please try again.');
  }
}

// Auth state check
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  }
});
