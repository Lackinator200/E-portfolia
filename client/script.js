

const whatAreSection = document.querySelector('.what-are');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const whatArePosition = whatAreSection.offsetTop + whatAreSection.offsetHeight / 2;
    
    if (scrollPosition > whatArePosition) {
        whatAreSection.classList.add('visible');
    }
    else {
        whatAreSection.classList.remove('visible');
    }
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