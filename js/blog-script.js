document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Áp dụng theme đã lưu khi tải trang
    if (currentTheme) {
        document.body.classList.add(currentTheme);
    } else {
        // Mặc định là dark-mode nếu chưa có gì trong localStorage
        // (Không cần thêm class vì dark-mode là mặc định trong CSS)
    }

    themeToggleBtn.addEventListener('click', () => {
        // Chuyển đổi class 'light-mode' trên thẻ body
        document.body.classList.toggle('light-mode');

        // Lưu lựa chọn theme vào localStorage
        let theme = 'dark-mode'; // Mặc định
        if (document.body.classList.contains('light-mode')) {
            theme = 'light-mode';
        }
        localStorage.setItem('theme', theme);
    });
});