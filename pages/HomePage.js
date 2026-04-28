/**
 * HomePage.js — Page Object para la página principal de PlutoTV
 *
 * El patrón Page Object Model (POM) centraliza todos los selectores
 * y acciones de una página en una sola clase. Los step definitions
 * no tocan el DOM directamente — siempre pasan por aquí.
 * Ventaja: si PlutoTV cambia un selector, solo se edita este archivo.
 */

class HomePage {
  /**
   * @param {import('playwright').Page} page - instancia de la página de Playwright
   *        que viene del PlaywrightWorld (this.page en los steps)
   */
  constructor(page) {
    this.page = page;
    this.url = 'https://pluto.tv/us/hub/home?lang=en';

    // Selector del botón "siguiente" del hero carousel.
    // PlutoTV usa CSS-in-JS con clases generadas (ej: nextButton-0-2-224).
    // El selector [class*="nextButton"] coincide con cualquier clase que contenga
    // "nextButton", haciéndolo robusto ante cambios en el número generado.
    this.nextSlideBtn = page.locator('button[class*="nextButton"]').first();
  }

  /**
   * Navega a la home de PlutoTV y espera a que el hero carousel esté listo.
   *
   * waitUntil: 'domcontentloaded' → espera que el HTML base cargue (sin imágenes ni JS pesado)
   * Luego espera el botón nextButton del carousel para confirmar que el JS de la página
   * hidratró y el carousel está interactivo.
   */
  async navigate() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });

    // Esperamos el botón "next" del carousel como señal de que la página está lista
    await this.page.locator('button[class*="nextButton"]').waitFor({ state: 'visible', timeout: 20000 });
  }

  /**
   * Busca y hace click en un botón del hero carousel según su texto.
   * Si el botón no está visible en el slide actual, avanza al siguiente slide
   * y vuelve a intentarlo, hasta un máximo de 10 slides.
   *
   * Esto es necesario porque el contenido del hero carousel es dinámico:
   * a veces el primer slide es un canal Live, otras veces es un VOD.
   *
   * @param {string} buttonText - texto exacto del botón a clickear
   *                              Ej: "Watch Live" para Live TV, "Play Now" para VOD
   * @throws {Error} si el botón no se encontró en ninguno de los slides
   */
  async clickHeroCarouselButton(buttonText) {
    const maxSlides = 10;

    for (let i = 0; i < maxSlides; i++) {
      // Busca un <button> cuyo texto sea exactamente `buttonText`
      // .filter({ hasText }) es más robusto que el pseudo-selector CSS :has-text()
      const btn = this.page.locator('button').filter({ hasText: buttonText }).first();

      try {
        // Espera hasta 2 segundos a que el botón sea visible en este slide
        await btn.waitFor({ state: 'visible', timeout: 2000 });
        await btn.click();
        return; // encontrado y clickeado — salimos del loop
      } catch {
        // El botón no está en este slide → avanzamos al siguiente
      }

      try {
        // Hace click en la flecha ">" del carousel para pasar al siguiente slide
        await this.nextSlideBtn.waitFor({ state: 'visible', timeout: 2000 });
        await this.nextSlideBtn.click();

        // Pequeña pausa para que la animación de transición del slide termine
        await this.page.waitForTimeout(1500);
      } catch {
        // No hay más slides disponibles — salimos del loop
        break;
      }
    }

    throw new Error(`"${buttonText}" button not found in hero carousel after checking ${maxSlides} slides`);
  }
}

module.exports = HomePage;
