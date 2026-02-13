/* ============================================
   CONFIGURACIÓN GLOBAL
   ============================================ */
const CONFIG = {
  targetPage: 'zoro.html',
  animationDuration: 300,
  particleCount: 20,
  scrollThreshold: 300,
  messages: {
    notFound: '⚔️ La página "zoro.html" no se encontró.\n\n¡Crea el archivo "zoro.html" en tu proyecto para acceder al perfil completo de Zoro con su biografía, técnicas y galería multimedia!',
    localWarning: '⚠️ No se pudo verificar "zoro.html".\n\nSi trabajas localmente, asegúrate de crear el archivo "zoro.html" en la misma carpeta del proyecto para ver el contenido completo.',
    loading: 'Cargando el perfil de Zoro...',
    easterEgg: '⚔️ ¡Modo Santoryu Activado! ⚔️\n\n¡Nada ocurrió! Zoro se perdió buscando el modo secreto...\n\n"No hay camino recto para llegar al destino" - Roronoa Zoro'
  }
};

/* ============================================
   UTILIDADES
   ============================================ */
const Utils = {
  // Debounce para optimizar eventos
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle para scroll y resize
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Easing functions
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Random number generator
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Formatear números grandes
  formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toString();
  }
};

/* ============================================
   SISTEMA DE PARTÍCULAS
   ============================================ */
class ParticleSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.particles = [];
    this.init();
  }

  init() {
    for (let i = 0; i < CONFIG.particleCount; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Utils.random(2, 6);
    const x = Utils.random(0, 100);
    const y = Utils.random(0, 100);
    const duration = Utils.random(15, 30);
    const delay = Utils.random(0, 10);
    
    Object.assign(particle.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, rgba(45, 212, 191, ${Utils.random(0.3, 0.7)}), transparent)`,
      borderRadius: '50%',
      left: `${x}%`,
      top: `${y}%`,
      animation: `particleFloat ${duration}s ${delay}s infinite ease-in-out`,
      pointerEvents: 'none'
    });

    this.container.appendChild(particle);
    this.particles.push(particle);
  }
}

/* ============================================
   CONTADOR ANIMADO
   ============================================ */
class AnimatedCounter {
  constructor(element, target, duration = 2000) {
    this.element = element;
    this.target = parseInt(target) || 0;
    this.duration = duration;
    this.hasAnimated = false;
  }

  animate() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;

    const startTime = performance.now();
    const startValue = 0;

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      const currentValue = Math.floor(
        startValue + (this.target - startValue) * Utils.easeOutCubic(progress)
      );

      this.element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        this.element.textContent = this.target;
      }
    };

    requestAnimationFrame(update);
  }
}

/* ============================================
   INTERSECTION OBSERVER
   ============================================ */
class AnimationObserver {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    // Observer para contadores
    this.createObserver('counters', '.stat-value[data-target]', (entry) => {
      const target = entry.target.getAttribute('data-target');
      const counter = new AnimatedCounter(entry.target, target);
      counter.animate();
    });

    // Observer para tarjetas de habilidades
    this.createObserver('skills', '.skill-card', (entry) => {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    });

    // Observer para items del timeline
    this.createObserver('timeline', '.timeline-item', (entry) => {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
    });
  }

  createObserver(name, selector, callback) {
    const options = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const elements = document.querySelectorAll(selector);
    elements.forEach(el => observer.observe(el));

    this.observers.set(name, observer);
  }
}

/* ============================================
   SISTEMA DE NOTIFICACIONES
   ============================================ */
class NotificationSystem {
  constructor() {
    this.container = null;
    this.activeNotifications = [];
    this.init();
  }

  init() {
    if (!document.getElementById('notification-styles')) {
      this.injectStyles();
    }
  }

  show(message, type = 'info', duration = 6000) {
    const notification = this.create(message, type);
    this.activeNotifications.push(notification);

    document.body.appendChild(notification);
    
    // Trigger reflow para animación
    notification.offsetHeight;
    notification.classList.add('show');

    // Auto-cerrar
    const autoCloseTimer = setTimeout(() => {
      this.close(notification);
    }, duration);

    // Botón de cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoCloseTimer);
      this.close(notification);
    });
  }

  create(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getIcon(type)}</span>
        <p class="notification-message">${message}</p>
        <button class="notification-close" aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="notification-progress"></div>
    `;

    return notification;
  }

  close(notification) {
    notification.classList.remove('show');
    
    setTimeout(() => {
      notification.remove();
      const index = this.activeNotifications.indexOf(notification);
      if (index > -1) {
        this.activeNotifications.splice(index, 1);
      }
    }, CONFIG.animationDuration);
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      warning: '⚠️',
      error: '✕',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  injectStyles() {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 420px;
        min-width: 300px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(10, 14, 26, 0.98));
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(45, 212, 191, 0.3);
        backdrop-filter: blur(20px);
        opacity: 0;
        transform: translateX(450px) scale(0.9);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 10000;
        overflow: hidden;
      }

      .notification.show {
        opacity: 1;
        transform: translateX(0) scale(1);
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
        position: relative;
        z-index: 2;
      }

      .notification-icon {
        font-size: 1.75rem;
        flex-shrink: 0;
        line-height: 1;
        animation: iconBounce 0.6s ease-out;
      }

      @keyframes iconBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      .notification-message {
        flex: 1;
        color: #e6eef8;
        font-size: 0.9375rem;
        line-height: 1.6;
        margin: 0;
        white-space: pre-line;
      }

      .notification-close {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #e6eef8;
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald));
        transform-origin: left;
        animation: progressBar 6s linear;
      }

      @keyframes progressBar {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
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

      @keyframes particleFloat {
        0%, 100% {
          transform: translate(0, 0);
          opacity: 0.5;
        }
        25% {
          transform: translate(10px, -20px);
          opacity: 0.8;
        }
        50% {
          transform: translate(-10px, -40px);
          opacity: 0.6;
        }
        75% {
          transform: translate(15px, -60px);
          opacity: 0.4;
        }
      }

      @media (max-width: 640px) {
        .notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
          min-width: 0;
          transform: translateY(-120px) scale(0.95);
        }

        .notification.show {
          transform: translateY(0) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ============================================
   VERIFICACIÓN DE PÁGINA
   ============================================ */
class PageVerifier {
  static async checkExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Error verificando página:', error);
      return false;
    }
  }

  static async handleClick(event, notificationSystem) {
    const button = event.currentTarget;
    const originalContent = button.innerHTML;
    
    // Estado de carga
    button.innerHTML = `
      <span class="btn-content">
        <span class="loading-spinner"></span>
        <span class="btn-text">${CONFIG.messages.loading}</span>
      </span>
    `;
    button.style.pointerEvents = 'none';

    // Agregar spinner CSS si no existe
    if (!document.getElementById('spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(10, 34, 46, 0.3);
          border-top-color: #0a222e;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    try {
      const exists = await this.checkExists(CONFIG.targetPage);
      
      if (!exists) {
        event.preventDefault();
        notificationSystem.show(CONFIG.messages.notFound, 'warning');
        button.innerHTML = originalContent;
        button.style.pointerEvents = 'auto';
      }
    } catch (error) {
      event.preventDefault();
      notificationSystem.show(CONFIG.messages.localWarning, 'info');
      button.innerHTML = originalContent;
      button.style.pointerEvents = 'auto';
    }
  }
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
class SmoothScroll {
  static init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', this.handleClick.bind(this));
    });
  }

  static handleClick(event) {
    const href = event.currentTarget.getAttribute('href');
    
    if (href && href !== '#') {
      event.preventDefault();
      const targetId = href.substring(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Actualizar URL
        window.history.pushState(null, '', href);
      }
    }
  }
}

/* ============================================
   SCROLL TO TOP
   ============================================ */
class ScrollToTop {
  constructor() {
    this.button = document.getElementById('scrollTop');
    if (!this.button) return;
    
    this.init();
  }

  init() {
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', Utils.throttle(() => {
      this.updateVisibility();
    }, 100));
  }

  updateVisibility() {
    if (window.pageYOffset > CONFIG.scrollThreshold) {
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
    }
  }
}

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */
class HeaderScroll {
  constructor() {
    this.header = document.querySelector('.header');
    if (!this.header) return;
    
    this.init();
  }

  init() {
    window.addEventListener('scroll', Utils.throttle(() => {
      this.update();
    }, 100));
  }

