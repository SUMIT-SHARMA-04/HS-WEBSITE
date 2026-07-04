
var FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='500' height='340'><rect width='100%' height='100%' fill='#FDFBF7'/><rect x='0' y='0' width='100%' height='100%' fill='none' stroke='#D4AF37' stroke-width='6'/><circle cx='250' cy='140' r='55' fill='none' stroke='#D4AF37' stroke-width='4'/><path d='M225 165 L250 115 L275 165 Z' fill='#D4AF37' opacity='0.85'/><text x='250' y='240' font-family='Georgia, serif' font-size='24' fill='#AA8222' text-anchor='middle'>High Spirits</text><text x='250' y='268' font-family='Arial' font-size='13' letter-spacing='2' fill='#666' text-anchor='middle'>PURE VEG</text></svg>`);

const imgs = {
    burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
    sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    pizza: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&q=80",
    dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80",
    idli: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80",
    paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=500&q=80",
    paneerTikka: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80",
    dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
    kofta: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80",
    roti: "https://images.unsplash.com/photo-1626082895617-2c6f140d3a51?w=500&q=80",
    rice: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&q=80",
    biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
    raita: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80",
    salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
    pakoda: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    maggie: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&q=80",
    fries: "https://images.unsplash.com/photo-1576107232684-1279f3908581?w=500&q=80",
    pasta: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&q=80",
    coffee: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80",
    tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80",
    // Additional images added so specific dishes stop sharing a mismatched photo
    mixVeg: "https://images.unsplash.com/photo-1554054204-b2f70b09d031?w=500&q=80",
    curryPot: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80",
    saagRice: "https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=500&q=80"
};

const menuData = {
    "Fast Food": [{ name: "Aloo Tikki Burger", price: 60, img: imgs.burger }, { name: "Cheese Burger", price: 100, img: imgs.burger }, { name: "Paneer Burger", price: 100, img: imgs.burger }, { name: "Veg Grill Sandwich", price: 80, img: imgs.sandwich }, { name: "Cheese Sandwich", price: 120, img: imgs.sandwich }, { name: "Tanduri Sandwich", price: 100, img: imgs.sandwich }, { name: "Pizza Sandwich", price: 150, img: imgs.sandwich }, { name: "Margherita Pizza", price: 140, img: imgs.pizza }, { name: "Onion Capsicum Pizza", price: 180, img: imgs.pizza }, { name: "Cheese Pizza", price: 220, img: imgs.pizza }, { name: "Paneer Pizza", price: 220, img: imgs.pizza }, { name: "Farm House Pizza", price: 280, img: imgs.pizza }, { name: "Sweet Corn Pizza", price: 240, img: imgs.pizza }],
    "South Indian": [{ name: "Idli (4-piece)", price: 100, img: imgs.idli }, { name: "Masala Idli", price: 130, img: imgs.idli }, { name: "Plain Dosa", price: 80, img: imgs.dosa }, { name: "Masala Dosa", price: 120, img: imgs.dosa }, { name: "Chocolate Dosa", price: 170, img: imgs.dosa }, { name: "Paneer Dosa", price: 160, img: imgs.dosa }, { name: "Cheese Dosa", price: 180, img: imgs.dosa }, { name: "Upma Dosa", price: 200, img: imgs.dosa }, { name: "Butter Masala Dosa", price: 170, img: imgs.dosa }, { name: "Mysore Bonda (4-piece)", price: 100, img: imgs.idli }, { name: "Medu Vada", price: 80, img: imgs.idli }, { name: "Upma", price: 80, img: imgs.idli }],
    "Sabji": [{ name: "Paneer Butter Masala", price: 170, img: imgs.paneer }, { name: "Shahi Paneer", price: 200, img: imgs.paneer }, { name: "Paneer Lababdar", price: 200, img: imgs.paneer }, { name: "Palak Paneer", price: 180, img: imgs.saagRice }, { name: "Aloo Palak", price: 140, img: imgs.saagRice }, { name: "Dal Fry", price: 140, img: imgs.dal }, { name: "Kadi", price: 100, img: imgs.curryPot }, { name: "Paneer Patiyala", price: 220, img: imgs.paneer }, { name: "Dahi Fry", price: 120, img: imgs.raita }, { name: "Chana Masala", price: 160, img: imgs.curryPot }, { name: "Chola Paneer", price: 180, img: imgs.paneer }, { name: "Khoya Matar Paneer", price: 200, img: imgs.paneer }, { name: "Paneer Cheese", price: 220, img: imgs.paneer }, { name: "Aloo Gobhi", price: 140, img: imgs.mixVeg }, { name: "Sev Paneer", price: 170, img: imgs.paneer }, { name: "Kadi Pakoda", price: 140, img: imgs.curryPot }, { name: "Mix Veg", price: 180, img: imgs.mixVeg }, { name: "Besan Gatta", price: 140, img: imgs.curryPot }, { name: "Sev Tomato", price: 140, img: imgs.dal }, { name: "Papad Sabji", price: 120, img: imgs.salad }, { name: "Kadhai Paneer", price: 200, img: imgs.paneer }, { name: "Matar Paneer", price: 180, img: imgs.paneer }, { name: "Paneer Pyaaza", price: 180, img: imgs.paneer }, { name: "Aloo Paneer", price: 160, img: imgs.paneer }, { name: "Dal Palak", price: 160, img: imgs.saagRice }, { name: "Dal Tadka", price: 140, img: imgs.dal }, { name: "Paneer Burji", price: 170, img: imgs.paneer }, { name: "Kaju Curry", price: 250, img: imgs.curryPot }, { name: "Dal Paneer", price: 170, img: imgs.dal }, { name: "Aloo Chola", price: 160, img: imgs.curryPot }, { name: "Khoya Paneer", price: 180, img: imgs.paneer }, { name: "Paneer Tikka", price: 220, img: imgs.paneerTikka }, { name: "Aloo Matar", price: 140, img: imgs.mixVeg }, { name: "Aloo Jeera", price: 140, img: imgs.mixVeg }, { name: "Sev Bhaji Paneer", price: 170, img: imgs.paneer }, { name: "Aloo Gobhi Matar", price: 160, img: imgs.mixVeg }, { name: "Green Mix Veg", price: 160, img: imgs.mixVeg }, { name: "Malai Kofta", price: 250, img: imgs.kofta }, { name: "Aloo Masala", price: 140, img: imgs.mixVeg }, { name: "Sev Bhaji Milk", price: 140, img: imgs.raita }],
    "Breads, Rice & Sides": [{ name: "Tava Plain", price: 10, img: imgs.roti }, { name: "Tava Butter", price: 12, img: imgs.roti }, { name: "Tava Ghee", price: 15, img: imgs.roti }, { name: "Plain Paratha", price: 25, img: imgs.roti }, { name: "Plain Paratha Butter", price: 25, img: imgs.roti }, { name: "Plain Paratha Ghee", price: 40, img: imgs.roti }, { name: "Onion Paratha", price: 60, img: imgs.roti }, { name: "Aloo Paratha", price: 60, img: imgs.roti }, { name: "Aloo Pyaaz Paratha", price: 60, img: imgs.roti }, { name: "Paneer Paratha", price: 80, img: imgs.roti }, { name: "Missi Roti", price: 40, img: imgs.roti }, { name: "Bajra Roti", price: 40, img: imgs.roti }, { name: "Extra Butter", price: 30, img: imgs.roti }, { name: "Matar Pulav", price: 150, img: imgs.biryani }, { name: "Paneer Pulav", price: 160, img: imgs.biryani }, { name: "Vegetable Pulav", price: 160, img: imgs.biryani }, { name: "Veg Biryani", price: 160, img: imgs.biryani }, { name: "Plain Rice", price: 100, img: imgs.rice }, { name: "Jeera Rice", price: 120, img: imgs.saagRice }, { name: "Dal Khichdi", price: 180, img: imgs.rice }, { name: "Dal Spicy Khichdi", price: 200, img: imgs.rice }, { name: "Veg Raita", price: 70, img: imgs.raita }, { name: "Boondi Raita", price: 70, img: imgs.raita }, { name: "Butter Chaach", price: 20, img: imgs.raita }, { name: "Curd", price: 25, img: imgs.raita }, { name: "Sweet Lassi", price: 50, img: imgs.raita }, { name: "Plain Raita", price: 50, img: imgs.raita }],
    "Salad": [{ name: "Tomato Salad", price: 50, img: imgs.salad }, { name: "Kheera Salad", price: 50, img: imgs.salad }, { name: "Onion Salad", price: 50, img: imgs.salad }, { name: "Green Salad", price: 50, img: imgs.salad }, { name: "Mix Salad", price: 50, img: imgs.salad }, { name: "Kachumbar Salad", price: 60, img: imgs.salad }, { name: "Plain Papad", price: 30, img: imgs.salad }, { name: "Fry Papad", price: 50, img: imgs.salad }, { name: "Masala Papad", price: 70, img: imgs.salad }, { name: "Peanut Masala", price: 70, img: imgs.salad }],
    "Snacks": [{ name: "Paneer Pakoda", price: 150, img: imgs.pakoda }, { name: "Aloo Pakoda", price: 160, img: imgs.pakoda }, { name: "Mix Pakoda", price: 160, img: imgs.pakoda }, { name: "Bread Pakoda (1-pc)", price: 80, img: imgs.pakoda }, { name: "Onion Pakoda", price: 150, img: imgs.pakoda }, { name: "Mirchi Pakoda (2-pc)", price: 80, img: imgs.pakoda }, { name: "Plain Maggie", price: 80, img: imgs.maggie }, { name: "Veg Maggie", price: 100, img: imgs.maggie }, { name: "Chatpati Maggie", price: 120, img: imgs.maggie }, { name: "Tanduri Maggie", price: 120, img: imgs.maggie }, { name: "Poha", price: 50, img: imgs.pakoda }, { name: "Pav Bhaji", price: 100, img: imgs.pakoda }, { name: "Vada Pav", price: 80, img: imgs.pakoda }, { name: "French Fries", price: 80, img: imgs.fries }, { name: "Spring Roll", price: 150, img: imgs.pakoda }, { name: "Bread Paneer Pakoda", price: 120, img: imgs.pakoda }, { name: "Soya Chaap", price: 190, img: imgs.pakoda }, { name: "Red Pasta", price: 150, img: imgs.pasta }, { name: "White Pasta", price: 150, img: imgs.pasta }],
    "Beverages": [{ name: "Plain Tea", price: 30, img: imgs.tea }, { name: "Coffee", price: 50, img: imgs.coffee }, { name: "Cold Coffee", price: 90, img: imgs.coffee }, { name: "Milk", price: 50, img: imgs.coffee }, { name: "Cold Coffee w/ Icecream", price: 120, img: imgs.coffee }]
};

let cart = JSON.parse(localStorage.getItem('hs_cart')) || [];
updateCartCount();

function handleCategoryChange(category, event) {
    const container = document.getElementById('menu-container');
    container.classList.add('fade-out');
    const targetTab = event ? event.currentTarget : null; 
    setTimeout(() => {
        try { renderMenu(category, targetTab); } 
        finally { container.classList.remove('fade-out'); }
    }, 300); 
}

function renderMenu(categoryFilter = 'all', targetTab = null) {
    if(targetTab) {
        document.querySelectorAll('.menu-tab').forEach(tab => tab.classList.remove('active'));
        targetTab.classList.add('active');
    }
    const container = document.getElementById('menu-container');
    container.innerHTML = ''; 
    let delayIndex = 0; 
    for (const [category, items] of Object.entries(menuData)) {
        if (categoryFilter === 'all' || categoryFilter === category) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'menu-category-group';
            const header = document.createElement('h3');
            header.className = 'menu-category'; header.innerText = category;
            groupDiv.appendChild(header);
            const gridDiv = document.createElement('div');
            gridDiv.className = 'menu-grid';
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'menu-item';
                const cappedDelay = Math.min(delayIndex * 0.05, 1.5);
                card.style.animationDelay = `${cappedDelay}s`;
                card.innerHTML = `
                    <div class="menu-img-wrap"><img src="${item.img}" alt="${item.name}" class="menu-img" loading="lazy" onload="this.classList.add('loaded'); this.parentElement.style.animation='none'; this.parentElement.style.background='none';" onerror="this.onerror=null; this.src=FALLBACK_IMG; this.classList.add('loaded'); this.parentElement.style.animation='none'; this.parentElement.style.background='none';"></div>
                    <div class="menu-content"><h4><span class="veg-icon"><span class="veg-dot"></span></span>${item.name}</h4><div><p>₹${item.price}</p><button class="btn" style="width: 100%;" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price}, this)">Add to Cart</button></div></div>`;
                gridDiv.appendChild(card);
                delayIndex++;
            });
            groupDiv.appendChild(gridDiv);
            container.appendChild(groupDiv);
        }
    }
    initCategoryReveal();
}
renderMenu('all');

