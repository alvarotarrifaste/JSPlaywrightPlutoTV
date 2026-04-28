/**
 * hooks.js — Hooks globales de Cucumber (Before / After)
 *
 * Los hooks se ejecutan automáticamente antes y después de CADA escenario.
 * No es necesario llamarlos desde los feature files — Cucumber los detecta solo.
 *
 * Before → abre el browser antes de que arranquen los steps del escenario
 * After  → cierra el browser al terminar; si el escenario falló, captura un screenshot
 */

const { Before, After, Status } = require('@cucumber/cucumber');

/**
 * Hook Before: se ejecuta una vez antes de cada escenario.
 * `this` es una instancia de PlaywrightWorld (definida en world.js),
 * por eso podemos llamar a this.openBrowser().
 */
Before(async function () {
  await this.openBrowser();
});

/**
 * Hook After: se ejecuta una vez después de cada escenario.
 *
 * @param {object} scenario - objeto de Cucumber con info del escenario ejecutado
 *
 * Si el escenario FALLÓ (Status.FAILED), toma un screenshot de la página
 * en el momento del fallo y lo adjunta al reporte HTML de Cucumber.
 * Esto es clave para el debugging: puedes ver exactamente qué mostraba
 * el browser cuando el test falló.
 */
After(async function (scenario) {
  if (scenario.result.status === Status.FAILED) {
    // page.screenshot() devuelve el PNG como Buffer (datos binarios)
    const screenshot = await this.page.screenshot();

    // attach() adjunta el screenshot al reporte de Cucumber
    // con el MIME type image/png para que se muestre como imagen
    await this.attach(screenshot, 'image/png');
  }

  // Siempre cerramos el browser, haya pasado o fallado el escenario
  await this.closeBrowser();
});
