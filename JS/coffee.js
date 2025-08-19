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
            const typeCheckboxes = document.querySelectorAll(".filter-section ul li input[type='checkbox']");

            // Get the "All" checkbox
            const allCheckbox = Array.from(typeCheckboxes).find(cb =>
                cb.parentElement.textContent.trim().toLowerCase() === "all"
            );

            // Create "No results" message element
            const noResultsMessage = document.createElement("div");
            noResultsMessage.id = "no-results";
            noResultsMessage.style.textAlign = "center";
            noResultsMessage.style.padding = "2rem";
            noResultsMessage.style.fontSize = "1.2rem";
            noResultsMessage.style.color = "#666";
            document.getElementById("menu-items").appendChild(noResultsMessage);

            // Filtering function
            function filterProducts() {
                const searchText = searchInput.value.toLowerCase();

                const selectedTypes = Array.from(typeCheckboxes)
                    .filter(cb => cb.checked && cb !== allCheckbox)
                    .map(cb => cb.parentElement.textContent.trim().toLowerCase());

                let anyVisible = false;

                productCards.forEach(card => {
                    const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
                    // const featuresText = Array.from(card.querySelectorAll(".product-description li"))
                    //     .map(li => li.textContent.toLowerCase())
                    //     .join(" ");
                    const category = (card.getAttribute("data-category") || "").trim().toLowerCase();

                    const matchesSearch = title.includes(searchText) || category.includes(searchText);
                    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(category);

                    if (matchesSearch && matchesType) {
                        card.style.display = "block";
                        anyVisible = true;
                    } else {
                        card.style.display = "none";
                    }
                });

                // Show or hide "No results"
                if (!anyVisible) {
                    noResultsMessage.innerHTML = `
                        <div style="font-size: 2rem; color: #555;">😕 Oops!</div>
                        <p>No results for "<strong>${searchInput.value}</strong>"</p>
                    `;
                } else {
                    noResultsMessage.innerHTML = "";
                }
            }

            // Search event
            searchInput.addEventListener("input", filterProducts);

            // All checkbox logic
            if (allCheckbox) {
                allCheckbox.addEventListener("change", () => {
                    if (allCheckbox.checked) {
                        typeCheckboxes.forEach(cb => {
                            if (cb !== allCheckbox) cb.checked = false;
                        });
                    }
                    filterProducts();
                });
            }

            // Type checkboxes logic
            typeCheckboxes.forEach(cb => {
                if (cb !== allCheckbox) {
                    cb.addEventListener("change", () => {
                        if (allCheckbox.checked) allCheckbox.checked = false;
                        filterProducts();
                    });
                }
            });
        });