 // Registration form handler
        function handleRegistration(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            
            // Get form values
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const email = formData.get('email');
            const selectedEvent = formData.get('eventSelect');
            
            // Update popup with user details
            document.getElementById('popupName').textContent = `${firstName} ${lastName}`;
            document.getElementById('popupEmail').textContent = email;
            
            // Get event name from select option
            const eventSelect = form.querySelector('select[name="eventSelect"]');
            const eventName = eventSelect.options[eventSelect.selectedIndex].text;
            document.getElementById('popupEvent').textContent = eventName;
            
            // Show popup
            showRegistrationPopup();
        }

        function showRegistrationPopup() {
            const popup = document.getElementById('registrationPopup');
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Add animation
            setTimeout(() => {
                popup.classList.add('show');
            }, 10);
        }

        function closeRegistrationPopup() {
            const popup = document.getElementById('registrationPopup');
            popup.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restore scrolling
            
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }

        function resetForm() {
            const form = document.querySelector('.form-grid');
            form.reset();
            closeRegistrationPopup();
        }

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

            // Close popup when clicking outside
            document.getElementById('registrationPopup').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeRegistrationPopup();
                }
            });
        });