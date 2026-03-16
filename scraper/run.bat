@echo off
cd /d "%~dp0"

REM Install dependencies if needed
pip install -r requirements.txt --quiet

REM Run the scraper
python instagram_scraper.py

pause
