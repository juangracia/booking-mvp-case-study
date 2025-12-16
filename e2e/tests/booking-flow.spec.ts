import { test, expect } from '@playwright/test';

const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'user123';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('User Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login as user and view resources', async ({ page }) => {
    await page.getByTestId('email-input').fill(USER_EMAIL);
    await page.getByTestId('password-input').fill(USER_PASSWORD);
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL('/resources');
    await expect(page.locator('h1')).toContainText('Available Resources');
  });

  test('should create a booking', async ({ page }) => {
    await page.getByTestId('email-input').fill(USER_EMAIL);
    await page.getByTestId('password-input').fill(USER_PASSWORD);
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL('/resources');

    const resourceCard = page.locator('[data-testid^="resource-card-"]').first();
    await resourceCard.click();

    await expect(page.locator('h1')).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.locator('#date').fill(dateStr);
    await page.locator('#startTime').fill('10:00');
    await page.locator('#endTime').fill('11:00');
    await page.locator('#notes').fill('E2E Test Booking');

    await page.getByTestId('create-booking-button').click();

    await expect(page).toHaveURL('/bookings', { timeout: 10000 });
    await expect(page.locator('text=Active Bookings')).toBeVisible();
  });

  test('should cancel a booking', async ({ page }) => {
    await page.getByTestId('email-input').fill(USER_EMAIL);
    await page.getByTestId('password-input').fill(USER_PASSWORD);
    await page.getByTestId('login-button').click();

    await page.goto('/bookings');

    const cancelButton = page.locator('[data-testid^="cancel-booking-"]').first();

    if (await cancelButton.isVisible()) {
      page.on('dialog', (dialog) => dialog.accept());
      await cancelButton.click();

      await expect(page.locator('text=Cancelled')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show validation error for invalid login', async ({ page }) => {
    await page.getByTestId('email-input').fill('invalid@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();

    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/resources');
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.click('text=Admin');

    await expect(page).toHaveURL('/admin');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('should view and manage resources', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Manage Resources')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
  });

  test('should view all bookings', async ({ page }) => {
    await page.goto('/admin');

    await page.click('text=All Bookings');

    await expect(page.locator('table')).toBeVisible();
  });

  test('should create a new resource', async ({ page }) => {
    await page.goto('/admin');

    await page.click('text=Add Resource');

    const uniqueName = `Test Resource ${Date.now()}`;
    await page.locator('#name').fill(uniqueName);
    await page.locator('textarea').fill('E2E test resource description');

    await page.click('button:has-text("Create")');

    await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Overlap Prevention', () => {
  test('should prevent double booking', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill(USER_EMAIL);
    await page.getByTestId('password-input').fill(USER_PASSWORD);
    await page.getByTestId('login-button').click();

    await expect(page).toHaveURL('/resources');

    const resourceCard = page.locator('[data-testid^="resource-card-"]').first();
    await resourceCard.click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.locator('#date').fill(dateStr);
    await page.locator('#startTime').fill('14:00');
    await page.locator('#endTime').fill('15:00');
    await page.getByTestId('create-booking-button').click();

    await expect(page).toHaveURL('/bookings', { timeout: 10000 });

    await page.goto('/resources');
    await resourceCard.click();

    await page.locator('#date').fill(dateStr);
    await page.locator('#startTime').fill('14:30');
    await page.locator('#endTime').fill('15:30');
    await page.getByTestId('create-booking-button').click();

    await expect(page.locator('text=overlaps')).toBeVisible({ timeout: 5000 });
  });
});
