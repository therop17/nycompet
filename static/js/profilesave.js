document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form[action="/profile/save"]');
  const profileData = document.getElementById('profile-data');

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // отменяем стандартную отправку

    // Получаем значения из формы
    const firstname = form.querySelector('input[name="firstname"]').value;
    const lastname = form.querySelector('input[name="lastname"]').value;
    const workplace = form.querySelector('input[name="workplace"]').value;
    const instagram = form.querySelector('input[name="instagram"]').value;

    // Отправляем их на сервер (AJAX, пример, если нужен реальный запрос)
    fetch('/profile/save', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        firstname: firstname,
        lastname: lastname,
        workplace: workplace,
        instagram: instagram
      })
    })
    .then(response => {
      if (response.ok) {
        // Скрыть форму
        form.style.display = 'none';
        // Показать блок с данными
        profileData.style.display = '';
        // Заполнить данными
        document.getElementById('data-firstname').textContent = firstname;
        document.getElementById('data-lastname').textContent = lastname;
        document.getElementById('data-workplace').textContent = workplace;
        document.getElementById('data-instagram').textContent = instagram;
      } else {
        alert('Ошибка сохранения!');
      }
    });
  });
});
