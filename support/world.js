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
   * headless: false  → el browser es VISIBLE (modo headed)
   * headless: true   → el browser corre en segundo plano sin ventana (modo CI)
   *
   * La variable de entorno HEADED controla el modo:
   *   npm test            → headless (HEADED no está definida → headless: true)
   *   npm run test:headed → visible  (HEADED=true → headless: false)
   */
  async openBrowser() {
    this.browser = await chromium.launch({
      headless: process.env.HEADED !== 'true'
    });

    // newContext() crea un perfil aislado: sin cookies ni storage de sesiones anteriores
    this.context = await this.browser.newContext();

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
