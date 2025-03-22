from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# Replace the path with your actual path to the chromedriver
webdriver_path = '/usr/local/bin/chromedriver'  # e.g., 'C:/path/to/chromedriver'

# Chrome driver options
chrome_options = Options()

# Set up the Chrome WebDriver
service = Service(webdriver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)

# URL of the webpage you want to take a screenshot of
url = 'http://localhost:8000/screenshot.html'  # Replace with the actual URL of your webpage

# Open the webpage once initially
driver.get(url)

try:
    while True:  # Infinite loop to keep the script running
        # Wait for 15 seconds before refreshing the page
        
        driver.refresh()  # Refresh the webpage
        time.sleep(30)  
        # Take a screenshot and save it. The timestamp ensures a unique filename for each screenshot.
        timestamp = int(time.time())
        screenshot_filename = f'screenshot.png'
        driver.save_screenshot(screenshot_filename)
except Exception as e:
    print("Error occurred:", e)
finally:
    driver.quit()  # Close the WebDriver if an exception occurs