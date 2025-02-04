document.addEventListener("DOMContentLoaded", function() {
    let cartData = localStorage.getItem("cart");
    let totalPrice = localStorage.getItem("totalPrice");
    
    if (!cartData) {
        alert("ตะกร้าสินค้าว่างเปล่า!");
        window.location.href = "index.html";
    }

    let cart = JSON.parse(cartData);
    let qrImage = document.getElementById("qr-code");

    // สร้าง QR Code สำหรับชำระเงิน (ตัวอย่างลิงก์ PromptPay QR)
    let promptpayNumber = "0812345678";  // เปลี่ยนเป็นเบอร์โทร PromptPay จริง
    let qrLink = `https://promptpay.io/${promptpayNumber}/${totalPrice}.png`;
    qrImage.src = qrLink;
});

function confirmOrder() {
    let name = document.getElementById("customer-name").value;
    let address = document.getElementById("customer-address").value;
    let phone = document.getElementById("customer-phone").value;

    if (!name || !address || !phone) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    let orderData = {
        name: name,
        address: address,
        phone: phone,
        cart: JSON.parse(localStorage.getItem("cart")),
        totalPrice: localStorage.getItem("totalPrice")
    };

    console.log("คำสั่งซื้อ:", orderData);
    
    alert("✅ คำสั่งซื้อถูกบันทึกแล้ว! กรุณาส่งหลักฐานการโอนผ่าน LINE");

    // เปลี่ยนเส้นทางไปยัง LINE พร้อมข้อมูล
    let message = `สวัสดี! ฉันได้ทำการสั่งซื้อสินค้าแล้ว\nชื่อ: ${name}\nที่อยู่: ${address}\nเบอร์โทร: ${phone}\nราคารวม: ${orderData.totalPrice} บาท`;
    let lineURL = `https://line.me/ti/p/~bk0704?text=${encodeURIComponent(message)}`;
    window.location.href = lineURL;

    // ล้างตะกร้าหลังสั่งซื้อ
    localStorage.removeItem("cart");
    localStorage.removeItem("totalPrice");
}
