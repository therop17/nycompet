document.addEventListener('DOMContentLoaded', function () {
  const tg = window.Telegram?.WebApp;

  // Проверяем, что Telegram WebApp доступен
  if (!tg) {
    console.error('Telegram WebApp не найден!');
    alert('Ошибка: откройте приложение через Telegram');
    return;
  }

  const user = tg.initDataUnsafe?.user;

  // Проверяем, что данные пользователя получены
  if (!user || !user.id) {
    console.error('Данные пользователя не получены:', tg.initDataUnsafe);
    alert('Ошибка: не удалось получить данные пользователя');
    return;
  }

  console.log('User data loaded:', user);

  // Сохраняем tg_id глобально для доступа из других скриптов
  window.userTgId = user.id;

  // ФИО
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const fullNameEl = document.getElementById('tg-fullname');
  if (fullNameEl) {
    fullNameEl.innerText = fullName || 'Имя не указано';
  }


  // ID в скрытом поле формы - КРИТИЧЕСКИ ВАЖНО
  const tgIdInput = document.getElementById("tg-id-hidden");
  if (tgIdInput) {
    tgIdInput.value = user.id;
    console.log("✅ TG ID установлен в скрытое поле:", user.id);
    console.log("✅ Значение поля tg-id-hidden:", tgIdInput.value);
  } else {
    console.error("❌ Элемент tg-id-hidden не найден!");
  }

  // Аватар
  const avatar = document.getElementById('tg-avatar');
  if (avatar) {
    avatar.src = user.photo_url || '/static/img/NOTAILS.png';
  }

  // Автозаполнение формы данными из Telegram
  const inputName = document.getElementById('input-name');
  const inputSurname = document.getElementById('input-surname');
  const inputWork = document.getElementById('input-work');
  const inputInst = document.getElementById('input-inst');

  // ИСПРАВЛЕНО: правильная проверка полей
  if (inputName && !inputName.value && user.first_name) {
    inputName.value = user.first_name;
  }

  if (inputSurname && !inputSurname.value && user.last_name) {
    inputSurname.value = user.last_name;
  }


  // Примечание: Telegram WebApp API не предоставляет workplace и instagram
  // Эти поля нужно заполнять вручную или получать из вашей БД

  // ВАЖНО: Блокируем отправку формы пока не загружены данные
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      const tgIdValue = document.getElementById('tg-id-hidden').value;

      console.log('Попытка отправки формы. tg_id:', tgIdValue);

      if (!tgIdValue) {
        e.preventDefault();
        alert('Ошибка: Telegram ID не определен. Перезагрузите страницу.');
        return false;
      }

      console.log('✅ Форма отправляется с tg_id:', tgIdValue);
    });
  }

  // ============ РЕДИРЕКТ С TG_ID В URL ============

  // Если на главной странице без tg_id в URL, делаем редирект с tg_id
  if (window.location.pathname === '/' && user.id) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('tg_id')) {
      console.log('🔄 Редирект на главную с tg_id:', user.id);
      window.location.href = '/?tg_id=' + user.id;
    }
  }

  // Если на странице /main без tg_id в URL, добавляем его
  if (window.location.pathname === '/main' && user.id) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('tg_id')) {
      console.log('🔄 Редирект на /main с tg_id:', user.id);
      window.location.href = '/main?tg_id=' + user.id;
    }
  }

  // Если на странице /profile без tg_id в URL, добавляем его
  if (window.location.pathname === '/profile' && user.id) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('tg_id')) {
      console.log('🔄 Редирект на /profile с tg_id:', user.id);
      window.location.href = '/profile?tg_id=' + user.id;
    }
  }
});