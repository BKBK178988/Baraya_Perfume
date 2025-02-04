let cart = [];

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
    cart = cart.filter(item => item.name !== name);
    updateCart();
}

function updateCart() {
    let cartList = document.getElementById("cart-items");
    let totalPriceElement = document.getElementById("total-price");
    let cartCountElement = document.getElementById("cart-count");
    let lineOrderButton = document.getElementById("lineOrderButton");

    cartList.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = `${item.name} x${item.quantity} - ${item.price * item.quantity} บาท 
                        <button onclick="removeFromCart('${item.name}')">❌</button>`;
        cartList.appendChild(li);
        total += item.price * item.quantity;
        totalItems += item.quantity;
    });

    cartCountElement.textContent = totalItems;
    totalPriceElement.textContent = `ราคารวม: ${total} บาท`;

    let message = cart.length > 0 
        ? `สวัสดี! ฉันต้องการสั่งซื้อสินค้า:\n${cart.map(item => `${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n")}`
        : "สวัสดี! ฉันต้องการสอบถามข้อมูลเพิ่มเติมเกี่ยวกับสินค้า";

    let lineURL = `https://line.me/ti/p/~bk0704?text=${encodeURIComponent(message)}`;
    lineOrderButton.href = lineURL;
}

function toggleCart() {
    let cartElement = document.getElementById("cart");
    cartElement.style.display = cartElement.style.display === "none" ? "block" : "none";
}

// อัปเดตตะกร้าตอนโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", updateCart);
