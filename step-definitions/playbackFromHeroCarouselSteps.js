/**
 * playbackFromHeroCarouselSteps.js — Step definitions para el feature PlaybackFromHeroCarousel
 *
 * Cada función aquí implementa una línea del archivo .feature.
 * Cucumber matchea el texto del step con la expresión en Given/When/Then
 * y ejecuta la función correspondiente.
 *
 * `this` dentro de cada función es el PlaywrightWorld (support/world.js),
 * por eso podemos acceder a this.page, this.homePage, this.playerPage, etc.
 *
 * Los steps usan `async/await` porque todas las acciones de Playwright son asíncronas
 * (el browser necesita tiempo para ejecutar cada acción).
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test'); // librería de aserciones de Playwright
const HomePage = require('../pages/HomePage');
const PlayerPage = require('../pages/PlayerPage');

/**
 * Step: "Given I open the PlutoTV home page"
 *
 * Crea una instancia del Page Object HomePage y navega a la URL.
 * Guardamos la instancia en `this.homePage` para reutilizarla en los steps siguientes
 * (When, Then) del mismo escenario.
 *
 * También inicializa `this.activeCarouselPage` apuntando a homePage.
 * Los steps de navegación (Live TV, On Demand) sobrescribirán este valor
 * con el Page Object de la sección a la que naveguen.
 */
Given('I open the PlutoTV home page', async function () {
  this.homePage = new HomePage(this.page);
  await this.homePage.navigate();

  // La home page es el carousel activo por defecto.
  // Si el escenario navega a otra sección, este valor se sobrescribe en los steps de navegación.
  this.activeCarouselPage = this.homePage;
});

/**
 * Step: "When I click the {string} button on the hero carousel"
 *
 * {string} es un parámetro de Cucumber que captura el texto entre comillas del feature.
 * Ejemplos:
 *   When I click the "Watch Live" button        → home page (Live TV slide)
 *   When I click the "Play Now" button          → home page (VOD slide)
 *   When I click the "Watch Live Channel" button → Live TV page
 *   When I click the "Details" button           → On Demand page
 *
 * Usa `this.activeCarouselPage` en lugar de `this.homePage` directamente.
 * Esto permite que el mismo step funcione para el carousel de cualquier sección:
 * Home, Live TV u On Demand, según a qué página haya navegado el escenario antes.
 *
 * `this.activeCarouselPage` es asignado por:
 *   - Este mismo Given (→ HomePage) para escenarios que no navegan
 *   - Los steps "I click the Live TV/On Demand navigation button" para los demás
 *
 * @param {string} buttonText - texto del botón a clickear en el carousel
 */
When('I click the {string} button on the hero carousel', async function (buttonText) {
  await this.activeCarouselPage.clickHeroCarouselButton(buttonText);
});

/**
 * Step: "Then the video player should be displayed in full screen"
 *
 * Valida que el player abrió en modo fullscreen: el <video> es visible Y ocupa
 * al menos el 85% del ancho y alto del viewport.
 *
 * Se usa para escenarios de la Home page, donde hacer click en el hero CTA
 * navega a una página de player dedicada (pantalla completa).
 *
 * Si alguna de las dos condiciones no se cumple en el tiempo dado, el step falla
 * y el hook After captura un screenshot automáticamente.
 */
Then('the video player should be displayed in full screen', async function () {
  this.playerPage = new PlayerPage(this.page);

  // Primero esperamos que el elemento <video> exista y sea visible
  await this.playerPage.waitForPlayer();

  // Luego esperamos que ocupe el fullscreen (puede haber una animación de transición)
  await this.playerPage.waitForFullScreenLayout();
});

/**
 * Step: "Then the video player should be visible"
 *
 * Valida únicamente que el elemento <video> apareció y es visible en pantalla.
 * NO valida fullscreen — se usa para el escenario de Live TV page donde el player
 * es embebido: el canal se reproduce en la zona del hero mientras el EPG
 * y el strip de canales permanecen visibles debajo del video.
 *
 * Este comportamiento es diferente al de la Home page (que abre un player fullscreen).
 * Ambas validaciones son correctas para sus respectivos contextos de la plataforma.
 */
Then('the video player should be visible', async function () {
  this.playerPage = new PlayerPage(this.page);

  // Solo verificamos que el <video> montó y es visible — sin chequeo de dimensiones
  await this.playerPage.waitForPlayer();
});

/**
 * Step: "And the playback should be active"
 *
 * Valida que el video está efectivamente reproduciendo (o cargando activamente en DRM).
 * Reutiliza `this.playerPage` creado en el step anterior.
 *
 * Si el video sigue pausado o sin fuente después del timeout, el step falla.
 */
Then('the playback should be active', async function () {
  await this.playerPage.waitForPlayback();
});
