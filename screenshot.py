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
url = 'http://scottypres.github.io/screenshot.html'  # Replace with the actual URL of your webpage

try:
    driver.get(url)  # Open the webpage

    # Wait for the page to load (adjust time as necessary)
    time.sleep(5)

    # Locate and click the Quickview button
    quickview_button = driver.find_element(By.ID, 'quickviewButton')
    quickview_button.click()

    # Wait for 5 seconds after clicking the button
    time.sleep(5)

    # Take a screenshot and save it as 'screenshot.png'
    driver.save_screenshot('screenshot.png')

except Exception as e:
    print("Error occurred:", e)
finally:
    driver.quit()  # Close the WebDriver