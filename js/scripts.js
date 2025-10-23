// Gộp tất cả logic vào MỘT sự kiện DOMContentLoaded duy nhất
document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // --- 1. LOGIC CHUNG & HEADER/PROGRESS BAR ---
    // ======================================================
    const header = document.querySelector('.main-header');
    const progressBar = document.querySelector('.scroll-progress-bar');
    const yearSpan = document.getElementById('currentYear');

    // Cập nhật năm hiện tại trong footer
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Theo dõi sự kiện cuộn trang
    window.addEventListener('scroll', () => {
        // Hiển thị header khi cuộn xuống
        if (window.scrollY > 100) {
            header.classList.add('visible');
        } else {
            header.classList.remove('visible');
        }

        // Cập nhật thanh tiến trình
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    });


    // ======================================================
    // --- 2. LOGIC ANIMATION KHI CUỘN TỚI ---
    // ======================================================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // NÂNG CẤP OBSERVER NÀY
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Nếu phần tử đang ở trong màn hình (isIntersecting là true)
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
            // Nếu phần tử KHÔNG còn ở trong màn hình (isIntersecting là false)
            else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Kích hoạt khi 10% của phần tử đi vào hoặc đi ra
    });

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });


    // ======================================================
    // --- 3. LOGIC CHO SKILLS CAROUSEL ---
    // ======================================================

    const skillsCarousel = document.querySelector('.skills-carousel');
    const skillsCarouselContainer = document.querySelector('.skills-carousel-container');

    // Hàm hiển thị kỹ năng dạng carousel
    async function fetchAndDisplaySkillsCarousel() {
        if (!skillsCarousel || !skillsCarouselContainer) return;

        // --- BƯỚC 1: ĐỊNH NGHĨA KỸ NĂNG VÀ ICON ---
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

        // Icon mặc định cho các ngôn ngữ không có trong danh sách trên
        const defaultIcon = 'assets/icons/default.png';

        const username = 'tranhuudat2004';
        const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`;

        try {
            // --- BƯỚC 2: FETCH VÀ PHÂN TÍCH GITHUB ---
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
            const repos = await response.json();

            const langStats = new Map();
            repos.forEach(repo => {
                if (repo.language) {
                    langStats.set(repo.language, (langStats.get(repo.language) || 0) + 1);
                }
            });

            // --- BƯỚC 3: THÊM CÁC NGÔN NGỮ MỚI TỪ GITHUB ---
            langStats.forEach((count, lang) => {
                if (!skillsMap.has(lang)) {
                    skillsMap.set(lang, {
                        name: lang,
                        icon: defaultIcon
                    });
                }
            });

            // --- BƯỚC 4: HIỂN THỊ KẾT QUẢ ---
            const finalSkills = Array.from(skillsMap.values());

            skillsCarousel.innerHTML = ''; // Xóa thông báo loading

            // Create skills HTML
            const skillsHTML = finalSkills.map(skill => `
                <div class="skill-item">
                    <img src="${skill.icon}" alt="${skill.name}" class="skill-icon">
                    <span class="skill-name">${skill.name}</span>
                </div>
            `).join('');

            // Create 4 copies for ultra-smooth infinite scroll
            skillsCarousel.innerHTML = skillsHTML + skillsHTML + skillsHTML + skillsHTML;

            // Setup infinite scroll for manual scrolling
            setupInfiniteScroll();

        } catch (error) {
            console.error("Failed to fetch skills:", error);
            
            // Display default skills on error
            const defaultSkills = Array.from(skillsMap.values());
            const skillsHTML = defaultSkills.map(skill => `
                <div class="skill-item">
                    <img src="${skill.icon}" alt="${skill.name}" class="skill-icon">
                    <span class="skill-name">${skill.name}</span>
                </div>
            `).join('');
            
            skillsCarousel.innerHTML = skillsHTML + skillsHTML + skillsHTML + skillsHTML;
            setupInfiniteScroll();
        }
    }

    // Setup Netflix-style infinite scroll with auto-scroll and manual control
    function setupInfiniteScroll() {
        if (!skillsCarouselContainer) return;

        let scrollSpeed = 0.8; // pixels per frame (smooth continuous scroll)
        let animationId = null;
        let isUserInteracting = false;
        let lastScrollLeft = 0;
        let interactionTimeout;
        let isMouseDown = false;

        // Initialize scroll position to middle of second section (out of 4)
        setTimeout(() => {
            const sectionWidth = skillsCarousel.scrollWidth / 4;
            // Start in middle of section 2, giving plenty of buffer on both sides
            skillsCarouselContainer.scrollLeft = sectionWidth * 2;
            lastScrollLeft = sectionWidth * 2;
        }, 100);

        // Auto-scroll function - Netflix style (always scrolling unless user intervenes)
        function autoScroll() {
            const scrollLeft = skillsCarouselContainer.scrollLeft;
            const scrollWidth = skillsCarousel.scrollWidth;
            const sectionWidth = scrollWidth / 4;

            // Auto-scroll when not interacting
            if (!isUserInteracting) {
                skillsCarouselContainer.scrollLeft += scrollSpeed;
            }

            // Seamless infinite loop - jump happens instantly without animation
            // We stay in sections 2 and 3 (middle sections), jumping before hitting edges
            if (scrollLeft >= sectionWidth * 2.5) {
                // Jump back to early in section 2
                skillsCarouselContainer.scrollLeft = scrollLeft - sectionWidth;
                lastScrollLeft = skillsCarouselContainer.scrollLeft;
            }
            else if (scrollLeft <= sectionWidth * 1.5) {
                // Jump forward to late in section 2
                skillsCarouselContainer.scrollLeft = scrollLeft + sectionWidth;
                lastScrollLeft = skillsCarouselContainer.scrollLeft;
            } else {
                lastScrollLeft = skillsCarouselContainer.scrollLeft;
            }

            animationId = requestAnimationFrame(autoScroll);
        }

        // Detect user interaction (scrolling, dragging, wheel)
        function handleUserInteraction() {
            isUserInteracting = true;
            clearTimeout(interactionTimeout);
            
            // Resume auto-scroll after 2 seconds of no interaction
            interactionTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 2000);
        }

        // Mouse/touch events for detecting interaction
        skillsCarouselContainer.addEventListener('mousedown', () => {
            isMouseDown = true;
            handleUserInteraction();
        });

        skillsCarouselContainer.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        skillsCarouselContainer.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                handleUserInteraction();
            }
        });

        // Detect manual scrolling (wheel, trackpad, scrollbar)
        let scrollCheckInterval = null;
        skillsCarouselContainer.addEventListener('scroll', () => {
            const currentScrollLeft = skillsCarouselContainer.scrollLeft;
            
            // Check if scroll was user-initiated (not auto-scroll)
            const scrollDiff = Math.abs(currentScrollLeft - lastScrollLeft);
            if (scrollDiff > scrollSpeed * 3 && !isUserInteracting) {
                handleUserInteraction();
            }
            
            // Handle infinite loop during manual scrolling
            const scrollLeft = skillsCarouselContainer.scrollLeft;
            const scrollWidth = skillsCarousel.scrollWidth;
            const sectionWidth = scrollWidth / 4;
            
            // Seamless loop for manual scrolling - jump by exactly one section
            if (scrollLeft >= sectionWidth * 2.8) {
                skillsCarouselContainer.scrollLeft = scrollLeft - sectionWidth;
                lastScrollLeft = skillsCarouselContainer.scrollLeft;
            } else if (scrollLeft <= sectionWidth * 1.2) {
                skillsCarouselContainer.scrollLeft = scrollLeft + sectionWidth;
                lastScrollLeft = skillsCarouselContainer.scrollLeft;
            }
            
            if (!isUserInteracting) {
                lastScrollLeft = currentScrollLeft;
            }
        });

        // Wheel event for immediate response
        skillsCarouselContainer.addEventListener('wheel', () => {
            handleUserInteraction();
        });

        // Touch events for mobile
        skillsCarouselContainer.addEventListener('touchstart', () => {
            handleUserInteraction();
        });

        skillsCarouselContainer.addEventListener('touchmove', () => {
            handleUserInteraction();
        });

        // Start the continuous auto-scroll
        animationId = requestAnimationFrame(autoScroll);
    }

    // Gọi hàm chính để bắt đầu
    fetchAndDisplaySkillsCarousel();


    // ======================================================
    // --- 4. LOGIC CHO MUSIC PLAYER ---
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


    // Gắn sự kiện cho các nút điều khiển nhạc
    if (playPauseBtn) playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
    if (nextBtn) nextBtn.addEventListener('click', nextSong);
    if (prevBtn) prevBtn.addEventListener('click', prevSong);
    if (audio) audio.addEventListener('ended', nextSong);

    // Tải bài hát đầu tiên
    loadSong(playlist[currentSongIndex]);


    // ======================================================
    // --- 5. LOGIC CHO ACTIVE NAV INDICATOR ---
    // ======================================================
    const navLinks = document.querySelectorAll('.main-nav a');
    const navIndicator = document.querySelector('.nav-indicator');
    const sections = document.querySelectorAll('main section');

    function moveIndicator(targetLink) {
    // Kiểm tra an toàn, nếu không có vạch chỉ báo thì không làm gì cả
    if (!navIndicator) return;

    // Nếu không có link mục tiêu (ví dụ: cuộn ra khỏi vùng các section), ẩn vạch chỉ báo đi
    if (!targetLink) {
        navIndicator.style.opacity = '0';
        return;
    }

    // === PHẦN LOGIC BỊ THIẾU ĐÂY ===
    // Lấy thông tin vị trí và kích thước của link mục tiêu
    const linkRect = targetLink.getBoundingClientRect();
    // Lấy thông tin vị trí của thanh điều hướng (để tính toán vị trí tương đối)
    const navRect = targetLink.parentElement.getBoundingClientRect();

    // Di chuyển và thay đổi kích thước của vạch chỉ báo
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.left = `${linkRect.left - navRect.left}px`;
    navIndicator.style.opacity = '1';

    // Cập nhật class 'is-active' cho các link
    navLinks.forEach(link => link.classList.remove('is-active'));
    targetLink.classList.add('is-active');
}

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => moveIndicator(e.currentTarget));
    });

    const navObserverOptions = {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0
    };

    const navSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const correspondingLink = document.querySelector(`.main-nav a[href="#${sectionId}"]`);
                moveIndicator(correspondingLink);
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        navSectionObserver.observe(section);
    });

    // Xử lý khi tải lại trang, di chuyển indicator đến vị trí đúng
    setTimeout(() => {
        let activeSectionVisible = false;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                const correspondingLink = document.querySelector(`.main-nav a[href="#${section.id}"]`);
                moveIndicator(correspondingLink);
                activeSectionVisible = true;
            }
        });

        // Nếu không có section nào active (ví dụ đang ở đầu trang), active #hero
        if (!activeSectionVisible && window.scrollY < window.innerHeight / 2) {
            const initialLink = document.querySelector('.main-nav a[href="#hero"]');
            moveIndicator(initialLink);
        }
    }, 200);

    // ======================================================
    // --- BỔ SUNG: LOGIC CHO LIGHT/DARK THEME ---
    // ======================================================
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('theme');

        // Áp dụng theme đã lưu khi trang vừa tải
        if (currentTheme) {
            document.body.classList.add(currentTheme);
        }

        // Gắn sự kiện click cho nút
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');

            // Lưu lựa chọn vào localStorage
            let theme = document.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';

            // Nếu không có class light-mode, có nghĩa là đang ở dark mode, nhưng ta không cần lưu 'dark-mode'
            // vì nó là mặc định. Chỉ cần lưu 'light-mode' thôi.
            if (theme === 'light-mode') {
                localStorage.setItem('theme', 'light-mode');
            } else {
                localStorage.removeItem('theme'); // Xóa key khi quay về dark mode
            }
        });
    }
}); // <-- Dấu ngoặc đóng của sự kiện DOMContentLoaded duy nhất