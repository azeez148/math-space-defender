import { test, expect } from '@playwright/test';
for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }]) {
  test(`mission controls and layout at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    const external: string[] = []; page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url()); });
    await page.goto('/'); await expect(page.getByRole('heading', { name: 'MATH SPACE DEFENDER' })).toBeVisible();
    await page.getByRole('button', { name: 'START MISSION' }).click();
    await expect(page.getByRole('button', { name: /Galaxy Warrior/ })).toBeDisabled();
    await page.getByRole('button', { name: /Space Rookie/ }).click();
    await expect(page.locator('canvas')).toBeVisible(); await page.keyboard.press('p'); await expect(page.getByRole('heading', { name: 'Mission paused' })).toBeVisible();
    const time = await page.locator('mission-scoreboard').innerText(); await page.waitForTimeout(1000); expect(await page.locator('mission-scoreboard').innerText()).toBe(time);
    await page.getByRole('button', { name: 'RESUME MISSION' }).click();
    const expression = await page.locator('.question-panel strong').innerText(); const [a, b] = expression.match(/\d+/g)!.map(Number); const answer = expression.includes('+') ? a + b : a - b;
    await page.getByRole('button', { name: `Shoot answer ${answer}`, exact: true }).click(); await expect(page.locator('.feedback')).toContainText(/\+15/);
    await page.waitForTimeout(1100); await expect(page.locator('mission-scoreboard')).toContainText('0015');
    await page.getByRole('button', { name: 'Pause or resume' }).click(); await page.getByRole('button', { name: 'Restart mission' }).click(); await expect(page.locator('mission-scoreboard')).toContainText('0000');
    await page.getByRole('button', { name: 'Enable sound' }).click(); await expect(page.getByRole('button', { name: 'Mute sound' })).toBeVisible(); await page.getByRole('button', { name: 'Mute sound' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/game-${viewport.width}.png` });
    expect(errors).toEqual([]); expect(external).toEqual([]);
  });
}
test('complete three missions, persist unlocks and high score, and handle game over', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/'); await page.getByRole('button', { name: 'START MISSION' }).click(); await page.getByRole('button', { name: /Space Rookie/ }).click();
  for (let level = 1; level <= 3; level++) {
    for (let round = 1; round <= 10; round++) {
      await expect(page.locator('.answer-access button')).toHaveCount(level === 1 ? 3 : 4);
      const text = await page.locator('.question-panel strong').innerText(); const [a, b, c] = text.match(/\d+/g)!.map(Number);
      const answer = text.includes('(') ? a * b + c : text.includes('×') ? a * b : text.includes('÷') ? a / b : text.includes('+') ? a + b : a - b;
      await page.getByRole('button', { name: `Shoot answer ${answer}`, exact: true }).click();
      await expect(page.locator('.feedback')).toContainText(/\+15/); await expect(page.locator('.feedback')).toHaveCount(0);
    }
    await expect(page.getByText('MISSION ACCOMPLISHED!', { exact: true })).toBeVisible();
    if (level < 3) await page.getByRole('button', { name: 'NEXT MISSION' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Earth is safe!' })).toBeVisible(); await expect(page.locator('.final-score')).toContainText('450');
  await page.getByRole('button', { name: 'Return to base' }).click(); await page.reload();
  await expect(page.locator('.welcome-stats')).toContainText('450'); await page.getByRole('button', { name: 'START MISSION' }).click();
  await expect(page.getByRole('button', { name: /Math Commander/ })).toBeEnabled(); await page.getByRole('button', { name: /Space Rookie/ }).click();
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.answer-access button')).toHaveCount(3);
    const text = await page.locator('.question-panel strong').innerText(); const [a, b] = text.match(/\d+/g)!.map(Number); const answer = text.includes('+') ? a + b : a - b;
    const buttons = page.locator('.answer-access button');
    for (let j = 0; j < 3; j++) { if (!(await buttons.nth(j).innerText()).endsWith(`· ${answer}`)) { await buttons.nth(j).click(); break; } }
    await expect(page.locator('.feedback')).toContainText('Keep going'); await expect(page.locator('.feedback')).toHaveCount(0);
  }
  await expect(page.getByRole('heading', { name: 'Every hero tries again.' })).toBeVisible(); expect(errors).toEqual([]);
});
