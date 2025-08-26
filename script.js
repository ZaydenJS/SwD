// SwD - Sharpy's Web Designs - Main JavaScript File

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initNavigation();
  // initScrollAnimations(); // deferred to idle for lower TBT on mobile
  initScrollToTop();
  initContactForm();
  initPortfolioFilter();
  initSmoothScrolling();
  initCrossPageAnchors(); // Handle cross-page anchor navigation
  // Stagger setup can wait – improves initial SI on mobile
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initLoadingAnimations);
  } else {
    setTimeout(initLoadingAnimations, 0);
  }
  initFAQ();
  // Defer heavy observers until idle for faster SI
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      initScrollAnimations();
    });
  } else {
    setTimeout(() => {
      initScrollAnimations();
    }, 0);
  }

  // Remove initial fade-in setup on above-the-fold to avoid FOUC
  document
    .querySelectorAll(
      ".page-hero .fade-in, .hero .fade-in, .section .section-title.fade-in"
    )
    .forEach((el) => el.classList.add("visible"));
});

// Navigation functionality
function initNavigation() {
  const header = document.querySelector(".header");
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Header scroll effect (rAF-throttled, passive listener)
  let headerScrollScheduled = false;
  const onHeaderScroll = () => {
    if (headerScrollScheduled) return;
    headerScrollScheduled = true;
    requestAnimationFrame(() => {
      headerScrollScheduled = false;
      const scrolled = window.scrollY > 100;
      header.classList.toggle("scrolled", scrolled);
    });
  };
  window.addEventListener("scroll", onHeaderScroll, { passive: true });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      mobileToggle.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking on links
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      mobileToggle.classList.remove("active");
    });
  });

  // Active navigation highlighting via IntersectionObserver
  const navLinksById = {};
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) {
      navLinksById[href.slice(1)] = link;
    }
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          // Reset
          Object.values(navLinksById).forEach((l) =>
            l.classList.remove("active")
          );
          // Activate
          const link = navLinksById[id];
          if (link) link.classList.add("active");
        }
      });
    },
    { threshold: 0.6, rootMargin: "-10% 0px -30% 0px" }
  );

  document
    .querySelectorAll("section[id]")
    .forEach((sec) => sectionObserver.observe(sec));
}

// Scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });
}

// Contact form functionality - Complete automatic email system
function initContactForm() {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Basic validation
      if (!validateForm(data)) {
        return;
      }

      // Show loading state
      const submitBtn = contactForm.querySelector(".btn-primary");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      // Try multiple email sending methods
      sendEmailWithFallbacks(data, submitBtn, originalText, contactForm);
    });
  }
}

// Advanced email sending with multiple fallback methods
function sendEmailWithFallbacks(data, submitBtn, originalText, contactForm) {
  // Method 1: Try EmailJS (if configured)
  if (typeof emailjs !== "undefined" && window.emailjsConfigured) {
    sendViaEmailJS(data, submitBtn, originalText, contactForm);
    return;
  }

  // Method 2: Try Web3Forms (free service)
  sendViaWeb3Forms(data, submitBtn, originalText, contactForm);
}

// EmailJS sending method
function sendViaEmailJS(data, submitBtn, originalText, contactForm) {
  const emailParams = {
    from_name: data.name,
    from_email: data.email,
    phone: data.phone || "Not provided",
    company: data.company || "Not provided",
    service: data.service || "Not specified",
    budget: data.budget || "Not specified",
    timeline: data.timeline || "Not specified",
    message: data.message,
    to_email: "sharpyswebdesigns@gmail.com",
  };

  emailjs
    .send(window.emailjsServiceId, window.emailjsTemplateId, emailParams)
    .then(function (response) {
      console.log("EmailJS SUCCESS!", response.status, response.text);
      showNotification(
        "Message sent successfully! We'll get back to you within 24 hours.",
        "success"
      );
      contactForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    })
    .catch(function (error) {
      console.log("EmailJS failed, trying Web3Forms...", error);
      sendViaWeb3Forms(data, submitBtn, originalText, contactForm);
    });
}

