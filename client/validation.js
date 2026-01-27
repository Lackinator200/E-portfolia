const form = document.getElementById('form');
const fullname_input = document.getElementById('fullname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const confirm_password_input = document.getElementById('confirm-password-input');
const error_message = document.getElementById('error-message');

// Clear error styling when user starts typing
[fullname_input, email_input, password_input, confirm_password_input].forEach(input => {
    input.addEventListener('input', () => {
        input.parentElement.classList.remove('incorrect');
    });
});

fetch("http://localhost:3000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username,
    email,
    password
  })
})
.then(res => {
  if (!res.ok) throw new Error("Signup failed");
  window.location.href = "login.html";
})
.catch(err => alert(err.message));

fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem("token", data.token);
  window.location.href = "group.html";
})
.catch(() => alert("Login failed"));

form.addEventListener('submit', (e) => {
    // e.preventDefault() prevent submit
    let error = [];

    const fullname_value = fullname_input.value.trim();
    const email_value = email_input.value.trim();
    const password_value = password_input.value.trim();
    const confirm_password_value = confirm_password_input.value.trim();

    if (fullname_value) {
        error = getSignupFormErrors(fullname_input.value, email_input.value, password_input.value, confirm_password_input.value);
    }
    else {
        error = getLoginFormErrors(email_input.value, password_input.value);
    }
    if (error.length > 0) {
        e.preventDefault();
        const error_message_element = document.getElementById('error-message');
        error_message_element.innerText = error.join('\n');
    }
});

function getSignupFormErrors(fullname, email, password, confirm_password) { 
    let error = [];

    if (fullname == '' || fullname == null) {
        error.push('Full name is required.');
        fullname_input.parentElement.classList.add('incorrect');
    }

    if (email == '' || email == null) {
        error.push('Email is required.');
        email_input.parentElement.classList.add('incorrect');
    }
    else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        error.push('Email is not valid.');
        email_input.parentElement.classList.add('incorrect');
    }

    if (password == '' || password == null) {
        error.push('Password is required.');
        password_input.parentElement.classList.add('incorrect');
    }
    else if (password.length < 6) {
        error.push('Password must be at least 6 characters long.');
        password_input.parentElement.classList.add('incorrect');
    }
    if (confirm_password != password) {
        error.push('Passwords do not match.');
        confirm_password_input.parentElement.classList.add('incorrect');
    }

    return error;
}

function getLoginFormErrors(email, password) { 
    let error = [];
    if (email == '' || email == null) {
        error.push('Email is required.');
        email_input.parentElement.classList.add('incorrect');
    }
    if (password == '' || password == null) {
        error.push('Password is required.');
        password_input.parentElement.classList.add('incorrect');
    }
    else if (password.length < 6) {
        error.push('Password must be at least 6 characters long.');
        password_input.parentElement.classList.add('incorrect');
    }
    return error;
}

const allInputs = [fullname_input, email_input, password_input, confirm_password_input].filter(input => input !== null);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
        }
    });
});

fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem("token", data.token);
  window.location.href = "group.html";
});