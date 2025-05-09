// --- KHAI BÁO BIẾN TOÀN CỤC ---
let timerInterval = null;
let startTime = null;     // Dùng cho chế độ classic
let timerSecondsRemaining = 0; // Dùng cho chế độ countdown
let countdownDuration = 30;
let timerRunning = false;
let gameWon = false;
let timeUp = false;
let draggedElement = null; // Cho desktop drag & drop
let currentPuzzleId = 'paimon';
let gameMode = 'classic';

// --- BIẾN TOÀN CỤC CHO KÉO THẢ CHẠM MẢNH GHÉP ---
let touchedElement = null;
let touchStartX = 0;
let touchStartY = 0;
let initialPieceX = 0;
let initialPieceY = 0;
let currentDropTarget = null;

// --- BIẾN CHO PHÂN BIỆT CLICK VÀ DRAG ---
let isPotentialClick = false;
let clickThreshold = 5; // Ngưỡng di chuyển (pixel)
let pieceMouseDownX = 0;
let pieceMouseDownY = 0;
let isActuallyDraggingDesktop = false;


// --- Dữ liệu các bộ ảnh (Nên đặt trong file puzzleData.js và include vào HTML trước file này) ---
// Giả sử puzzlesData đã được định nghĩa ở file khác hoặc ở đầu file này nếu bạn không tách
// const puzzlesData = { ... };

