import time
from flask import Flask, render_template, request, redirect
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__)

# =====================================================
#   GOOGLE SHEETS: ОПТИМИЗИРОВАННАЯ РАБОТА С БД
# =====================================================

class GoogleSheetsDB:
    def __init__(self):
        """
        Инициализация БД:
        • Подключение к Google Sheets
        • Загрузка листов
        • Создание кэша (ускоряет работу)
        """

        # Права доступа
        scope = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]

        # Авторизация сервисного аккаунта
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            'service_acc.json', scope
        )

        # Подключаемся к Sheets
        self.client = gspread.authorize(creds)

        # Открываем таблицу
        self.spreadsheet = self.client.open('NY NOTAILS 25')

        # Загружаем листы
        self.users_sheet = self.spreadsheet.worksheet('Users')
        self.bart_sheet = self.spreadsheet.worksheet('PostBart')
        self.cocktails_sheet = self.spreadsheet.worksheet('PostCocktails')
        self.ai_sheet = self.spreadsheet.worksheet('PostAi')

        # Кэш
        self.cache = {}
        self.cache_time = {}
        self.CACHE_TTL = 300   # 5 минут

    # =====================================================
    #   КЭШ ИНФРАСТРУКТУРА
    # =====================================================

    def _is_cache_valid(self, key):
        """Проверяет, не устарел ли кэш."""
        if key in self.cache:
            return time.time() - self.cache_time.get(key, 0) < self.CACHE_TTL
        return False

    def _set_cache(self, key, value):
        """Добавляет значение в кэш."""
        self.cache[key] = value
        self.cache_time[key] = time.time()

    def invalidate_cache(self, tg_id):
        """Удаляет все кэш-значения конкретного пользователя."""
        keys = [
            f"user_{tg_id}", f"bart_{tg_id}",
            f"cocktail_{tg_id}", f"ai_{tg_id}",
            f"complete_{tg_id}"
        ]
        for key in keys:
            self.cache.pop(key, None)
            self.cache_time.pop(key, None)

    # =====================================================
    #   ВЫБОРКА ВСЕХ ДАННЫХ ОДНИМ ЗАПРОСОМ
    # =====================================================

    def get_user_complete_data(self, tg_id):
        """
        Получает ВСЕ данные пользователя:
          • профиль
          • работа бартендера
          • коктейли
          • креативы
        Всего 4 запроса к Google Sheets → в 3 раза быстрее.
        """

        cache_key = f"complete_{tg_id}"

        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]

        try:
            # Загружаем все таблицы
            users = self.users_sheet.get_all_records()
            barts = self.bart_sheet.get_all_records()
            cocktails = self.cocktails_sheet.get_all_records()
            creatives = self.ai_sheet.get_all_records()

            result = {
                "user": None,
                "bart": None,
                "cocktail": None,
                "creative": None
            }

            # Поиск пользователя в массиве
            for u in users:
                if str(u.get("tg_id")) == str(tg_id):
                    result["user"] = u
                    break

            for b in barts:
                if str(b.get("tg_id")) == str(tg_id):
                    result["bart"] = b
                    break

            for c in cocktails:
                if str(c.get("tg_id")) == str(tg_id):
                    result["cocktail"] = c
                    break

            for a in creatives:
                if str(a.get("tg_id")) == str(tg_id):
                    result["creative"] = a
                    break

            # Кэшируем
            self._set_cache(cache_key, result)
            return result

        except Exception as e:
            print("Ошибка загрузки данных:", e)
            return None

    # =====================================================
    #   USERS
    # =====================================================

    def get_user_by_tg_id(self, tg_id):
        """Возвращает профиль пользователя."""
        cache_key = f"user_{tg_id}"

        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]

        try:
            for record in self.users_sheet.get_all_records():
                if str(record.get("tg_id")) == str(tg_id):
                    self._set_cache(cache_key, record)
                    return record

            return None
        except Exception as e:
            print("Ошибка поиска пользователя:", e)
            return None

    def user_exists(self, tg_id):
        """True = пользователь есть."""
        return self.get_user_by_tg_id(tg_id) is not None

    def create_user(self, tg_id, firstname, workplace, instagram):
        """Создаёт нового пользователя."""
        try:
            if self.user_exists(tg_id):
                return False, "Пользователь уже существует"

            row = [tg_id, firstname, workplace, instagram]
            self.users_sheet.append_row(row)

            self.invalidate_cache(tg_id)
            return True, "ОК"
        except Exception as e:
            return False, str(e)

    # =====================================================
    #   POSTS (3 категории)
    # =====================================================

    # Универсальный метод — меньше повторений
    def _create_post(self, sheet, cache_key, tg_id, name, link):
        try:
            # Проверяем, есть ли уже работа
            for r in sheet.get_all_records():
                if str(r.get("tg_id")) == str(tg_id):
                    return False, "Работа уже есть"

            # Добавляем строку
            sheet.append_row([tg_id, name, link])

            # Чистим кэш
            self.invalidate_cache(tg_id)

            return True, "Сохранено"
        except Exception as e:
            return False, str(e)

    def create_bart_post(self, tg_id, name, link):
        return self._create_post(self.bart_sheet, f"bart_{tg_id}", tg_id, name, link)

    def create_cocktail_post(self, tg_id, name, link):
        return self._create_post(self.cocktails_sheet, f"cocktail_{tg_id}", tg_id, name, link)

    def create_ai_post(self, tg_id, name, link):
        return self._create_post(self.ai_sheet, f"ai_{tg_id}", tg_id, name, link)


