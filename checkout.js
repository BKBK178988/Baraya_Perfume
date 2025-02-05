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

    // ✅ สร้าง QR Code พร้อมเพย์อัตโนมัติ
    let promptpayNumber = "0639392988"; // 🔹 ใส่หมายเลขพร้อมเพย์ที่ถูกต้อง
    let qrLink = `https://promptpay.io/${promptpayNumber}/${totalPrice}.png`;
    qrImage.src = qrLink;
});

function previewSlip() {
    let fileInput = document.getElementById("slipUpload");
    let previewContainer = document.getElementById("slipPreviewContainer");
    let previewImage = document.getElementById("slipPreview");

    let file = fileInput.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewContainer.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }
}

function confirmOrder() {
    let name = document.getElementById("customer-name").value;
    let address = document.getElementById("customer-address").value;
    let phone = document.getElementById("customer-phone").value;
    let slipFile = document.getElementById("slipUpload").files[0];

    if (!name || !address || !phone || !slipFile) {
        alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน และแนบสลิปการโอนเงิน!");
        return;
    }

    // ✅ สร้างข้อมูลคำสั่งซื้อ
    let orderData = {
        name: name,
        address: address,
        phone: phone,
        cart: JSON.parse(localStorage.getItem("cart")),
        totalPrice: localStorage.getItem("totalPrice")
    };

    console.log("คำสั่งซื้อ:", orderData);

    // ✅ ส่งข้อมูลไปยัง LINE
    let message = `📦 คำสั่งซื้อใหม่!\n\n👤 ชื่อ: ${name}\n🏠 ที่อยู่: ${address}\n📞 เบอร์โทร: ${phone}\n💰 ราคารวม: ${orderData.totalPrice} บาท\n\n✅ กรุณาตรวจสอบข้อมูล!`;

    let lineURL = `https://line.me/ti/p/~bk0704?text=${encodeURIComponent(message)}`;
    
    alert("✅ สั่งซื้อสำเร็จ! ระบบจะนำคุณไปยัง LINE เพื่อส่งข้อมูลการสั่งซื้อ");
    window.location.href = lineURL;

    // ✅ ล้างตะกร้าหลังจากทำการสั่งซื้อ
    localStorage.removeItem("cart");
    localStorage.removeItem("totalPrice");
}