// Web3Forms sending method (free alternative)
function sendViaWeb3Forms(data, submitBtn, originalText, contactForm) {
  const formData = new FormData();
  formData.append("access_key", "878d4eaa-00fd-4523-b3cd-4f60a8caeba8");
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("phone", data.phone || "Not provided");
  formData.append("company", data.company || "Not provided");
  formData.append("service", data.service || "Not specified");
  formData.append("budget", data.budget || "Not specified");
  formData.append("timeline", data.timeline || "Not specified");
  formData.append("message", data.message);
  formData.append("subject", `New Contact Form Submission from ${data.name}`);

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        console.log("Web3Forms SUCCESS!", result);

        // Send auto-reply email to user
        sendAutoReplyEmail(data);

        // Show success message instead of redirecting
        showSuccessMessage(data, contactForm);
      } else {
        throw new Error("Web3Forms failed");
      }
    })
    .catch((error) => {
      console.log("Web3Forms failed, using mailto fallback...", error);
      // Final fallback to mailto
      const mailtoLink = createMailtoLink(data);
      showNotification(
        "Opening your email client to send the message...",
        "info"
      );
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 1000);
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

// Create mailto link as fallback
function createMailtoLink(data) {
  const subject = encodeURIComponent(
    `New Contact Form Submission from ${data.name}`
  );
  const body = encodeURIComponent(
    `
Hello,

You have received a new message from your website contact form:

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Company: ${data.company || "Not provided"}
Service Interested In: ${data.service || "Not specified"}
Project Budget: ${data.budget || "Not specified"}
Project Timeline: ${data.timeline || "Not specified"}

Message:
${data.message}

---
This message was sent from your website contact form.
Please reply to ${data.email} to respond to ${data.name}.
  `.trim()
  );

  return `mailto:sharpyswebdesigns@gmail.com?subject=${subject}&body=${body}`;
}

// Send auto-reply email to user
function sendAutoReplyEmail(data) {
  const autoReplyFormData = new FormData();
  autoReplyFormData.append(
    "access_key",
    "878d4eaa-00fd-4523-b3cd-4f60a8caeba8"
  );
  autoReplyFormData.append("name", "SwD - Sharpy's Web Designs");
  autoReplyFormData.append("email", "sharpyswebdesigns@gmail.com");
  autoReplyFormData.append(
    "subject",
    `Thank you for contacting SwD, ${data.name}!`
  );

  // Create Google Form URL with prefilled data
  const googleFormURL = createGoogleFormURL(data);

  const autoReplyMessage = `Hi ${data.name},

Thank you for reaching out to SwD - Sharpy's Web Designs! We're excited to help bring your vision to life.

We've received your message and will get back to you within 24 hours with a personalized proposal.

NEXT STEPS - Choose what works best for you:

🚀 COMPLETE DETAILED PROJECT BRIEF (10-15 minutes)
For serious projects only - get accurate quote by completing our detailed brief:
${googleFormURL}

📅 SCHEDULE FREE ZOOM CALL (30 minutes)
Book a Zoom call with our team to discuss your project:
https://calendly.com/sharpyswebdesigns/30min

📞 CALL OR MESSAGE OUR PHONE
Speak directly with our team: 0459 437 764
Available Mon-Fri, 9AM-6PM AEST

YOUR SUBMISSION DETAILS:
• Service: ${data.service || "Not specified"}
• Budget: ${data.budget || "Not specified"}
• Timeline: ${data.timeline || "Not specified"}
• Message: ${data.message}

We'll review your requirements and prepare a customized proposal that aligns with your goals and budget.

Looking forward to working with you!

Best regards,
The SwD Team
📧 sharpyswebdesigns@gmail.com
📞 0459 437 764
🌐 swd.design

---
This is an automated response. Please don't reply to this email - we'll contact you directly within 24 hours.`;

  // Set recipient as the user who submitted the form
  autoReplyFormData.append("_to", data.email);
  autoReplyFormData.append("message", autoReplyMessage);

  // Send auto-reply
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: autoReplyFormData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        console.log("Auto-reply sent successfully!");
      } else {
        console.log("Auto-reply failed:", result);
      }
    })
    .catch((error) => {
      console.log("Auto-reply error:", error);
    });
}

