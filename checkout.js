document.addEventListener("DOMContentLoaded", function() {
    let cartData = localStorage.getItem("cart");
    let totalPrice = localStorage.getItem("totalPrice");

    if (!cartData || cartData === "[]") {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กลับไปเลือกสินค้าก่อนทำการชำระเงิน");
        window.location.href = "index.html";
        return;
    }

    let cart = JSON.parse(cartData);
    let qrImage = document.getElementById("qr-code");

    // ✅ สร้าง QR Code พร้อมเพย์
    let promptpayNumber = "0639392988"; // 🔹 เปลี่ยนเป็นหมายเลขพร้อมเพย์ของคุณ
    let qrLink = `https://promptpay.io/${promptpayNumber}/${totalPrice}.png`;

    // ✅ ตรวจสอบว่า Element `qr-code` มีอยู่จริง
    if (qrImage) {
        qrImage.src = qrLink;
    } else {
        console.error("❌ ไม่พบ <img id='qr-code'> ใน HTML");
    }

    // ซ่อนตัวอย่างสลิปถ้ายังไม่มีไฟล์
    const slipPreviewContainer = document.getElementById('slipPreviewContainer');
    if (slipPreviewContainer && !document.getElementById('slipUpload').files.length) {
        slipPreviewContainer.classList.add('hidden');
    }
});

// ✅ ฟังก์ชันแสดงตัวอย่างสลิป (preview)
function previewSlip() {
    const input = document.getElementById('slipUpload');
    const file = input.files[0];
    if (!file) return;
    const img = document.getElementById('slipPreview');
    img.src = URL.createObjectURL(file);
    const container = document.getElementById('slipPreviewContainer');
    if (container) container.classList.remove('hidden');
}

// ✅ ฟังก์ชันส่งข้อมูลไปยังอีเมล / ฟอร์ม endpoint
// NOTE: GitHub Pages เป็น static hosting และไม่สามารถรัน PHP ได้ ดังนั้นต้องเปลี่ยน endpoint เป็นบริการภายนอก
// ตัวอย่างด้านล่างใช้ Formspree: https://formspree.io/
// - ลงทะเบียนที่ Formspree แล้วสร้าง Form (จะได้ form ID เช่น f/xxxxx) แล้วเอา ID ไปใส่แทน "YOUR_FORM_ID"
// - ถ้าต้องการใช้บริการอื่น (EmailJS, Netlify Functions, Vercel, Firebase) ให้เปลี่ยน URL และกำหนดค่าให้เหมาะสม
function sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile) {
    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("orderDetails", orderDetails);
    formData.append("totalPrice", totalPrice);
    if (slipFile) {
        // เพิ่มไฟล์สลิปลงใน FormData
        formData.append("slip", slipFile);
    }

    // เปลี่ยน URL นี้เป็น endpoint ของคุณ (Formspree หรือ backend ที่รองรับ)
    const endpoint = "https://formspree.io/f/YOUR_FORM_ID"; // <-- เปลี่ยน YOUR_FORM_ID

    return fetch(endpoint, {
        method: "POST",
        body: formData
        // อย่าใส่ header Content-Type เมื่อส่ง FormData (เบราว์เซอร์จะกำหนด boundary ให้เอง)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || response.statusText); });
        }
        return response.text();
    })
    .then(data => {
        // แสดงข้อความที่ endpoint ตอบกลับ (หรือแสดงข้อความสำเร็จมาตรฐาน)
        alert("✅ อัปโหลดข้อมูลสำเร็จ! ขอบคุณที่สั่งซื้อ");
        return data;
    })
    .catch(error => {
        console.error("❌ Error sending order:", error);
        alert("❌ เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ: " + (error.message || error));
        throw error;
    });
}

// ✅ ฟังก์ชันยืนยันคำสั่งซื้อ (เรียก sendOrderToEmail พร้อมไฟล์สลิป)
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

    let orderDetails = cart.map(item => `📦 ${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n");
    let totalPrice = localStorage.getItem("totalPrice");

    // ส่งอีเมล/ฟอร์มไปยัง endpoint ภายนอก
    sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile)
    .then(() => {
        // ล้างตะกร้าหลังจากสำเร็จ
        localStorage.removeItem("cart");
        localStorage.removeItem("totalPrice");

        // พาผู้ใช้กลับหน้าแรก
        window.location.href = "index.html";
    })
    .catch(error => {
        console.error("❌ เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ:", error);
    });
}