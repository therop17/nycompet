// Карусель судей - полностью на свайпах
let currentSlide = 0;
const track = document.getElementById('carouselTrack');
const cards = document.querySelectorAll('.judge-card');
const indicatorsContainer = document.getElementById('carouselIndicators');
const carousel = document.querySelector('.judges-carousel');
let cardsPerView = 3;
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;

// Определяем количество карточек на экране в зависимости от ширины
function updateCardsPerView() {
    const width = window.innerWidth;
    if (width <= 480) {
        cardsPerView = 1;
    } else if (width <= 768) {
        cardsPerView = 2;
    } else {
        cardsPerView = 3;
    }
}

// Количество слайдов
function getTotalSlides() {
    return Math.ceil(cards.length / cardsPerView);
}

// Создаем индикаторы
function createIndicators() {
    indicatorsContainer.innerHTML = '';
    const totalSlides = getTotalSlides();
    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (i === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(indicator);
    }
}

// Получаем позицию касания/клика
function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

// Обновляем позицию карусели
function updateCarousel() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    const offset = currentSlide * (cardWidth + gap) * cardsPerView;

    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    track.style.transform = `translateX(-${offset}px)`;
    currentTranslate = -offset;
    prevTranslate = -offset;

    // Обновляем индикаторы
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Переход к конкретному слайду
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

// Анимация перетаскивания
function animation() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}

// Начало перетаскивания
function touchStart(index) {
    return function(event) {
        isDragging = true;
        startPos = getPositionX(event);
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none';

        // Останавливаем автоплей при взаимодействии
        clearInterval(autoplayInterval);
    }
}

// Процесс перетаскивания
function touchMove(event) {
    if (isDragging) {
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
}

// Конец перетаскивания
function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;
    const totalSlides = getTotalSlides();

    // Если свайп больше 100px, переключаем слайд
    if (movedBy < -100 && currentSlide < totalSlides - 1) {
        currentSlide += 1;
    }

    if (movedBy > 100 && currentSlide > 0) {
        currentSlide -= 1;
    }

    updateCarousel();

    // Возобновляем автоплей
    startAutoplay();
}

// События для мыши
carousel.addEventListener('mousedown', touchStart(0));
carousel.addEventListener('mousemove', touchMove);
carousel.addEventListener('mouseup', touchEnd);
carousel.addEventListener('mouseleave', () => {
    if (isDragging) touchEnd();
});

// События для тач-устройств
carousel.addEventListener('touchstart', touchStart(0));
carousel.addEventListener('touchmove', touchMove);
carousel.addEventListener('touchend', touchEnd);

// Автоматическая прокрутка
let autoplayInterval;

function startAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
        const totalSlides = getTotalSlides();
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }, 3500);
}

// Останавливаем автоплей при наведении
carousel.addEventListener('mouseenter', () => {
    clearInterval(autoplayInterval);
});

// Возобновляем автоплей при уходе мыши
carousel.addEventListener('mouseleave', () => {
    if (!isDragging) {
        startAutoplay();
    }
});

// Обновление при изменении размера окна
window.addEventListener('resize', () => {
    updateCardsPerView();
    createIndicators();
    const totalSlides = getTotalSlides();
    if (currentSlide >= totalSlides) {
        currentSlide = totalSlides - 1;
    }
    updateCarousel();
});

// Инициализация
updateCardsPerView();
createIndicators();
updateCarousel();
startAutoplay();

// Кнопка "Участвовать" (ваш существующий код)
document.querySelector('.btn-next').addEventListener('click', function() {
    // Ваш код для перехода к форме регистрации
});

// Получаем элементы
const btnNext = document.querySelector('.btn-next');
const coverContainer = document.querySelector('.coverpage-container');

// Получаем tg_id из URL
const urlParams = new URLSearchParams(window.location.search);
const tgId = urlParams.get('tg_id') || '';

// Обработчик клика на кнопку
btnNext.addEventListener('click', function(e) {
    e.preventDefault();

    // Скрываем текущее содержимое
    coverContainer.style.opacity = '0';
    coverContainer.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        // Очищаем контейнер
        coverContainer.innerHTML = '';

        // Создаем форму регистрации
        const registrationForm = document.createElement('div');

        registrationForm.innerHTML = `       
            <div class="coverpage-logo">
                <img src="/static/img/cleaned.png" alt="Notails Logo" class="logo-image">
            </div>
            
            <h2 class="form-title">Регистрация в конкурсе <p><span class="yellowreg">NY COMPETITION</span></p></h2>
            
            <form id="participantForm" class="participant-form" method="POST" action="/register">
               
                <input type="hidden" name="tg_id_reg" id="tg-id-hidden" value="${tgId}">
                
                <div class="form-group">
                    <label for="firstName">ФИО</label>
                    <input type="text" id="firstName" name="firstname" required>
                </div>
               
                
                <div class="form-group">
                    <label for="workplace">Место работы</label>
                    <input type="text" id="workplace" name="workplace" required>
                </div>
                
                <div class="form-group">
                    <label for="instagram">Instagram</label>
                    <input type="text" id="instagram" name="instagram" placeholder="http://instagram.com/username/" required>
                </div>
                
                <button type="submit" class="btn-submit">Зарегистрироваться</button>
                <button type="button" class="btn-back">Назад</button>
            </form>
        `;

        coverContainer.appendChild(registrationForm);

        // Показываем форму с анимацией
        setTimeout(() => {
            coverContainer.style.opacity = '1';
            coverContainer.style.transform = 'translateY(0)';
        }, 50);

        // Обработчик кнопки "Назад"
        const btnBack = document.querySelector('.btn-back');
        btnBack.addEventListener('click', function() {
            location.reload();
        });

    }, 300);
});