// --- ANIMATED CATEGORY HEADINGS ---
function initCategoryReveal() {
    const headings = document.querySelectorAll('.menu-category');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('cat-visible'); });
    }, { threshold: 0.2 });
    headings.forEach(h => observer.observe(h));
}

function addToCart(itemName, price, btnElement) {
    cart.push({ name: itemName, price: price });
    localStorage.setItem('hs_cart', JSON.stringify(cart));
    updateCartCount();
    const originalText = btnElement.innerText;
    btnElement.innerText = "Added!";
    btnElement.style.background = "#008a00"; btnElement.style.color = "white"; btnElement.style.transform = "scale(0.95)";
    setTimeout(() => {
        btnElement.innerText = originalText; btnElement.style.background = ""; btnElement.style.color = ""; btnElement.style.transform = "scale(1)";
    }, 1000);
}

function updateCartCount() { 
    const countEl = document.getElementById('cart-count');
    countEl.innerText = cart.length; 
    countEl.classList.remove('bump');
    void countEl.offsetWidth; // restart animation
    countEl.classList.add('bump');
}

// --- RIPPLE EFFECT (buttons & tabs) ---
document.addEventListener('click', function(e) {
    const target = e.target.closest('.btn, .menu-tab');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
});

// --- SCROLL PROGRESS BAR ---
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const update = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

