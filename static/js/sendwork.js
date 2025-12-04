// Элементы
const categorySelection = document.getElementById('categorySelection');
const sendworkForm = document.getElementById('sendworkForm');
const categoryCards = document.querySelectorAll('.category-card');
const btnBack = document.getElementById('btnBack');
const selectedCategoryName = document.getElementById('selectedCategoryName');
const categoryInput = document.getElementById('category');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

// Названия категорий
const categoryNames = {
    'bartender': 'Bartender of the Year',
    'cocktail': 'Cocktail of the Year',
    'creative': 'AI Creative of the Year'
};

// Инициализация - блокируем уже отправленные категории
categoryCards.forEach(card => {
    const isSubmitted = card.dataset.submitted === 'true';

    if (isSubmitted) {
        card.classList.add('disabled');
    }
});

// Выбор категории
categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        // Проверяем, не заблокирована ли категория
        if (this.classList.contains('disabled')) {
            return; // Не даём выбрать заблокированную категорию
        }

        // Убираем выделение у всех карточек
        categoryCards.forEach(c => c.classList.remove('selected'));

        // Выделяем текущую карточку
        this.classList.add('selected');

        // Получаем выбранную категорию
        const category = this.dataset.category;

        // Небольшая задержка для визуального эффекта
        setTimeout(() => {
            showForm(category);
        }, 300);
    });
});

// Показать форму
function showForm(category) {
    // Скрываем выбор категории
    categorySelection.classList.add('hidden');

    // Показываем форму
    sendworkForm.classList.add('active');

    // Устанавливаем выбранную категорию
    categoryInput.value = category;
    selectedCategoryName.textContent = categoryNames[category];

    // Обновляем индикаторы шагов
    step1.classList.remove('active');
    step1.classList.add('completed');
    step2.classList.add('active');
}

// Кнопка "Назад"
btnBack.addEventListener('click', function() {
    // Скрываем форму
    sendworkForm.classList.remove('active');

    // Показываем выбор категории
    categorySelection.classList.remove('hidden');

    // Убираем выделение у всех карточек
    categoryCards.forEach(c => c.classList.remove('selected'));

    // Сбрасываем форму
    sendworkForm.reset();
    categoryInput.value = '';

    // Обновляем индикаторы шагов
    step2.classList.remove('active');
    step1.classList.remove('completed');
    step1.classList.add('active');
});

// Отправка формы (можете добавить свою логику)
sendworkForm.addEventListener('submit', function(e) {
    // Здесь можно добавить дополнительную валидацию или AJAX отправку
    console.log('Категория:', categoryInput.value);
    console.log('Название:', document.getElementById('name').value);
    console.log('Ссылка:', document.getElementById('link').value);
});