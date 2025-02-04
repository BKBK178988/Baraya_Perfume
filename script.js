let cart = [];

function addToCart(name, price) {
    let product = cart.find(item => item.name === name);
    if (product) {
        product.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    let cartItems = document.getElementById("cart-items");
    let totalPrice = document.getElementById("total-price");
    let cartCount = document.getElementById("cart-count");

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        let li = document.createElement("li");
        li.innerHTML = `${item.name} x${item.quantity} <button onclick="removeFromCart('${item.name}')">❌</button>`;
        cartItems.appendChild(li);
    });

    totalPrice.innerText = `ราคารวม: ${total} บาท`;
    cartCount.innerText = cart.length;
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
}

function toggleCart() {
    let cartDiv = document.getElementById("cart");
    cartDiv.style.display = cartDiv.style.display === "block" ? "none" : "block";
}

function checkout() {
    if (cart.length === 0) {
        alert("ตะกร้าสินค้าว่าง! กรุณาเลือกสินค้าก่อน");
        return;
    }

    let orderDetails = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let message = `🛍️ สั่งซื้อสินค้า: ${orderDetails} | ราคารวม ${total} บาท`;
    
    let lineURL = `https://line.me/ti/p/~OJY81U61Jk?text=${encodeURIComponent(message)}`;

    window.open(lineURL, "_blank");
}
