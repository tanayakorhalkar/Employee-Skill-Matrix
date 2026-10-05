import { test, expect } from '@playwright/test';

test.describe('Employee Skill Matrix E2E Test Suite', () => {
  test('Complete Flow: Employee rates skill, Manager reviews, RBAC verified', async ({ page }) => {
    // 1. Employee Login
    await page.goto('/');
    await expect(page.locator('text=Employee Skill Matrix')).toBeVisible();

    // Fill login form
    await page.fill('input#login_userid', 'emp1');
    await page.fill('input#login_password', 'Emp@123');
    await page.click('button[type="submit"]');

    // 2. Employee Dashboard
    await expect(page.locator('text=Welcome back, John')).toBeVisible();
    await expect(page.locator('text=My Rated Skills')).toBeVisible();

    // 3. View Skills & Rate Skill
    await page.click('a[href="#my-skills"], button:has-text("My Skills")');
    await expect(page.locator('text=Skill Catalog & Self-Rating')).toBeVisible();

    // Search for a skill
    await page.fill('input[placeholder*="Search"]', 'Python');
    await expect(page.locator('text=Programming Languages')).toBeVisible();

    // Click Rate button or update rating
    const rateBtn = page.locator('button:has-text("Update Rating"), button:has-text("Rate Skill")').first();
    await rateBtn.click();

    // Select rating 5
    await page.click('button[data-rating="5"]');
    await page.fill('textarea[name="comments"]', 'E2E automated self-rating submission verification.');
    await page.click('button:has-text("Save & Submit")');

    // Verify toast or confirmation
    await expect(page.locator('text=successfully saved, text=Rating updated').first()).toBeVisible({ timeout: 5000 });

    // 4. Logout employee
    await page.click('button:has-text("Sign Out")');
    await expect(page.locator('input#login_userid')).toBeVisible();

    // 5. Manager Login
    await page.fill('input#login_userid', 'manager');
    await page.fill('input#login_password', 'Manager@123');
    await page.click('button[type="submit"]');

    // Verify Manager Dashboard
    await expect(page.locator('text=Manager Portal')).toBeVisible();
    await expect(page.locator('text=Sarah Connor')).toBeVisible();

    // 6. View Skill Review
    await page.click('button:has-text("Skill Review"), a[href="#review"]');
    await expect(page.locator('text=Skill Review & Approvals')).toBeVisible();

    // Review John Doe's rating
    await expect(page.locator('text=John Doe').first()).toBeVisible();

    // Click Approve
    const approveBtn = page.locator('button:has-text("Approve")').first();
    await approveBtn.click();
    await expect(page.locator('text=approved successfully, text=Approved').first()).toBeVisible();

    // 7. Verify Employee Skill Matrix Page
    await page.click('button:has-text("Skill Matrix"), a[href="#matrix"]');
    await expect(page.locator('text=Organizational Skill Matrix')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('RBAC Access Control: Employee cannot access admin management', async ({ page }) => {
    await page.goto('/');
    await page.fill('input#login_userid', 'emp1');
    await page.fill('input#login_password', 'Emp@123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Welcome back, John')).toBeVisible();

    // Verify Admin tabs are not present for Employee
    await expect(page.locator('button:has-text("Employee Management")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Skills Management")')).not.toBeVisible();
  });
});
