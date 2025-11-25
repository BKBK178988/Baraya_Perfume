document.addEventListener("DOMContentLoaded", function() {

    // ✅ โหลดข้อมูลลูกค้ากลับมาใส่ฟอร์ม
    let savedCustomer = localStorage.getItem("customerData");
    if (savedCustomer) {
        let c = JSON.parse(savedCustomer);
        document.getElementById("customer-name").value = c.name || "";
        document.getElementById("customer-email").value = c.email || "";
        document.getElementById("customer-address").value = c.address || "";
        document.getElementById("customer-phone").value = c.phone || "";
    }

    let cartData = localStorage.getItem("cart");
    let totalPrice = localStorage.getItem("totalPrice");

    if (!cartData || cartData === "[]") {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กลับไปเลือกสินค้าก่อนทำการชำระเงิน");
        window.location.href = "index-modern.html";
        return;
    }

    let cart = JSON.parse(cartData);
    let qrImage = document.getElementById("qr-code");

    // ✅ สร้าง QR Code พร้อมเพย์
    let promptpayNumber = "0639392988";
    let qrLink = `https://promptpay.io/${promptpayNumber}/${totalPrice}.png`;

    if (qrImage) {
        qrImage.src = qrLink;
    } else {
        console.error("❌ ไม่พบ <img id='qr-code'> ใน HTML");
    }

    const slipPreviewContainer = document.getElementById('slipPreviewContainer');
    if (slipPreviewContainer && !document.getElementById('slipUpload').files.length) {
        slipPreviewContainer.classList.add('hidden');
    }
});

// ✅ ฟังก์ชันแสดงตัวอย่างสลิป
function previewSlip() {
    const input = document.getElementById('slipUpload');
    const file = input.files[0];
    if (!file) return;
    const img = document.getElementById('slipPreview');
    img.src = URL.createObjectURL(file);
    const container = document.getElementById('slipPreviewContainer');
    if (container) container.classList.remove('hidden');
}

// ✅ ฟังก์ชันส่งข้อมูลไปยังอีเมล
function sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile) {
    console.log('🔵 sendOrderToEmail called with:', {name, email, address, phone, totalPrice, hasSlip: !!slipFile});

    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("orderDetails", orderDetails);
    formData.append("totalPrice", totalPrice);

    if (slipFile) {
        formData.append("slip", slipFile);
        console.log('🔵 Slip file attached:', slipFile.name, slipFile.size, 'bytes');
    }

    console.log('🔵 Sending to send_email.php...');

    return fetch("send_email.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        console.log('🔵 Response status:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('✅ Response data:', data);
        return data;
    })
    .catch(error => {
        console.error("❌ Error:", error);
        throw error;
    });
}

// ✅ ฟังก์ชันยืนยันคำสั่งซื้อ + บันทึกข้อมูลลูกค้า
function confirmOrder() {
    let name = document.getElementById("customer-name").value;
    let email = document.getElementById("customer-email").value;
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

    // ⭐ บันทึกข้อมูลลูกค้าใส่ LocalStorage
    localStorage.setItem("customerData", JSON.stringify({
        name: name,
        email: email,
        address: address,
        phone: phone
    }));

    let orderDetails = cart.map(item => `📦 ${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n");
    let totalPrice = localStorage.getItem("totalPrice");

    sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile)
    .then((response) => {
        if (response.includes("✅")) {
            alert("✅ สั่งซื้อสำเร็จ! อีเมลยืนยันถูกส่งแล้ว");

            localStorage.removeItem("cart");
            localStorage.removeItem("totalPrice");

            setTimeout(() => {
                window.location.href = "index-modern.html";
            }, 2000);
        } else {
            alert("❌ เกิดข้อผิดพลาดในการส่งอีเมล กรุณาติดต่อทางร้านโดยตรง");
        }
    })
    .catch(error => {
        console.error("❌ เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ:", error);
        alert("❌ ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    });
}
