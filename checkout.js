// =================================================================
// 🚨 ALERT: ต้องมั่นใจว่าในหน้าตะกร้ามีการบันทึกข้อมูลด้วยคีย์เหล่านี้:
// 1. customerInfo (ชื่อ, อีเมล, ที่อยู่, เบอร์โทร)
// 2. cartItems (รายการสินค้า)
// 3. totalPrice (ราคารวม)
// =================================================================

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. ดึงข้อมูลและกรอกฟอร์มอัตโนมัติ ---
    let savedCustomer = localStorage.getItem("customerInfo"); // ⬅️ เปลี่ยนจาก 'customerData' เป็น 'customerInfo'
    if (savedCustomer) {
        let c = JSON.parse(savedCustomer);
        document.getElementById("customer-name").value = c.name || "";
        document.getElementById("customer-email").value = c.email || "";
        document.getElementById("customer-address").value = c.address || "";
        document.getElementById("customer-phone").value = c.phone || "";
    }

    let cartData = localStorage.getItem("cartItems"); // ⬅️ เปลี่ยนจาก 'cart' เป็น 'cartItems'
    let totalPrice = localStorage.getItem("totalPrice");
    let cart = cartData ? JSON.parse(cartData) : [];

    if (cart.length === 0) {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กลับไปเลือกสินค้าก่อนทำการชำระเงิน");
        window.location.href = "index.html";
        return;
    }

    // --- 2. แสดงราคารวม ---
    if (totalPrice) {
        document.getElementById('display-price').textContent = Number(totalPrice).toLocaleString();
    }
    
    // --- 3. สร้าง QR Code พร้อมเพย์ ---
    let qrImage = document.getElementById("qr-code");
    let promptpayNumber = "0639392988";
    let qrLink = `https://promptpay.io/${promptpayNumber}/${totalPrice}.png`;

    if (qrImage) {
        qrImage.src = qrLink;
    } else {
        console.error("❌ ไม่พบ <img id='qr-code'> ใน HTML");
    }

    // --- 4. ผูกปุ่มยืนยันคำสั่งซื้อ ---
    document.getElementById('confirmOrderBtn').addEventListener('click', confirmOrder);
    
    // --- 5. แสดงตัวอย่างสลิป (เริ่มต้น) ---
    const slipPreviewContainer = document.getElementById('slipPreviewContainer');
    if (slipPreviewContainer && !document.getElementById('slipUpload').files.length) {
        slipPreviewContainer.classList.add('hidden');
    }
    
    // --- 6. แสดงรายการสินค้า (ส่วนที่ขาดในโค้ดเดิม) ---
    const orderItemsList = document.getElementById('order-items');
    orderItemsList.innerHTML = ''; 
    
    if (cart.length > 0) {
        cart.forEach(item => {
            const listItem = document.createElement('li');
            const itemTotal = item.quantity * item.price;
            
            listItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #ccc;">
                    <span>${item.name} (x${item.quantity})</span>
                    <span style="font-weight: bold;">${itemTotal.toLocaleString()} บาท</span>
                </div>
            `;
            orderItemsList.appendChild(listItem);
        });

        // เพิ่มราคารวมในส่วนสรุปรายการสินค้า
        const totalSummary = document.createElement('li');
        totalSummary.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 1.1em; border-top: 2px solid #d4af37;">
                <span>**รวมทั้งหมด**</span>
                <span style="color: #c0392b; font-weight: bold;">${Number(totalPrice).toLocaleString()} บาท</span>
            </div>
        `;
        orderItemsList.appendChild(totalSummary);
    }
});

// ✅ ฟังก์ชันแสดงตัวอย่างสลิป (เหมือนเดิม)
function previewSlip() {
    const input = document.getElementById('slipUpload');
    const file = input.files[0];
    if (!file) return;
    const img = document.getElementById('slipPreview');
    img.src = URL.createObjectURL(file);
    const container = document.getElementById('slipPreviewContainer');
    if (container) container.classList.remove('hidden');
}

// ✅ ฟังก์ชันส่งข้อมูลไปยังอีเมล (เปลี่ยนกลับไปใช้ EmailJS ตามที่อยู่ใน HTML เดิม)
function sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            emailjs.send("service_sfp9xjq", "template_order", {
                customer_name: name,
                customer_email: email,
                customer_address: address,
                customer_phone: phone,
                order_list: orderDetails, // Order details must be a string for the template
                order_total: totalPrice,
                slip_image: e.target.result // Base64 image
            })
            .then(() => resolve("✅ success"))
            .catch(err => reject(err));
        };
        reader.readAsDataURL(slipFile);
    });
}

// ✅ ฟังก์ชันยืนยันคำสั่งซื้อ + บันทึกข้อมูลลูกค้า (ปรับปรุง)
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

    let cart = JSON.parse(localStorage.getItem("cartItems")) || []; // ⬅️ ใช้ 'cartItems'
    if (cart.length === 0) {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กรุณาเลือกสินค้าใหม่");
        return;
    }

    // ⭐ บันทึกข้อมูลลูกค้าใส่ LocalStorage (ใช้ 'customerInfo')
    localStorage.setItem("customerInfo", JSON.stringify({
        name: name,
        email: email,
        address: address,
        phone: phone
    }));

    // สร้าง OrderDetails สำหรับ EmailJS (เป็นข้อความบรรทัดต่อบรรทัด)
    let orderDetails = cart.map(item => `📦 ${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n");
    let totalPrice = localStorage.getItem("totalPrice");

    sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile) // ⬅️ ใช้ EmailJS
    .then((result) => {
        if (result === "✅ success") {
            alert("✅ สั่งซื้อสำเร็จ! อีเมลยืนยันถูกส่งแล้ว");

            // ล้างข้อมูลตะกร้าหลังสั่งซื้อสำเร็จ
            localStorage.removeItem("cartItems");
            localStorage.removeItem("totalPrice");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        }
    })
    .catch(error => {
        console.error("❌ เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ:", error);
        alert("❌ เกิดข้อผิดพลาดในการส่งอีเมล กรุณาติดต่อทางร้านโดยตรง");
    });
}

// ✅ ฟังก์ชันดาวน์โหลด QR Code
function downloadQRCode() {
    const qrImage = document.getElementById('qr-code');
    if (!qrImage || !qrImage.src) {
        alert('⚠️ ไม่พบ QR Code');
        return;
    }
    
    // ดาวน์โหลดรูป QR Code
    const link = document.createElement('a');
    try {
        link.href = qrImage.src;
        link.download = 'BARAYA_PERFUME_QR_CODE.png';
        document.body.appendChild(link);
        link.click();
        
        if (window.toast) {
            toast.success('📥 กำลังดาวน์โหลด QR Code...');
        }
    } finally {
        // ลบ link element ไม่ว่าจะสำเร็จหรือไม่
        document.body.removeChild(link);
    }
}
