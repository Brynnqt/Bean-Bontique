    // Popup functionality - show only once per session
      function showPopup() {
        const popup = document.getElementById("welcomePopup");
        const hasSeenPopup = sessionStorage.getItem("hasSeenWelcomePopup");

        if (!hasSeenPopup) {
          setTimeout(() => {
            popup.style.display = "block";
            popup.classList.add("popup-show");
          }, 2000); // Show after 2 seconds
        }
      }

      function closePopup() {
        const popup = document.getElementById("welcomePopup");
        popup.classList.add("popup-hide");
        setTimeout(() => {
          popup.style.display = "none";
          popup.classList.remove("popup-show", "popup-hide");
        }, 300);
        sessionStorage.setItem("hasSeenWelcomePopup", "true");
      }

      function handleSubscription(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;

        // Show success message
        const popup = document.getElementById("welcomePopup");
        popup.innerHTML = `
          <div class="success-message">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Welcome to Bean Boutique!</h2>
            <p>Thank you for subscribing! Your 10% discount code has been sent to <strong>${email}</strong></p>
            <button onclick="closePopup()" class="success-btn">Start Shopping</button>
          </div>
        `;
        // Automatically close after 4 seconds
        setTimeout(() => {
          closePopup();
        }, 4000);
      }

      // Burger Menu functionality
      function toggleBurgerMenu() {
        const burgerMenu = document.getElementById("burgerMenu");
        const navMenu = document.getElementById("navMenu");

        burgerMenu.classList.toggle("active");
        navMenu.classList.toggle("active");
      }

      // Initialize popup on page load
      document.addEventListener("DOMContentLoaded", function () {
        showPopup();

        // Attach close button click event
        const popupCloseBtn = document.getElementById("popupCloseBtn");
        if (popupCloseBtn) {
          popupCloseBtn.addEventListener("click", closePopup);
        }

        // Optionally, attach the subscription form handler here if it exists
        const subscriptionForm = document.getElementById("subscriptionForm");
        if (subscriptionForm) {
          subscriptionForm.addEventListener("submit", handleSubscription);
        }

        // Burger menu click event
        const burgerMenu = document.getElementById("burgerMenu");
        if (burgerMenu) {
          burgerMenu.addEventListener("click", toggleBurgerMenu);
        }

        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll(".nav-menu a");
        navLinks.forEach((link) => {
          link.addEventListener("click", () => {
            const burgerMenu = document.getElementById("burgerMenu");
            const navMenu = document.getElementById("navMenu");
            burgerMenu.classList.remove("active");
            navMenu.classList.remove("active");
          });
        });

        // Chatbot initialization
        initChatbot();
      });

      // Header scroll effect
      window.addEventListener("scroll", () => {
        const header = document.querySelector("header");
        if (window.scrollY > 100) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      });

      // Back to top functionality
      const backToTop = document.getElementById("backToTop");
      window.addEventListener("scroll", () => {
        backToTop.style.display = window.scrollY > 300 ? "block" : "none";
      });
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Simple Slideshow Functionality
      const dots = document.querySelectorAll(".nav-dot");
      const slides = document.querySelectorAll(".slide");

      let currentIndex = 0;

      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.toggle("active", i === index);
          dots[i].classList.toggle("active", i === index);
        });
        currentIndex = index;
      }

      // Arrow navigation function
      function changeSlide(direction) {
        clearInterval(slideInterval); // Stop auto sliding on manual control
        let nextIndex;
        if (direction === 1) {
          nextIndex = (currentIndex + 1) % slides.length;
        } else {
          nextIndex = (currentIndex - 1 + slides.length) % slides.length;
        }
        showSlide(nextIndex);
        // Restart auto sliding
        slideInterval = setInterval(() => {
          let autoNextIndex = (currentIndex + 1) % slides.length;
          showSlide(autoNextIndex);
        }, 5000);
      }

      // Auto slide every 5 seconds
      let slideInterval = setInterval(() => {
        let nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
      }, 3000);

      // Dot navigation click handlers
      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          clearInterval(slideInterval); // Stop auto sliding on manual control
          showSlide(i);
          slideInterval = setInterval(() => {
            let nextIndex = (currentIndex + 1) % slides.length;
            showSlide(nextIndex);
          }, 5000);
        });
      });

      // Chatbot logic
      function initChatbot() {
        const widget = document.getElementById('chatbotWidget');
        const toggleBtn = document.getElementById('chatbotToggle');
        const closeBtn = document.getElementById('chatbotClose');
        const form = document.getElementById('chatbotForm');
        const input = document.getElementById('chatbotInput');
        const messages = document.getElementById('chatbotMessages');

        if (!widget || !toggleBtn || !form || !input || !messages) return;

        const openWidget = () => {
          widget.classList.add('open');
          widget.setAttribute('aria-hidden', 'false');
          setTimeout(() => input.focus(), 0);
        };
        const closeWidget = () => {
          widget.classList.remove('open');
          widget.setAttribute('aria-hidden', 'true');
        };

        toggleBtn.addEventListener('click', () => {
          if (widget.classList.contains('open')) {
            closeWidget();
          } else {
            openWidget();
            if (!widget.dataset.greeted) {
              addBotMessage("Hi! သိချင်တာမေးနော်! How may I help you?");
              widget.dataset.greeted = '1';
            }
          }
        });

        if (closeBtn) {
          closeBtn.addEventListener('click', () => closeWidget());
        }

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const text = input.value.trim();
          if (!text) return;
          addUserMessage(text);
          input.value = '';
          setTimeout(() => handleBotResponse(text), 300);
        });

        function addMessage(text, who) {
          const el = document.createElement('div');
          el.className = `chatbot-message ${who}`;
          el.textContent = text;
          messages.appendChild(el);
          messages.scrollTop = messages.scrollHeight;
        }
        function addBotMessage(text) { addMessage(text, 'bot'); }
        function addUserMessage(text) { addMessage(text, 'user'); }

          function handleBotResponse(text) {
            const t = text.toLowerCase();
            // simple rules
            if (/(hour|open|close|time)/.test(t)) {
              addBotMessage('We are open Mon-Sun from 9AM to 10PM.');
              return;
            }
            if (/(offer|discount|deal|sale|special)/.test(t)) {
              addBotMessage('Check our Special Offers page for current deals. New subscribers get 10% off.');
              return;
            }
            if (/(event|workshop|class)/.test(t)) {
              addBotMessage('Browse upcoming events on the Events page. You can register online.');
              return;
            }
            if (/(address|where|location|direction)/.test(t)) {
              addBotMessage('Find us at 123 Kabaraye Road, Yangon, Myanmar. Use the Find Us section map for directions.');
              return;
            }
            if (/(coffee|bean|menu|product)/.test(t)) {
              addBotMessage('Explore our Coffee and Equipment pages for details and shopping links.');
              return;
            }
            if (/(hello|hi|hey)/.test(t)) {
              addBotMessage('Hello! How can I help today?');
              return;
            }
            addBotMessage("I'm not sure, but I can connect you with our pages: Home, Coffee, Equipment, Special Offers, and Events.");
          }
      }