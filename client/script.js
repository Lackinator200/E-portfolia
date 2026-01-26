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