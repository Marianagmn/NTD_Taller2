/* ============================================
   CONFIGURACIÓN GLOBAL
   ============================================ */
const CONFIG = {
  targetPage: 'zoro.html',
  animationDuration: 300,
  particleCount: 30,
  scrollThreshold: 300,
  typingSpeed: 50,
  typingDelay: 1000,
  messages: {
    notFound: '⚔️ La página "zoro.html" no se encontró.\n\n¡Crea el archivo "zoro.html" en tu proyecto para acceder al perfil completo de Zoro con su biografía, técnicas y galería multimedia!',
    localWarning: '⚠️ No se pudo verificar "zoro.html".\n\nSi trabajas localmente, asegúrate de crear el archivo "zoro.html" en la misma carpeta del proyecto para ver el contenido completo.',
    loading: 'Cargando el perfil de Zoro...',
    easterEgg: '⚔️ ¡Modo Santoryu Activado! ⚔️\n\n¡Nada ocurrió! Zoro se perdió buscando el modo secreto...\n\n"No hay camino recto para llegar al destino" - Roronoa Zoro'
  },
  quotes: [
    "Las cicatrices en la espalda son la vergüenza de un espadachín",
    "¡Nunca volveré a perder!",
    "Nada... nada pasó",
    "El camino del espadachín es solitario",
    "Rey del Infierno"
  ]
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
   SISTEMA DE PARTÍCULAS MEJORADO
   ============================================ */
class ParticleSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.init();
    this.setupMouseTracking();
  }

  init() {
    for (let i = 0; i < CONFIG.particleCount; i++) {
      this.createParticle(i);
    }
    this.animate();
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  createParticle(index) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Utils.random(2, 8);
    const x = Utils.random(0, 100);
    const y = Utils.random(0, 100);
    const duration = Utils.random(15, 35);
    const delay = index * 0.3;
    
    // Tipos de partículas
    const types = ['glow', 'sparkle', 'sword'];
    const type = types[Math.floor(Utils.random(0, types.length))];
    
    Object.assign(particle.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}%`,
      top: `${y}%`,
      pointerEvents: 'none',
      zIndex: 1
    });

    switch(type) {
      case 'glow':
        particle.style.background = `radial-gradient(circle, rgba(45, 212, 191, ${Utils.random(0.4, 0.8)}), transparent)`;
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 ${size * 2}px rgba(45, 212, 191, 0.5)`;
        break;
      case 'sparkle':
        particle.style.background = 'rgba(255, 255, 255, 0.8)';
        particle.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        break;
      case 'sword':
        particle.innerHTML = '⚔️';
        particle.style.fontSize = `${size}px`;
        particle.style.opacity = Utils.random(0.2, 0.5);
        particle.style.filter = 'blur(1px)';
        break;
    }

    particle.style.animation = `particleFloat ${duration}s ${delay}s infinite ease-in-out`;
    
    this.container.appendChild(particle);
    
    // Guardar datos de la partícula
    this.particles.push({
      element: particle,
      x: parseFloat(x),
      y: parseFloat(y),
      baseX: parseFloat(x),
      baseY: parseFloat(y),
      size: size,
      type: type
    });
  }

  animate() {
    this.particles.forEach(particle => {
      const rect = particle.element.getBoundingClientRect();
      const particleX = rect.left + rect.width / 2;
      const particleY = rect.top + rect.height / 2;
      
      const dx = this.mouse.x - particleX;
      const dy = this.mouse.y - particleY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Efecto de repulsión al mouse
      if (distance < 150) {
        const force = (150 - distance) / 150;
        const angle = Math.atan2(dy, dx);
        const moveX = -Math.cos(angle) * force * 30;
        const moveY = -Math.sin(angle) * force * 30;
        
        particle.element.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.5})`;
      } else {
        particle.element.style.transform = 'translate(0, 0) scale(1)';
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

/* ============================================
   EFECTO DE TYPING ANIMADO
   ============================================ */
class TypingEffect {
  constructor(element, text, speed = 50) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.currentIndex = 0;
    this.isComplete = false;
  }

  async start() {
    this.element.textContent = '';
    
    return new Promise((resolve) => {
      const type = () => {
        if (this.currentIndex < this.text.length) {
          this.element.textContent += this.text[this.currentIndex];
          this.currentIndex++;
          
          // Cursor parpadeante
          const cursor = document.createElement('span');
          cursor.className = 'typing-cursor';
          cursor.textContent = '|';
          this.element.appendChild(cursor);
          
          setTimeout(() => {
            if (cursor.parentNode) {
              cursor.remove();
            }
            type();
          }, this.speed);
        } else {
          this.isComplete = true;
          resolve();
        }
      };
      
      type();
    });
  }

  reset() {
    this.currentIndex = 0;
    this.isComplete = false;
    this.element.textContent = '';
  }
}

/* ============================================
   GESTOR DE TEXTO ROTATIVO
   ============================================ */
class RotatingText {
  constructor(element, texts, interval = 4000) {
    this.element = element;
    this.texts = texts;
    this.interval = interval;
    this.currentIndex = 0;
    this.init();
  }

  init() {
    if (!this.element) return;
    this.show();
  }

  async show() {
    // Fade out
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(-10px)';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Cambiar texto
    this.element.textContent = this.texts[this.currentIndex];
    
    // Fade in
    this.element.style.transition = 'all 0.5s ease';
    this.element.style.opacity = '1';
    this.element.style.transform = 'translateY(0)';
    
    this.currentIndex = (this.currentIndex + 1) % this.texts.length;
    
    setTimeout(() => this.show(), this.interval);
  }
}
/* ============================================
   CONTADOR ANIMADO MEJORADO
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

    // Añadir efecto de pulso
    this.element.style.transition = 'transform 0.3s ease';

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      const currentValue = Math.floor(
        startValue + (this.target - startValue) * Utils.easeOutCubic(progress)
      );

      this.element.textContent = currentValue;

      // Efecto de escala durante la animación
      const scale = 1 + Math.sin(progress * Math.PI) * 0.15;
      this.element.style.transform = `scale(${scale})`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        this.element.textContent = this.target;
        this.element.style.transform = 'scale(1)';
        
        // Efecto final de celebración
        this.celebrate();
      }
    };

    requestAnimationFrame(update);
  }

  celebrate() {
    // Crear mini explosión de partículas
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      this.createCelebrationParticle(centerX, centerY, i);
    }
  }

  createCelebrationParticle(x, y, index) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, rgba(45, 212, 191, 1), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
    `;

    document.body.appendChild(particle);

    const angle = (index / 8) * Math.PI * 2;
    const distance = 50;
    const targetX = x + Math.cos(angle) * distance;
    const targetY = y + Math.sin(angle) * distance;

    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(0)`, opacity: 0 }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => particle.remove();
  }
}

/* ============================================
   EFECTO RIPPLE (ONDA) PARA CLICKS
   ============================================ */
class RippleEffect {
  static init() {
    const elements = document.querySelectorAll('.btn, .stat-card, .skill-card, .info-item');
    elements.forEach(element => {
      element.addEventListener('click', (e) => this.create(e, element));
    });
  }

  static create(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(45, 212, 191, 0.5), transparent);
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      transform: scale(0);
      opacity: 1;
      z-index: 1000;
    `;

    // Asegurar que el elemento padre tenga position relative
    const position = window.getComputedStyle(element).position;
    if (position === 'static') {
      element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';

    element.appendChild(ripple);

    const animation = ripple.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(2)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });

    animation.onfinish = () => ripple.remove();
  }
}