// Create Google Form URL with prefilled data
function createGoogleFormURL(data) {
  // Google Form URL (updated)
  const baseFormURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSd9BYhd4VooMs1CreiSEqs2RClK5gyT6ZLV_Kwky38kKqZw0Q/viewform?usp=dialog";

  let formURL = baseFormURL;

  // Add prefilled parameters (replace with your actual field IDs from Google Form)
  if (data.name)
    formURL += `&entry.NAME_FIELD=${encodeURIComponent(data.name)}`;
  if (data.email)
    formURL += `&entry.EMAIL_FIELD=${encodeURIComponent(data.email)}`;
  if (data.phone)
    formURL += `&entry.PHONE_FIELD=${encodeURIComponent(data.phone)}`;
  if (data.company)
    formURL += `&entry.COMPANY_FIELD=${encodeURIComponent(data.company)}`;
  if (data.service)
    formURL += `&entry.SERVICE_FIELD=${encodeURIComponent(data.service)}`;
  if (data.budget)
    formURL += `&entry.BUDGET_FIELD=${encodeURIComponent(data.budget)}`;
  if (data.timeline)
    formURL += `&entry.TIMELINE_FIELD=${encodeURIComponent(data.timeline)}`;
  if (data.message)
    formURL += `&entry.MESSAGE_FIELD=${encodeURIComponent(data.message)}`;

  return formURL;
}

