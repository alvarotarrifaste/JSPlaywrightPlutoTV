/**
 * DetailsPage.js — Page Object para la pantalla de detalles de un título VOD en PlutoTV
 *
 * Esta pantalla aparece al hacer click en "Details" desde el hero carousel de On Demand.
 * Muestra información del título (película o serie): imagen de fondo, título, descripción,
 * elenco, y los botones de acción principales:
 *   - "Watch Now" → inicia la reproducción desde el episodio/película más reciente
 *   - "Trailer"   → reproduce el tráiler del título (si está disponible)
 *
 * La URL de esta página varía según el tipo de contenido:
 *   Movies:  pluto.tv/us/on-demand/movies/<slug>
 *   Series:  pluto.tv/us/on-demand/series/<slug>
 *
 * El contenido cargado depende del slide activo en el hero de On Demand al momento
 * de hacer click en "Details" — es dinámico y cambia entre sesiones.
 */

class DetailsPage {
  /**
   * @param {import('playwright').Page} page - instancia de la página de Playwright
   */
  constructor(page) {
    this.page = page;

    // CTA principal de reproducción en la página de detalles.
    // PlutoTV puede usar <button> o <a> estilizado como botón según el tipo de contenido:
    //   - Movies: "Watch Now"
    //   - Series: "Watch Now" (primer episodio) o "Start Watching"
    // Se busca en ambos tipos de elemento con regex case-insensitive para cubrir
    // variantes de capitalización y texto ("Watch Now", "Watch now", "Start Watching").
    this.watchNowButton = page
      .locator('button, a')
      .filter({ hasText: /Watch Now|Start Watching/i })
      .first();
  }

  /**
   * Espera a que la página de detalles esté lista para interactuar.
   *
   * Se usa la visibilidad del botón "Watch Now" como señal de que la página
   * cargó completamente: si el botón está visible, el JS hidratró y el contenido
   * del título está disponible para reproducir.
   *
   * No se espera un patrón de URL específico porque la URL varía según el título
   * (movies vs series) y el slug del contenido (que cambia con cada sesión).
   *
   * @param {number} timeout - tiempo máximo de espera en ms (default: 25 segundos)
   */
  async waitForPage(timeout = 40000) {
    // Espera que el CTA principal de reproducción sea visible → página de detalles cargada.
    // Timeout aumentado a 40 s porque la details page de PlutoTV tiene contenido rico
    // (imágenes, metadatos, elenco, episodios) que puede tardar más en hidratarse.
    await this.watchNowButton.waitFor({ state: 'visible', timeout });
  }

  /**
   * Hace click en el botón "Watch Now" para iniciar la reproducción del título.
   *
   * Al hacer click, PlutoTV navega al player con el contenido seleccionado.
   * Para VOD, el browser negocia la licencia Widevine DRM antes de que el
   * video comience a reproducirse — ver PlayerPage.waitForPlayback() para
   * cómo se valida el playback en contenido DRM.
   */
  async clickWatchNow() {
    await this.watchNowButton.click();
  }
}

module.exports = DetailsPage;
