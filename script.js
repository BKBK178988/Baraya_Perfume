let cart = [];

// โหลดตะกร้าจาก LocalStorage เมื่อเปิดหน้าเว็บ
document.addEventListener("DOMContentLoaded", function() {
    try {
        let storedCart = localStorage.getItem("cartItems");
        let storedTotal = localStorage.getItem("totalPrice");

        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (error) {
        console.error("localStorage ใช้งานไม่ได้:", error);
    }

    updateCart();
});

function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCart();
}

function removeFromCart(name) {
    if (cart.length === 0) return; // ป้องกันข้อผิดพลาดถ้าตะกร้าว่าง

    let itemIndex = cart.findIndex(item => item.name === name);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
    }

    updateCart();
}

function updateCart() {
    let cartList = document.getElementById("cart-items");
    let totalPriceElement = document.getElementById("total-price");
    let cartCountElement = document.getElementById("cart-count");
    let lineOrderButton = document.getElementById("lineOrderButton");

    if (!cartList || !totalPriceElement || !cartCountElement) {
        console.error("Cart elements not found");
        return;
    }

    cartList.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = `${item.name} x${item.quantity} - ${item.price * item.quantity} บาท 
                        <button onclick="removeFromCart('${item.name}')">❌ ลบ</button>`;
        cartList.appendChild(li);
        total += item.price * item.quantity;
        totalItems += item.quantity;
    });

    cartCountElement.textContent = totalItems;
    totalPriceElement.textContent = `ราคารวม: ${total} บาท`;

    // Update cart count animation
    if (window.updateCartCountAnimated) {
        updateCartCountAnimated(totalItems);
    }

    // บันทึกลง LocalStorage
    localStorage.setItem("cartItems", JSON.stringify(cart));
    localStorage.setItem("totalPrice", total);

    // อัปเดตลิงก์ LINE พร้อมรายการสินค้า
    if (lineOrderButton) {
        let message = cart.length > 0 
            ? `สวัสดีค่ะ! ฉันต้องการสั่งซื้อสินค้า BARAYA PERFUME:\n\n${cart.map(item => `🌸 ${item.name} x${item.quantity} = ${item.price * item.quantity} บาท`).join("\n")}\n\n💰 ยอดรวม: ${total} บาท`
            : "สวัสดีค่ะ! ฉันต้องการสอบถามข้อมูลเพิ่มเติมเกี่ยวกับน้ำหอม BARAYA PERFUME";

        // LINE ID: bk0704
        let lineURL = `https://line.me/ti/p/~bk0704?text=${encodeURIComponent(message)}`;
        
        lineOrderButton.href = lineURL;
        
        console.log('🔵 LINE URL updated:', lineURL);
    }
}

function toggleCart() {
    let cartElement = document.getElementById("cart");
    if (!cartElement) {
        console.error("❌ ไม่พบ <div id='cart'> ใน HTML");
        return;
    }
    
    // ใช้ class 'show' แทน 'hidden' สำหรับ modern design
    if (cartElement.classList.contains('show')) {
        cartElement.classList.remove('show');
    } else {
        cartElement.classList.add('show');
        // ลบ hidden class ถ้ามี (สำหรับ compatibility)
        cartElement.classList.remove('hidden');
    }
    
    console.log('Cart toggled, classes:', cartElement.className);
}