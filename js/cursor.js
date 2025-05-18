        const cursorElement = document.querySelector('.cursor-element');
        const cursorTextElement = cursorElement.querySelector('.cursor-text');
        const gridItems = document.querySelectorAll('.interactive-grid .grid-item');

        let autoTextCurrentIndex = 0;
        let autoTextInterval;
        let isTextFading = false; // Biến cờ để tránh thay đổi text khi đang fade

        const autoTexts = [
            "Hello!",
            "I'm Tran Huu Dat",
            "I'm a Web Developer",
            "I'm looking for a job",
            "Thanks for visiting!"
        ];

        function updateCursorPosition(x, y) {
            cursorElement.style.left = x + 'px';
            cursorElement.style.top = y + 'px';
            if (!cursorElement.classList.contains('visible')) {
                cursorElement.classList.add('visible');
            }
        }

        function changeCursorTextWithFade(newText) {
            if (isTextFading || cursorTextElement.textContent === newText) {
                // Nếu đang fade hoặc text không đổi, không làm gì cả
                return;
            }

            isTextFading = true;
            cursorTextElement.classList.add('fade-out'); // Bắt đầu fade out text cũ

            setTimeout(() => {
                cursorTextElement.textContent = newText;    // Thay đổi text khi nó đã mờ
                cursorTextElement.classList.remove('fade-out'); // Bắt đầu fade in text mới
                isTextFading = false;
            }, 300); // Thời gian này phải bằng hoặc lớn hơn thời gian transition trong CSS (0.3s)
        }


        function updateAutoCursorText() {
            let newTextToShow;
            let isOverGridItem = false;
            let currentGridItemText = null;

            const cursorRect = cursorElement.getBoundingClientRect();
            for (const item of gridItems) {
                const itemRect = item.getBoundingClientRect();
                if (
                    cursorRect.right > itemRect.left &&
                    cursorRect.left < itemRect.right &&
                    cursorRect.bottom > itemRect.top &&
                    cursorRect.top < itemRect.bottom
                ) {
                    if (item.dataset.text) {
                        isOverGridItem = true;
                        currentGridItemText = item.dataset.text;
                        break;
                    }
                }
            }

            if (isOverGridItem) {
                newTextToShow = currentGridItemText;
            } else {
                newTextToShow = autoTexts[autoTextCurrentIndex];
                autoTextCurrentIndex = (autoTextCurrentIndex + 1) % autoTexts.length;
            }

            changeCursorTextWithFade(newTextToShow);
        }


        document.addEventListener('mousemove', (e) => {
            updateCursorPosition(e.clientX, e.clientY);

            // Để text thay đổi NGAY LẬP TỨC khi trỏ vào/ra grid-item với hiệu ứng fade
            // chúng ta cần gọi logic cập nhật text ở đây.
            // Tuy nhiên, việc gọi liên tục có thể làm hiệu ứng fade bị gián đoạn.
            // Một cách tiếp cận tốt hơn là chỉ gọi khi trạng thái hover thay đổi.

            // Trong trường hợp này, vì updateAutoCursorText đã có logic kiểm tra hover,
            // và setInterval gọi nó, chúng ta có thể không cần gọi trực tiếp ở đây
            // để giữ nhịp 3 giây.
            // Nếu muốn phản ứng nhanh hơn khi hover, cần điều chỉnh logic.
            // Ví dụ, chỉ gọi changeCursorTextWithFade nếu text cần hiển thị THAY ĐỔI
            // so với text hiện tại.

            // Tạm thời để setInterval xử lý để giữ nhịp 3 giây
        });


        if (gridItems.length > 0) {
            gridItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    // Khi di chuột vào item, chúng ta muốn text thay đổi ngay lập tức (với fade)
                    if (item.dataset.text) {
                        changeCursorTextWithFade(item.dataset.text);
                    }
                });
                item.addEventListener('mouseleave', () => {
                    // Khi di chuột ra, text sẽ tự động quay lại chuỗi auto theo interval
                    // không cần làm gì ở đây, vì updateAutoCursorText trong interval sẽ xử lý
                });
            });
        }

        if (cursorElement && cursorTextElement) {
            // Hiển thị text đầu tiên với fade
            changeCursorTextWithFade(autoTexts[autoTextCurrentIndex]);
            autoTextCurrentIndex = (autoTextCurrentIndex + 1) % autoTexts.length; // Chuẩn bị cho lần gọi tiếp theo

            autoTextInterval = setInterval(updateAutoCursorText, 3000); // Bắt đầu đổi text tự động
        }

        if (cursorElement) {
            function initialCursorShow() {
                if (!cursorElement.classList.contains('visible')) {
                    cursorElement.classList.add('visible');
                }
            }
            setTimeout(initialCursorShow, 100);
        } else {
            console.error("Cursor element not found!");
        }