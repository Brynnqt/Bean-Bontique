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

    // Set the target date and time for the countdown (e.g., 15 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7 ); // Adjust as needed

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.querySelector('.offers-countdown').innerHTML = '<p>Offer expired!</p>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = String(days).padStart(2, '0');
        document.getElementById("hours").textContent = String(hours).padStart(2, '0');
        document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
        document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
    }

    // Update countdown every second
    updateCountdown(); // Initial call
    setInterval(updateCountdown, 1000);