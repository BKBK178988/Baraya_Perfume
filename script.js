let cart = [];
let cartCount = 0;

function addToCart(name, price) {
    cart.push({ name, price });
    cartCount++;
    updateCart();
}

function updateCart() {
    let cartList = document.getElementById("cart-items");
    let totalPrice = document.getElementById("total-price");
    let cartCountElement = document.getElementById("cart-count");
    let lineOrderButton = document.getElementById("lineOrderButton");

    cartList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        let li = document.createElement("li");
        li.textContent = `${item.name} - ${item.price} บาท`;
        cartList.appendChild(li);
        total += item.price;
    });

    cartCountElement.textContent = cart.length;
    totalPrice.textContent = `ราคารวม: ${total} บาท`;

    // อัปเดตลิงก์ LINE อัตโนมัติ
    let message = cart.length > 0 
        ? `สวัสดี! ฉันต้องการสั่งซื้อสินค้า:\n${cart.map(item => `${item.name} - ${item.price} บาท`).join("\n")}`
        : "สวัสดี! ฉันต้องการสอบถามข้อมูลเพิ่มเติมเกี่ยวกับสินค้า";

    let lineURL = `https://line.me/ti/p/~OJY81U61Jk?text=${encodeURIComponent(message)}`;
    lineOrderButton.href = lineURL;
}

function toggleCart() {
    let cartElement = document.getElementById("cart");
    cartElement.style.display = cartElement.style.display === "none" ? "block" : "none";
}

// เรียกใช้ updateCart() ตอนโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", updateCart);
