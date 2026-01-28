

const whatAreSection = document.querySelector('.what-are');
const navBar = document.querySelector('.nav-Bar');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const whatArePosition = whatAreSection.offsetTop + whatAreSection.offsetHeight / 2;
    
    if (scrollPosition > whatArePosition) {
        whatAreSection.classList.add('visible');
    }
    else {
        whatAreSection.classList.remove('visible');
    }
    
    // Navbar hide/show on scroll
    let currentScroll = window.scrollY;
    
    if (currentScroll > lastScrollTop) {
        // Scrolling down
        navBar.classList.add('hide');
    } else {
        // Scrolling up
        navBar.classList.remove('hide');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

