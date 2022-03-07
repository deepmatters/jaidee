from flask_wtf import FlaskForm
from wtforms.fields.html5 import EmailField, URLField, IntegerField
from wtforms.fields import PasswordField, SubmitField, StringField, RadioField, TextAreaField, BooleanField, DecimalField
from wtforms.validators import DataRequired
from flask_pagedown.fields import PageDownField

class SignupForm(FlaskForm):
    name = StringField('ชื่อ: ', validators=[DataRequired()])
    email = EmailField('อีเมล: ', validators=[DataRequired()])
    password = PasswordField('รหัสผ่าน: ', validators=[DataRequired()])
    password_check = PasswordField('ยืนยันรหัสผ่าน: ', validators=[DataRequired()])
    submit = SubmitField('สมัครสมาชิก')

class LoginForm(FlaskForm):
    email = EmailField('อีเมล: ', validators=[DataRequired()])
    password = PasswordField('รหัสผ่าน: ', validators=[DataRequired()])
    submit = SubmitField('ล็อกอิน')

class ForgetForm(FlaskForm):
    email = EmailField('อีเมล: ', validators=[DataRequired()])
    submit = SubmitField('ขอรหัสผ่านใหม่')

class PasswordChangeForm(FlaskForm):
    password_current = PasswordField('รหัสผ่านปัจจุบัน: ', validators=[DataRequired()])
    password_new = PasswordField('รหัสผ่านใหม่: ', validators=[DataRequired()])
    password_new_check = PasswordField('ยืนยันรหัสผ่านใหม่: ', validators=[DataRequired()])
    submit = SubmitField('เปลี่ยนรหัสผ่าน')

class PasswordResetForm(FlaskForm):
    password_reset_id = StringField('Password Reset ID: ', validators=[DataRequired()])
    password_new = PasswordField('รหัสผ่านใหม่: ', validators=[DataRequired()])
    password_new_check = PasswordField('ยืนยันรหัสผ่านใหม่: ', validators=[DataRequired()])
    submit = SubmitField('เปลี่ยนรหัสผ่าน')

class Chatbot(FlaskForm):
    input_request = StringField('Input')

class DonateForm(FlaskForm):
    topic = TextAreaField('ตอนเป็นวัยรุ่น ท่านมีความเครียด ความกังวล หรือความทุกข์เรื่องใดมากที่สุด เขียนเล่าคร่าวๆ')
    solution = TextAreaField('ท่านแก้ปัญหาเรื่องข้างบนอย่างไร')
    age = IntegerField('ปัจจุบันท่านอายุเท่าใด')
    gender = RadioField('เพศ: ', choices=[
        ("male", "ชาย"), 
        ("female", "หญิง"), 
        ("other", "อื่นๆ")
    ], default="male")
    province = StringField('อาศัยอยู่จังหวัดอะไร')
    submit = SubmitField('ส่งข้อมูล')