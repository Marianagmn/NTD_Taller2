// ===== CONFIGURACIÓN INICIAL =====
const CONFIG = {
  targetPage: 'zoro.html',
  messages: {
    notFound: '⚔️ La página "zoro.html" no se encontró.\n\n¡Crea el archivo "zoro.html" en tu proyecto para acceder al perfil completo de Zoro!',
    localWarning: '⚠️ No se pudo verificar "zoro.html".\n\nSi trabajas localmente, asegúrate de crear el archivo "zoro.html" en la misma carpeta del proyecto.',
    loading: 'Cargando el perfil de Zoro...'
  }
};

// ===== VERIFICACIÓN DE PÁGINA =====
/**
 * Verifica si el archivo de destino existe
 * @param {string} url - URL del archivo a verificar
 * @returns {Promise<boolean>}
 */
async function checkPageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Error al verificar la página:', error);
    return false;
  }
}

/**
 * Maneja el clic en el botón principal
 * @param {Event} event - Evento de clic
 */
async function handleMainButtonClick(event) {
  const button = event.currentTarget;
  const originalContent = button.innerHTML;
  
  // Mostrar estado de carga
  button.innerHTML = `
    <span class="loading-spinner"></span>
    <span>${CONFIG.messages.loading}</span>
  `;
  button.style.pointerEvents = 'none';

  try {
    const exists = await checkPageExists(CONFIG.targetPage);
    
    if (!exists) {
      event.preventDefault();
      showNotification(CONFIG.messages.notFound, 'warning');
      button.innerHTML = originalContent;
      button.style.pointerEvents = 'auto';
    }
    // Si existe, la navegación continuará normalmente
  } catch (error) {
    event.preventDefault();
    showNotification(CONFIG.messages.localWarning, 'info');
    button.innerHTML = originalContent;
    button.style.pointerEvents = 'auto';
  }
}

// ===== SISTEMA DE NOTIFICACIONES =====
/**
 * Muestra una notificación temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, warning, error, info)
 */
function showNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <p class="notification-message">${message}</p>
      <button class="notification-close" aria-label="Cerrar">✕</button>
    </div>
  `;

  // Agregar estilos si no existen
  if (!document.getElementById('notification-styles')) {
    injectNotificationStyles();
  }

  // Agregar al DOM
  document.body.appendChild(notification);

  // Animación de entrada
  setTimeout(() => notification.classList.add('show'), 10);

  // Configurar cierre automático
  const autoCloseTimeout = setTimeout(() => closeNotification(notification), 6000);

  // Configurar botón de cierre
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => {
    clearTimeout(autoCloseTimeout);
    closeNotification(notification);
  });
}

/**
 * Cierra una notificación con animación
 * @param {HTMLElement} notification - Elemento de notificación
 */
function closeNotification(notification) {
  notification.classList.remove('show');
  setTimeout(() => notification.remove(), 300);
}

/**
 * Obtiene el icono según el tipo de notificación
 * @param {string} type - Tipo de notificación
 * @returns {string} - Emoji del icono
 */
function getNotificationIcon(type) {
  const icons = {
    success: '✓',
    warning: '⚠️',
    error: '✕',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

/**
 * Inyecta estilos CSS para las notificaciones
 */
function injectNotificationStyles() {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(10, 14, 26, 0.98));
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(45, 212, 191, 0.2);
      backdrop-filter: blur(10px);
      opacity: 0;
      transform: translateX(400px);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      z-index: 10000;
    }

    .notification.show {
      opacity: 1;
      transform: translateX(0);
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
    }

    .notification-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .notification-message {
      flex: 1;
      color: #e6eef8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
      white-space: pre-line;
    }

    .notification-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .notification-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #e6eef8;
    }

    .notification-warning {
      border-left: 4px solid #fbbf24;
    }

    .notification-success {
      border-left: 4px solid #34d399;
    }

    .notification-error {
      border-left: 4px solid #ef4444;
    }

    .notification-info {
      border-left: 4px solid #2dd4bf;
    }

    .loading-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(10, 34, 46, 0.3);
      border-top-color: #0a222e;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
        transform: translateY(-100px);
      }

      .notification.show {
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// ===== SMOOTH SCROLL =====
/**
 * Maneja el scroll suave para enlaces internos
 * @param {Event} event - Evento de clic
 */
function handleSmoothScroll(event) {
  const href = event.currentTarget.getAttribute('href');
  
  if (href && href.startsWith('#')) {
    event.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Actualizar URL sin recargar
      window.history.pushState(null, '', href);
    }
  }
}

// ===== ANIMACIONES DE ENTRADA =====
/**
 * Observa elementos para animarlos cuando entran en el viewport
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos animables
  const animatableElements = document.querySelectorAll('.feature-card, .stat-item');
  animatableElements.forEach(el => observer.observe(el));
}

// ===== EFECTO PARALLAX SUTIL =====
/**
 * Añade efecto parallax al mover el mouse
 */
function initParallaxEffect() {
  const hero = document.querySelector('.hero');
  
  if (!hero) return;

  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const xPos = (clientX / innerWidth - 0.5) * 20;
    const yPos = (clientY / innerHeight - 0.5) * 20;
    
    hero.style.transform = `translate(${xPos}px, ${yPos}px)`;
  });
}

// ===== CONTADOR ANIMADO =====
/**
 * Anima los números de las estadísticas
 */
function animateCounters() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(stat => {
    const text = stat.textContent.trim();
    
    // Solo animar números simples
    if (text === '3') {
      animateNumber(stat, 0, 3, 1000);
    }
  });
}

/**
 * Anima un número desde start hasta end
 * @param {HTMLElement} element - Elemento a animar
 * @param {number} start - Valor inicial
 * @param {number} end - Valor final
 * @param {number} duration - Duración en ms
 */
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const value = Math.floor(start + (end - start) * easeOutCubic(progress));
    element.textContent = value;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Función de easing cubic
 * @param {number} t - Progreso (0-1)
 * @returns {number}
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ===== EASTER EGG =====
/**
 * Código secreto de Zoro (presionar las teclas Z-O-R-O)
 */
let secretCode = '';
const targetCode = 'ZORO';

function checkSecretCode(key) {
  secretCode += key.toUpperCase();
  
  if (secretCode.length > targetCode.length) {
    secretCode = secretCode.slice(-targetCode.length);
  }
  
  if (secretCode === targetCode) {
    activateZoroMode();
    secretCode = '';
  }
}

function activateZoroMode() {
  showNotification('⚔️ ¡Modo Zoro Activado! ⚔️\n\n¡Nada ocurrió! Zoro se perdió buscando el modo secreto...', 'success');
  
  // Efecto visual temporal
  document.body.style.animation = 'shake 0.5s';
  setTimeout(() => {
    document.body.style.animation = '';
  }, 500);
}

// Inyectar animación de shake
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

// ===== INICIALIZACIÓN =====
/**
 * Inicializa todas las funcionalidades cuando el DOM está listo
 */
function init() {
  // Botón principal
  const mainButton = document.getElementById('conocerBtn');
  if (mainButton) {
    mainButton.addEventListener('click', handleMainButtonClick);
  }

  // Todos los botones que apuntan a zoro.html
  const zoroLinks = document.querySelectorAll('a[href="zoro.html"]');
  zoroLinks.forEach(link => {
    link.addEventListener('click', handleMainButtonClick);
  });

  // Smooth scroll para enlaces internos
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(link => {
    link.addEventListener('click', handleSmoothScroll);
  });

  // Efectos visuales
  initScrollAnimations();
  initParallaxEffect();
  animateCounters();

  // Easter egg
  document.addEventListener('keypress', (e) => {
    checkSecretCode(e.key);
  });

  // Mensaje de bienvenida en consola
  console.log('%c⚔️ Bienvenido al sitio de Roronoa Zoro ⚔️', 'color: #2dd4bf; font-size: 20px; font-weight: bold;');
  console.log('%cPresiona las teclas Z-O-R-O para activar un secreto...', 'color: #94a3b8; font-size: 12px;');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===== EXPORTAR FUNCIONES (opcional, para uso externo) =====
window.ZoroSite = {
  showNotification,
  checkPageExists,
  CONFIG
};