/* ============================================
   EFECTO DE MAGNETISMO EN CURSOR
   ============================================ */
class MagneticCursor {
  constructor() {
    this.cursor = null;
    this.follower = null;
    this.pos = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0 };
    this.speed = 0.15;
    this.init();
  }

  init() {
    // Crear cursor personalizado
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: rgba(45, 212, 191, 0.8);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10001;
      mix-blend-mode: difference;
      transition: transform 0.2s ease;
    `;

    this.follower = document.createElement('div');
    this.follower.className = 'cursor-follower';
    this.follower.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(45, 212, 191, 0.3);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transition: transform 0.2s ease, border-color 0.3s ease;
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.follower);

    this.setupEventListeners();
    this.animate();
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Efecto hover en elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, .btn, .stat-card, .skill-card');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursor.style.transform = 'scale(1.5)';
        this.follower.style.transform = 'scale(1.5)';
        this.follower.style.borderColor = 'rgba(45, 212, 191, 0.8)';
      });

      element.addEventListener('mouseleave', () => {
        this.cursor.style.transform = 'scale(1)';
        this.follower.style.transform = 'scale(1)';
        this.follower.style.borderColor = 'rgba(45, 212, 191, 0.3)';
      });
    });

    // Ocultar cursor por defecto
    document.addEventListener('mouseenter', () => {
      document.body.style.cursor = 'none';
    });
  }

  animate() {
    // Smooth follow effect
    this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
    this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

    this.cursor.style.left = `${this.mouse.x}px`;
    this.cursor.style.top = `${this.mouse.y}px`;

    this.follower.style.left = `${this.pos.x}px`;
    this.follower.style.top = `${this.pos.y}px`;

    requestAnimationFrame(() => this.animate());
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
    // Observer para contadores con efecto especial
    this.createObserver('counters', '.stat-value[data-target]', (entry) => {
      const target = entry.target.getAttribute('data-target');
      const counter = new AnimatedCounter(entry.target, target);
      counter.animate();
    }, { threshold: 0.5 });

    // Observer para tarjetas de habilidades con stagger
    this.createObserver('skills', '.skill-card', (entry, index) => {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        
        // Efecto de brillo al aparecer
        const shine = document.createElement('div');
        shine.style.cssText = `
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          pointer-events: none;
        `;
        entry.target.style.position = 'relative';
        entry.target.style.overflow = 'hidden';
        entry.target.appendChild(shine);
        
        shine.animate([
          { left: '-100%' },
          { left: '100%' }
        ], {
          duration: 1000,
          easing: 'ease-in-out'
        }).onfinish = () => shine.remove();
      }, index * 150);
    });

    // Observer para items del timeline con animación de línea
    this.createObserver('timeline', '.timeline-item', (entry, index) => {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        
        // Animar el marcador
        const marker = entry.target.querySelector('.timeline-marker');
        if (marker) {
          marker.animate([
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.5)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1 }
          ], {
            duration: 600,
            delay: 200,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          });
        }
      }, index * 200);
    });

    // Observer para stats cards con efecto de contador
    this.createObserver('stats', '.stat-card', (entry) => {
      entry.target.animate([
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1.05)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      });
    }, { threshold: 0.3 });

    // Observer para info items con cascada
    this.createObserver('info', '.info-item', (entry, index) => {
      setTimeout(() => {
        entry.target.animate([
          { transform: 'translateX(-30px)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ], {
          duration: 500,
          fill: 'forwards',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
      }, index * 100);
    });

    // Observer para tags con efecto de aparición
    this.createObserver('tags', '.tag', (entry, index) => {
      setTimeout(() => {
        entry.target.animate([
          { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 }
        ], {
          duration: 400,
          fill: 'forwards',
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        });
      }, index * 80);
    });
  }

  createObserver(name, selector, callback, options = {}) {
    const defaultOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerOptions = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          callback(entry, index);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(selector);
    elements.forEach((el, idx) => {
      el.dataset.index = idx;
      observer.observe(el);
    });

    this.observers.set(name, observer);
  }

  disconnect(name) {
    const observer = this.observers.get(name);
    if (observer) {
      observer.disconnect();
      this.observers.delete(name);
    }
  }

  disconnectAll() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
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
   EASTER EGG MEJORADO - CÓDIGO SECRETO
   ============================================ */
class EasterEgg {
  constructor(notificationSystem) {
    this.code = '';
    this.targetCode = 'ZORO';
    this.notificationSystem = notificationSystem;
    this.activated = false;
    this.init();
  }

  init() {
    document.addEventListener('keypress', (e) => {
      this.checkCode(e.key);
    });

    // Easter egg adicional con triple click en logo
    const logo = document.querySelector('.logo');
    if (logo) {
      let clickCount = 0;
      let clickTimer = null;
      
      logo.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 3) {
          this.activateSantoryu();
          clickCount = 0;
        }
        
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 500);
      });
    }
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
    if (this.activated) return;
    this.activated = true;

    this.notificationSystem.show(CONFIG.messages.easterEgg, 'success', 8000);
    
    // Efectos mejorados
    this.createScreenFlash();
    this.shakeScreen();
    this.animateSwords();
    this.createSlashEffect();
    this.createSpecialParticles();
    this.temporaryColorChange();
    this.consoleArt();

    setTimeout(() => {
      this.activated = false;
    }, 3000);
  }

  activateSantoryu() {
    this.notificationSystem.show('⚔️⚔️⚔️ ¡SANTORYU OUGI! ⚔️⚔️⚔️\n\nLas tres espadas danzan...', 'success', 5000);
    
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.animate([
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(360deg) scale(1.3)' },
        { transform: 'rotate(720deg) scale(1)' }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      });
    }
  }

  createScreenFlash() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      inset: 0;
      background: radial-gradient(circle, rgba(45, 212, 191, 0.3), transparent);
      pointer-events: none;
      z-index: 10002;
    `;
    document.body.appendChild(flash);

    flash.animate([
      { opacity: 0 },
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 400,
      easing: 'ease-in-out'
    }).onfinish = () => flash.remove();
  }

  shakeScreen() {
    const keyframes = [];
    for (let i = 0; i < 10; i++) {
      keyframes.push({
        transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`
      });
    }
    keyframes.push({ transform: 'translate(0, 0)' });

    document.body.animate(keyframes, {
      duration: 500,
      easing: 'ease-in-out'
    });
  }

  animateSwords() {
    const swords = document.querySelectorAll('.sword');
    swords.forEach((sword, index) => {
      setTimeout(() => {
        sword.animate([
          { transform: `rotate(${index * 120}deg) scale(1)` },
          { transform: `rotate(${index * 120 + 360}deg) scale(1.5)` },
          { transform: `rotate(${index * 120 + 720}deg) scale(1)` }
        ], {
          duration: 1000,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        });
      }, index * 100);
    });
  }

  createSlashEffect() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const slash = document.createElement('div');
        const angle = Math.random() * 360;
        const length = 300 + Math.random() * 200;
        
        slash.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          width: ${length}px;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(45, 212, 191, 0.8), transparent);
          transform-origin: left center;
          transform: translate(-50%, -50%) rotate(${angle}deg);
          pointer-events: none;
          z-index: 10003;
          box-shadow: 0 0 20px rgba(45, 212, 191, 0.8);
        `;
        
        document.body.appendChild(slash);

        slash.animate([
          { opacity: 0, width: '0px' },
          { opacity: 1, width: `${length}px` },
          { opacity: 0, width: `${length * 1.5}px` }
        ], {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => slash.remove();
      }, i * 200);
    }
  }

  createSpecialParticles() {
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = 4 + Math.random() * 8;
        
        particle.textContent = ['⚔️', '✨', '💫'][Math.floor(Math.random() * 3)];
        particle.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          font-size: ${size}px;
          pointer-events: none;
          z-index: 10003;
          filter: drop-shadow(0 0 10px rgba(45, 212, 191, 0.8));
        `;
        
        document.body.appendChild(particle);

        particle.animate([
          { 
            transform: 'translate(0, 0) rotate(0deg) scale(0)', 
            opacity: 0 
          },
          { 
            transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg) scale(1)`, 
            opacity: 1 
          },
          { 
            transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 + 100}px) rotate(${Math.random() * 720}deg) scale(0)`, 
            opacity: 0 
          }
        ], {
          duration: 2000,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => particle.remove();
      }, i * 50);
    }
  }

  temporaryColorChange() {
    const originalBg = document.body.style.background;
    
    document.body.style.transition = 'background 0.5s ease';
    document.body.style.background = 'linear-gradient(180deg, #0a5043 0%, #0d4d3f 50%, #0a3e35 100%)';
    
    setTimeout(() => {
      document.body.style.background = originalBg;
    }, 2000);
  }

  consoleArt() {
    const style1 = 'color: #2dd4bf; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-family: monospace;';
    const style2 = 'color: #34d399; font-size: 14px; font-weight: bold;';
    const style3 = 'color: #94a3b8; font-size: 12px; font-style: italic;';
    
    console.clear();
    console.log('%c⚔️ SANTORYU OUGI ACTIVADO ⚔️', style1);
    console.log('%c⚔️ SANZEN SEKAI ⚔️', style2);
    console.log('%c"Daré mi vida por mi capitán. Ese es el camino que he elegido."', style3);
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
    this.magneticCursor = null;
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
    // Inicializar sistemas principales
    new ParticleSystem('particles');
    new AnimationObserver();
    new ScrollToTop();
    new HeaderScroll();
    new EasterEgg(this.notificationSystem);
    new ParallaxEffect();
    
    // Inicializar efectos interactivos
    RippleEffect.init();
    SmoothScroll.init();

    // Cursor personalizado (solo en desktop)
    if (window.innerWidth > 1024) {
      this.magneticCursor = new MagneticCursor();
    }

    // Configurar botones de verificación
    const zoroLinks = document.querySelectorAll('a[href="zoro.html"]');
    zoroLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        PageVerifier.handleClick(e, this.notificationSystem);
      });
    });

    // Animaciones de entrada para elementos del hero
    this.animateHeroElements();

    // Setup de eventos de teclado
    this.setupKeyboardShortcuts();

    // Verificar si hay hash en la URL
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    // Mensaje de bienvenida en consola
    this.welcomeMessage();

    // Iniciar texto rotativo si existe
    const quoteElement = document.querySelector('.footer-quote');
    if (quoteElement && CONFIG.quotes) {
      new RotatingText(quoteElement, CONFIG.quotes, 5000);
    }
  }

  animateHeroElements() {
    // Animar badge
    const badge = document.querySelector('.hero-badge');
    if (badge) {
      badge.animate([
        { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
        { transform: 'scale(1.1) rotate(10deg)', opacity: 1 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 }
      ], {
        duration: 800,
        delay: 200,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        fill: 'backwards'
      });
    }

    // Animar título línea por línea
    const titleLines = document.querySelectorAll('.title-line, .title-highlight');
    titleLines.forEach((line, index) => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        line.animate([
          { opacity: 0, transform: 'translateY(30px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 600,
          fill: 'forwards',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
      }, 400 + (index * 200));
    });

    // Animar botones con efecto de rebote
    const buttons = document.querySelectorAll('.cta-group .btn');
    buttons.forEach((btn, index) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        btn.animate([
          { opacity: 0, transform: 'translateY(20px) scale(0.8)' },
          { opacity: 1, transform: 'translateY(0) scale(1.05)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], {
          duration: 600,
          fill: 'forwards',
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        });
      }, 1000 + (index * 150));
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K para scroll to top
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Escape para cerrar notificaciones
      if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(n => {
          n.classList.remove('show');
          setTimeout(() => n.remove(), 300);
        });
      }

      // Números 1-3 para navegar a secciones
      if (['1', '2', '3'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
        const sections = ['inicio', 'perfil', 'habilidades'];
        const target = document.getElementById(sections[parseInt(e.key) - 1]);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
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

    const styles3 = [
      'color: #34d399',
      'font-size: 11px',
      'font-weight: bold'
    ].join(';');

    console.log('%c⚔️ Bienvenido al Portal de Roronoa Zoro ⚔️', styles);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles2);
    console.log('%cEaster Eggs disponibles:', styles3);
    console.log('%c  • Presiona Z-O-R-O para activar Modo Santoryu', styles2);
    console.log('%c  • Triple-click en el logo para Santoryu Ougi', styles2);
    console.log('%c  • Ctrl+K para volver arriba', styles2);
    console.log('%c  • Números 1-3 para navegar entre secciones', styles2);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles2);
    console.log('%c"Las cicatrices en la espalda son la vergüenza de un espadachín"', styles2);
  }
}

// Iniciar aplicación
const app = new App();

// Exportar para uso externo
window.ZoroSite = {
  notification: (msg, type) => app.notificationSystem.show(msg, type),
  config: CONFIG,
  app: app
};