import { QuartzComponent, QuartzComponentConstructor } from "./types"

const CastImages: QuartzComponent = () => {
  return <></>
}

CastImages.css = `
  .cast-image-wrapper {
    position: relative;
    display: inline-block;
    /* Prevent layout shift — wrapper matches img display */
    line-height: 0;
  }

  .cast-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.55);
    border: none;
    border-radius: 6px;
    padding: 5px 7px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.18s ease, background 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    z-index: 20;
    color: white;
    font-size: 11px;
    font-family: inherit;
    line-height: 1;
    white-space: nowrap;
    backdrop-filter: blur(4px);
  }

  .cast-image-wrapper:hover .cast-btn,
  .cast-btn:focus-visible {
    opacity: 1;
  }

  .cast-btn svg {
    fill: white;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  /* Blue tint while actively casting */
  .cast-btn.casting {
    opacity: 1;
    background: rgba(26, 115, 232, 0.85);
  }

  /* Tooltip on hover */
  .cast-btn::after {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: rgba(0, 0, 0, 0.75);
    color: white;
    font-size: 10px;
    padding: 3px 7px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .cast-btn:hover::after {
    opacity: 1;
  }
`

CastImages.afterDOMLoaded = `
(function () {
  let castReady = false;

  // ── 1. Register callback BEFORE the SDK script is injected ──────────────
  window['__onGCastApiAvailable'] = function (isAvailable) {
    if (!isAvailable) return;
    castReady = true;

    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });

    setupCastButtons();
  };

  // ── 2. Inject the Cast Sender SDK ────────────────────────────────────────
  const sdk = document.createElement('script');
  sdk.src =
    'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  document.head.appendChild(sdk);

  // ── 3. Re-run on Quartz SPA navigations ─────────────────────────────────
  document.addEventListener('nav', () => {
    if (castReady) setupCastButtons();
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  function setupCastButtons() {
    // Target images inside the main article content; skip already-wrapped ones
    document
      .querySelectorAll('article img, .center img, figure img')
      .forEach(addCastButton);
  }

  function addCastButton(img) {
    if (img.parentElement?.classList.contains('cast-image-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'cast-image-wrapper';

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    const btn = document.createElement('button');
    btn.className = 'cast-btn';
    btn.setAttribute('data-tooltip', 'Cast to TV');
    btn.setAttribute('aria-label', 'Cast image to TV');
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z' +
      'zm0-4v2c4.97 0 9 4.03 9 9h2C12 14.36 7.06 10 1 10zm20-6H3C1.9 4 1 4.9 1 6v3h2V6h18' +
      'v12h-7v2h7c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      castImage(img, btn);
    });

    wrapper.appendChild(btn);
  }

  function castImage(img, btn) {
    const context = cast.framework.CastContext.getInstance();
    const session = context.getCurrentSession();

    if (!session) {
      context
        .requestSession()
        .then(() => sendImage(img, btn))
        .catch((err) => console.warn('Cast session error:', err));
    } else {
      sendImage(img, btn);
    }
  }

  function sendImage(img, btn) {
    const session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (!session) return;

    // Resolve to an absolute URL (handles relative /images/... paths)
    const absoluteUrl = new URL(img.src, window.location.href).href;

    // Derive MIME type from file extension
    const ext =
      absoluteUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] ?? 'image/jpeg';

    // Build a media item — use the page title + alt text as metadata
    const mediaInfo = new chrome.cast.media.MediaInfo(absoluteUrl, contentType);
    const meta = new chrome.cast.media.GenericMediaMetadata();
    meta.title = img.alt || document.title || 'Image';
    mediaInfo.metadata = meta;

    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    btn.classList.add('casting');
    btn.setAttribute('data-tooltip', 'Casting…');

    session
      .loadMedia(request)
      .then(() => {
        btn.setAttribute('data-tooltip', 'Casting ✓');
      })
      .catch((err) => {
        console.error('Cast load error:', err);
        btn.classList.remove('casting');
        btn.setAttribute('data-tooltip', 'Cast failed');
      });
  }
})();
`

export default (() => CastImages) satisfies QuartzComponentConstructor
