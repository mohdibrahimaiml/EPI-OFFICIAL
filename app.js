// Theme Toggle (Light/Dark Mode)
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to system preference
const savedTheme = null; // Storage not available in sandbox
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Set initial theme (default to dark mode)
if (!prefersDark) {
  body.classList.add('light-mode');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    // Add a small animation effect
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
  });
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Only auto-update if user hasn't manually set theme
  if (e.matches) {
    body.classList.remove('light-mode');
  } else {
    body.classList.add('light-mode');
  }
});

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate hamburger to X
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = navLinks.classList.contains('active') 
      ? 'rotate(45deg) translateY(7px)' 
      : 'none';
    spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navLinks.classList.contains('active') 
      ? 'rotate(-45deg) translateY(-7px)' 
      : 'none';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Skip if it's just "#"
    if (href === '#') {
      e.preventDefault();
      return;
    }
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = document.querySelector('.nav').offsetHeight;
      const targetPosition = target.offsetTop - navHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Sticky Navigation with Enhanced Shadow on Scroll
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    navbar.style.boxShadow = '0 8px 32px rgba(0, 132, 212, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
    navbar.style.transform = 'translateY(0)';
  } else {
    navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02), 0 8px 32px rgba(0, 0, 0, 0.03)';
    navbar.style.transform = 'translateY(0)';
  }
  
  lastScroll = currentScroll;
});

// Demo Form Submission
const demoForm = document.getElementById('demoForm');
const demoSuccess = document.getElementById('demoSuccess');

if (demoForm && demoSuccess) {
  demoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      company: document.getElementById('company').value,
      role: document.getElementById('role').value,
      message: document.getElementById('message').value
    };
    
    // In a real application, you would send this data to a backend
    console.log('Demo request submitted:', formData);
    
    // Create mailto link as fallback
    const subject = encodeURIComponent('EPI MVP/Demo Request from ' + formData.name);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Company: ${formData.company}\n` +
      `Role: ${formData.role}\n\n` +
      `Message:\n${formData.message}`
    );
    
    // Open mailto link
    window.location.href = `mailto:mohdibrahimaiml@outlook.com?subject=${subject}&body=${body}`;
    
    // Show success message
    demoForm.style.display = 'none';
    demoSuccess.style.display = 'block';
    
    // Scroll to success message
    setTimeout(() => {
      demoSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });
}

// Animate elements on scroll with staggered delays (Intersection Observer)
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Add staggered delay for multiple elements in same section
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
      }, index * 80);
    }
  });
}, observerOptions);

// Observe all cards and sections with enhanced animations
const animatedElements = document.querySelectorAll(
  '.feature-card, .use-case-card, .pricing-card, .stat-card, .timeline-item, .india-card, .regulation-card, .advantage-card'
);

animatedElements.forEach((el, index) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(40px) scale(0.95)';
  el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  observer.observe(el);
});

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinksAll.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'var(--color-primary)';
    }
  });
});

// Animate hero file icon steps on load with enhanced effects
window.addEventListener('load', () => {
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateX(-30px)';
    step.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    
    setTimeout(() => {
      step.style.opacity = '1';
      step.style.transform = 'translateX(0)';
    }, 800 + (index * 200));
  });
  
  // Add number counter animations for stats
  const statsNumbers = document.querySelectorAll('.banner-stat-number');
  statsNumbers.forEach((stat, index) => {
    setTimeout(() => {
      stat.style.opacity = '1';
      stat.style.transform = 'scale(1)';
    }, 1200 + (index * 150));
  });
});

// Add copy-to-clipboard functionality for code snippets with enhanced feedback
const codeBlocks = document.querySelectorAll('.code-block pre, .code-snippet');

codeBlocks.forEach(block => {
  block.style.position = 'relative';
  block.style.cursor = 'pointer';
  block.title = 'Click to copy';
  
  block.addEventListener('click', () => {
    const code = block.textContent;
    
    // Copy to clipboard using temporary variable
    const tempCode = code;
    const textarea = document.createElement('textarea');
    textarea.value = tempCode;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      
      // Show enhanced feedback
      const originalTitle = block.title;
      block.title = '✓ Copied to clipboard!';
      block.style.transform = 'scale(0.98)';
      block.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      
      setTimeout(() => {
        block.title = originalTitle;
        block.style.transform = 'scale(1)';
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    
    document.body.removeChild(textarea);
  });
});

// Performance: Lazy load images if any are added later
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// File Explorer Toggle Functionality
window.toggleExplorer = function(header) {
  const item = header.parentElement;
  item.classList.toggle('collapsed');
};

// Initialize all explorer items as expanded by default
document.addEventListener('DOMContentLoaded', () => {
  const explorerItems = document.querySelectorAll('.explorer-item');
  // Start with all items expanded (no collapsed class)
  // Users can click to collapse if needed
});

// Add keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
  // ESC key closes mobile menu
  if (e.key === 'Escape' && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
  
  // Ctrl/Cmd + Shift + L toggles theme
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
    e.preventDefault();
    body.classList.toggle('light-mode');
  }
});

// Add ripple effect to buttons on click
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Add smooth transitions to all elements on theme change
body.style.transition = 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

// Add parallax effect to hero on scroll
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');
  
  if (heroContent && scrolled < 800) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroContent.style.opacity = `${1 - scrolled / 800}`;
  }
  
  if (heroVisual && scrolled < 800) {
    heroVisual.style.transform = `translateY(${scrolled * 0.15}px) scale(${1 - scrolled / 3000})`;
  }
});

// Add smooth scroll reveal for section titles
const sectionTitles = document.querySelectorAll('.section-title');
const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.5 });

sectionTitles.forEach(title => {
  title.style.opacity = '0';
  title.style.transform = 'translateY(20px)';
  title.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  titleObserver.observe(title);
});

// Animate regulations cards on scroll with enhanced stagger
const regulationCards = document.querySelectorAll('.regulation-card');
regulationCards.forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(50px) scale(0.95)';
  card.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`;
});

const regulationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0) scale(1)';
    }
  });
}, { threshold: 0.1 });

regulationCards.forEach(card => regulationObserver.observe(card));

// Animate competitive table rows on scroll
const tableRows = document.querySelectorAll('.comparison-table tbody tr');
const tableObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }, index * 60);
    }
  });
}, { threshold: 0.1 });

tableRows.forEach((row, index) => {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-30px)';
  row.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  tableObserver.observe(row);
});

// Animate advantage cards
const advantageCards = document.querySelectorAll('.advantage-card');
const advantageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
      }, index * 100);
    }
  });
}, { threshold: 0.1 });

advantagCards.forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(40px) scale(0.95)';
  card.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  advantageObserver.observe(card);
});

// Add hover effect highlighting for competitive table cells
const tableCells = document.querySelectorAll('.comparison-table td');
tableCells.forEach(cell => {
  cell.addEventListener('mouseenter', function() {
    if (this.classList.contains('capability-full') || 
        this.classList.contains('capability-partial') || 
        this.classList.contains('capability-none')) {
      this.style.transform = 'scale(1.3)';
      this.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  });
  
  cell.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});