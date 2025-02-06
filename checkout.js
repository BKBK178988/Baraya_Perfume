function sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice) {
    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("orderDetails", orderDetails);
    formData.append("totalPrice", totalPrice);

    return fetch("send_email.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert(data); // แสดงผลว่าอีเมลส่งสำเร็จหรือไม่
    })
    .catch(error => {
        console.error("❌ Error sending email:", error);
        alert("❌ เกิดข้อผิดพลาดในการส่งอีเมล");
    });
}

function confirmOrder() {
    let name = document.getElementById("customer-name").value;
    let email = document.getElementById("customer-email").value; // ✅ รับค่าอีเมลลูกค้า
    let address = document.getElementById("customer-address").value;
    let phone = document.getElementById("customer-phone").value;
    let slipFile = document.getElementById("slipUpload").files[0];

    if (!name || !email || !address || !phone || !slipFile) {
        alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน และแนบสลิปการโอนเงิน!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กรุณาเลือกสินค้าใหม่");
        return;
    }

    let orderDetails = cart.map(item => `📦 ${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n");
    let totalPrice = localStorage.getItem("totalPrice");

    // ✅ ส่งอีเมลไปยังเจ้าของร้านพร้อมข้อมูลลูกค้า
    sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice)
    .then(() => {
        alert("✅ สั่งซื้อสำเร็จ! อีเมลแจ้งเตือนถูกส่งแล้ว");

        // ✅ ล้างตะกร้าหลังจากสั่งซื้อสำเร็จ
        localStorage.removeItem("cart");
        localStorage.removeItem("totalPrice");

        // ✅ รีเฟรชหน้าหรือพาผู้ใช้กลับไปยังหน้าแรก
        window.location.href = "index.html";
    })
    .catch(error => {
        console.error("❌ เกิดข้อผิดพลาด:", error);
    });
}
