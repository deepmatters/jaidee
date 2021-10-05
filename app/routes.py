from flask import render_template, redirect, url_for, flash, request, jsonify, json
from app import app, db, mail
from app.forms import SignupForm, LoginForm, ForgetForm, PasswordChangeForm, PasswordResetForm, Chatbot
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User
from flask_mail import Message
import pymongo
import random
from datetime import datetime
from threading import Thread
# import boto3
# from pathlib import Path
from pythainlp.tokenize import word_tokenize
from pythainlp.tag import pos_tag
import re

@app.route('/')
def home():
    form = Chatbot()

    return render_template('home.html', form=form)

"""
Login and user sub-system
"""

@app.route('/signup', methods=('GET', 'POST'))
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
        
    form = SignupForm()

    if form.validate_on_submit():
        # Get data from form
        name = form.name.data
        email = form.email.data
        password = form.password.data
        password_check = form.password_check.data

        # Check if email already exist
        email_exist = User.query.filter_by(email=email).first()
        if email_exist:
            comment = f"อีเมล {email} เคยลงทะเบียนไว้แล้ว"   
            return render_template('signup-error.html', comment=comment)

        # Check if passwords match
        if password == password_check:
            password_final = password
        else:
            comment = "คุณพิมพ์รหัสผ่านสองช่องไม่ตรงกัน"
            return render_template('signup-error.html', comment=comment)

        # Create user with name, email, password
        new_user = User(name=name, email=email)
        new_user.set_password(password_final)
        db.session.add(new_user)
        db.session.commit()

        # Give confirmation, login, and redirect to profile page
        user = User.query.filter_by(email=form.email.data).first()
        login_user(user)
        flash("ลงทะเบียนสำเร็จ และล็อกอินเรียบร้อยแล้ว")
        return redirect('/profile')

    return render_template('signup.html', form=form)

# Function to send mail using thread
def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

