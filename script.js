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

function updateCart() {
    let cartList = document.getElementById("cart-items");
    let totalPriceElement = document.getElementById("total-price");
    let cartCountElement = document.getElementById("cart-count");

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

    // บันทึกลง LocalStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("totalPrice", total);
}

function removeFromCart(name) {
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
