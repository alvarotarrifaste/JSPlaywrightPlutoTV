/**
 * world.js — Cucumber World personalizado para Playwright
 *
 * En Cucumber, el "World" es el objeto `this` disponible en cada step y hook.
 * Al extenderlo con PlaywrightWorld, compartimos el browser, context y page
 * entre todos los steps de un mismo escenario sin pasar variables manualmente.
 *
 * setDefaultTimeout(30000) aplica un timeout de 30 segundos a TODOS los steps
 * y hooks del proyecto. Sin esto, Cucumber usa 5 segundos por defecto, lo cual
 * es insuficiente para cargar páginas de streaming como PlutoTV.
 */

const { setWorldConstructor, World, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Timeout global: 60 segundos por step/hook.
// Se aumentó de 30 s a 60 s porque algunos steps combinan múltiples esperas:
// waitForPlayer (hasta 30 s) + waitForFullScreenLayout (hasta 25 s) = 55 s máximo teórico.
// PlutoTV también tiene tiempo de carga de DRM y negociación de licencia Widevine,
// lo que puede sumar latencia adicional en la validación de playback.
setDefaultTimeout(60000);

class PlaywrightWorld extends World {
  /**
   * El constructor recibe `options` de Cucumber (parámetros del world, reporter, etc.)
   * y llama a super() para que Cucumber inicialice su lógica base.
   * Las propiedades browser, context y page empiezan en null y se asignan en openBrowser().
   */
  constructor(options) {
    super(options);
    this.browser = null;   // instancia del navegador (Chromium)
    this.context = null;   // contexto del browser (equivale a un perfil aislado)
    this.page = null;      // pestaña activa donde se ejecutan las acciones
  }

  /**
   * Abre una instancia de Chrome y crea una pestaña nueva.
   * Es llamado en el hook Before (support/hooks.js) al inicio de cada escenario.
   *
   * headless: false  → el browser es VISIBLE (modo headed, desarrollo local)
   * headless: true   → el browser corre en segundo plano sin ventana (modo CI)
   *
   * Variables de entorno que controlan el comportamiento:
   *   HEADED=true    → browser visible (npm run test:headed)
   *   CI_MODE=true   → activa opciones de hardening para GitHub Actions
   *
   * --- Args de Chromium para CI (CI_MODE=true) ---
   *
   * --no-sandbox, --disable-setuid-sandbox:
   *   Requeridos en contenedores Linux (GitHub Actions ubuntu-latest) porque
   *   el sandbox de Chromium necesita privilegios de kernel que los containers
   *   no otorgan. Sin esto, Chromium puede crashear al inicio.
   *
   * --disable-dev-shm-usage:
   *   En containers de CI, /dev/shm (memoria compartida) suele tener solo 64 MB.
   *   Chromium la usa para renderizado y puede quedarse sin espacio → crash.
   *   Este flag lo hace usar /tmp en su lugar.
   *
   * --disable-blink-features=AutomationControlled:
   *   Elimina el flag `navigator.webdriver = true` que los sitios detectan
   *   para identificar browsers automatizados (bot detection básico).
   *
   * --- Contexto del browser ---
   *
   * userAgent: imita un Chrome real en Windows 10 para evitar bot detection
   *   basado en User-Agent. El headless Chrome por defecto incluye "HeadlessChrome"
   *   en el UA, que muchos sitios bloquean.
   *
   * viewport: 1920x1080 → simula un desktop estándar. PlutoTV adapta su layout
   *   al viewport; un viewport pequeño puede ocultar elementos o cambiar el DOM.
   *
   * locale / timezoneId: simula un usuario en US para obtener el contenido
   *   de PlutoTV US correctamente (la plataforma es geo-dependent).
   */
  async openBrowser() {
    const isCI = process.env.CI_MODE === 'true';

    // Args adicionales solo en CI: necesarios para correr Chromium en containers Linux
    const ciArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ];

    this.browser = await chromium.launch({
      headless: process.env.HEADED !== 'true',
      args: isCI ? ciArgs : []
    });

    // Opciones del contexto para simular un browser real (aplica en CI y local)
    const contextOptions = {
      // User-Agent de Chrome 131 en Windows 10 — evita el "HeadlessChrome" del UA por defecto
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

      // Viewport de desktop estándar — PlutoTV puede renderizar diferente en viewports pequeños
      viewport: { width: 1920, height: 1080 },

      // Locale y timezone de US — PlutoTV sirve contenido geo-dependiente
      locale: 'en-US',
      timezoneId: 'America/New_York'
    };

    // newContext() crea un perfil aislado: sin cookies ni storage de sesiones anteriores
    this.context = await this.browser.newContext(contextOptions);

    // newPage() abre una nueva pestaña dentro del contexto
    this.page = await this.context.newPage();
  }

  /**
   * Cierra el browser y libera todos los recursos asociados (contexto, páginas, etc.)
   * Es llamado en el hook After (support/hooks.js) al finalizar cada escenario.
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Registra PlaywrightWorld como el constructor del World para todos los escenarios
setWorldConstructor(PlaywrightWorld);
