window.Telegram.WebApp.ready();

const user = window.Telegram.WebApp.initDataUnsafe.user || {};

const avatarUrl = user.photo_url || ''; // Проверить, что именно передает Телеграм
const userName = user.first_name + (user.last_name ? ' ' + user.last_name : '');

const avatarImg = document.getElementById('profile-avatar');
const userNameSpan = document.getElementById('user-name');

if (avatarUrl) {
  avatarImg.src = avatarUrl;
} else {
  avatarImg.style.display = 'none';  // Если аватарки нет, скрыть img
}



userNameSpan.textContent = userName;
