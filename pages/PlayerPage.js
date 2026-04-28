/**
 * PlayerPage.js — Page Object para el reproductor de video de PlutoTV
 *
 * Contiene todas las validaciones relacionadas con el player:
 * - Detectar que el player apareció en pantalla
 * - Confirmar que está en modo fullscreen
 * - Confirmar que el playback está activo
 */

class PlayerPage {
  /**
   * @param {import('playwright').Page} page - instancia de la página de Playwright
   */
  constructor(page) {
    this.page = page;

    // Selector del elemento <video> nativo del HTML
    // PlutoTV renderiza el video directamente en el DOM principal (no en iframe separado)
    this.videoElement = page.locator('video');
  }

  /**
   * Espera a que el elemento <video> sea visible en la pantalla.
   * Esto confirma que el player fue montado por PlutoTV después del click.
   *
   * @param {number} timeout - tiempo máximo de espera en ms (default: 25 segundos)
   */
  async waitForPlayer(timeout = 25000) {
    await this.videoElement.waitFor({ state: 'visible', timeout });
  }

  /**
   * Espera hasta que el video ocupe al menos el 85% del ancho y alto de la ventana.
   * Esto valida que el player está en modo fullscreen (no en mini-player docked).
   *
   * Usa waitForFunction en lugar de una verificación puntual porque el player
   * tiene una animación de transición: primero aparece pequeño y luego se expande.
   *
   * getBoundingClientRect() devuelve la posición y tamaño del elemento en píxeles.
   * window.innerWidth/innerHeight son las dimensiones visibles del viewport.
   *
   * @param {number} timeout - tiempo máximo de espera en ms (default: 20 segundos)
   */
  async waitForFullScreenLayout(timeout = 20000) {
    await this.page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        if (!video) return false;
        const rect = video.getBoundingClientRect();
        return (
          rect.width  >= window.innerWidth  * 0.85 &&
          rect.height >= window.innerHeight * 0.85
        );
      },
      { timeout }
    );
  }

  /**
   * Espera hasta confirmar que el playback está activo.
   *
   * PlutoTV usa dos mecanismos distintos según el tipo de contenido:
   *
   * LIVE TV (ej: canal en vivo):
   *   El stream MPEG-DASH entrega datos de inmediato.
   *   readyState llega a >= 3 (HAVE_FUTURE_DATA) rápidamente,
   *   confirmando que hay suficiente buffer para reproducir.
   *
   * VOD — Movies/Series (contenido bajo demanda):
   *   PlutoTV usa Widevine DRM. El video se carga como un blob URL
   *   (blob:https://pluto.tv/...) mientras el browser negocia la licencia DRM.
   *   En este estado readyState puede quedarse en 0 (HAVE_NOTHING) por más
   *   de 30 segundos, pero networkState === 2 (NETWORK_LOADING) confirma
   *   que el browser está descargando activamente los segmentos cifrados.
   *
   * La condición combina ambos casos:
   *   - hasSource: el <video> tiene un src asignado (no es un elemento vacío)
   *   - !video.paused: el browser ejecutó play() — no está pausado por el usuario
   *   - readyState >= 3 OR networkState === 2: está reproduciendo O cargando activamente
   *
   * @param {number} timeout - tiempo máximo de espera en ms (default: 30 segundos)
   */
  async waitForPlayback(timeout = 30000) {
    await this.page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        if (!video) return false;

        // Verifica que el <video> tenga una fuente asignada
        const hasSource = video.src !== '' || video.currentSrc !== '';

        // readyState >= 3: suficiente buffer para reproducir (Live TV)
        // networkState === 2: descargando activamente segmentos DRM (VOD)
        const isPlayingOrBuffering = !video.paused && (video.readyState >= 3 || video.networkState === 2);

        return hasSource && isPlayingOrBuffering;
      },
      { timeout }
    );
  }
}

module.exports = PlayerPage;
