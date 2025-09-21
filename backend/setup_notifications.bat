@echo off
echo Setting up automated notification reminders...

REM Set up daily reminders at 9 AM
schtasks /create /tn "TaskFlow Daily Reminders" /tr "cd /d C:\Users\%USERNAME%\Desktop\project\backend && python manage.py send_reminders --hours 24" /sc daily /st 09:00

REM Set up daily summaries at 6 PM
schtasks /create /tn "TaskFlow Daily Summaries" /tr "cd /d C:\Users\%USERNAME%\Desktop\project\backend && python manage.py send_summaries --type daily" /sc daily /st 18:00

REM Set up weekly summaries on Mondays at 9 AM
schtasks /create /tn "TaskFlow Weekly Summaries" /tr "cd /d C:\Users\%USERNAME%\Desktop\project\backend && python manage.py send_summaries --type weekly" /sc weekly /d MON /st 09:00

echo Notification system setup complete!
echo.
echo Scheduled tasks created:
echo - Daily reminders: 9:00 AM
echo - Daily summaries: 6:00 PM  
echo - Weekly summaries: Mondays 9:00 AM
echo.
echo You can view and manage these tasks in Windows Task Scheduler.
