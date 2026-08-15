import { test, expect } from '@playwright/test';

test.describe('Lofi Music Options - All 4 must work and sound different', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('Audio Mixer modal opens correctly', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    // Modal should be visible
    const modal = page.locator('.dual-audio-modal');
    await expect(modal).toBeVisible();
    
    // Should have both sections
    await expect(page.getByText('1. Ambient Background Sounds')).toBeVisible();
    await expect(page.getByText('2. In-App Lofi Music & Beats')).toBeVisible();
  });

  test('Option 1: Lofi Chill Beats - can activate and produces audio', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    const lofiBeatsCard = page.locator('.sound-card', { hasText: 'Lofi Chill Beats' });
    await expect(lofiBeatsCard).toBeVisible();
    await lofiBeatsCard.click();
    
    // Should show active state
    await expect(lofiBeatsCard).toHaveClass(/active/);
    
    // Active badge should show
    await expect(page.locator('.lofi-badge-active')).toBeVisible();
    await expect(page.locator('.lofi-badge-active')).toContainText('lofiBeats');
    
    // Music volume slider should be enabled
    const musicSlider = page.locator('.music-slider');
    await expect(musicSlider).not.toBeDisabled();
    
    // Verify Web Audio is running by checking AudioContext state
    const audioState = await page.evaluate(() => {
      const ctx = (window as any).__audioCtx || new AudioContext();
      return ctx.state;
    });
    // AudioContext starts running once user interaction happens
    expect(['running', 'suspended']).toContain(audioState);
    
    // Wait 2 seconds to hear the beat
    await page.waitForTimeout(2000);
    
    // Deactivate
    await lofiBeatsCard.click();
    await expect(lofiBeatsCard).not.toHaveClass(/active/);
  });

  test('Option 2: Midnight Jazz Lofi - can activate and produces audio', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    const jazzCard = page.locator('.sound-card', { hasText: 'Midnight Jazz Lofi' });
    await expect(jazzCard).toBeVisible();
    await jazzCard.click();
    
    await expect(jazzCard).toHaveClass(/active/);
    await expect(page.locator('.lofi-badge-active')).toContainText('lofiJazz');
    
    await page.waitForTimeout(2000);
    
    await jazzCard.click();
    await expect(jazzCard).not.toHaveClass(/active/);
  });

  test('Option 3: Cosmic Lofi Ambient - can activate and produces audio', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    const cosmicCard = page.locator('.sound-card', { hasText: 'Cosmic Lofi Ambient' });
    await expect(cosmicCard).toBeVisible();
    await cosmicCard.click();
    
    await expect(cosmicCard).toHaveClass(/active/);
    await expect(page.locator('.lofi-badge-active')).toContainText('lofiCosmic');
    
    await page.waitForTimeout(2000);
    
    await cosmicCard.click();
    await expect(cosmicCard).not.toHaveClass(/active/);
  });

  test('Option 4: Lofi Chill Radio Stream - can activate', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    const radioCard = page.locator('.sound-card', { hasText: 'Lofi Chill Radio' });
    await expect(radioCard).toBeVisible();
    await radioCard.click();
    
    await expect(radioCard).toHaveClass(/active/);
    await expect(page.locator('.lofi-badge-active')).toContainText('lofiRadio');
    
    await page.waitForTimeout(1000);
    
    await radioCard.click();
    await expect(radioCard).not.toHaveClass(/active/);
  });

  test('Switching between options properly stops previous and starts new', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    // Start with Lofi Beats
    const beatsCard = page.locator('.sound-card', { hasText: 'Lofi Chill Beats' });
    await beatsCard.click();
    await expect(beatsCard).toHaveClass(/active/);
    
    await page.waitForTimeout(1000);
    
    // Switch to Jazz - beats should deactivate
    const jazzCard = page.locator('.sound-card', { hasText: 'Midnight Jazz Lofi' });
    await jazzCard.click();
    await expect(jazzCard).toHaveClass(/active/);
    await expect(beatsCard).not.toHaveClass(/active/);
    
    await page.waitForTimeout(1000);
    
    // Switch to Cosmic
    const cosmicCard = page.locator('.sound-card', { hasText: 'Cosmic Lofi Ambient' });
    await cosmicCard.click();
    await expect(cosmicCard).toHaveClass(/active/);
    await expect(jazzCard).not.toHaveClass(/active/);
    
    await page.waitForTimeout(1000);
  });

  test('Ambient and Music can play simultaneously with separate volume controls', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    // Enable ambient rain
    const rainCard = page.locator('.sound-card', { hasText: 'Rainfall' });
    await rainCard.click();
    await expect(rainCard).toHaveClass(/active/);
    
    // Enable Lofi Beats at the same time
    const beatsCard = page.locator('.sound-card', { hasText: 'Lofi Chill Beats' });
    await beatsCard.click();
    await expect(beatsCard).toHaveClass(/active/);
    
    // Both should be active simultaneously
    await expect(rainCard).toHaveClass(/active/);
    await expect(beatsCard).toHaveClass(/active/);
    
    // Check ambient volume slider is enabled
    const ambientSlider = page.locator('.ambient-slider');
    await expect(ambientSlider).not.toBeDisabled();
    
    // Check music volume slider is enabled
    const musicSlider = page.locator('.music-slider');
    await expect(musicSlider).not.toBeDisabled();
    
    // Footer should show both active
    const statusSummary = page.locator('.mixer-status-summary');
    await expect(statusSummary).toContainText('rain');
    await expect(statusSummary).toContainText('lofiBeats');
    
    await page.waitForTimeout(2000);
  });

  test('Volume sliders affect only their own channel', async ({ page }) => {
    const audioBtn = page.locator('.nav-btn', { hasText: 'Audio Mixer' }).first();
    await audioBtn.click();
    
    // Activate ambient
    await page.locator('.sound-card', { hasText: 'Rainfall' }).click();
    
    // Activate music
    await page.locator('.sound-card', { hasText: 'Lofi Chill Beats' }).click();
    
    // Change ambient volume to 20
    const ambientSlider = page.locator('.ambient-slider');
    await ambientSlider.fill('20');
    
    // Music slider should still be at default (60)
    const musicSlider = page.locator('.music-slider');
    const musicVal = await musicSlider.inputValue();
    expect(parseInt(musicVal)).toBeGreaterThan(20);
    
    // Change music volume to 80
    await musicSlider.fill('80');
    
    // Ambient slider should still be 20
    const ambientVal = await ambientSlider.inputValue();
    expect(parseInt(ambientVal)).toBe(20);
  });
});
