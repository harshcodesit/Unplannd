 const sidebarLinks = document.querySelectorAll('.sidebar ul li');

        const sidebar = document.getElementById('sidebar');

        const hamburger = document.getElementById('hamburger-menu');

        const mainContent = document.getElementById('main-content');



        // Function to set the active tab

        function setActiveTab(clickedItem) {

            sidebarLinks.forEach(item => {

                item.classList.remove('active');

            });

            clickedItem.classList.add('active');

        }



        // Handle active tab state on click

        sidebarLinks.forEach(link => {

            link.addEventListener('click', function(event) {

                event.preventDefault();

                setActiveTab(this);

                // On small screens, close sidebar after clicking a link

                if (window.innerWidth <= 768) {

                    sidebar.classList.add('hidden');

                    sidebar.classList.remove('show');

                    hamburger.classList.remove('shifted');

                    mainContent.classList.remove('shifted');

                }

            });

        });



        // Toggle sidebar visibility on hamburger click

        hamburger.addEventListener('click', () => {

            sidebar.classList.toggle('hidden');

            sidebar.classList.toggle('show');

            hamburger.classList.toggle('shifted');

            mainContent.classList.toggle('shifted');

        });



        // Set initial active tab (e.g., "Hub" as default)

        document.addEventListener('DOMContentLoaded', () => {

            const initialActiveLink = document.querySelector('#hub-tab').closest('li');

            if (initialActiveLink) {

                setActiveTab(initialActiveLink);

            }



            // Adjust sidebar visibility on initial load based on screen size

            if (window.innerWidth > 768) {

                sidebar.classList.remove('hidden');

                mainContent.classList.remove('shifted');

            } else {

                sidebar.classList.add('hidden');

                mainContent.classList.remove('shifted'); // Ensure no margin on initial small screen load

            }

        });



        // Adjust sidebar visibility on window resize

        window.addEventListener('resize', () => {

            if (window.innerWidth > 768) {

                sidebar.classList.remove('hidden');

                sidebar.classList.remove('show'); // Remove 'show' class if it was applied for mobile

                hamburger.classList.remove('shifted');

                mainContent.classList.remove('shifted');

            } else {

                sidebar.classList.add('hidden');

                sidebar.classList.remove('show');

                hamburger.classList.remove('shifted');

                mainContent.classList.remove('shifted');

            }

        });
