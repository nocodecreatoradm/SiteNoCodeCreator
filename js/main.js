(function () {
  const WHATSAPP_NUMBER = '51908844210';
  const WHATSAPP_DISPLAY = '+51 908 844 210';
  const EMAIL = 'hola@nocodecreatoria.com';
  const WHATSAPP_MESSAGE = 'Hola, vi tu página de NoCode Creator y quiero cotizar un proyecto.';

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  document.querySelectorAll('.js-wa-link').forEach((el) => {
    el.setAttribute('href', waLink);
  });
  document.querySelectorAll('.js-wa-display').forEach((el) => {
    el.textContent = WHATSAPP_DISPLAY;
  });
  document.querySelectorAll('.js-mail-link').forEach((el) => {
    el.setAttribute('href', `mailto:${EMAIL}`);
  });
  document.querySelectorAll('.js-mail-display').forEach((el) => {
    el.textContent = EMAIL;
  });

  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  const error = document.getElementById('contactError');
  if (form && success && error) {
    const submitButton = form.querySelector('button[type="submit"]');
    const submitButtonDefaultText = submitButton.textContent;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      success.hidden = true;
      error.hidden = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
        .then((response) => response.json())
        .then((data) => {
          submitButton.disabled = false;
          submitButton.textContent = submitButtonDefaultText;
          if (data.success) {
            success.hidden = false;
            form.reset();
          } else {
            error.hidden = false;
          }
        })
        .catch(() => {
          submitButton.disabled = false;
          submitButton.textContent = submitButtonDefaultText;
          error.hidden = false;
        });
    });
  }

  const parallaxLayers = document.querySelectorAll('.bg-scene__layer');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (parallaxLayers.length && !reduceMotion) {
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      parallaxLayers.forEach((layer) => {
        const factor = parseFloat(layer.dataset.parallax || '0');
        layer.style.transform = `translate3d(0, ${y * factor}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo && !reduceMotion) {
    heroVideo.play().catch(() => {});
  }

  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');
  const navHeader = document.querySelector('.nav');
  if (burger && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
      if (navHeader) {
        mobileMenu.style.top = navHeader.getBoundingClientRect().height + 'px';
      }
      const isOpen = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('is-open')) return;
      if (mobileMenu.contains(e.target) || burger.contains(e.target)) return;
      closeMenu();
    });
  }
})();
