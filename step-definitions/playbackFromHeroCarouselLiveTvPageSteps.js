/**
 * playbackFromHeroCarouselLiveTvPageSteps.js — Steps para el escenario PlaybackValidationFromHeroCarouselLiveTvPage
 *
 * Este archivo implementa los steps específicos de la sección Live TV.
 * Los steps compartidos (Given home page, carousel button, player validations)
 * están definidos en playbackFromHeroCarouselSteps.js y Cucumber los resuelve
 * automáticamente ya que carga todos los archivos de step-definitions/ juntos.
 *
 * Este archivo añade únicamente el step de navegación al menú Live TV:
 *   When I click the "Live TV" navigation button
 *
 * Flujo del escenario:
 *   Given I open the PlutoTV home page          ← playbackFromHeroCarouselSteps.js
 *   When  I click the "Live TV" navigation button  ← este archivo
 *   And   I click the "Watch Live Channel" button on the hero carousel ← steps compartido
 *   Then  the video player should be displayed in full screen  ← steps compartido
 *   And   the playback should be active                        ← steps compartido
 */

const { When } = require('@cucumber/cucumber');
const LiveTvPage = require('../pages/LiveTvPage');

/**
 * Step: 'When I click the "Live TV" navigation button'
 *
 * Secuencia de acciones:
 * 1. Llama a HomePage.clickNavButton('Live TV') → hace click en el link del nav superior
 * 2. Instancia LiveTvPage con la misma referencia de `this.page`
 *    (Playwright mantiene la misma instancia de página aunque la URL cambie)
 * 3. Espera a que la Live TV page esté completamente hidratada (waitForPage)
 * 4. Actualiza `this.activeCarouselPage` → el step de carousel usará LiveTvPage
 *    en lugar de HomePage para encontrar el botón "Watch Live Channel"
 *
 * Por qué usar texto literal en lugar de {string}:
 *   Si usáramos When('I click the {string} navigation button'), Cucumber
 *   podría crear ambigüedad con el step de On Demand si ambos usan la misma expresión.
 *   Con texto literal cada step es único y no hay riesgo de conflicto.
 */
When('I click the "Live TV" navigation button', async function () {
  // Paso 1: click en el link "Live TV" del menú superior (definido en HomePage)
  await this.homePage.clickNavButton('Live TV');

  // Paso 2: instancia el Page Object de Live TV (la página ya navegó gracias al click)
  this.liveTvPage = new LiveTvPage(this.page);

  // Paso 3: espera que la página de Live TV esté cargada e interactiva
  await this.liveTvPage.waitForPage();

  // Paso 4: establece LiveTvPage como el carousel activo para el siguiente step
  // El step "I click the {string} button on the hero carousel" usará esta referencia
  this.activeCarouselPage = this.liveTvPage;
});
