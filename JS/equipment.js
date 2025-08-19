 // Burger Menu functionality
      function toggleBurgerMenu() {
        const burgerMenu = document.getElementById("burgerMenu");
        const navMenu = document.getElementById("navMenu");
        
        burgerMenu.classList.toggle("active");
        navMenu.classList.toggle("active");
      }

      document.addEventListener("DOMContentLoaded", function () {
        // Burger menu click event
        const burgerMenu = document.getElementById("burgerMenu");
        if (burgerMenu) {
          burgerMenu.addEventListener("click", toggleBurgerMenu);
        }

        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll(".nav-menu a");
        navLinks.forEach(link => {
          link.addEventListener("click", () => {
            const burgerMenu = document.getElementById("burgerMenu");
            const navMenu = document.getElementById("navMenu");
            burgerMenu.classList.remove("active");
            navMenu.classList.remove("active");
          });
        });

        // Existing search and filter functionality
        const searchInput = document.getElementById("search-input");
        const productCards = document.querySelectorAll(".product-card");
        const filterSections = document.querySelectorAll(".filter-sidebar .filter-section");
        const typeSection = filterSections[0];
        const priceSection = filterSections[1];
        const typeCheckboxes = typeSection ? typeSection.querySelectorAll("ul li input[type='checkbox']") : [];
        const priceCheckboxes = priceSection ? priceSection.querySelectorAll("ul li input[type='checkbox']") : [];
        const productContainer = document.getElementById("product-items");

        // Create "No results" message
        const noResultsMessage = document.createElement("div");
        noResultsMessage.id = "no-results";
        noResultsMessage.style.textAlign = "center";
        noResultsMessage.style.padding = "2rem";
        noResultsMessage.style.fontSize = "1.2rem";
        noResultsMessage.style.color = "#666";
        productContainer.appendChild(noResultsMessage);

        function filterProducts() {
          const searchText = searchInput.value.toLowerCase();

          // Get selected filter categories (Type)
          const selectedTypes = Array.from(typeCheckboxes)
            .filter(
              (cb) =>
                cb.checked &&
                cb.parentElement.textContent.trim().toLowerCase() !== "all"
            )
            .map((cb) => cb.parentElement.textContent.trim().toLowerCase());

          // Get selected price ranges
          const selectedPriceRanges = Array.from(priceCheckboxes || [])
            .filter((cb) => cb.checked)
            .map((cb) => {
              const label = cb.parentElement.textContent.trim().toLowerCase();
              if (label.includes("under")) return { min: 0, max: 100 };
              if (label.includes("$100") && label.includes("$200")) return { min: 100, max: 200 };
              if (label.includes("$200") && label.includes("$500")) return { min: 200, max: 500 };
              if (label.includes("$500")) return { min: 500, max: Infinity };
              return null;
            })
            .filter(Boolean);

          let anyVisible = false;

          productCards.forEach((card) => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            const desc = card
              .querySelector(".product-description")
              .textContent.toLowerCase();
            const category = card
              .getAttribute("data-category")
              .toLowerCase()
              .trim();

            // Extract numeric price from the price element
            const priceText = card.querySelector(".price")?.textContent || "";
            const numericPrice = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

            const matchesSearch =
              title.includes(searchText) || desc.includes(searchText);
            const matchesType =
              selectedTypes.length === 0 || selectedTypes.includes(category);
            const matchesPrice =
              selectedPriceRanges.length === 0 ||
              selectedPriceRanges.some((r) => numericPrice >= r.min && (r.max === Infinity ? true : numericPrice <= r.max));

            if (matchesSearch && matchesType && matchesPrice) {
              card.style.display = "block";
              anyVisible = true;
            } else {
              card.style.display = "none";
            }
          });

          // Show/hide "No results" message
          noResultsMessage.innerHTML = !anyVisible
            ? `<div style="font-size: 2rem; color: #555;">😕 Oops!</div>
               <p>No results for "<strong>${searchInput.value}</strong>"</p>`
            : "";
        }

        // Search input
        searchInput.addEventListener("input", filterProducts);

        // Type filter checkboxes
        typeCheckboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            // Uncheck all other checkboxes if "All" is selected
            const label = checkbox.parentElement.textContent
              .trim()
              .toLowerCase();
            if (label === "all") {
              typeCheckboxes.forEach((cb) => {
                if (cb !== checkbox) cb.checked = false;
              });
            } else {
              // Uncheck "All" if any specific checkbox is selected
              typeCheckboxes.forEach((cb) => {
                if (
                  cb.parentElement.textContent.trim().toLowerCase() === "all"
                ) {
                  cb.checked = false;
                }
              });
            }
            filterProducts();
          });
        });

        // Price range filter checkboxes
        if (priceCheckboxes && priceCheckboxes.forEach) {
          priceCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", filterProducts);
          });
        }

        // Initial filter on load
        filterProducts();


        // Quick View setup
        const qvOverlay = document.getElementById('qvOverlay');
        const qvTitle = document.getElementById('qvTitle');
        const qvDesc = document.getElementById('qvDesc');
        const qvClose = document.getElementById('qvClose');

        function openQuickView(card) {
          if (!qvOverlay || !card) return;
          const title = card.querySelector('h3')?.textContent?.trim() || 'Product';
          const desc = card.querySelector('.product-description')?.textContent?.trim() || 'No description available.';
          qvTitle.textContent = title;
          qvDesc.textContent = desc;
          qvOverlay.classList.add('show');
          qvOverlay.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }

        function closeQuickView() {
          if (!qvOverlay) return;
          qvOverlay.classList.remove('show');
          qvOverlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }

        // Bind click handlers for quick view buttons
        document.querySelectorAll('.product-card .quick-view-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.product-card');
            openQuickView(card);
          });
        });

        // Close handlers
        if (qvClose) {
          qvClose.addEventListener('click', closeQuickView);
        }
        if (qvOverlay) {
          qvOverlay.addEventListener('click', (e) => {
            if (e.target === qvOverlay) closeQuickView();
          });
        }
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && qvOverlay && qvOverlay.classList.contains('show')) {
            closeQuickView();
          }
        });
      });