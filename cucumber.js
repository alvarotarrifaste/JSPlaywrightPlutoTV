/**
 * cucumber.js — Configuración central de Cucumber
 *
 * Este archivo le dice a Cucumber:
 *   - Dónde encontrar los feature files (.feature)
 *   - Dónde encontrar los step definitions y support files (.js)
 *   - Qué formato usar para los reportes
 *   - Cuántos escenarios correr en paralelo
 *   - El timeout global por step (sobreescrito también en support/world.js)
 */

module.exports = {
  default: {
    // Archivos que Cucumber debe cargar antes de correr los tests:
    // support/**/*.js → world.js y hooks.js (configuración del browser)
    // step-definitions/**/*.js → implementación de los Given/When/Then
    require: ['support/**/*.js', 'step-definitions/**/*.js'],

    // Dónde están los feature files (los .feature con los escenarios en Gherkin)
    paths: ['features/**/*.feature'],

    // Formatos de reporte:
    // 'progress-bar' → muestra una barra de progreso en la terminal
    // 'html:reports/cucumber-report.html' → genera un reporte visual en HTML
    format: ['progress-bar', 'html:reports/cucumber-report.html'],

    // Número de workers paralelos. Con 1, los escenarios corren uno por uno.
    // Aumentar este número ejecuta varios escenarios simultáneamente (útil en CI).
    parallel: 1,

    // Timeout global en ms. Sobreescrito por setDefaultTimeout() en support/world.js.
    // Se mantiene aquí como referencia documental.
    timeout: 30000
  }
};
