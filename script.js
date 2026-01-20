const appearImageBackground = document.querySelector('.info');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const imagePosition = appearImageBackground.offsetTop + appearImageBackground.offsetHeight / 2;
    if (scrollPosition > imagePosition) {
        appearImageBackground.classList.add('visible');
    }
    else {
        appearImageBackground.classList.remove('visible');
    }
});