// --- Các hàm xử lý thời gian ---
function startTimer() {
    if (timerRunning || gameWon || timeUp) return;
    timerRunning = true;
    if (gameMode === 'classic') {
        startTime = Date.now();
        timerInterval = setInterval(updateClassicTimer, 1000);
        updateClassicTimer();
    } else if (gameMode === 'countdown') {
        let secondsValue = parseInt($('#countdown-seconds').val()) || 30;
        secondsValue = Math.max(20, Math.min(60, secondsValue));
        countdownDuration = secondsValue;
        timerSecondsRemaining = countdownDuration;
        timerInterval = setInterval(updateCountdownTimer, 1000);
        updateCountdownTimer();
    }
}
function stopTimer() { clearInterval(timerInterval); timerRunning = false; }
function updateClassicTimer() { if (!startTime) return; displayTime((Date.now() - startTime) / 1000); }
function updateCountdownTimer() {
    if (timerSecondsRemaining <= 0 || gameWon) {
        if (timerSecondsRemaining <= 0 && !gameWon) handleTimeUp();
        else stopTimer();
        return;
    }
    timerSecondsRemaining--;
    displayTime(timerSecondsRemaining);
}
function displayTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    $('#timer-display').text(`Thời gian: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
}
function handleTimeUp() {
    timeUp = true; stopTimer();
    $('#game-table').addClass('game-lost').removeClass('game-won');
    $('#game-table img, #image-list img').attr('draggable', false).css('cursor', 'not-allowed');
    if ($.fn.modal) $('#loseModal').modal('show'); else alert("Hết giờ!");
}
function getFinalTime() {
    if (!startTime) return "00:00";
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- Hàm kiểm tra điều kiện thắng ---
function checkWinCondition() {
    if (gameWon || timeUp) return false;
    const targetCells = $('#game-table .target-cell');
    if (targetCells.length !== 9) return false;
    let allCorrect = true;
    for (let i = 0; i < targetCells.length; i++) {
        const cell = targetCells[i]; const img = cell.querySelector('img');
        if (!img) { allCorrect = false; break; }
        const expectedCellId = img.getAttribute('data-correct-cell');
        const currentCellId = cell.id;
        const currentAngle = ($(img).data('angle') || 0) % 360;
        if (expectedCellId !== currentCellId || currentAngle !== 0) { allCorrect = false; break; }
    }
    if (allCorrect) {
        gameWon = true; timeUp = false; stopTimer();
        $('#game-table').addClass('game-won').removeClass('game-lost');
        $('#game-table img, #image-list img').attr('draggable', false).css('cursor', 'default');
        if (gameMode === 'classic') $('#final-time').text(getFinalTime());
        else {
            const usedSeconds = countdownDuration - timerSecondsRemaining;
            const minutes = Math.floor(usedSeconds / 60);
            const seconds = Math.floor(usedSeconds % 60);
            $('#final-time').text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
        if ($.fn.modal) $('#winModal').modal('show'); else alert("Chúc mừng! Bạn đã thắng!");
    }
    return allCorrect;
}

// --- Hàm xáo trộn & góc xoay ---
function shuffleImages() {
    var parent = $("#image-list"); var cells = parent.children('.source-cell');
    if (cells.length === 0) return;
    var tempCells = []; cells.each(function () { tempCells.push($(this).detach()); });
    while (tempCells.length) { parent.append(tempCells.splice(Math.floor(Math.random() * tempCells.length), 1)[0]); }
    parent.find('.source-cell img').each(function () {
        var randomRotation = getRandomRotationAngle();
        $(this).css('transform', 'rotate(' + randomRotation + 'deg)').data('angle', randomRotation);
    });
    console.log("Shuffled images for:", currentPuzzleId);
}
function getRandomRotationAngle() { return [0, 90, 180, 270][Math.floor(Math.random() * 4)]; }

// --- Các hàm xử lý Drag and Drop (Desktop) ---
function startDrag(event) {
    if (gameWon || timeUp) { event.preventDefault(); return; }
    draggedElement = event.target;
    pieceMouseDownX = event.clientX;
    pieceMouseDownY = event.clientY;
    isPotentialClick = true;
    if (event.dataTransfer) {
        event.dataTransfer.setData('imageId', draggedElement.id);
        // Không thêm class 'dragging' ngay
    }
}
function allowDrop(event, receiverCell) {
    if (gameWon || timeUp) return;
    const isReceiverEmpty = receiverCell.childElementCount === 0;
    const isNotSelfContainer = draggedElement ? receiverCell !== draggedElement.parentNode : true;
    if (isReceiverEmpty && isNotSelfContainer) {
        event.preventDefault(); receiverCell.classList.add('drag-over-valid');
    }
}
function dragLeave(event, receiverCell) { if (receiverCell) receiverCell.classList.remove('drag-over-valid'); }
function endDrag(event) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    $('.image-cell').removeClass('drag-over-valid');
    draggedElement = null;
    isActuallyDraggingDesktop = false;
    // isPotentialClick sẽ được reset bởi sự kiện click
}
function receiveData(event) { // Cho Desktop
    event.preventDefault();
    if (gameWon || timeUp) return;
    const id = event.dataTransfer ? event.dataTransfer.getData('imageId') : null;
    if (!id) return;
    const droppedImage = document.getElementById(id);
    let targetCell = event.target;
    $('.image-cell').removeClass('drag-over-valid');
    if (!droppedImage) return;
    if (targetCell.tagName === 'IMG') targetCell = targetCell.parentNode;
    if (targetCell.classList.contains('image-cell') && targetCell.childElementCount === 0 && (!draggedElement || targetCell !== draggedElement.parentNode)) {
        targetCell.appendChild(droppedImage);
        if ($(targetCell).closest('#game-table').length > 0 && !timerRunning) startTimer();
        if ($(targetCell).closest('#game-table').length > 0) checkWinCondition();
    }
}

// --- CÁC HÀM XỬ LÝ CHẠM CHO MẢNH GHÉP ---
function handlePieceTouchStart(event) {
    if (gameWon || timeUp) { event.preventDefault(); return; }
    touchedElement = event.target;
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX; touchStartY = touch.clientY;
    const rect = touchedElement.getBoundingClientRect();
    initialPieceX = rect.left; initialPieceY = rect.top;
    touchedElement.style.left = `${initialPieceX}px`; // Đặt style inline để fixed position hoạt động đúng
    touchedElement.style.top = `${initialPieceY}px`;
    touchedElement.style.position = 'fixed';
    touchedElement.style.zIndex = '1000';
    touchedElement.style.opacity = '0.7';
    touchedElement.classList.add('dragging');
    isPotentialClick = true;
    document.addEventListener('touchmove', handlePieceTouchMove, { passive: false });
    document.addEventListener('touchend', handlePieceTouchEnd);
    document.addEventListener('touchcancel', handlePieceTouchEnd);
}
function handlePieceTouchMove(event) {
    if (!touchedElement) return;
    event.preventDefault();
    const touch = event.touches[0];
    const currentX = touch.clientX; const currentY = touch.clientY;
    if (isPotentialClick && (Math.abs(currentX - touchStartX) > clickThreshold || Math.abs(currentY - touchStartY) > clickThreshold)) {
        isPotentialClick = false;
    }
    const newX = initialPieceX + (currentX - touchStartX);
    const newY = initialPieceY + (currentY - touchStartY);
    touchedElement.style.left = `${newX}px`;
    touchedElement.style.top = `${newY}px`;
    touchedElement.style.display = 'none';
    let elementBelow = document.elementFromPoint(currentX, currentY);
    touchedElement.style.display = '';
    if (currentDropTarget && currentDropTarget !== elementBelow) {
        currentDropTarget.classList.remove('drag-over-valid');
    }
    currentDropTarget = null;
    if (elementBelow) {
        let potentialTarget = elementBelow.closest('.image-cell');
        if (potentialTarget && potentialTarget.childElementCount === 0 && potentialTarget !== touchedElement.parentNode) {
            potentialTarget.classList.add('drag-over-valid');
            currentDropTarget = potentialTarget;
        }
    }
}
function handlePieceTouchEnd(event) {
    if (!touchedElement) return;
    const wasDragging = !isPotentialClick;
    touchedElement.style.position = ''; touchedElement.style.zIndex = '';
    touchedElement.style.opacity = '1'; touchedElement.style.left = ''; touchedElement.style.top = '';
    touchedElement.classList.remove('dragging');
    if (wasDragging && currentDropTarget) {
        currentDropTarget.classList.remove('drag-over-valid');
        if (currentDropTarget.childElementCount === 0) {
            currentDropTarget.appendChild(touchedElement);
            if ($(currentDropTarget).closest('#game-table').length > 0 && !timerRunning) startTimer();
            if ($(currentDropTarget).closest('#game-table').length > 0) checkWinCondition();
        }
    }
    document.removeEventListener('touchmove', handlePieceTouchMove);
    document.removeEventListener('touchend', handlePieceTouchEnd);
    document.removeEventListener('touchcancel', handlePieceTouchEnd);
    touchedElement = null; currentDropTarget = null;
    isPotentialClick = false;
}

// --- Hàm tạo danh sách lựa chọn ảnh ---
function populateSelectionList() {
    const selectionList = $('#selection-list'); selectionList.empty();
    for (const puzzleId in puzzlesData) { // Đảm bảo puzzlesData đã được load
        const puzzle = puzzlesData[puzzleId];
        const imgElement = $('<img>').attr('src', puzzle.thumbnail).attr('alt', `Chọn ${puzzle.name}`)
            .attr('data-puzzle-id', puzzleId).addClass('puzzle-option img-thumbnail').on('click', selectPuzzle);
        if (puzzleId === currentPuzzleId) imgElement.addClass('active');
        selectionList.append(imgElement);
    }
}

// --- Hàm xử lý khi chọn bộ ảnh mới ---
function selectPuzzle(event) {
    const selectedId = $(event.target).data('puzzle-id');
    if (selectedId === currentPuzzleId) return;
    currentPuzzleId = selectedId;
    $('.puzzle-option').removeClass('active'); $(event.target).addClass('active');
    resetGame();
}

// --- Hàm Reset và Tải bộ ảnh mới ---
function resetAndLoadPuzzle(puzzleId) {
    console.log("Đang tải bộ ảnh:", puzzleId);
    const puzzle = puzzlesData[puzzleId]; // Đảm bảo puzzlesData đã được load
    if (!puzzle) { console.error("Không tìm thấy bộ ảnh:", puzzleId); return; }
    $('#game-table').removeClass('game-won game-lost');
    $('#game-table .target-cell').empty();
    $('.reference-image').attr('src', puzzle.reference).attr('alt', `Ảnh gốc ${puzzle.name}`);
    const imageList = $('#image-list'); imageList.empty();
    if (!puzzle.pieces || puzzle.pieces.length !== 9) {
        console.error("Dữ liệu mảnh ghép không hợp lệ cho:", puzzleId);
        imageList.html('<p style="color: red;">Lỗi tải mảnh ghép!</p>'); return;
    }
    puzzle.pieces.forEach((pieceSrc, index) => {
        const cellId = `cell-${index}`;
        const imgId = `${puzzleId}-image${String(index + 1).padStart(2, '0')}`;
        const imgDOM = $('<img>').attr('src', pieceSrc).attr('id', imgId).attr('data-correct-cell', cellId).get(0);
        imgDOM.draggable = true;
        imgDOM.ondragstart = startDrag;
        imgDOM.ondragend = endDrag;
        imgDOM.addEventListener('touchstart', handlePieceTouchStart, { passive: false });
        const cellDOM = $('<div>').addClass('image-cell source-cell').append(imgDOM).get(0);
        // Các ô source không cần sự kiện drop của desktop
        imageList.append(cellDOM);
    });
    shuffleImages();
    $('#image-list img').css('cursor', 'grab');
    console.log("Đã tải xong bộ ảnh:", puzzleId);
}

// --- Hàm Reset Game Tổng Quát ---
function resetGame() {
    console.log("Resetting game...");
    gameWon = false; timeUp = false; timerRunning = false; draggedElement = null;
    touchedElement = null; currentDropTarget = null; isPotentialClick = false; isActuallyDraggingDesktop = false; // Reset thêm các biến touch/click
    stopTimer(); startTime = null; timerSecondsRemaining = 0;
    if (gameMode === 'classic') {
        $('#timer-display').text('Thời gian: 00:00');
    } else {
        let secondsValue = parseInt($('#countdown-seconds').val()) || 30;
        secondsValue = Math.max(20, Math.min(60, secondsValue));
        countdownDuration = secondsValue;
        timerSecondsRemaining = countdownDuration;
        displayTime(timerSecondsRemaining);
        $('#countdown-value').text(countdownDuration);
    }
    resetAndLoadPuzzle(currentPuzzleId);
}

// --- Document Ready ---
$(document).ready(function () {
    // Gán sự kiện cho các ảnh/ô ban đầu có trong HTML
    function initialPieceSetup(imgElement) {
        const imgDOM = $(imgElement).get(0);
        if (!imgDOM.ondragstart) imgDOM.ondragstart = startDrag;
        if (!imgDOM.ondragend) imgDOM.ondragend = endDrag;
        if (!imgDOM.ontouchstart) imgDOM.addEventListener('touchstart', handlePieceTouchStart, { passive: false });
    }
    $('#image-list img').each(function() { initialPieceSetup(this); });

    // Các ô target-cell trên bảng game cần allowDrop cho desktop
    $('#game-table .target-cell').each(function() {
        const cellDOM = $(this).get(0);
        if (!cellDOM.ondragover) cellDOM.ondragover = (e) => allowDrop(e, cellDOM);
        if (!cellDOM.ondrop) cellDOM.ondrop = (e) => receiveData(e); // Desktop drop
        if (!cellDOM.ondragleave) cellDOM.ondragleave = (e) => dragLeave(e, cellDOM);
    });

    populateSelectionList();
    shuffleImages(); // Shuffle bộ ảnh mặc định

    // --- Gắn sự kiện mousemove trên document cho desktop drag ---
    document.addEventListener('mousemove', function(event) {
        if (draggedElement && isPotentialClick) {
            const deltaX = Math.abs(event.clientX - pieceMouseDownX);
            const deltaY = Math.abs(event.clientY - pieceMouseDownY);
            if (deltaX > clickThreshold || deltaY > clickThreshold) {
                isPotentialClick = false;
                isActuallyDraggingDesktop = true;
                if (!draggedElement.classList.contains('dragging')) {
                    draggedElement.classList.add('dragging');
                }
            }
        }
    });

    // Xử lý thay đổi chế độ chơi
    $('input[name="gameMode"]').change(function() {
        gameMode = $(this).val();
        if (gameMode === 'countdown') {
            let currentSliderVal = parseInt($('#countdown-seconds').val()) || 30;
            $('#countdown-value').text(currentSliderVal);
            countdownDuration = currentSliderVal;
            $('#countdown-duration-group').slideDown();
        } else {
            $('#countdown-duration-group').slideUp();
        }
        resetGame();
    });
    $('#countdown-seconds').on('input', function() { $('#countdown-value').text($(this).val()); });
    $('#countdown-seconds').on('change', function() { if (gameMode === 'countdown') resetGame(); });

    // --- Xử lý Sidebar Hướng dẫn ---
    const insBtn = document.getElementById('insBtn');
    const insSidebar = document.getElementById('insSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    if(insBtn && insSidebar && closeSidebar){
        function toggleSidebar(e) { if(e) e.stopPropagation(); insSidebar.classList.toggle('open'); }
        function closeSidebarIfClickedOutside(event) {
            if (insSidebar.classList.contains('open') && !insSidebar.contains(event.target) && !insBtn.contains(event.target)) {
                insSidebar.classList.remove('open');
            }
        }
        insBtn.addEventListener('click', toggleSidebar);
        closeSidebar.addEventListener('click', toggleSidebar);
        document.addEventListener('click', closeSidebarIfClickedOutside);
        insSidebar.addEventListener('click', function(e){ e.stopPropagation(); });
    }
});

// --- SỰ KIỆN CLICK XOAY ẢNH (Dùng event delegation) ---
$(document).on('click', '.image-cell img', function (e) {
    if (gameWon || timeUp) return;
    if (isPotentialClick && !isActuallyDraggingDesktop) { // Chỉ xoay nếu là click thực sự
        var currentAngle = ($(this).data('angle') || 0);
        var newAngle = (currentAngle + 90) % 360;
        $(this).css('transform', 'rotate(' + newAngle + 'deg)').data('angle', newAngle);
        if ($(this).closest('#game-table').length > 0) checkWinCondition();
    }
    isPotentialClick = false; // Reset cờ sau mỗi lần xử lý xong
    isActuallyDraggingDesktop = false;
});