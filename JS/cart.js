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
    });