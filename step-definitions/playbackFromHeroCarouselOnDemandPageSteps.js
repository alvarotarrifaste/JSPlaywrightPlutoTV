/**
 * playbackFromHeroCarouselOnDemandPageSteps.js — Steps para el escenario PlaybackValidationFromHeroCarouselOnDemandPage
 *
 * Implementa los steps específicos del flujo On Demand que no están en otros archivos:
 *   1. Navegación al menú On Demand
 *   2. Click en "Watch Now" desde la pantalla de detalles del título
 *
 * Los steps compartidos (Given home page, carousel "Details" button, player validations)
 * son resueltos automáticamente por Cucumber desde playbackFromHeroCarouselSteps.js.
 *
 * Flujo completo del escenario:
 *   Given I open the PlutoTV home page              ← playbackFromHeroCarouselSteps.js
 *   When  I click the "On Demand" navigation button ← este archivo
 *   And   I click the "Details" button on the hero carousel  ← step compartido (usa OnDemandPage)
 *   And   I click the "Watch Now" button on the details page ← este archivo
 *   Then  the video player should be displayed in full screen ← step compartido
 *   And   the playback should be active                       ← step compartido
 */

const { When } = require('@cucumber/cucumber');
const OnDemandPage = require('../pages/OnDemandPage');
const DetailsPage = require('../pages/DetailsPage');

/**
 * Step: 'When I click the "On Demand" navigation button'
 *
 * Navega a la sección On Demand haciendo click en el link del menú superior.
 *
 * Secuencia:
 * 1. Click en el link "On Demand" del nav superior (via HomePage.clickNavButton)
 * 2. Instancia OnDemandPage y espera que el hero carousel esté listo
 * 3. Establece OnDemandPage como carousel activo para el step "Details" que viene después
 *
 * Por qué texto literal y no {string}:
 *   Evita ambigüedad con el step "Live TV" definido en playbackFromHeroCarouselLiveTvPageSteps.js.
 *   Cada step es único con su texto literal → Cucumber no tiene conflicto de resolución.
 */
When('I click the "On Demand" navigation button', async function () {
  // Paso 1: click en el link "On Demand" del menú superior
  await this.homePage.clickNavButton('On Demand');

  // Paso 2: instancia OnDemandPage y espera que el hero carousel esté hidratado
  this.onDemandPage = new OnDemandPage(this.page);
  await this.onDemandPage.waitForPage();

  // Paso 3: establece OnDemandPage como carousel activo
  // El step "I click the {string} button on the hero carousel" llamará a
  // this.onDemandPage.clickHeroCarouselButton("Details")
  this.activeCarouselPage = this.onDemandPage;
});

/**
 * Step: 'And I click the "Watch Now" button on the details page'
 *
 * Este step se ejecuta DESPUÉS de que el step "Details" llevó al usuario
 * a la ficha de detalles del título (película o serie destacada).
 *
 * Secuencia:
 * 1. Instancia DetailsPage y espera que el botón "Watch Now" sea visible
 *    (señal de que la página de detalles cargó completamente)
 * 2. Hace click en "Watch Now" → PlutoTV abre el player con el contenido DRM
 *
 * Por qué crear DetailsPage aquí y no antes:
 *   La página de detalles no existe hasta que el step anterior ("Details" button)
 *   completa la navegación. Instanciarla aquí garantiza que `this.page`
 *   ya está en la URL correcta del título.
 */
When('I click the "Watch Now" button on the details page', async function () {
  // Instancia DetailsPage con la página actual (que ahora muestra la ficha del título)
  this.detailsPage = new DetailsPage(this.page);

  // Espera que el botón "Watch Now" sea visible → página de detalles completamente cargada
  await this.detailsPage.waitForPage();

  // Hace click en "Watch Now" → inicia reproducción (con negociación DRM de Widevine)
  await this.detailsPage.clickWatchNow();
});
