# backend/mailer.py

import os
import smtplib
import ssl

EMAIL = os.environ.get('SMTP_USER')
PWD = os.environ.get('SMTP_PASS')

def send_email(to, subject, body):
    if not EMAIL or not PWD:
        print("❌ SMTP credentials are missing.")
        return

    msg = f"Subject: {subject}\n\n{body}"
    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(EMAIL, PWD)
            server.sendmail(EMAIL, to, msg.encode('utf-8'))
            print(f"✅ Email sent to {to} with subject: {subject}")
    except Exception as e:
        print(f"❌ Failed to send email to {to}: {e}")