// --- INTERACTIVE STAR RATING ---
let selectedStarValue = 4; // matches original default look (4 filled stars)
function initStarRating() {
    const wrapper = document.getElementById('star-rating');
    if (!wrapper) return;
    const stars = wrapper.querySelectorAll('.star');
    const paint = (value) => stars.forEach(s => s.classList.toggle('filled', +s.dataset.value <= value));
    paint(selectedStarValue);
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => paint(+star.dataset.value));
        star.addEventListener('click', () => {
            selectedStarValue = +star.dataset.value;
            paint(selectedStarValue);
            star.classList.add('selected');
            setTimeout(() => star.classList.remove('selected'), 400);
            submitRating(selectedStarValue);
        });
    });
    wrapper.addEventListener('mouseleave', () => paint(selectedStarValue));
}

// --- BACKEND API INTEGRATION ---
async function handleBooking(event) {
    event.preventDefault();
    const bookingData = {
        customer_name: document.getElementById('b-name').value,
        customer_phone: document.getElementById('b-phone').value,
        date: event.target.elements[2].value,
        time: event.target.elements[3].value,
        guests: parseInt(event.target.elements[4].value)
    };
    try {
        const response = await fetch('http://localhost:8000/bookings/', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (response.ok) {
            const msgBox = document.getElementById('booking-message');
            msgBox.style.display = 'block';
            msgBox.innerHTML = `<strong>Reservation Confirmed!</strong><br>Thank you, ${bookingData.customer_name}. Your table is secured.`;
            document.getElementById('booking-form').reset();
            setTimeout(() => { msgBox.style.display = 'none'; }, 5000);
        }
    } catch (error) { 
        alert("Error connecting to the server. Please try again."); 
    }
}

function submitRating(value) { 
    const msgBox = document.getElementById('rating-message'); 
    msgBox.style.display = 'block'; 
    msgBox.innerHTML = `<strong>Thank you for the ${value || selectedStarValue}-star rating!</strong> Your feedback fuels our excellence.`; 
    setTimeout(() => { msgBox.style.display = 'none'; }, 4000); 
}

function handleReview(event) { 
    event.preventDefault(); 
    const msgBox = document.getElementById('review-message'); 
    msgBox.style.display = 'block'; 
    msgBox.innerHTML = `<strong>Thank you!</strong> Your review has been submitted for moderation.`; 
    event.target.reset(); 
    setTimeout(() => { msgBox.style.display = 'none'; }, 4000); 
}

function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0 }); 
    sections.forEach(section => {
        observer.observe(section);
        if (section.getBoundingClientRect().top < window.innerHeight) section.classList.add('visible');
    });
}

function initAllAnimations() {
    initScrollAnimations();
    initScrollProgress();
    initStarRating();
}

if (document.readyState === 'loading') document.addEventListener("DOMContentLoaded", initAllAnimations);
else initAllAnimations()