// Show success message inline instead of redirecting
function showSuccessMessage(data, contactForm) {
  // Create prefilled Google Form URL
  const googleFormURL = createGoogleFormURL(data);

  // Create success message HTML
  const successHTML = `
    <div class="form-success-message" style="
      background: linear-gradient(145deg, rgba(59, 240, 228, 0.1) 0%, rgba(26, 26, 26, 0.9) 100%);
      border: 1px solid rgba(59, 240, 228, 0.3);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      text-align: center;
      margin-top: 2rem;
      backdrop-filter: blur(10px);
      animation: successFadeIn 0.8s ease-out;
    ">
      <div style="font-size: 3rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 20px rgba(59, 240, 228, 0.6));">🚀</div>
      <h3 style="color: var(--text-primary); font-size: 1.8rem; font-weight: 700; margin-bottom: 1rem;">
        Message Sent Successfully!
      </h3>
      <p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem;">
        Thanks ${
          data.name ? data.name : ""
        }! We've received your message and will respond within 24 hours.
      </p>

      <div style="background: rgba(59, 240, 228, 0.05); border: 1px solid rgba(59, 240, 228, 0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h4 style="color: var(--accent-cyan); font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">
          🎯 Choose How You'd Like To Continue:
        </h4>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="${googleFormURL}" target="_blank"
             class="btn btn-primary" style="min-width: 220px; position: relative;">
            📋 Complete Detailed Project Brief
            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.2rem;">For serious projects only • 10-15 minutes</div>
          </a>
          <a href="https://calendly.com/sharpyswebdesigns/30min" target="_blank"
             class="btn btn-outline" style="min-width: 220px;">
            📅 Schedule Free Zoom Call
            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.2rem;">30 minutes with our team</div>
          </a>
          <a href="tel:0459437764" class="btn btn-secondary" style="min-width: 220px;">
            📞 Call or Message Our Phone
            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.2rem;">0459 437 764 - Available now</div>
          </a>
        </div>
      </div>

      <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; color: var(--text-secondary); font-size: 0.9rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.1rem;">📧</span>
          <span>sharpyswebdesigns@gmail.com</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.1rem;">⏰</span>
          <span>Mon-Fri, 9AM-6PM AEST</span>
        </div>
      </div>
    </div>
  `;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes successFadeIn {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Hide the form and show success message
  contactForm.style.display = "none";
  contactForm.insertAdjacentHTML("afterend", successHTML);

  // Scroll to success message
  setTimeout(() => {
    const successMessage = document.querySelector(".form-success-message");
    if (successMessage) {
      successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
}

// Form validation
function validateForm(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long");
  }

  if (errors.length > 0) {
    showNotification(errors.join("<br>"), "error");
    return false;
  }

  return true;
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Portfolio filter functionality
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll(".portfolio-filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter portfolio items
      portfolioItems.forEach((item) => {
        if (filter === "all" || item.classList.contains(filter)) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 100);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.8)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

// Handle cross-page anchor navigation (e.g., services.html#web-design)
function initCrossPageAnchors() {
  // Check if there's a hash in the URL when the page loads
  if (window.location.hash) {
    // Wait a bit for the page to fully load
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const isMobile = window.innerWidth <= 768;

        // Use different offsets for mobile vs desktop
        const extraOffset = isMobile ? 30 : 20;
        const targetPosition = target.offsetTop - headerHeight - extraOffset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  }
}

// Loading animations
function initLoadingAnimations() {
  // Add staggered animation delays to grid items
  const gridItems = document.querySelectorAll(
    ".grid .card, .grid .portfolio-item"
  );
  gridItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10B981"
            : type === "error"
            ? "#EF4444"
            : "#3B82F6"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

  document.body.appendChild(notification);

  // Animate in using rAF to avoid forced reflow during paint
  setTimeout(() => {
    requestAnimationFrame(() => {
      notification.style.transform = "translateX(0)";
    });
  }, 100);

  // Close functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    requestAnimationFrame(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => notification.remove(), 300);
    });
  });

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      requestAnimationFrame(() => {
        notification.style.transform = "translateX(400px)";
        setTimeout(() => notification.remove(), 300);
      });
    }
  }, 5000);
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Scroll to Top Button
function initScrollToTop() {
  // Create scroll to top button
  const scrollToTopBtn = document.createElement("button");
  scrollToTopBtn.className = "scroll-to-top";
  scrollToTopBtn.setAttribute("aria-label", "Scroll to top");
  scrollToTopBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L12 20M12 4L18 10M12 4L6 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  document.body.appendChild(scrollToTopBtn);

  // Show/hide button based on scroll position
  const toggleScrollButton = () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }
  };

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Event listeners
  window.addEventListener("scroll", debounce(toggleScrollButton, 100), {
    passive: true,
  });
  scrollToTopBtn.addEventListener("click", scrollToTop);

  // Initial check
  toggleScrollButton();
}

// Performance optimization - Enhanced scroll handling
const debouncedScroll = debounce(() => {
  // Handle scroll events here if needed
}, 16); // 60fps = 16ms

// Use passive listeners for better performance
window.addEventListener("scroll", debouncedScroll, { passive: true });

// Performance: Optimize animations with requestAnimationFrame
function optimizedAnimate(callback) {
  let ticking = false;
  return function () {
    if (!ticking) {
      requestAnimationFrame(callback);
      ticking = true;
      setTimeout(() => {
        ticking = false;
      }, 16);
    }
  };
}

