/* ========================================
   🎯 MODERN FEATURES - BARAYA PERFUME
   ======================================== */

// ===== TOAST NOTIFICATION =====
class Toast {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        const titles = {
            success: 'สำเร็จ!',
            error: 'เกิดข้อผิดพลาด',
            info: 'ข้อมูล',
            warning: 'คำเตือน'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;

        this.container.appendChild(toast);
        
        // Show animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }
}

// สร้าง Toast instance
const toast = new Toast();

// ===== LOADING OVERLAY =====
function showLoading(message = 'กำลังดำเนินการ...') {
    let overlay = document.querySelector('.loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-text').textContent = message;
    }
    
    setTimeout(() => overlay.classList.add('show'), 10);
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// ===== BACK TO TOP BUTTON =====
function createBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    button.onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    document.body.appendChild(button);

    // Show/Hide on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    });
}

// ===== SMOOTH ADD TO CART ANIMATION =====
function animateAddToCart(button) {
    // เพิ่ม pulse animation
    button.classList.add('pulse');
    setTimeout(() => button.classList.remove('pulse'), 500);

    // สร้าง floating text
    const rect = button.getBoundingClientRect();
    const float = document.createElement('div');
    float.textContent = '+1';
    float.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top}px;
        color: #06c755;
        font-size: 24px;
        font-weight: bold;
        pointer-events: none;
        z-index: 10001;
        animation: floatUp 1s ease-out forwards;
    `;
    
    // เพิ่ม keyframe animation
    if (!document.getElementById('floatUpAnimation')) {
        const style = document.createElement('style');
        style.id = 'floatUpAnimation';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-50px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 1000);
}

// ===== UPDATE CART COUNT WITH ANIMATION =====
function updateCartCountAnimated(count) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.classList.add('pulse');
        setTimeout(() => cartCount.classList.remove('pulse'), 500);
    }
}

// ===== PRODUCT CARD ANIMATIONS =====
function animateProducts() {
    const products = document.querySelectorAll('.product');
    products.forEach((product, index) => {
        product.style.animationDelay = `${index * 0.1}s`;
        product.classList.add('fade-in');
    });
}

// ===== CONFETTI ANIMATION =====
function showConfetti() {
    const colors = ['#d4af37', '#f9d342', '#ff6b6b', '#4ecdc4', '#95e1d3'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: 1;
            transform: rotate(0deg);
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
            z-index: 10000;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
    
    // เพิ่ม animation
    if (!document.getElementById('confetti-animation')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    createBackToTopButton();
    animateProducts();
    
    // เพิ่ม smooth scroll สำหรับ anchor links เท่านั้น
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // ตรวจสอบว่าเป็น anchor link จริงๆ (ไม่ใช่ # เดี่ยวๆ)
            if (href && href.length > 1 && href.startsWith('#')) {
                e.preventDefault();
                try {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.error('Scroll target not found:', href);
                }
            }
        });
    });
});

// ===== EXPORT สำหรับใช้ในไฟล์อื่น =====
window.toast = toast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.animateAddToCart = animateAddToCart;
window.updateCartCountAnimated = updateCartCountAnimated;
window.showConfetti = showConfetti;
