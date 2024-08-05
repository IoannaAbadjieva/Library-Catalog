const { test, expect } = require('@playwright/test');

const BaseURL = 'http://localhost:3000';

test('Verify "All Book link is visible"', async ({ page }) => {
  await page.goto(BaseURL);
  await page.waitForSelector('nav.navbar');
  const allBooksLink = await page.$('a[href="/catalog"]');
  const isLinkVisible = await allBooksLink.isVisible();

  expect(isLinkVisible).toBe(true);
});

test('Verify "Login link is visible"', async ({ page }) => {
  await page.goto(BaseURL);
  await page.waitForSelector('nav.navbar');
  const loginLink = await page.$('a[href="/login"]');
  const isLinkVisible = await loginLink.isVisible();

  expect(isLinkVisible).toBe(true);
});

test('Verify "Register link is visible"', async ({ page }) => {
  await page.goto(BaseURL);
  await page.waitForSelector('nav.navbar');
  const registerLink = await page.$('a[href="/login"]');
  const isLinkVisible = await registerLink.isVisible();

  expect(isLinkVisible).toBe(true);
});

test('Verify "All Books link is visible for logged in user"', async ({
  page,
}) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');
  const allBooksLink = await page.$('a[href="/catalog"]');
  const isLinkVisible = await allBooksLink.isVisible();

  expect(isLinkVisible).toBe(true);
});

test('Verify "My Books link is visible for logged in user"', async ({
  page,
}) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');
  const myBooksLink = await page.$('a[href="/profile"]');
  const isLinkVisible = await myBooksLink.isVisible();

  expect(isLinkVisible).toBe(true);
});

test('Verify "Add Book link is visible for logged in user"', async ({
  page,
}) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');
  const addBookLink = await page.$('a[href="/create"]');
  const isLinkVisible = await addBookLink.isVisible();

  expect(isLinkVisible).toBe(true);
});

test('Login with valid credentials should be succesfull', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');
  await page.$('a[href="catalog"]');

  expect(page.url()).toBe(`${BaseURL}/catalog`);
});

test('Login with invalid credentials should not be succesfull', async ({
  page,
}) => {
  await page.goto(`${BaseURL}/login`);
  await page.click('input[type="submit"]');
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toContain('alert');
    expect(dialog.message()).toContain('All fields are reqiured');
    await dialog.accept();
  });

  await page.$('a[href="login"]');
  expect(page.url()).toBe(`${BaseURL}/login`);
});

test('Login without email should not be succesfull', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="password"]', '123456');
  await page.click('input[type="submit"]');

  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toContain('alert');
    expect(dialog.message()).toContain('All fields are reqiured');
    await dialog.accept();
  });

  await page.$('a[href="login"]');
  expect(page.url()).toBe(`${BaseURL}/login`);
});

test('Login without password should not be succesfull', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.click('input[type="submit"]');
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toContain('alert');
    expect(dialog.message()).toContain('All fields are reqiured');
    await dialog.accept();
  });

  await page.$('a[href="login"]');
  expect(page.url()).toBe(`${BaseURL}/login`);
});

test('Add book with correct data', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForURL(`${BaseURL}/catalog`),
  ]);

  await page.click('a[href="/create"]');
  await page.waitForSelector('#create-form');

  await page.fill('#title', 'Test Book');
  await page.fill('#description', 'Test Book Description');
  await page.fill('#image', 'https://example.com/book-image.jpg');
  await page.selectOption('#type', 'Fiction');
  await page.click('#create-form input[type="submit"]');

  await page.waitForURL(`${BaseURL}/catalog`);
  expect(page.url()).toBe(`${BaseURL}/catalog`);
});

test('Add book with incorrect data', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'),
    await page.waitForURL(`${BaseURL}/catalog`),
  ]);

  await page.click('a[href="/create"]');
  await page.waitForSelector('#create-form');

  await page.fill('#description', 'Test Book Description');
  await page.fill('#image', 'https://example.com/book-image.jpg');
  await page.selectOption('#type', 'Fiction');

  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toContain('alert');
    expect(dialog.message()).toContain('All fields are reqiured');
    await dialog.accept();
  });

  await page.$('a[href="/create"]');
  expect(page.url()).toBe(`${BaseURL}/create`);
});

test('Login and verify all books are displayed', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'),
    await page.waitForURL(`${BaseURL}/catalog`),
  ]);

  await page.waitForSelector('.dashboard');
  const bookElements = await page.$$('.other-books-list li');

  expect(bookElements.length).toBeGreaterThan(0);
});

test('Login and navigateto Details page', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');

  await Promise.all([
    page.click('input[type="submit"]'),
    await page.waitForURL(`${BaseURL}/catalog`),
  ]);

  await page.click('a[href="/catalog"]');
  await page.waitForSelector('.otherBooks');
  await page.click('.otherBooks a.button');
  await page.waitForSelector('.book-information');

  const detailsPageTitle = await page.textContent('.book-information h3');

  expect(detailsPageTitle).toBe('Test Book');
});

test('Verify redirection ofLogout link after user login', async ({ page }) => {
  await page.goto(`${BaseURL}/login`);
  await page.fill('input[name="email"]', 'peter@abv.bg');
  await page.fill('input[name="password"]', '123456');
  page.click('input[type="submit"]');

  const logoutLink = await page.$('a[href="javascript:void(0)"]');
  await logoutLink.click();

  const redirectedURL = page.url();
  expect(redirectedURL).toBe(`${BaseURL}/catalog`);
});