# Инициализация БД
db = GoogleSheetsDB()


# =====================================================
#   FLASK РОУТЫ
# =====================================================

@app.route('/')
def home():
    """
    Если tg_id нет → показать обложку.
    Если tg_id есть → проверить, зарегистрирован ли пользователь.
    """
    tg_id = request.args.get("tg_id")



    if db.user_exists(tg_id):
        return redirect(f"/materials?tg_id={tg_id}")
    if not tg_id:
        return render_template("coverpage.html")

    return render_template("coverpage.html")


@app.route('/register', methods=['POST'])
def register():
    """
    Обработка регистрации пользователя.
    Сохраняем всё в Google Sheets.
    """

    tg_id = request.form.get("tg_id_reg", "").strip()
    firstname = request.form.get("firstname", "").strip()
    workplace = request.form.get("workplace", "").strip()
    instagram = request.form.get("instagram", "").strip()

    success, message = db.create_user(
        tg_id, firstname, workplace, instagram
    )

    if success:
        return redirect(f"/materials?tg_id={tg_id}")
    else:
        print("Ошибка регистрации:", message)
        return redirect("/")


@app.route('/materials')
def materials():
    """Главная страница после регистрации."""
    tg_id = request.args.get("tg_id")
    return render_template("materials.html", tg_id=tg_id, active_page="materials")


@app.route('/sendwork', methods=['GET', 'POST'])
def sendwork():
    """
    Страница загрузки работ:
        • bartender
        • cocktail
        • creative
    """

    tg_id = request.args.get("tg_id")



    # Если POST → сохраняем работу
    if request.method == "POST":
        category = request.form.get("category")
        name = request.form.get("name")
        link = request.form.get("link")

        if category == "bartender":
            success, message = db.create_bart_post(tg_id, name, link)
        elif category == "cocktail":
            success, message = db.create_cocktail_post(tg_id, name, link)
        elif category == "creative":
            success, message = db.create_ai_post(tg_id, name, link)
        else:
            return "Неверная категория", 400

        return redirect(f"/sendwork?tg_id={tg_id}")

    # Если GET → показываем страницу
    data = db.get_user_complete_data(tg_id)

    return render_template(
        "sendwork.html",
        tg_id=tg_id,
        bart=data["bart"],
        cock=data["cocktail"],
        creative=data["creative"],
        active_page="sendwork"
    )


@app.route('/profile')
def profile():
    """Профиль пользователя."""

    tg_id = request.args.get("tg_id")

    if not tg_id:
        return redirect("/")

    data = db.get_user_complete_data(tg_id)

    if not data or not data["user"]:
        return redirect(f"/?tg_id={tg_id}")

    return render_template(
        "profile.html",
        tg_id=tg_id,
        user=data["user"],
        bart=data["bart"],
        cock=data["cocktail"],
        creative=data["creative"],
        active_page="profile"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)