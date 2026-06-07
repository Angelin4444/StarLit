/*=============== LOADER ===============*/
/* Page loader that displays an animated book while content loads */

// Wait for entire page to load (images, scripts, etc.)
window.addEventListener('load', () => {
    const loader = document.getElementById('loader')
    // Hide loader after 1.5 seconds minimum (ensures smooth experience)
    setTimeout(() => {
        loader.classList.add('loader--hide')
    }, 1500)
})

/* Function to manually trigger loader animation */
const triggerLoader = () => {
    const loader = document.getElementById('loader')
    loader.classList.remove('loader--hide') // Show loader
    setTimeout(() => {
        loader.classList.add('loader--hide') // Hide after delay
    }, 1500)
}

/* Add loader trigger to home navigation link for visual feedback */
const homeLink = document.querySelector('.nav__link[href="#home"]')
if(homeLink){
    homeLink.addEventListener('click', (e) => {
        triggerLoader() // Show loading animation on home click
    })
}

/*=============== SEARCH OVERLAY ===============*/
/* Search functionality with Google Books API integration */

// Get search-related DOM elements
const searchButton= document.getElementById('search-button'),  // Opens search overlay
      searchClose = document.getElementById('search-close'),     // Closes search overlay
      searchContent = document.getElementById('search-content'), // Search overlay container
      searchForm = document.getElementById('search-form'),       // Search form element
      searchInput = document.getElementById('search-input'),     // Search text input
      searchResults = document.getElementById('search-results')  // Container for search results

/*===== SHOW SEARCH =====*/
/* Open search overlay when search button is clicked */
if(searchButton){
    searchButton.addEventListener('click', () =>{
        searchContent.classList.add('show-search') // Add class to display overlay
    })
}

/*===== HIDE SEARCH =====*/
/* Close search overlay and reset search state */
if(searchClose){
    searchClose.addEventListener('click', () =>{
       searchContent.classList.remove('show-search') // Remove display class
       searchResults.innerHTML = '' // Clear previous search results
       searchForm.reset() // Clear search input field
    })
}

/*=============== BOOK DETAILS OVERLAY ===============*/
/* Modal for displaying detailed book information */

// Get book details modal elements
const bookDetailsContent = document.getElementById('book-details-content'), // Modal container
      detailsClose = document.getElementById('details-close'),             // Close button
      detailTitle = document.getElementById('detail-title'),               // Book title display
      detailImg = document.getElementById('detail-img'),                   // Book cover image
      detailDescription = document.getElementById('detail-description'),   // Book description
      detailAuthor = document.getElementById('detail-author'),             // Author info
      detailPages = document.getElementById('detail-pages'),               // Page count
      detailAddCart = document.getElementById('detail-add-cart')           // Add to cart button

/*===== HIDE DETAILS =====*/
/* Close book details modal */
if(detailsClose){
    detailsClose.addEventListener('click', () => {
        bookDetailsContent.classList.remove('show-login') // Remove display class
    })
}

/*=============== SEARCH API LOGIC (Google Books) ===============*/
/* Fetch and display books from Google Books API based on search query */