@app.route('/forget', methods=('GET', 'POST'))
def forget():
    form = ForgetForm()
    if form.validate_on_submit():
        # Get data from form
        email = form.email.data

        # Check if entered email is an existing user or not
        user = User.query.filter_by(email=email).first()
        if user is None:
            # Return comment and error type
            comment = "ไม่พบอีเมลที่กรอกในระบบสมาชิก"
            error_type = "wrong_email"
            return render_template('forget-result.html', comment=comment, error_type=error_type)
        # If email exists, proceed to password recovery process
        else:
            # Generate password_reset_id
            rand_universe = [1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f","g","A","B","C","D","E","F","G"]
            rand_str = ""
            rand_list = random.sample(rand_universe, k=12)
            password_reset_id = rand_str.join([str(i) for i in rand_list])

            # Insert password_reset_id in db for this user
            user.password_reset_id = password_reset_id
            db.session.commit()

            # Send an email to user

            """
            !!! MUST CUSTOMISE MESSAGE BODY IN IMPLEMENTATION !!!
            """
            msg = Message(subject='[chatbotjaidee.com] รีเซ็ตรหัสผ่าน',
                  sender = 'support@cfapp.org',
                  recipients = [email])  # <<< CONFIGURE WEBSITE URL
            msg.body = ("คุณได้กดขอรหัสผ่านใหม่จากเว็บ chatbotjaidee.com กรุณากดลิงก์นี้ https://chatbotjaidee.com/password-reset/" + password_reset_id + " เพื่อตั้งรหัสผ่านใหม่")  # <<< CONFIGURE EMAIL MESSAGE AND URL

            Thread(target=send_async_email, args=(app, msg)).start()  # Send mail asynchronously

            # Return comment
            comment = "เราได้ส่งคำแนะนำในการตั้งรหัสผ่านใหม่ไปยังอีเมลของท่านแล้ว"
            return render_template('forget-result.html', comment=comment)

    return render_template('forget.html', form=form)

# Password recovery API endpoint
@app.route('/password-reset/<string:password_reset_id>')
def password_reset(password_reset_id):
    # Check if password_reset_id is valid or not
    user = User.query.filter_by(password_reset_id=password_reset_id).first()
    if user is None:
        flash("ลิงก์รีเซ็ตรหัสผ่านไม่ผ่านการตรวจสอบ หรือได้ใช้ลิงก์นี้ไปแล้ว")
        return redirect('/')
    # If password_reset_id is valid, proceed to reset password
    else:
        form = PasswordResetForm()
        return render_template('password-reset.html', password_reset_id=password_reset_id, form=form)

@app.route('/password-reset-result', methods=('GET', 'POST'))
def password_reset_result():
    form = PasswordResetForm()

    if form.validate_on_submit():
        # Get data from form
        password_reset_id = form.password_reset_id.data
        password_new = form.password_new.data
        password_new_check = form.password_new_check.data

        # Get the user who belong to this password_reset_id
        user = User.query.filter_by(password_reset_id=password_reset_id).first()

        # Check if new passwords match each other
        if password_new != password_new_check:
            # Return comment and error type
            comment = "คุณพิมพ์รหัสผ่านสองช่องไม่ตรงกัน"
            error_type = "unmatched_password_check_reset"
            return render_template('password-change-result.html', comment=comment, error_type=error_type, password_reset_id=password_reset_id)
        # Proceed if passwords check passed
        else:
            # Generate new password hash
            user.set_password(password_new)

            # Update password_reset_id with blank string so the id can be used only this time only
            # and can't be used in API
            user.password_reset_id = ""
            db.session.commit()

            # Login user instantly
            login_user(user)
            flash("ล็อกอินเรียบร้อยแล้ว")

            # Return comment
            comment = "กรุณาใช้รหัสผ่านใหม่เมื่อล็อกอินครั้งถัดไป"
            return render_template('password-change-result.html', comment=comment)

    return render_template('password-change-result.html')

@app.route('/login', methods=('GET', 'POST'))
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    form = LoginForm()
    
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user is None or not user.check_password(form.password.data):
            return render_template('fail.html')
        
        login_user(user)

        # Update lastlogin_dt to the current time
        user.lastlogin_dt = datetime.now()
        db.session.commit()

        flash("ล็อกอินสำเร็จ")
        return redirect('/profile')

    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("ออกจากระบบเรียบร้อยแล้ว")
    return redirect(url_for('home'))

@app.route('/password-change', methods=('GET', 'POST'))
@login_required
def password_change():
    form = PasswordChangeForm()

    if form.validate_on_submit():
        # Get data from form
        pass_current = form.password_current.data
        pass_new = form.password_new.data
        pass_new_check = form.password_new_check.data

        # Connect to db
        user = User.query.filter_by(id=current_user.id).first()

        # Check if current pass matches pass in db
        if not user.check_password(pass_current):
            # Return comment and error type
            comment = "คุณใส่รหัสผ่านปัจจุบันไม่ถูกต้อง"
            error_type = "wrong_pass_current"
            return render_template('password-change-result.html', comment=comment, error_type=error_type)
        # Check if new passwords match each other
        elif pass_new != pass_new_check:
            # Return comment and error type
            comment = "คุณพิมพ์รหัสผ่านสองช่องไม่ตรงกัน"
            error_type = "unmatched_password_check"
            return render_template('password-change-result.html', comment=comment, error_type=error_type)
        # Proceed if 2 above checks passed
        else:
            # Generate new password hash
            user.set_password(pass_new)
            db.session.commit()

            # Return comment
            comment = "กรุณาใช้รหัสผ่านใหม่เมื่อล็อกอินครั้งถัดไป"
            return render_template('password-change-result.html', comment=comment)

    return render_template('password-change.html', form=form)

"""
Profile
"""

@app.route('/profile')
@login_required
def profile():
    user = User.query.filter_by(id=current_user.id).first()
    user_id = user.id
    user_name = user.name
    user_email = user.email
    user_role = user.role
    user_create_dt = user.create_dt
    user_lastlogin_dt = user.lastlogin_dt

    return render_template('profile.html', user_id=user_id, user_name=user_name, user_email=user_email, user_role=user_role, user_create_dt=user_create_dt, user_lastlogin_dt=user_lastlogin_dt)

"""
Search API
"""

def gender_convert(gender):
    if gender == 'male':
        return 'ชาย'
    elif gender == 'female':
        return 'หญิง'
    else:
        return 'ไม่ระบุเพศ'

@app.route('/search/api', methods=('GET', 'POST'))
def search_api():
    if request.method == 'POST':
        # Get request JSON and parse as dict
        input_request = request.get_json()
        
        # Remove Zero-width Space to prevent white block display
        input_request['request'] = input_request['request'].replace('\u200b', '')

        # Process input request using PythaiNLP
        word_list_raw = word_tokenize(input_request['request'], engine='newmm', keep_whitespace=False)
        word_list_pos = pos_tag(word_list_raw, corpus='pud')

        print(f"Words deconstruction: {word_list_pos}")

        word_list = []

        for word in word_list_pos:
            if word[1] == 'NOUN' or word[1] == 'VERB' or word[1] == 'ADJ' or word[1] == 'PROPN':
                word_list.append(word[0])

        # Prepare regex
        word_regex_and = '.*'.join(word_list)
        word_regex_or = '|'.join(word_list)
        regex_and = re.compile(word_regex_and)
        regex_or = re.compile(word_regex_or)

        # Connect and define the database
        client = pymongo.MongoClient(app.config['DB_SOLUTION_URI'])
        db = client.jaidee

        # Find the db using the given regex
        data = []

        for result in db.solution.find({'topic': {'$regex': regex_and}}):
            data.append({
                "gender": gender_convert(result['gender']), 
                "age": result['age'], 
                "area": result['area'], 
                "topic": result['topic'], 
                "solution": result['solution'], 
                "mode": 1  # 1 means strict mode
            })

        if len(data) > 0:  # If there's at least one result
            # Random shuffle data list
            random.shuffle(data)

            print(f"Data length: {len(data)}")
            print(f"Regex AND: {regex_and}")

            return jsonify(data)
        else:  # If no result, use OR regex
            for result in db.solution.find({'topic': {'$regex': regex_or}}):
                data.append({
                    "gender": gender_convert(result['gender']), 
                    "age": result['age'], 
                    "area": result['area'], 
                    "topic": result['topic'], 
                    "solution": result['solution'], 
                    "mode": 2  # 2 means loose mode
                })

            if len(data) > 0:  # If there's result
                # Random shuffle data list
                random.shuffle(data)

                print(f"Data length: {len(data)}")
                print(f"Regex OR: {regex_or}")

                return jsonify(data)
            else:  # If there's no result at all
                data.append({"result": 0})

                print(f"Data length: {len(data)}")
                print(f"Regex OR: {regex_or}")

                return jsonify(data)

"""
Static
"""

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/donate')
def donate():
    return render_template('donate.html')