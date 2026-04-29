/**
 * OnDemandPage.js — Page Object para la sección On Demand de PlutoTV
 *
 * Representa la pantalla /on-demand con su hero carousel en la parte superior.
 * A diferencia del hero de la home y de Live TV (que usan flechas next/prev),
 * el hero de On Demand usa indicadores de puntos (dots) con auto-rotación:
 *
 *   ‖  • • • • •   (pausa + 5 puntos de paginación)
 *
 * Cada slide muestra una película o serie destacada con un único CTA visible:
 *   - "Details" (amarillo) → navega a la ficha de detalles del título
 *
 * Por esta razón, clickHeroCarouselButton es más simple que en HomePage/LiveTvPage:
 * solo espera que el CTA sea visible y hace click, sin iterar slides con flechas.
 *
 * Estructura de la página:
 *   Hero carousel (auto-rotating, dots navigation)
 *   └── Slide activo: título, género, descripción, "Details"
 *   Carruseles de contenido: CBS Latest Episodes, Most Popular Movies, etc.
 *   Sidebar izquierdo: categorías (Featured, April Ghouls, Action, Comedy, etc.)
 */

class OnDemandPage {
  /**
   * @param {import('playwright').Page} page - instancia de la página de Playwright
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Espera a que la página de On Demand esté cargada e interactiva.
   *
   * 1. Espera que la URL contenga "on-demand" → navegación exitosa
   * 2. Espera que el botón "Details" del hero sea visible → carousel hidratado
   *
   * El hero de On Demand siempre muestra un "Details" button como único CTA,
   * así que usarlo como señal de ready es confiable.
   */
  async waitForPage() {
    // Espera que la URL cambie a /on-demand antes de buscar elementos
    await this.page.waitForURL(/on-demand/, { timeout: 15000 });

    // Espera que el botón "Details" del hero carousel sea visible
    await this.page
      .locator('button')
      .filter({ hasText: 'Details' })
      .first()
      .waitFor({ state: 'visible', timeout: 25000 });
  }

  /**
   * Hace click en el botón CTA visible en el hero carousel de On Demand.
   *
   * El hero de On Demand NO tiene flechas next/prev para iterar slides manualmente.
   * Usa auto-rotación con dots como indicadores de paginación.
   * El CTA del slide actual siempre es visible, así que no necesitamos iterar.
   *
   * En el flujo de On Demand, este método se usa para hacer click en "Details",
   * que lleva a la ficha de detalles del título para luego iniciar la reproducción.
   *
   * @param {string} buttonText - texto del botón a clickear: "Details"
   * @throws {Error} si el botón no está visible en el tiempo de espera
   */
  async clickHeroCarouselButton(buttonText) {
    // El CTA del slide activo siempre está visible en el hero de On Demand
    const btn = this.page.locator('button').filter({ hasText: buttonText }).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
  }
}

module.exports = OnDemandPage;
