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
    qrImage.src = qrLink;
});

const LINE_NOTIFY_TOKEN = "t6UcP4Xz6WUTS9EThvv2AkL1pGoDLmQpmi6JaamrrE6"; // 🔹 ใส่ Token ที่ได้จาก LINE Notify

function sendOrderToLine(name, address, phone, orderDetails, totalPrice) {
    let message = `🛍️ แจ้งเตือนคำสั่งซื้อใหม่!\n\n👤 ชื่อ: ${name}\n🏠 ที่อยู่: ${address}\n📞 เบอร์โทร: ${phone}\n💰 ราคารวม: ${totalPrice} บาท\n\n🛍 รายการสินค้า:\n${orderDetails}`;

    // ส่งข้อมูลไปยัง LINE Notify
    return fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${LINE_NOTIFY_TOKEN}`
        },
        body: `message=${encodeURIComponent(message)}`
    }).then(response => response.json());
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

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กรุณาเลือกสินค้าใหม่");
        return;
    }

    let orderDetails = cart.map(item => `📦 ${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n");
    let totalPrice = localStorage.getItem("totalPrice");

    // ✅ แจ้งเตือน LINE ผู้ขาย
    sendOrderToLine(name, address, phone, orderDetails, totalPrice)
    .then(data => {
        if (data.status === 200) {
            alert("✅ แจ้งเตือนไปยัง LINE ผู้ขายเรียบร้อยแล้ว!");
        } else {
            alert("❌ ไม่สามารถแจ้งเตือนไปยัง LINE ได้");
            console.error("LINE Notify Error:", data);
        }

        // ✅ ส่งลูกค้าไปที่ LINE Messenger พร้อมข้อมูลอัตโนมัติ
        let message = `📢 คำสั่งซื้อใหม่!\n\n👤 ชื่อ: ${name}\n🏠 ที่อยู่: ${address}\n📞 เบอร์โทร: ${phone}\n💰 ราคารวม: ${totalPrice} บาท\n\n🛍 รายการสินค้า:\n${orderDetails}`;
        let lineURL = `https://line.me/ti/p/~bk0704?text=${encodeURIComponent(message)}`;

        alert("✅ สั่งซื้อสำเร็จ! ระบบจะนำคุณไปยัง LINE เพื่อส่งข้อมูลการสั่งซื้อ");
        window.location.href = lineURL;

        // ✅ ล้างตะกร้าหลังจากสั่งซื้อสำเร็จ
        localStorage.removeItem("cart");
        localStorage.removeItem("totalPrice");
    })
    .catch(error => {
        console.error("Fetch Error:", error);
        alert("❌ เกิดข้อผิดพลาดในการส่งแจ้งเตือน");
    });
}

function downloadQRCode() {
    const qrImage = document.getElementById('qr-code');
    if (!qrImage.src || qrImage.src === window.location.href) {
        alert("QR Code ยังไม่ถูกโหลด กรุณาลองใหม่อีกครั้ง!");
        return;
    }

    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = "QR_Code_PromptPay.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
