import time
from functools import lru_cache
import gspread
from flask import Flask, render_template, request, redirect, make_response
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.base'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

dp = SQLAlchemy(app)


class User(dp.Model):
    id = dp.Column(dp.Integer, primary_key=True)
    tg_id = dp.Column(dp.String, unique=True, index=True)  # Добавлен индекс!
    firstname = dp.Column(dp.String(60))
    lastname = dp.Column(dp.String(80))
    workplace = dp.Column(dp.String(120))
    instagram = dp.Column(dp.String(120))


class PostBart(dp.Model):
    id = dp.Column(dp.Integer, primary_key=True)
    tg_id = dp.Column(dp.String, unique=True, index=True)
    name = dp.Column(dp.String(60), unique=True)
    link = dp.Column(dp.String(80), unique=True)


class PostCocktails(dp.Model):
    id = dp.Column(dp.Integer, primary_key=True)
    tg_id = dp.Column(dp.String, unique=True, index=True)
    name = dp.Column(dp.String(60), unique=True)
    link = dp.Column(dp.String(80), unique=True)


class PostAi(dp.Model):
    id = dp.Column(dp.Integer, primary_key=True)
    tg_id = dp.Column(dp.String, unique=True, index=True)
    name = dp.Column(dp.String(60), unique=True)
    link = dp.Column(dp.String(80), unique=True)





@app.route('/')
def home():
    tg_id = request.args.get('tg_id')
    user_exists = dp.session.query(User).filter_by(tg_id=str(tg_id)).first()
    if not tg_id:
        return render_template('coverpage.html')
    if user_exists:
        return redirect(f'/materials?tg_id={tg_id}')
    else:
        return render_template('coverpage.html')


@app.route('/coverpage')
def coverpage():
    return render_template('coverpage.html')


@app.route('/register', methods=['POST', 'GET'])
def register():
    try:
        tg_id_reg = request.form.get('tg_id_reg', '').strip()
        firstname = request.form.get('firstname', '').strip()
        lastname = request.form.get('lastname', '').strip()
        workplace = request.form.get('workplace', '').strip()
        instagram = request.form.get('instagram', '').strip()

        user = User(tg_id=tg_id_reg, firstname=firstname, lastname=lastname, workplace=workplace, instagram=instagram)
        print(tg_id_reg)
        dp.session.add(user)
        dp.session.commit()

        return redirect(f'/materials?tg_id={tg_id_reg}')

    except Exception as e:
        dp.session.rollback()
        print(f"Ошибка регистрации: {e}")
        return redirect('/register')


@app.route('/materials')
def main_page():
    tg_id = request.args.get('tg_id')
    return render_template('materials.html', tg_id=tg_id)


@app.route('/sendwork', methods=['POST', 'GET'])
def sendwork():
    tg_id = request.args.get('tg_id')
    if not tg_id:
        return redirect('/')

    if request.method == 'POST':
        category = request.form.get('category', '').strip()
        name = request.form.get('name', '')
        link = request.form.get('link', '')

        if category == 'bartender':
            post = PostBart(tg_id=tg_id, name=name, link=link)
        elif category == 'cocktail':
            post = PostCocktails(tg_id=tg_id, name=name, link=link)
        elif category == 'creative':
            post = PostAi(tg_id=tg_id, name=name, link=link)
        else:
            return 'Неверная категория', 400

        try:
            dp.session.add(post)
            dp.session.commit()
            return redirect(f'/sendwork?tg_id={tg_id}')
        except Exception as e:
            dp.session.rollback()
            print(f"Ошибка при добавлении работы: {e}")
            return 'Произошла ошибка при сохранении работы', 500

    # Получаем все работы пользователя для проверки
    bart = PostBart.query.filter_by(tg_id=str(tg_id)).first()
    cock = PostCocktails.query.filter_by(tg_id=str(tg_id)).first()
    creative = PostAi.query.filter_by(tg_id=str(tg_id)).first()

    return render_template('sendwork.html',
                           tg_id=tg_id,
                           bart=bart,
                           cock=cock,
                           creative=creative)


@app.route('/profile', methods=['GET'])
def profile():
    tg_id = request.args.get('tg_id')
    print(f"Profile - получен tg_id: {tg_id}")

    if not tg_id:
        print("Ошибка: tg_id не передан")
        return redirect('/')

    user = User.query.filter_by(tg_id=str(tg_id)).first()
    bart = PostBart.query.filter_by(tg_id=str(tg_id)).first()
    cock = PostCocktails.query.filter_by(tg_id=str(tg_id)).first()
    creative = PostAi.query.filter_by(tg_id=str(tg_id)).first()
    print(f"Найден пользователь: {user}")

    if user:
        print(f"Имя: {user.firstname}, Фамилия: {user.lastname}")
        print(f"Место работы: {user.workplace}, Instagram: {user.instagram}")
        return render_template('profile.html', user=user, tg_id=tg_id, bart=bart, cock=cock, creative=creative)
    else:
        print("Пользователь не найден в базе данных")
        return redirect(f'/?tg_id={tg_id}')


if __name__ == '__main__':
    with app.app_context():
        dp.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)