const searchBooks = async (query) => {
    // Show loading message while fetching data
    searchResults.innerHTML = '<p class="search__message">Searching...</p>'
    
    try {
        // Fetch book data from Google Books API
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=15`)
        const data = await response.json()
        
        searchResults.innerHTML = '' // Clear loading message

        if (data.items) {
            // Loop through each book and create result card
            data.items.forEach(book => {
                const info = book.volumeInfo
                const title = info.title
                const authors = info.authors ? info.authors.join(', ') : 'Unknown Author'
                const thumbnail = info.imageLinks ? info.imageLinks.thumbnail : 'assets/img/book-1.jpg' // Fallback image
                const link = info.infoLink
                const description = info.description ? info.description : 'No description available for this book.'
                const pageCount = info.pageCount ? info.pageCount : 'N/A'

                // Create search result card element
                const searchCard = document.createElement('article')
                searchCard.classList.add('search__card')
                searchCard.innerHTML = `
                    <i class="ri-heart-3-line search__wishlist"></i>
                    <img src="${thumbnail}" alt="image" class="search__img">
                    <h3 class="search__title-book">${title}</h3>
                    <span class="search__author">${authors}</span>
                    <div class="search__buttons">
                        <button class="button search__button view-details" 
                            data-title="${title}" 
                            data-author="${authors}" 
                            data-img="${thumbnail}" 
                            data-desc='${description.replace(/'/g, "&apos;")}' 
                            data-pages="${pageCount}">View Details</button>
                        <button class="button search__button add-from-search" 
                            data-title="${title}" 
                            data-price="50" 
                            data-img="${thumbnail}">Add to Cart</button>
                    </div>
                `
                searchResults.appendChild(searchCard) // Add card to results container
            })

            // Attach event listeners to "View Details" buttons
            const viewDetailsBtns = document.querySelectorAll('.view-details')
            viewDetailsBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Populate modal with book details
                    detailTitle.innerText = btn.getAttribute('data-title')
                    detailAuthor.innerText = 'Author: ' + btn.getAttribute('data-author')
                    detailImg.src = btn.getAttribute('data-img')
                    detailDescription.innerText = btn.getAttribute('data-desc')
                    detailPages.innerText = 'Pages: ' + btn.getAttribute('data-pages')
                    
                    // Set up "Add to Cart" functionality in details modal
                    detailAddCart.onclick = () => {
                        const title = btn.getAttribute('data-title')
                        const img = btn.getAttribute('data-img')
                        const existingItemIndex = cart.findIndex(item => item.title === title)
                        if(existingItemIndex > -1){
                            cart[existingItemIndex].amount++ // Increase quantity if already in cart
                        } else {
                            cart.push({ title, price: 50, img, amount: 1 }) // Add new item
                        }
                        updateCart() // Refresh cart display
                        bookDetailsContent.classList.remove('show-login') // Close details modal
                        cartContent.classList.add('show-cart') // Show cart
                    }

                    bookDetailsContent.classList.add('show-login') // Show details modal
                })
            })

            // Attach event listeners to "Add to Cart" buttons in search results
            const addFromSearchBtns = document.querySelectorAll('.add-from-search')
            addFromSearchBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const title = btn.getAttribute('data-title')
                    const price = parseInt(btn.getAttribute('data-price'))
                    const img = btn.getAttribute('data-img')
                    
                    // Check if book already exists in cart
                    const existingItemIndex = cart.findIndex(item => item.title === title)
                    if(existingItemIndex > -1){
                        cart[existingItemIndex].amount++ // Increase quantity
                    } else {
                        cart.push({ title, price, img, amount: 1 }) // Add new item
                    }
                    updateCart() // Refresh cart display
                    searchContent.classList.remove('show-search') // Close search
                    cartContent.classList.add('show-cart') // Show cart
                })
            })
        } else {
            // No results found
            searchResults.innerHTML = '<p class="search__message">No books found.</p>'
        }
    } catch (error) {
        // Handle API errors gracefully
        searchResults.innerHTML = '<p class="search__message">Error fetching data. Try again later.</p>'
        console.error(error)
    }
}

/* Handle search form submission */
if(searchForm){
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault() // Prevent page reload
        const query = searchInput.value.trim()
        if(query){
            searchBooks(query) // Call API search function
        }
    })
}

/*=============== LOGIN & SIGNUP OVERLAYS ===============*/
/* User authentication interface with login and registration forms */

// Get authentication-related DOM elements
const loginButton= document.getElementById('login-button'),         // Opens login modal
      loginClose = document.getElementById('login-close'),           // Closes login modal
      loginContent = document.getElementById('login-content'),       // Login modal container
      signupContent = document.getElementById('signup-content'),     // Signup modal container
      signupClose = document.getElementById('signup-close'),         // Closes signup modal
      loginSignupLink = document.getElementById('login-signup-link'), // Switch to signup
      signupLoginLink = document.getElementById('signup-login-link'), // Switch to login
      profileButton = document.getElementById('profile-button'),      // Opens profile modal
      profileClose = document.getElementById('profile-close'),        // Closes profile modal
      profileContent = document.getElementById('profile-content'),    // Profile modal container
      logoutButton = document.getElementById('logout-button'),        // Logs out user
      profileNameDisplay = document.getElementById('profile-name-display'),   // Display user name
      profileEmailDisplay = document.getElementById('profile-email-display'), // Display user email
      profileImgDisplay = document.getElementById('profile-img-display')      // Display user avatar

/*===== SHOW PROFILE =====*/
/* Open user profile modal */
if(profileButton){
    profileButton.addEventListener('click', () =>{
        profileContent.classList.add('show-login') // Display profile modal
    })
}

/*===== HIDE PROFILE =====*/
/* Close user profile modal */
if(profileClose){
    profileClose.addEventListener('click', () =>{
        profileContent.classList.remove('show-login') // Hide profile modal
    })
}

/*===== LOGOUT LOGIC =====*/
/* Handle user logout - clear session and update UI */
if(logoutButton){
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token') // Clear authentication token
        localStorage.removeItem('user')  // Clear user data
        updateAuthUI() // Update interface to logged-out state
        profileContent.classList.remove('show-login') // Close profile modal
        alert('You have been logged out.') // Notify user
    })
}

/*===== UPDATE AUTH UI =====*/
/* Update interface based on authentication status */
const updateAuthUI = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
        // User is logged in - show profile button, hide login button
        loginButton.classList.add('hide-login')
        profileButton.style.display = 'block'
        profileNameDisplay.innerText = user.name
        profileEmailDisplay.innerText = user.email
        // Generate avatar using user's name
        profileImgDisplay.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
    } else {
        // User is logged out - show login button, hide profile button
        loginButton.classList.remove('hide-login')
        profileButton.style.display = 'none'
    }
}

// Check authentication status when page loads
updateAuthUI()

/*===== SHOW LOGIN =====*/
/* Open login modal */
if(loginButton){
    loginButton.addEventListener('click', () =>{
        loginContent.classList.add('show-login') // Display login modal
    })
}

/*===== HIDE LOGIN =====*/
/* Close login modal */
if(loginClose){
    loginClose.addEventListener('click', () =>{
       loginContent.classList.remove('show-login') // Hide login modal
    })
}

/*===== TOGGLE LOGIN/SIGNUP =====*/
/* Switch between login and signup modals */

// Switch from login to signup
if(loginSignupLink){
    loginSignupLink.addEventListener('click', (e) =>{
        e.preventDefault()
        loginContent.classList.remove('show-login')   // Hide login
        signupContent.classList.add('show-login')     // Show signup
    })
}

// Switch from signup to login
if(signupLoginLink){
    signupLoginLink.addEventListener('click', (e) =>{
        e.preventDefault()
        signupContent.classList.remove('show-login')  // Hide signup
        loginContent.classList.add('show-login')      // Show login
    })
}

// Close signup modal
if(signupClose){
    signupClose.addEventListener('click', () =>{
        signupContent.classList.remove('show-login') // Hide signup modal
    })
}

/*=============== BACKEND CONNECTION (AUTH) ===============*/
/* Handle user registration and login via backend API */

const loginFormSubmit = document.getElementById('login-form-submit'),
      signupFormSubmit = document.getElementById('signup-form-submit')

/* Handle Sign Up Form Submission */
if(signupFormSubmit){
    signupFormSubmit.addEventListener('submit', async (e) => {
        e.preventDefault() // Prevent page reload
        
        // Get form values
        const name = document.getElementById('signup-name').value
        const email = document.getElementById('signup-email').value
        const password = document.getElementById('signup-password').value

        try {
            console.log('Attempting signup to: /api/auth/signup');
            // Send signup request to backend
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })

            const data = await response.json()
            if(response.ok){
                alert('Success: ' + data.message)
                // If backend returns token, save user data (auto-login)
                if (data.user && data.token) {
                    localStorage.setItem('token', data.token)
                    localStorage.setItem('user', JSON.stringify(data.user))
                    updateAuthUI()
                }
                signupContent.classList.remove('show-login')
                // If no auto-login, show login form
                if (!data.token) loginContent.classList.add('show-login')
            } else {
                alert('Error: ' + (data.error || data.message))
            }
        } catch (error) {
            console.error('Error during signup:', error)
            alert('Could not connect to the backend server. Make sure it is running!')
        }
    })
}

/* Handle Log In Form Submission */
if(loginFormSubmit){
    loginFormSubmit.addEventListener('submit', async (e) => {
        e.preventDefault() // Prevent page reload
        
        // Get form values
        const email = document.getElementById('login-email').value
        const password = document.getElementById('login-password').value

        try {
            console.log('Attempting login to: /api/auth/login');
            // Send login request to backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()
            if(response.ok){
                alert('Logged in as ' + data.user.name)
                localStorage.setItem('token', data.token) // Save authentication token
                localStorage.setItem('user', JSON.stringify(data.user)) // Save user info
                updateAuthUI() // Update UI to show logged-in state
                loginContent.classList.remove('show-login') // Close login modal
            } else {
                alert('Error: ' + data.message)
            }
        } catch (error) {
            console.error('Error during login:', error)
            alert('Could not connect to the backend server. Make sure it is running!')
        }
    })
}

/*=============== SHOPPING CART OVERLAY ===============*/
/* Shopping cart interface for managing selected books */

// Get cart-related DOM elements
const cartButton = document.getElementById('cart-button'), // Opens cart
      cartClose = document.getElementById('cart-close'),   // Closes cart
      cartContent = document.getElementById('cart-content') // Cart container

/*===== SHOW CART =====*/
/* Open shopping cart overlay */
if(cartButton){
    cartButton.addEventListener('click', () =>{
        cartContent.classList.add('show-cart') // Display cart
    })
}

/*===== HIDE CART =====*/
/* Close shopping cart overlay */
if(cartClose){
    cartClose.addEventListener('click', () =>{
        cartContent.classList.remove('show-cart') // Hide cart
    })
}

/*=============== SHOPPING CART LOGIC ===============*/
/* Manage cart items, quantities, and total calculations */

// Get elements for cart display and calculations
const addToCartButtons = document.querySelectorAll('.featured__card .button, .new__card'),
      cartContainer = document.getElementById('cart-container'),     // Cart items container
      cartTotalItems = document.getElementById('cart-total-items'),  // Total item count display
      cartTotalPrice = document.getElementById('cart-total-price')   // Total price display

let cart = [] // Array to store all cart items

/* Function to update cart display and calculations */
const updateCart = () => {
    cartContainer.innerHTML = '' // Clear current cart display
    let totalItems = 0  // Reset item counter
    let totalPrice = 0  // Reset price counter

    // Build HTML for each cart item
    cart.forEach((item, index) => {
        totalItems += item.amount  // Count total items
        totalPrice += item.price * item.amount  // Calculate total price

        const cartCard = document.createElement('article')
        cartCard.classList.add('cart__card')
        cartCard.innerHTML = `
            <img src="${item.img}" alt="image" class="cart__img">
            <div>
                <h3 class="cart__title-item">${item.title}</h3>
                <span class="cart__price-item">Dhs ${item.price}</span>
                <div class="cart__amount">
                    <div class="cart__amount-content">
                        <span class="cart__amount-box minus" data-index="${index}">
                            <i class="ri-subtract-line"></i>
                        </span>
                        <span class="cart__amount-number">${item.amount}</span>
                        <span class="cart__amount-box plus" data-index="${index}">
                            <i class="ri-add-line"></i>
                        </span>
                    </div>
                    <i class="ri-delete-bin-line cart__amount-trash" data-index="${index}"></i>
                </div>
            </div>
        `
        cartContainer.appendChild(cartCard)
    })

    // Update totals in UI
    cartTotalItems.innerText = totalItems
    cartTotalPrice.innerText = totalPrice

    // Re-attach event listeners for quantity controls
    const plusButtons = document.querySelectorAll('.cart__amount-box.plus')
    const minusButtons = document.querySelectorAll('.cart__amount-box.minus')
    const trashButtons = document.querySelectorAll('.cart__amount-trash')

    // Increase quantity button
    plusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index')
            cart[index].amount++ // Increment quantity
            updateCart() // Refresh display
        })
    })

    // Decrease quantity button
    minusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index')
            if(cart[index].amount > 1){
                cart[index].amount-- // Decrement quantity
            } else {
                cart.splice(index, 1) // Remove item if quantity reaches 0
            }
            updateCart() // Refresh display
        })
    })

    // Delete item button
    trashButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index')
            cart.splice(index, 1) // Remove item from cart
            updateCart() // Refresh display
        })
    })
}

/* Add event listeners to all "Add to Cart" buttons */
addToCartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Prevent default link behavior for book cards
        if(btn.classList.contains('new__card')){
            e.preventDefault()
        }

        // Extract book data from HTML
        let parent = btn.closest('article') || btn.closest('.new__card')
        let title = parent.querySelector('.featured__title, .new__title').innerText
        let priceText = parent.querySelector('.featured__discount, .new__discount').innerText
        let price = parseInt(priceText.replace('Dhs ', ''))
        let img = parent.querySelector('.featured__img, .new__img').src

        // Add to cart or increment quantity if already exists
        const existingItemIndex = cart.findIndex(item => item.title === title)

        if(existingItemIndex > -1){
            cart[existingItemIndex].amount++ // Increase quantity
        } else {
            cart.push({ title, price, img, amount: 1 }) // Add new item
        }

        updateCart() // Refresh cart display
        cartContent.classList.add('show-cart') // Show cart after adding
    })
})

/*=============== ADD SHADOW HEADER ===============*/
/* Add shadow to header when scrolling for visual depth */
const shadowHeader = () =>{
    const header = document.getElementById('header')
    // Add shadow class when scrolled past 50px
    this.scrollY >= 50 ? header.classList.add('shadow-header')
                      : header.classList.remove('shadow-header')
}
window.addEventListener('scroll', shadowHeader)


/*=============== HOME SWIPER ===============*/
/* Initialize home section book slider with Swiper library */
let swiperHome = new Swiper('.home__swiper', {
  loop: true,                    // Infinite loop
  spaceBetween: -24,            // Overlap slides slightly
  grabCursor : true,            // Show grab cursor on hover
  slidesPerView: 'auto',        // Auto-calculate slides to show
  centeredSlides: 'auto',       // Center active slide

  autoplay:{
    delay: 3000,                // Auto-advance every 3 seconds
    disableOnInteraction: false, // Continue autoplay after user interaction
  } ,

  breakpoints: {
    1220: {
        spaceBetween: -32,      // Larger overlap on big screens
    }
  }
});

/*=============== FEATURED SWIPER ===============*/
/* Initialize featured books slider with navigation arrows */
let swiperFeatured = new Swiper('.featured__swiper', {
  loop: true,                    // Infinite loop
  spaceBetween: 16,             // Space between slides
  grabCursor : true,            // Show grab cursor
  slidesPerView: 'auto',        // Auto-calculate slides
  centeredSlides: 'auto',       // Center active slide

  navigation: {
    nextEl: '.swiper-button-next', // Next arrow
    prevEl: '.swiper-button-prev', // Previous arrow
  },

  breakpoints: {
    1150: {
        slidesPerView: 4,         // Show 4 slides on desktop
        centeredSlides: false,    // Don't center on desktop
    }
  }
});

/*=============== NEW SWIPER ===============*/
/* Initialize new books section sliders */
let swiperNew = new Swiper('.new__swiper', {
  loop: true,                    // Infinite loop
  spaceBetween: 16,             // Space between slides
  grabCursor : true,            // Show grab cursor
  slidesPerView: 'auto',        // Auto-calculate slides

  breakpoints: {
    1150: {
        slidesPerView: 3,         // Show 3 slides on desktop
    }
  }
});

/*=============== TESTIMONIAL SWIPER ===============*/
/* Initialize customer testimonials slider */
let swiperTestimonial = new Swiper('.testimonial__swiper', {
  loop: true,                    // Infinite loop
  spaceBetween: 16,             // Space between slides
  grabCursor : true,            // Show grab cursor
  slidesPerView: 'auto',        // Auto-calculate slides
  centeredSlides: 'auto',       // Center active slide

  breakpoints: {
    1150: {
        slidesPerView: 3,         // Show 3 testimonials on desktop
        centeredSlides: false,    // Don't center on desktop
    }
  }
});

/*=============== SHOW SCROLL UP ===============*/
/* Display scroll-to-top button when scrolled down */
const scrollUp = () =>{
  const scrollUp = document.getElementById('scroll-up')
  // Show button when scrolled past 350px
  this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
            : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
/* Highlight navigation link corresponding to current section in viewport */
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

        // Add active class if section is in viewport
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*=============== DARK LIGHT THEME ===============*/
/* Toggle between dark and light themes */
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'      // CSS class for dark theme
const iconTheme = 'ri-sun-line'      // Icon for light mode

// Get previously selected theme from localStorage
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// Helper functions to get current theme state
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// Apply saved theme on page load
if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme)
}

// Toggle theme when button is clicked
themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme)     // Toggle theme class
    themeButton.classList.toggle(iconTheme)        // Toggle icon
    // Save theme preference
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
/* Animate elements as they scroll into view */
const sr = ScrollReveal({
  origin: 'top',        // Animation starts from top
  distance: '60px',     // Move 60px during animation
  duration: 2500,       // Animation duration in ms
  delay: 400,          // Delay before animation starts
  // reset: true,      // Uncomment to repeat animation on scroll
})

// Apply animations to different sections
sr.reveal(`.home__data, .featured__container, .new__container, 
           .join__data, .testimonial__container, .footer`)
sr.reveal(`.home__images`, {delay: 600})       // Longer delay for images
sr.reveal(`.services__card`, {interval: 100})  // Stagger service cards
sr.reveal(`.discount__data`, {origin: 'left'}) // Slide from left
sr.reveal(`.discount__images`, {origin: 'right'}) // Slide from right

/*=============== LIKE/HEART TOGGLE & WISHLIST ===============*/
/* Manage user's wishlist of favorite books */

// Get wishlist-related DOM elements
const wishlistButton = document.getElementById('wishlist-button'),   // Opens wishlist
      wishlistClose = document.getElementById('wishlist-close'),     // Closes wishlist
      wishlistContent = document.getElementById('wishlist-content'), // Wishlist container
      wishlistContainer = document.getElementById('wishlist-container') // Items container

let wishlist = [] // Array to store wishlist items

/*===== SHOW WISHLIST =====*/
/* Open wishlist overlay */
if(wishlistButton){
    wishlistButton.addEventListener('click', () => {
        wishlistContent.classList.add('show-cart') // Display wishlist
    })
}

/*===== HIDE WISHLIST =====*/
/* Close wishlist overlay */
if(wishlistClose){
    wishlistClose.addEventListener('click', () => {
        wishlistContent.classList.remove('show-cart') // Hide wishlist
    })
}

/* Function to update wishlist display */
const updateWishlist = () => {
    wishlistContainer.innerHTML = '' // Clear current display
    wishlist.forEach((item, index) => {
        const wishlistCard = document.createElement('article')
        wishlistCard.classList.add('cart__card')
        wishlistCard.innerHTML = `
            <img src="${item.img}" alt="image" class="cart__img">
            <div>
                <h3 class="cart__title-item">${item.title}</h3>
                <span class="cart__price-item">Dhs ${item.price}</span>
                <i class="ri-delete-bin-line cart__amount-trash" data-index="${index}"></i>
            </div>
        `
        wishlistContainer.appendChild(wishlistCard)
    })

    // Attach delete button listeners
    const trashButtons = wishlistContainer.querySelectorAll('.cart__amount-trash')
    trashButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index')
            const removedItem = wishlist.splice(index, 1)[0] // Remove from wishlist
            
            // Update heart icon on main page
            const hearts = document.querySelectorAll('.ri-heart-3-fill')
            hearts.forEach(h => {
                const p = h.closest('article') || h.closest('.new__card') || h.closest('.search__card')
                const t = p.querySelector('.featured__title, .new__title, .search__title-book').innerText
                if(t === removedItem.title){
                    h.classList.remove('ri-heart-3-fill') // Change to outline
                    h.classList.add('ri-heart-3-line')
                    h.style.color = '' // Reset color
                }
            })
            
            updateWishlist() // Refresh display
        })
    })
}

/* Event delegation for heart icon clicks (works for dynamic content) */
document.addEventListener('click', (e) => {
    // Check if clicked element is a heart icon
    if(e.target.classList.contains('ri-heart-3-line') || 
       e.target.classList.contains('ri-heart-3-fill') || 
       e.target.classList.contains('ri-heart-line')){
        
        const btn = e.target
        let parent = btn.closest('article') || btn.closest('.new__card') || btn.closest('.search__card')
        
        // Extract book information from card
        let titleEl = parent.querySelector('.featured__title, .new__title, .search__title-book')
        let imgEl = parent.querySelector('.featured__img, .new__img, .search__img')
        let priceEl = parent.querySelector('.featured__discount, .new__discount')
        
        let title = titleEl ? titleEl.innerText : 'Unknown Book'
        let img = imgEl ? imgEl.src : 'assets/img/book-1.jpg'
        let price = priceEl ? parseInt(priceEl.innerText.replace('Dhs ', '')) : 50

        // Toggle heart state
        if(btn.classList.contains('ri-heart-3-line') || btn.classList.contains('ri-heart-line')){
            // Add to wishlist
            btn.classList.remove('ri-heart-3-line', 'ri-heart-line')
            btn.classList.add('ri-heart-3-fill')
            btn.style.color = 'red' // Fill with red
            
            // Add to wishlist array if not already there
            if(!wishlist.find(item => item.title === title)){
                wishlist.push({title, img, price})
                updateWishlist()
            }
        } else {
            // Remove from wishlist
            btn.classList.remove('ri-heart-3-fill')
            btn.classList.add('ri-heart-3-line')
            btn.style.color = '' // Reset color
            
            // Remove from wishlist array
            wishlist = wishlist.filter(item => item.title !== title)
            updateWishlist()
        }
    }
})

/*=============== REVIEWS LOGIC ===============*/
/* Fetch and submit user reviews via backend API */

const reviewForm = document.getElementById('review-form'),
      reviewsList = document.getElementById('reviews-list')

/* Fetch all reviews from backend */
const fetchReviews = async () => {
    try {
        console.log('Fetching reviews from: /api/reviews');
        const response = await fetch('/api/reviews')
        const data = await response.json()
        
        reviewsList.innerHTML = '' // Clear current reviews
        data.forEach(review => {
            const reviewCard = document.createElement('article')
            reviewCard.classList.add('reviews__card')
            reviewCard.innerHTML = `
                <span class="reviews__user">${review.name}</span>
                <p class="reviews__text">${review.text}</p>
                <span class="reviews__date">${new Date(review.date).toLocaleDateString()}</span>
            `
            reviewsList.appendChild(reviewCard)
        })
    } catch (error) {
        console.error('Error fetching reviews:', error)
    }
}

/* Handle review form submission */
if(reviewForm){
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault() // Prevent page reload
        const name = document.getElementById('review-name').value
        const text = document.getElementById('review-text').value

        try {
            // Submit review to backend
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, text })
            })

            if(response.ok){
                reviewForm.reset() // Clear form
                fetchReviews()     // Refresh review list
            }
        } catch (error) {
            console.error('Error posting review:', error)
        }
    })
}

// Fetch reviews when page loads
fetchReviews()