// Preload critical images
function preloadImages() {
  const imageUrls = [
    // Add critical image URLs here
  ];

  // Portfolio page specific preloading
  if (window.location.pathname.includes("portfolio")) {
    const portfolioImages = [
      "Recent%20Project%20Photos/cockyspainting.png",
      "Recent%20Project%20Photos/qira.png",
      "Recent%20Project%20Photos/MRZO.png",
      "Recent%20Project%20Photos/alltimeplumbing.png",
      "Recent%20Project%20Photos/petalhairdesigns.png",
      "Recent%20Project%20Photos/7elementshair.png",
    ];
    imageUrls.push(...portfolioImages);
  }

  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

// Initialize preloading
preloadImages();

// Lazy loading for images - Performance optimized
function initLazyLoading() {
  const images = document.querySelectorAll("img[data-src]");

  // Special handling for portfolio images - load them faster
  const isPortfolioPage = window.location.pathname.includes("portfolio");
  const rootMargin = isPortfolioPage ? "200px 0px" : "50px 0px";

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    },
    {
      // Performance: optimize intersection observer
      rootMargin: rootMargin,
      threshold: 0.1,
    }
  );

  images.forEach((img) => imageObserver.observe(img));
}

// Performance monitoring
function initPerformanceMonitoring() {
  // Monitor Core Web Vitals
  if ("web-vital" in window) {
    // This would integrate with web-vitals library if included
    console.log("Performance monitoring initialized");
  }

  // Monitor page load time
  window.addEventListener("load", () => {
    const loadTime =
      performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);

    // Send to analytics if needed
    if (loadTime > 3000) {
      console.warn("Page load time is slow:", loadTime);
    }
  });
}

// Service Worker (prod only). In dev/preview, unregister any existing SW to avoid cross-project caching issues.
function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const host = location.hostname;
  const isProd = host === "goswd.com" || host === "www.goswd.com";

  if (!isProd) {
    // Kill any existing service workers and caches on localhost/preview origins
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
    console.log(
      "Service worker disabled in dev/preview; unregistered stale workers."
    );
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// FAQ functionality
function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (faqItems.length === 0) {
    console.log("No FAQ items found on this page");
    return;
  }

  console.log(`Initializing FAQ functionality for ${faqItems.length} items`);

  faqItems.forEach((item, index) => {
    const question = item.querySelector(".faq-question");
    const toggle = item.querySelector(".faq-toggle");

    if (!question) {
      console.warn(`FAQ item ${index} missing .faq-question element`);
      return;
    }

    if (!toggle) {
      console.warn(`FAQ item ${index} missing .faq-toggle element`);
      return;
    }

    // Add click handler to the question container
    question.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log(`FAQ item ${index} clicked`);

      // Close all other FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle current item
      item.classList.toggle("active");

      // Log the new state
      console.log(
        `FAQ item ${index} is now ${
          item.classList.contains("active") ? "open" : "closed"
        }`
      );
    });

    // Also add click handler directly to the toggle button
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Trigger the same behavior as clicking the question
      question.click();
    });
  });
}

// Initialize performance features
document.addEventListener("DOMContentLoaded", () => {
  initLazyLoading();
  initPerformanceMonitoring();
  initServiceWorker();
});

// Calendly integration with performance optimizations
function openCalendly() {
  // SwD - Sharpy's Web Designs Calendly booking link with performance parameters
  const calendlyUrl =
    "https://calendly.com/sharpyswebdesigns/30min?hide_landing_page_details=1&hide_gdpr_banner=1";

  // Preload the Calendly page for faster loading
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = calendlyUrl;
  document.head.appendChild(link);

  // Open Calendly in a new window/tab with optimized settings
  const newWindow = window.open(
    calendlyUrl,
    "_blank",
    "width=900,height=750,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=no"
  );

  // Focus the new window for better UX
  if (newWindow) {
    newWindow.focus();
  }
}

// Preload Calendly resources when page loads for even faster booking
document.addEventListener("DOMContentLoaded", function () {
  // Preload Calendly domain for DNS resolution
  const dnsLink = document.createElement("link");
  dnsLink.rel = "dns-prefetch";
  dnsLink.href = "//calendly.com";
  document.head.appendChild(dnsLink);

  // Preconnect to Calendly for faster connection
  const preconnectLink = document.createElement("link");
  preconnectLink.rel = "preconnect";
  preconnectLink.href = "https://calendly.com";
  preconnectLink.crossOrigin = "anonymous";
  document.head.appendChild(preconnectLink);

  // Initialize secure email functionality
  initSecureEmail();
});

