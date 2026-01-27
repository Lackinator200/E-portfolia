// User profile management
const userDisplay = document.getElementById('userDisplay');
const descriptionDisplay = document.getElementById('descriptionDisplay');
const userIcon = document.getElementById('userIcon');

const nameInput = document.getElementById('nameInput');
const descriptionInput = document.getElementById('descriptionInput');
const changeNameBtn = document.getElementById('changeName');
const changeDescriptionBtn = document.getElementById('changeDescription');
const changeIconBtn = document.getElementById('changeIconBtn');
const iconUpload = document.getElementById('iconUpload');

// Load user data from localStorage
function loadUserData() {
  const savedUsername = localStorage.getItem('username') || 'Waseem';
  const savedDescription = localStorage.getItem('userDescription') || 'N/A';
  const savedIcon = localStorage.getItem('userIcon');
  
  userDisplay.textContent = savedUsername;
  descriptionDisplay.textContent = savedDescription;
  
  if (savedIcon) {
    userIcon.src = savedIcon;
  }
}

// Change username
changeNameBtn.addEventListener('click', () => {
  const newName = nameInput.value.trim();
  
  if (!newName) {
    alert('Please enter a username');
    return;
  }
  
  if (newName.length < 2) {
    alert('Username must be at least 2 characters');
    return;
  }
  
  localStorage.setItem('username', newName);
  userDisplay.textContent = newName;
  nameInput.value = '';
  alert('Username updated successfully!');
});

// Change description
changeDescriptionBtn.addEventListener('click', () => {
  const newDescription = descriptionInput.value.trim();
  
  if (!newDescription) {
    alert('Please enter a description');
    return;
  }
  
  localStorage.setItem('userDescription', newDescription);
  descriptionDisplay.textContent = newDescription;
  descriptionInput.value = '';
  alert('Description updated successfully!');
});

// Change icon
changeIconBtn.addEventListener('click', () => {
  iconUpload.click();
});

iconUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const imageData = event.target.result;
    localStorage.setItem('userIcon', imageData);
    userIcon.src = imageData;
    alert('Icon updated successfully!');
  };
  
  reader.readAsDataURL(file);
});

// Allow Enter key to save
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    changeNameBtn.click();
  }
});

descriptionInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    changeDescriptionBtn.click();
  }
});

// Initialize on page load
loadUserData();
