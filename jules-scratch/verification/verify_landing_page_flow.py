from playwright.sync_api import sync_playwright, Page, expect

def run(page: Page):
    # Navigate to the landing page
    page.goto("http://localhost:5000")

    # Wait for the hero section to be visible
    expect(page.get_by_role("heading", name="The Future of AI Automation is Here")).to_be_visible()

    # Take a screenshot of the landing page
    page.screenshot(path="jules-scratch/verification/landing_page.png")

    # Click the login button in the header
    page.get_by_role("button", name="Login").click()

    # Wait for the login page to load
    expect(page.get_by_role("heading", name="Welcome to AuraOS")).to_be_visible()

    # Take a screenshot of the login page
    page.screenshot(path="jules-scratch/verification/login_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run(page)
        browser.close()
