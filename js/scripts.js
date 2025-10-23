document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // --- 1. HEADER & SCROLL PROGRESS BAR ---
    // ======================================================
    const header = document.querySelector('.main-header');
    const progressBar = document.querySelector('.scroll-progress-bar');
    const yearSpan = document.getElementById('currentYear');

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) header.classList.add('visible');
        else header.classList.remove('visible');

        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    });

    // ======================================================
    // --- 2. ANIMATION ON SCROLL ---
    // ======================================================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => animationObserver.observe(el));

    // ======================================================
    // --- 3. SKILLS & AWARDS CAROUSELS ---
    // ======================================================
    const skillsCarousel = document.querySelector('.skills-carousel');
    const skillsCarouselContainer = document.querySelector('.skills-carousel-container');
    const awardsCarousel = document.querySelector('.awards-carousel');
    const awardsCarouselContainer = document.querySelector('.awards-carousel-container');

    const defaultIcon = 'assets/icons/default.png';
    let skillsCarouselControls;
    let awardsCarouselControls;

    // ------------------- Skills Carousel -------------------
    async function fetchAndDisplaySkillsCarousel() {
        if (!skillsCarousel || !skillsCarouselContainer) return;

        const skillsMap = new Map([
            ['HTML', { name: 'HTML', icon: 'assets/icons/html.png' }],
            ['CSS', { name: 'CSS', icon: 'assets/icons/css.png' }],
            ['JavaScript', { name: 'JavaScript', icon: 'assets/icons/javascript.png' }],
            ['TypeScript', { name: 'TypeScript', icon: 'assets/icons/typescript.png' }],
            ['Python', { name: 'Python', icon: 'assets/icons/python.png' }],
            ['Java', { name: 'Java', icon: 'assets/icons/java1.png' }],
            ['PHP', { name: 'PHP', icon: 'assets/icons/php.png' }],
            ['Dart', { name: 'Dart', icon: 'assets/icons/dart.png' }],
            ['Docker', { name: 'Docker', icon: 'assets/icons/docker.png' }],
            ['Git & GitHub', { name: 'Git & GitHub', icon: 'assets/icons/github.png' }],
        ]);

        // Use a hardcoded list of skills instead of fetching from GitHub API
        // This avoids rate limiting and authentication issues.
        const finalSkills = Array.from(skillsMap.values());

        const skillsHTML = finalSkills.map(skill => `
            <div class="skill-item">
                <img src="${skill.icon}" alt="${skill.name}" class="skill-icon">
                <span class="skill-name">${skill.name}</span>
            </div>
        `).join('');

        skillsCarousel.innerHTML = skillsHTML.repeat(4);

        skillsCarouselControls = setupInfiniteScroll(skillsCarouselContainer, skillsCarousel);
        skillsCarouselControls.start();
    }

    // ------------------- Awards Carousel -------------------
    function fetchAndDisplayAwardsCarousel() {
        if (!awardsCarousel || !awardsCarouselContainer) return;

        const awardsData = [
            { image: 'assets/achive.jpg', title: 'Consolation Prize - Youth Pioneering Digital Transformation', description: 'Achieved a consolation prize in a university-wide competition with over 20 teams...' },
            { image: 'assets/full1.PNG', title: 'Google Hash Code 2023 Participant', description: 'Participated in Google Hash Code 2023 solving complex algorithmic problems...' },
            { image: 'assets/full2.PNG', title: 'Microsoft Imagine Cup 2022 National Finalist', description: 'Reached the National Finals with an AI-powered solution for sustainable agriculture...' },
            { image: 'assets/summary.PNG', title: 'Outstanding Academic Achievement Award', description: 'Maintained a GPA of 7.8/10 throughout the Bachelor of Software Engineering program...' },
            { image: 'assets/web v2.0.png', title: 'Best Project Award - Web Development Course', description: 'Developed a responsive e-commerce website praised for innovative design...' }
        ];

        const awardsHTML = awardsData.map(award => `
            <div class="award-item">
                <img src="${award.image}" alt="${award.title}" class="award-image">
                <h3 class="award-title">${award.title}</h3>
                <p class="award-description">${award.description}</p>
            </div>
        `).join('');

        awardsCarousel.innerHTML = awardsHTML.repeat(4);

        awardsCarouselControls = setupInfiniteScroll(awardsCarouselContainer, awardsCarousel);
        awardsCarouselControls.start();
    }

    // ------------------- Infinite Scroll Function (Corrected) -------------------
    function setupInfiniteScroll(container, carousel) {
        if (!container || !carousel) return { start: () => {}, stop: () => {} };

        const copies = 4;
        let sectionWidth;
        let animationId = null;
        let isUserInteracting = false;
        let interactionTimeout;
        const scrollSpeed = 1.0; // Changed from 100.0 to 1.0 for smooth motion
        let isProgrammaticScroll = false;

        function updateSectionWidth() {
            sectionWidth = carousel.scrollWidth / copies;
        }

        // This function is for INSTANT jumps when looping
        function jumpToPosition(targetScrollLeft) {
            isProgrammaticScroll = true; // Tell the scroll listener to ignore this
            container.style.scrollBehavior = 'auto'; // Jump instantly
            container.scrollLeft = targetScrollLeft;
        }

        function autoScroll() {
            if (!isUserInteracting) {
                isProgrammaticScroll = true; // Flag this as a programmatic scroll
                container.style.scrollBehavior = 'auto'; // We are scrolling manually
                container.scrollLeft += scrollSpeed;
            }
            
            // The looping logic is now handled by the 'scroll' event listener

            animationId = requestAnimationFrame(autoScroll);
        }

        function startAutoScroll() {
            if (!animationId) {
                updateSectionWidth();
                container.style.scrollBehavior = 'auto'; // Ensure instantaneous initial positioning
                container.scrollLeft = sectionWidth; // Start at the 2nd copy
                
                // After setting position, enable smooth scroll for USER interactions
                requestAnimationFrame(() => {
                    container.style.scrollBehavior = 'smooth';
                });

                animationId = requestAnimationFrame(autoScroll);
            }
        }

        function stopAutoScroll() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        function handleUserInteraction() {
            isUserInteracting = true;
            clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(() => { isUserInteracting = false; }, 2000);
        }

        container.addEventListener('mousedown', handleUserInteraction);
        container.addEventListener('mousemove', handleUserInteraction);
        container.addEventListener('wheel', handleUserInteraction);
        container.addEventListener('touchstart', handleUserInteraction);
        container.addEventListener('touchmove', handleUserInteraction);
        
        // This 'scroll' listener now handles ALL looping logic
        container.addEventListener('scroll', () => {
            if (isProgrammaticScroll) {
                // If scroll was from autoScroll or jumpToPosition,
                // just reset the flag and do nothing else.
                isProgrammaticScroll = false; 
            } else {
                // Otherwise, it was a USER scroll.
                handleUserInteraction();
            }

            // This logic now runs for EVERY scroll event, which is correct.
            if (container.scrollLeft >= sectionWidth * 2) {
                jumpToPosition(container.scrollLeft - sectionWidth);
            } else if (container.scrollLeft < sectionWidth) {
                jumpToPosition(container.scrollLeft + sectionWidth);
            }
        });

        window.addEventListener('resize', updateSectionWidth);

        return { start: startAutoScroll, stop: stopAutoScroll };
    }

    // Initialize carousels
    fetchAndDisplaySkillsCarousel();
    fetchAndDisplayAwardsCarousel();

    // ======================================================
    // --- 4. MUSIC PLAYER LOGIC ---
    // ======================================================
    const audio = document.getElementById('audio-source');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const songCover = document.getElementById('song-cover');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');

    let currentSongIndex = 0;
    let isPlaying = false;
    
    // NOTE: You must define 'playlist' somewhere for this to work
    // Example: const playlist = [ { title: 'Song 1', artist: 'Artist 1', ... }, ... ];

    function loadSong(song) {
        if (song) {
            songTitle.textContent = song.title;
            songArtist.textContent = song.artist;
            songCover.src = song.coverPath;
            audio.src = song.audioPath;
        }
    }

    function playSong() {
        isPlaying = true;
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
        audio.play();
    }

    function pauseSong() {
        isPlaying = false;
        playPauseBtn.classList.replace('fa-pause', 'fa-play');
        audio.pause();
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(playlist[currentSongIndex]);
        playSong();
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(playlist[currentSongIndex]);
        playSong();
    }

    if (playPauseBtn) playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
    if (nextBtn) nextBtn.addEventListener('click', nextSong);
    if (prevBtn) prevBtn.addEventListener('click', prevSong);
    if (audio) audio.addEventListener('ended', nextSong);

    // Make sure 'playlist' exists and is not empty before loading
    if (typeof playlist !== 'undefined' && playlist.length > 0) {
        loadSong(playlist[currentSongIndex]);
    } else {
        console.warn("Music player 'playlist' is not defined or is empty.");
    }


    // ======================================================
    // --- 5. ACTIVE NAV INDICATOR ---
    // ======================================================
    const navLinks = document.querySelectorAll('.main-nav a');
    const navIndicator = document.querySelector('.nav-indicator');
    const sections = document.querySelectorAll('main section');

    function moveIndicator(targetLink) {
        if (!navIndicator) return;
        if (!targetLink) {
            navIndicator.style.opacity = '0';
            return;
        }
        const linkRect = targetLink.getBoundingClientRect();
        const navRect = targetLink.parentElement.getBoundingClientRect();
        navIndicator.style.width = `${linkRect.width}px`;
        navIndicator.style.left = `${linkRect.left - navRect.left}px`;
        navIndicator.style.opacity = '1';

        navLinks.forEach(link => link.classList.remove('is-active'));
        targetLink.classList.add('is-active');
    }

    navLinks.forEach(link => link.addEventListener('click', e => moveIndicator(e.currentTarget)));

    const navObserverOptions = { rootMargin: "-50% 0px -50% 0px", threshold: 0 };
    const navSectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const correspondingLink = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
                moveIndicator(correspondingLink);
            }
        });
    }, navObserverOptions);

    sections.forEach(section => navSectionObserver.observe(section));

    setTimeout(() => {
        let activeFound = false;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                moveIndicator(document.querySelector(`.main-nav a[href="#${section.id}"]`));
                activeFound = true;
            }
        });
        if (!activeFound && window.scrollY < window.innerHeight / 2) {
            moveIndicator(document.querySelector('.main-nav a[href="#hero"]'));
        }
    }, 200);

    // ======================================================
    // --- 6. LIGHT/DARK THEME TOGGLE ---
    // ======================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) document.body.classList.add(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const theme = document.body.classList.contains('light-mode') ? 'light-mode' : '';
            if (theme) localStorage.setItem('theme', theme);
            else localStorage.removeItem('theme');
        });
    }

});
