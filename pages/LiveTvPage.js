/**
 * LiveTvPage.js — Page Object para la sección Live TV de PlutoTV
 *
 * Representa la pantalla /live-tv con su hero carousel en la parte superior.
 * El hero carousel de Live TV muestra canales en vivo con dos CTAs:
 *   - "Watch Live Channel" (amarillo) → abre el player del canal directamente
 *   - "Details" (gris) → navega a la ficha de detalles del canal
 *
 * Debajo del hero hay un strip horizontal de thumbnails de canales y una
 * barra lateral izquierda con categorías (Featured, Live Sports, Movies, etc.)
 *
 * Estructura de la página:
 *   Hero carousel (con nextButton arrows)
 *   └── Slide activo: título del canal, "Watch Live Channel", "Details"
 *   Channel strip horizontal (thumbnails de canales)
 *   EPG / parrilla de programación
 */

class LiveTvPage {
  /**
   * @param {import('playwright').Page} page - instancia de la página de Playwright
   *        (la misma referencia que viene del PlaywrightWorld)
   */
  constructor(page) {
    this.page = page;

    // Botón "siguiente" del hero carousel.
    // Live TV usa el mismo patrón CSS-in-JS que la home page:
    // clases generadas tipo "nextButton-0-2-224" → selector robusto con [class*="nextButton"]
    // .first() → toma el primer nextButton del DOM (que pertenece al hero carousel)
    this.nextSlideBtn = page.locator('button[class*="nextButton"]').first();
  }

  /**
   * Espera a que la página de Live TV esté completamente cargada y lista para interactuar.
   *
   * Dos condiciones deben cumplirse:
   * 1. La URL debe contener "live-tv" → confirma que la navegación fue exitosa
   * 2. Algún botón CTA del hero carousel debe ser visible → confirma que el JS
   *    hidratró y el carousel está interactivo
   *
   * Se espera "Watch Live Channel" OR "Details" porque el contenido del hero
   * es dinámico: según el canal destacado, el CTA principal puede variar.
   */
  async waitForPage() {
    // Espera que la URL cambie a /live-tv antes de buscar elementos
    await this.page.waitForURL(/live-tv/, { timeout: 15000 });

    // Espera que el hero carousel hidrate: alguno de los CTAs debe estar visible
    await this.page
      .locator('button')
      .filter({ hasText: /Watch Live Channel|Details/ })
      .first()
      .waitFor({ state: 'visible', timeout: 25000 });
  }

  /**
   * Busca y hace click en un botón del hero carousel de Live TV por su texto.
   * Si el botón no está en el slide actual, avanza al siguiente slide y reintenta,
   * hasta un máximo de 10 slides.
   *
   * El hero carousel de Live TV funciona igual que el de la Home page:
   * el contenido es dinámico y el canal destacado cambia entre sesiones,
   * por lo que necesitamos iterar slides hasta encontrar el CTA objetivo.
   *
   * @param {string} buttonText - texto del botón: "Watch Live Channel" o "Details"
   * @throws {Error} si el botón no se encuentra en ninguno de los slides
   */
  async clickHeroCarouselButton(buttonText) {
    const maxSlides = 10;

    for (let i = 0; i < maxSlides; i++) {
      // Busca un <button> cuyo texto coincida exactamente con buttonText
      const btn = this.page.locator('button').filter({ hasText: buttonText }).first();

      try {
        // Espera hasta 2 segundos a que el botón sea visible en el slide actual
        await btn.waitFor({ state: 'visible', timeout: 2000 });
        await btn.click();
        return; // encontrado y clickeado — salimos del loop
      } catch {
        // El botón no está en este slide → intentamos avanzar al siguiente
      }

      try {
        // Hace click en la flecha ">" del hero carousel para pasar al siguiente slide
        await this.nextSlideBtn.waitFor({ state: 'visible', timeout: 2000 });
        await this.nextSlideBtn.click();

        // Pausa para que la animación de transición del slide termine
        await this.page.waitForTimeout(1500);
      } catch {
        // No hay botón "next" disponible → no hay más slides
        break;
      }
    }

    throw new Error(
      `"${buttonText}" button not found in Live TV hero carousel after checking ${maxSlides} slides`
    );
  }
}

module.exports = LiveTvPage;