// Secure Email Contact System with Bot Protection
function initSecureEmail() {
  // Obfuscated email parts (bot protection)
  const emailParts = {
    user: atob("c2hhcnB5c3dlYmRlc2lnbnM="), // base64 encoded
    domain: atob("Z21haWwuY29t"), // base64 encoded
    separator: String.fromCharCode(64), // @ symbol
  };

  // Professional email template
  const emailTemplate = {
    subject: encodeURIComponent("Web Design Inquiry from SwD Website"),
    body: encodeURIComponent(`Hello SwD - Sharpy's Web Designs Team,

I'm interested in learning more about your web design services. I found your website and would like to discuss:

□ Custom Web Design
□ UI/UX Design
□ SEO Optimization
□ Backend Integration
□ Other: _______________

Project Details:
- Business/Industry:
- Timeline:
- Budget Range:
- Specific Requirements:

I would appreciate the opportunity to discuss my project with you.

Best regards,
[Your Name]
[Your Company]
[Your Phone Number]

---
This email was sent from: ${window.location.href}`),
  };

  // Find and replace all email elements
  const emailElements = document.querySelectorAll('[data-email="contact"]');
  emailElements.forEach((element) => {
    // Check if it's an email card or just text
    if (element.classList.contains("email-method")) {
      // Email card styling (like booking card)
      element.style.cursor = "pointer";
      element.style.transition = "all 0.3s ease";

      // Add hover effects for email card
      element.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 8px 25px rgba(59, 240, 228, 0.3)";
        this.style.borderColor = "var(--accent-cyan)";
      });

      element.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
        this.style.borderColor = "var(--border-color)";
      });
    } else {
      // Regular email text styling
      element.style.cursor = "pointer";
      element.style.textDecoration = "underline";
      element.style.color = "var(--accent-cyan)";
      element.style.transition = "all 0.3s ease";

      // Add hover effects for email text
      element.addEventListener("mouseenter", function () {
        this.style.color = "var(--accent-blue)";
        this.style.textShadow = "0 0 10px rgba(59, 240, 228, 0.5)";
      });

      element.addEventListener("mouseleave", function () {
        this.style.color = "var(--accent-cyan)";
        this.style.textShadow = "none";
      });
    }

    // Add click handler for all email elements
    element.addEventListener("click", function (e) {
      e.preventDefault();
      openSecureEmail(emailParts, emailTemplate);
    });
  });
}

// Secure email opening function
function openSecureEmail(emailParts, template) {
  // Construct email with additional obfuscation
  const email = emailParts.user + emailParts.separator + emailParts.domain;

  // Create mailto URL with professional template
  const mailtoUrl = `mailto:${email}?subject=${template.subject}&body=${template.body}`;

  // Add user interaction verification (bot protection)
  if (document.hasFocus() && Date.now() - window.lastUserInteraction < 5000) {
    // Open email client
    window.location.href = mailtoUrl;

    // Optional: Show confirmation message
    showEmailConfirmation();
  } else {
    // Fallback for potential bot detection
    console.log("User interaction required");
  }
}

// Track user interactions for bot protection
window.lastUserInteraction = Date.now();
document.addEventListener("mousemove", () => {
  window.lastUserInteraction = Date.now();
});
document.addEventListener("keydown", () => {
  window.lastUserInteraction = Date.now();
});
document.addEventListener("click", () => {
  window.lastUserInteraction = Date.now();
});

// Email confirmation notification
function showEmailConfirmation() {
  // Create temporary notification
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
    color: var(--bg-ultra-dark);
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(59, 240, 228, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = "📧 Opening your email client...";

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
