// @ts-check
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';


test.describe('Magic Drink - Test de scroll entre secciones', () => {

  test.beforeEach(async ({ page }) => {
    // Ir a la página principal
    await page.goto('/', { waitUntil: 'networkidle' });
    // Esperar a que React hidrate
    await page.waitForTimeout(2000);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 1: Scroll completo sin errores de consola
  // ─────────────────────────────────────────────────────────────
  test('Scroll completo - sin errores JS críticos', async ({ page }) => {
    /**
     * @type {string[]}
     */
    const consoleErrors = [];

    // Capturar errores de consola
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });

    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`\n📏 Altura total de la página: ${pageHeight}px`);

    // Scroll gradual por toda la página
    const step = 300;
    for (let y = 0; y < pageHeight; y += step) {
      await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'instant' }), y);
      await page.waitForTimeout(80);
    }

    // Scroll al final
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(500);

    if (consoleErrors.length > 0) {
      console.log('\n❌ Errores encontrados en consola:');
      consoleErrors.forEach((e) => console.log('  -', e));
    } else {
      console.log('\n✅ Sin errores de consola durante el scroll');
    }

    // No bloqueamos por errores de consola (algunos pueden ser de assets faltantes)
    // Solo reportamos
    expect(consoleErrors.filter(e => e.includes('TypeError') || e.includes('ReferenceError'))).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 2: Detección del flash entre Sección 6 y 7
  // ─────────────────────────────────────────────────────────────
  test('Transición Sección 6 → Sección 7 - sin flash visual', async ({ page }) => {
    // Encontrar la sección 6 (wonderpopSection) para posicionarnos
    const sec6 = page.locator('[class*="wonderpopSection"]').first();
    await expect(sec6).toBeVisible({ timeout: 10000 });

    // Obtener posición de la sección 6
    const sec6Box = await sec6.boundingBox();
    console.log(`\n📍 Sección 6 encontrada en Y: ${sec6Box?.y}`);

    // Scrollear hasta la sección 6
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), sec6Box?.y ?? 0);
    await page.waitForTimeout(1000);

    // ── Monitorear posición del scroll durante el PIN ──────────
    const scrollLog = [];
    let screenshotCount = 0;

    // Hacer scroll lento y manual para simular el PIN de la sección 6
    // Con pasos pequeños para detectar cualquier salto
    const totalScrollInSec6 = (sec6Box?.height ?? 900) * 6; // ~550% del PIN
    const startY = sec6Box?.y ?? 0;
    const endY = startY + totalScrollInSec6;

    console.log(`\n🔍 Monitoreando scroll de ${startY} a ${endY} (zona del PIN de Sección 6)`);

    let previousScrollY = -1;
    let jumpDetected = false;
    let jumpDetails = [];

    for (let targetY = startY; targetY <= endY; targetY += 150) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
      await page.waitForTimeout(50);

      // Leer scroll actual real
      const currentScrollY = await page.evaluate(() => window.scrollY);
      const viewportContent = await page.evaluate(() => {
        // Detectar qué sección está visible en el 50% superior de la viewport
        const midY = window.scrollY + window.innerHeight * 0.3;
        const secs = document.querySelectorAll('section');
        let active = null;
        secs.forEach((s) => {
          const rect = s.getBoundingClientRect();
          const absTop = rect.top + window.scrollY;
          const absBot = rect.bottom + window.scrollY;
          if (midY >= absTop && midY <= absBot) active = s.className;
        });
        return active;
      });

      // @ts-ignore
      scrollLog.push({ targetY, currentScrollY, section: viewportContent?.substring(0, 60) });

      // Detectar salto: si el scroll visible "retrocede" más de 200px de golpe
      if (previousScrollY > 0 && currentScrollY < previousScrollY - 200) {
        jumpDetected = true;
        const detail = `⚡ SALTO DETECTADO: scroll fue de ${previousScrollY} → ${currentScrollY} (retroceso de ${previousScrollY - currentScrollY}px) al intentar ir a Y=${targetY}`;
        jumpDetails.push(detail);
        console.log('\n' + detail);

        // Screenshot del momento del flash
        await page.screenshot({
          path: `tests/results/screenshots/flash_at_${targetY}.png`,
          fullPage: false
        });
      }

      previousScrollY = currentScrollY;
    }

    // ── Reporte final ──────────────────────────────────────────
    console.log('\n── RESUMEN DEL SCROLL LOG ──');
    // Mostrar solo los momentos donde la sección cambia
    let prevSection = '';
    scrollLog.forEach(({ targetY, currentScrollY, section }) => {
      if (section !== prevSection) {
        console.log(`  Y=${currentScrollY} → Sección: ${section}`);
        prevSection = section;
      }
    });

    if (jumpDetected) {
      console.log('\n❌ RESULTADO: Se detectaron saltos de scroll (flash visual):');
      jumpDetails.forEach((d) => console.log(' ', d));
      console.log('\n📁 Screenshots guardados en: tests/results/screenshots/');
    } else {
      console.log('\n✅ RESULTADO: Sin saltos de scroll detectados entre secciones');
    }

    // El test falla si hay saltos de scroll
    expect(jumpDetails).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Screenshots de cada sección para verificación visual
  // ─────────────────────────────────────────────────────────────
  test('Capturar screenshots de cada sección', async ({ page }) => {
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 900;

    // Puntos de interés para screenshots
    const checkpoints = [
      { name: '01_inicio', y: 0 },
      { name: '02_seccion2', y: viewportHeight * 1 },
      { name: '03_seccion3', y: viewportHeight * 2 },
      { name: '04_seccion4', y: viewportHeight * 3 },
      { name: '05_seccion5_inicio', y: viewportHeight * 4 },
      { name: '06_seccion5_mitad', y: viewportHeight * 5.5 },
      { name: '07_seccion6_inicio', y: viewportHeight * 7 },
      { name: '08_seccion6_video', y: viewportHeight * 9 },
      { name: '09_seccion6_highlights', y: viewportHeight * 11 },
      { name: '10_seccion6_stats', y: viewportHeight * 13 },
      { name: '11_transicion_6a7', y: viewportHeight * 14 },
      { name: '12_seccion7_inicio', y: viewportHeight * 15 },
      { name: '13_seccion7_cards', y: viewportHeight * 16 },
      { name: '14_final', y: pageHeight - viewportHeight },
      { name: '15_seccion8_inicio', y: viewportHeight * 17 },
    ];

    // Asegurar carpeta
    mkdirSync('tests/results/screenshots', { recursive: true });

    for (const { name, y } of checkpoints) {
      const scrollTarget = Math.min(y, pageHeight - viewportHeight);
      await page.evaluate((sy) => window.scrollTo({ top: sy, behavior: 'instant' }), scrollTarget);
      await page.waitForTimeout(600); // Esperar animaciones CSS

      const realY = await page.evaluate(() => window.scrollY);
      await page.screenshot({ path: `tests/results/screenshots/${name}_y${realY}.png` });
      console.log(`📸 Screenshot: ${name} (Y real: ${realY})`);
    }

    console.log('\n✅ Screenshots guardados en tests/results/screenshots/');
    
    // Este test siempre pasa, es solo para inspección visual
    expect(true).toBe(true);
  });

});