  update() {
    if (window.pageYOffset > 50) {
      this.header.style.background = 'rgba(10, 14, 26, 0.95)';
      this.header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
    } else {
      this.header.style.background = 'rgba(10, 14, 26, 0.75)';
      this.header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    }
  }
}

/* ============================================
   EASTER EGG - CÓDIGO SECRETO
   ============================================ */
class EasterEgg {
  constructor(notificationSystem) {
    this.code = '';
    this.targetCode = 'ZORO';
    this.notificationSystem = notificationSystem;
    this.init();
  }

  init() {
    document.addEventListener('keypress', (e) => {
      this.checkCode(e.key);
    });
  }

  checkCode(key) {
    this.code += key.toUpperCase();
    
    if (this.code.length > this.targetCode.length) {
      this.code = this.code.slice(-this.targetCode.length);
    }
    
    if (this.code === this.targetCode) {
      this.activate();
      this.code = '';
    }
  }

  activate() {
    this.notificationSystem.show(CONFIG.messages.easterEgg, 'success', 8000);
    
    // Efecto visual
    document.body.style.animation = 'shake 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);

    // Efecto en las espadas del logo
    const swords = document.querySelectorAll('.sword');
    swords.forEach((sword, index) => {
      setTimeout(() => {
        sword.style.animation = 'swordSlash 0.6s ease-out';
        setTimeout(() => {
          sword.style.animation = '';
        }, 600);
      }, index * 100);
    });

    // Inyectar animaciones si no existen
    if (!document.getElementById('easter-egg-styles')) {
      const style = document.createElement('style');
      style.id = 'easter-egg-styles';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }

        @keyframes swordSlash {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(360deg) scale(1.3); }
          100% { transform: rotate(720deg) scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    console.log('%c⚔️ ¡MODO SANTORYU ACTIVADO! ⚔️', 
      'color: #2dd4bf; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    console.log('%c"El camino del espadachín es solitario"', 
      'color: #94a3b8; font-size: 14px; font-style: italic;');
  }
}

/* ============================================
   PARALLAX EFFECT
   ============================================ */
class ParallaxEffect {
  constructor() {
    this.elements = document.querySelectorAll('.hero-content, .hero-sidebar');
    if (this.elements.length === 0) return;
    
    this.init();
  }

  init() {
    document.addEventListener('mousemove', Utils.throttle((e) => {
      this.update(e);
    }, 50));
  }

  update(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const xPercent = (clientX / innerWidth - 0.5) * 2;
    const yPercent = (clientY / innerHeight - 0.5) * 2;
    
    this.elements.forEach((element, index) => {
      const depth = (index + 1) * 5;
      const x = xPercent * depth;
      const y = yPercent * depth;
      
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
}

/* ============================================
   INICIALIZACIÓN
   ============================================ */
class App {
  constructor() {
    this.notificationSystem = new NotificationSystem();
    this.init();
  }

  init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Inicializar sistemas
    new ParticleSystem('particles');
    new AnimationObserver();
    new ScrollToTop();
    new HeaderScroll();
    new EasterEgg(this.notificationSystem);
    new ParallaxEffect();
    
    SmoothScroll.init();

    // Configurar botones de verificación
    const zoroLinks = document.querySelectorAll('a[href="zoro.html"]');
    zoroLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        PageVerifier.handleClick(e, this.notificationSystem);
      });
    });

    // Mensaje de bienvenida en consola
    this.welcomeMessage();

    // Verificar si hay hash en la URL
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  welcomeMessage() {
    const styles = [
      'color: #2dd4bf',
      'font-size: 20px',
      'font-weight: bold',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.5)',
      'padding: 10px'
    ].join(';');

    const styles2 = [
      'color: #94a3b8',
      'font-size: 12px',
      'font-style: italic'
    ].join(';');

    console.log('%c⚔️ Bienvenido al Portal de Roronoa Zoro ⚔️', styles);
    console.log('%cPresiona las teclas Z-O-R-O para descubrir un secreto...', styles2);
    console.log('%c"Las cicatrices en la espalda son la vergüenza de un espadachín"', styles2);
  }
}

// Iniciar aplicación
const app = new App();

// Exportar para uso externo
window.ZoroSite = {
  notification: (msg, type) => app.notificationSystem.show(msg, type),
  config: CONFIG
};