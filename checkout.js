// =================================================================
// 🚨 ALERT: ต้องมั่นใจว่าในหน้าตะกร้ามีการบันทึกข้อมูลด้วยคีย์เหล่านี้:
// 1. customerInfo (ชื่อ, อีเมล, ที่อยู่, เบอร์โทร)
// 2. cart (รายการสินค้า)
// 3. totalPrice (ราคารวม)
// =================================================================

// =================================================================
// 📧 EmailJS Configuration - ตั้งค่าก่อนใช้งาน
// =================================================================
// 1. สมัครบัญชีที่ https://www.emailjs.com/
// 2. สร้าง Email Service และ Template
// 3. ใส่ Service ID และ Template ID ด้านล่าง
// 4. ใส่ Public Key ใน checkout-modern.html
// 
// 💡 หากยังไม่ได้ตั้งค่า ระบบจะแสดงคำเตือนแต่ยังทำงานได้
// 📖 ดูคู่มือเต็มรูปแบบที่ EMAIL_SETUP_GUIDE.md
// =================================================================
const EMAILJS_SERVICE_ID = "service_sfp9xjq";
const EMAILJS_TEMPLATE_ID = "template_tcn8bod";

// Demo IDs for validation comparison
const DEMO_SERVICE_ID = "service_sfp9xjq";
const DEMO_TEMPLATE_ID = "template_tcn8bod";
// =================================================================

// ========== ฟังก์ชัน Validation ==========

/**
 * ตรวจสอบรูปแบบอีเมล
 * @param {string} email - อีเมลที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าอีเมลถูกต้อง
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * ตรวจสอบรูปแบบเบอร์โทรศัพท์ไทย (10 หลัก เริ่มต้นด้วย 0)
 * @param {string} phone - เบอร์โทรที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเบอร์โทรถูกต้อง
 */
function validatePhone(phone) {
    const re = /^0[0-9]{9}$/;
    return re.test(phone);
}

/**
 * ตรวจสอบขนาดไฟล์
 * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
 * @param {number} maxSizeMB - ขนาดสูงสุดเป็น MB (ค่าเริ่มต้น 5MB)
 * @returns {boolean} - true ถ้าขนาดไฟล์ไม่เกินที่กำหนด
 */
function validateFileSize(file, maxSizeMB = 5) {
    return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
 * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้าเป็นไฟล์รูปภาพ
 */
function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
}

/**
 * ตรวจสอบว่า EmailJS พร้อมใช้งานหรือไม่
 * @returns {boolean} - true ถ้า EmailJS พร้อมใช้งาน
 */
function isEmailJSReady() {
    return typeof emailjs !== 'undefined' && emailjs !== null;
}

// ========== ฟังก์ชัน Loading State ==========

/**
 * แสดง/ซ่อน Loading State
 * @param {boolean} isLoading - true เพื่อแสดง loading, false เพื่อซ่อน
 */
function setLoading(isLoading) {
    const btn = document.getElementById('confirmOrderBtn');
    if (!btn) {
        console.warn("⚠️ ไม่พบปุ่ม confirmOrderBtn");
        return;
    }
    
    if (isLoading) {
        btn.disabled = true;
        btn.setAttribute('data-original-text', btn.textContent);
        btn.textContent = '⏳ กำลังส่งข้อมูล...';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
    } else {
        btn.disabled = false;
        btn.textContent = btn.getAttribute('data-original-text') || '✅ ยืนยันคำสั่งซื้อ';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

/**
 * แสดง Visual Feedback สำหรับ Input Field
 * @param {HTMLElement} element - Input element
 * @param {boolean} isValid - true ถ้าข้อมูลถูกต้อง
 */
function setInputFeedback(element, isValid) {
    if (!element) return;
    
    if (isValid) {
        element.classList.remove('input-error');
        element.classList.add('input-valid');
    } else {
        element.classList.remove('input-valid');
        element.classList.add('input-error');
    }
}

/**
 * ล้าง Visual Feedback ทั้งหมด
 */
function clearAllFeedback() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.classList.remove('input-error', 'input-valid');
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Checkout page loaded");
    
    // ตรวจสอบว่า EmailJS พร้อมใช้งานหรือไม่
    if (!isEmailJSReady()) {
        console.warn("⚠️ EmailJS is not loaded yet. Some features may not work.");
    } else {
        console.log("✅ EmailJS is ready");
        // แสดง EmailJS User ID เพื่อการ Debug (ใช้ internal property _userID)
        // หมายเหตุ: _userID เป็น internal property ที่อาจเปลี่ยนในอนาคต แต่มีประโยชน์สำหรับ debugging
        console.log("📧 EmailJS User ID:", emailjs && emailjs._userID);
    }
    
    // --- 1. ดึงข้อมูลและกรอกฟอร์มอัตโนมัติ ---
    let savedCustomer = localStorage.getItem("customerInfo"); // ⬅️ เปลี่ยนจาก 'customerData' เป็น 'customerInfo'
    if (savedCustomer) {
        let c = JSON.parse(savedCustomer);
        document.getElementById("customer-name").value = c.name || "";
        document.getElementById("customer-email").value = c.email || "";
        document.getElementById("customer-address").value = c.address || "";
        document.getElementById("customer-phone").value = c.phone || "";
    }

    let cartData = localStorage.getItem("cart"); // ⬅️ ใช้ 'cart' ให้ตรงกับ script.js
    let totalPrice = localStorage.getItem("totalPrice");
    let cart = cartData ? JSON.parse(cartData) : [];

    if (cart.length === 0) {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กลับไปเลือกสินค้าก่อนทำการชำระเงิน");
        window.location.href = "index.html"; // หรือหน้าที่ถูกต้อง
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
    const confirmBtn = document.getElementById('confirmOrderBtn');
    if (confirmBtn) {
        // Use addEventListener for better control and avoid duplicate handlers
        confirmBtn.addEventListener('click', confirmOrder);
    } else {
        console.error("❌ ไม่พบปุ่มยืนยันคำสั่งซื้อ (ID: confirmOrderBtn)");
    }
    
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

/**
 * ตรวจสอบว่า EmailJS Configuration ถูกตั้งค่าแล้วหรือไม่
 * @returns {object} - { isValid: boolean, missingConfig: string[], warning: string[] }
 */
function validateEmailJSConfig() {
    const missingConfig = [];
    const warnings = [];
    
    // Check if IDs are still using default demo values
    if (EMAILJS_SERVICE_ID === DEMO_SERVICE_ID) {
        warnings.push("Service ID ยังเป็นค่าเริ่มต้น กรุณาอัปเดตเป็นของคุณเอง");
    }
    if (EMAILJS_TEMPLATE_ID === DEMO_TEMPLATE_ID) {
        warnings.push("Template ID ยังเป็นค่าเริ่มต้น กรุณาอัปเดตเป็นของคุณเอง");
    }
    
    // Check if IDs are empty
    if (!EMAILJS_SERVICE_ID) {
        missingConfig.push("Service ID");
    }
    if (!EMAILJS_TEMPLATE_ID) {
        missingConfig.push("Template ID");
    }
    
    return {
        isValid: missingConfig.length === 0,
        missingConfig: missingConfig,
        warnings: warnings
    };
}

/**
 * บีบอัดและลดขนาดรูปภาพให้พอดีกับข้อจำกัดของ EmailJS (50KB)
 * @param {File} file - ไฟล์รูปภาพที่ต้องการบีบอัด
 * @param {number} maxSizeKB - ขนาดสูงสุดเป็น KB (ค่าเริ่ต้น 45KB เพื่อความปลอดภัย)
 * @returns {Promise<string>} - Base64 string ของรูปภาพที่บีบอัดแล้ว
 */
function compressImageForEmail(file, maxSizeKB = 45) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // เริ่มต้นด้วยขนาดปกติ
                let width = img.width;
                let height = img.height;
                
                // ถ้ารูปใหญ่เกินไป ลดขนาดลงก่อน
                const maxDimension = 800; // ขนาดสูงสุดด้านใดด้านหนึ่ง
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // ลดคุณภาพจนกว่าจะได้ขนาดที่ต้องการ (ใช้ loop แทน recursion เพื่อหลีกเลี่ยง stack overflow)
                let quality = 0.7; // เริ่มที่ quality 70%
                let base64 = '';
                let sizeKB = 0;
                
                while (quality > 0.1) {
                    base64 = canvas.toDataURL('image/jpeg', quality);
                    // Extract base64 data without the data URL prefix (data:image/jpeg;base64,)
                    const base64Data = base64.split(',')[1];
                    // Base64 uses 4 characters to represent 3 bytes, so multiply by 0.75 to get binary size
                    sizeKB = (base64Data.length * 0.75) / 1024;
                    
                    console.log(`🔄 กำลังบีบอัด: quality=${quality.toFixed(2)}, size=${sizeKB.toFixed(2)}KB`);
                    
                    if (sizeKB <= maxSizeKB) {
                        // ได้ขนาดที่ต้องการแล้ว
                        console.log(`✅ บีบอัดสำเร็จ: ขนาดสุดท้าย ${sizeKB.toFixed(2)}KB`);
                        resolve(base64);
                        return;
                    }
                    
                    // ยังใหญ่เกินไป ลด quality ลงอีก
                    quality -= 0.1;
                }
                
                // ถ้าลด quality จนต่ำสุดแล้วยังใหญ่เกินไป ใช้ค่าที่ได้
                console.log(`⚠️ บีบอัดที่ quality ต่ำสุดแล้ว: ขนาดสุดท้าย ${sizeKB.toFixed(2)}KB`);
                resolve(base64);
            };
            
            img.onerror = function() {
                reject(new Error('ไม่สามารถโหลดรูปภาพได้'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        };
        
        reader.readAsDataURL(file);
    });
}

async function sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile) {
    // ตรวจสอบว่า EmailJS Configuration ถูกตั้งค่าแล้วหรือไม่
    const configValidation = validateEmailJSConfig();
    
    // ถ้าขาดข้อมูลที่จำเป็น ให้แจ้ง error
    if (!configValidation.isValid) {
        const errorMsg = `กรุณาตั้งค่า EmailJS ก่อนใช้งาน: ${configValidation.missingConfig.join(", ")}`;
        console.error("❌ " + errorMsg);
        throw {
            status: 400,
            text: errorMsg,
            isConfigError: true
        };
    }
    
    // ถ้ามี warnings แต่ยังใช้งานได้ ให้แสดงใน console
    if (configValidation.warnings.length > 0) {
        console.warn("⚠️ EmailJS Configuration Warnings:");
        configValidation.warnings.forEach(w => console.warn("  - " + w));
    }
    
    console.log("📤 Sending email with:", {
        service: EMAILJS_SERVICE_ID,
        template: EMAILJS_TEMPLATE_ID,
        customerEmail: email
    });
    
    try {
        // บีบอัดรูปภาพให้เหลือไม่เกิน 45KB (เพื่อให้พอดีกับข้อจำกัด 50KB ของ EmailJS)
        console.log("🔄 กำลังบีบอัดรูปภาพ...");
        const compressedBase64 = await compressImageForEmail(slipFile, 45);
        // Extract base64 data without the data URL prefix for accurate size calculation
        const base64Data = compressedBase64.split(',')[1];
        const sizeKB = (base64Data.length * 0.75) / 1024;
        console.log(`📊 ขนาดรูปภาพหลังบีบอัด: ${sizeKB.toFixed(2)} KB`);
        
        // ส่งอีเมลด้วยรูปภาพที่บีบอัดแล้ว
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            customer_name: name,
            customer_email: email,
            customer_address: address,
            customer_phone: phone,
            order_list: orderDetails,
            order_total: totalPrice,
            slip_image: compressedBase64
        });
        
        return "✅ success";
        
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการบีบอัดหรือส่งอีเมล:", error);
        throw {
            status: error.status || 500,
            text: error.message || "ไม่สามารถประมวลผลรูปภาพหรือส่งอีเมลได้"
        };
    }
}

// ✅ ฟังก์ชันยืนยันคำสั่งซื้อ + บันทึกข้อมูลลูกค้า (ปรับปรุง)
function confirmOrder() {
    console.log("📝 เริ่มการยืนยันคำสั่งซื้อ...");
    
    // ล้าง feedback เก่า
    clearAllFeedback();
    
    // ดึงข้อมูลจากฟอร์ม
    const nameInput = document.getElementById("customer-name");
    const emailInput = document.getElementById("customer-email");
    const addressInput = document.getElementById("customer-address");
    const phoneInput = document.getElementById("customer-phone");
    const slipInput = document.getElementById("slipUpload");
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const address = addressInput.value.trim();
    const phone = phoneInput.value.trim();
    const slipFile = slipInput.files[0];
    
    console.log("📋 ข้อมูลที่ได้รับ:", { name, email, address, phone, hasSlip: !!slipFile });
    
    // ========== ตรวจสอบข้อมูลทีละฟิลด์ ==========
    
    // ตรวจสอบชื่อ-นามสกุล
    if (!name) {
        setInputFeedback(nameInput, false);
        alert("⚠️ กรุณากรอกชื่อ-นามสกุล");
        nameInput.focus();
        return;
    }
    setInputFeedback(nameInput, true);
    
    // ตรวจสอบอีเมล
    if (!email) {
        setInputFeedback(emailInput, false);
        alert("⚠️ กรุณากรอกอีเมล");
        emailInput.focus();
        return;
    }
    if (!validateEmail(email)) {
        setInputFeedback(emailInput, false);
        alert("⚠️ รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง\nตัวอย่าง: example@gmail.com");
        emailInput.focus();
        return;
    }
    setInputFeedback(emailInput, true);
    
    // ตรวจสอบที่อยู่
    if (!address) {
        setInputFeedback(addressInput, false);
        alert("⚠️ กรุณากรอกที่อยู่สำหรับจัดส่ง");
        addressInput.focus();
        return;
    }
    setInputFeedback(addressInput, true);
    
    // ตรวจสอบเบอร์โทรศัพท์
    if (!phone) {
        setInputFeedback(phoneInput, false);
        alert("⚠️ กรุณากรอกเบอร์โทรศัพท์");
        phoneInput.focus();
        return;
    }
    if (!validatePhone(phone)) {
        setInputFeedback(phoneInput, false);
        alert("⚠️ รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง\nกรุณากรอกเบอร์โทร 10 หลัก เริ่มต้นด้วย 0\nตัวอย่าง: 0812345678");
        phoneInput.focus();
        return;
    }
    setInputFeedback(phoneInput, true);
    
    // ตรวจสอบสลิปการโอนเงิน
    if (!slipFile) {
        alert("⚠️ กรุณาอัปโหลดสลิปการโอนเงิน");
        slipInput.focus();
        return;
    }
    
    // ตรวจสอบว่าไฟล์เป็นรูปภาพ
    if (!validateImageFile(slipFile)) {
        alert("⚠️ ไฟล์สลิปต้องเป็นรูปภาพ (JPEG, PNG, GIF, WEBP เท่านั้น)");
        return;
    }
    
    // ตรวจสอบขนาดไฟล์สลิป (ไม่เกิน 5MB)
    if (!validateFileSize(slipFile, 5)) {
        const fileSizeMB = (slipFile.size / (1024 * 1024)).toFixed(2);
        alert(`⚠️ ไฟล์สลิปมีขนาดใหญ่เกินไป (${fileSizeMB} MB)\nกรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5 MB`);
        return;
    }
    
    // ตรวจสอบตะกร้าสินค้า
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("⚠️ ตะกร้าสินค้าว่างเปล่า! กรุณาเลือกสินค้าใหม่");
        return;
    }
    
    // ตรวจสอบว่า EmailJS พร้อมใช้งาน
    if (!isEmailJSReady()) {
        console.error("❌ EmailJS is not available");
        alert("⚠️ ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณารอสักครู่แล้วลองใหม่\nหากปัญหายังคงอยู่ กรุณาติดต่อทางร้าน");
        return;
    }

    // ⭐ บันทึกข้อมูลลูกค้าใส่ LocalStorage (ใช้ 'customerInfo')
    localStorage.setItem("customerInfo", JSON.stringify({
        name: name,
        email: email,
        address: address,
        phone: phone
    }));
    console.log("💾 บันทึกข้อมูลลูกค้าสำเร็จ");

    // สร้าง OrderDetails สำหรับ EmailJS (เป็นข้อความบรรทัดต่อบรรทัด)
    let orderDetails = cart.map(item => `📦 ${item.name} x${item.quantity} - ${item.price * item.quantity} บาท`).join("\n");
    let totalPrice = localStorage.getItem("totalPrice");
    
    console.log("📧 กำลังส่งข้อมูลไปยัง EmailJS...");
    console.log("📋 Order Details:", orderDetails);
    console.log("💰 Total Price:", totalPrice);
    
    // แสดง Loading State
    setLoading(true);

    sendOrderToEmail(name, email, address, phone, orderDetails, totalPrice, slipFile)
    .then((result) => {
        console.log("✅ ส่งอีเมลสำเร็จ:", result);
        setLoading(false);
        
        if (result === "✅ success") {
            alert("✅ สั่งซื้อสำเร็จ!\n\n" +
                  "📧 อีเมลยืนยันถูกส่งไปยังอีเมลของคุณแล้ว\n" +
                  "📨 เจ้าของร้านได้รับคำสั่งซื้อและจะติดต่อกลับเร็วๆ นี้\n\n" +
                  "ขอบคุณที่ใช้บริการ BARAYA PERFUME ❤️\n" +
                  "กำลังพาคุณกลับสู่หน้าหลัก...");

            // ล้างข้อมูลตะกร้าหลังสั่งซื้อสำเร็จ
            localStorage.removeItem("cart");
            localStorage.removeItem("totalPrice");
            console.log("🗑️ ล้างข้อมูลตะกร้าสำเร็จ");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        }
    })
    .catch(error => {
        console.error("❌ เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ:", error);
        setLoading(false);
        
        // แสดง Error Message ที่ละเอียดมากขึ้น
        let errorMessage = "❌ เกิดข้อผิดพลาดในการส่งอีเมล\n\n";
        
        // ตรวจสอบว่าเป็น Configuration Error หรือไม่
        if (error.isConfigError) {
            errorMessage += "สาเหตุ: ยังไม่ได้ตั้งค่า EmailJS\n";
            errorMessage += "กรุณาตั้งค่า Service ID และ Template ID ในไฟล์ checkout.js\n\n";
            errorMessage += "วิธีแก้ไข:\n";
            errorMessage += "1. สมัครบัญชี EmailJS ที่ https://www.emailjs.com/\n";
            errorMessage += "2. สร้าง Email Service และ Template\n";
            errorMessage += "3. คัดลอก Service ID, Template ID และ Public Key\n";
            errorMessage += "4. แก้ไขค่าในไฟล์ checkout.js และ checkout-modern.html";
        } else if (error.status === 400 && error.text && error.text.includes('template')) {
            errorMessage += "สาเหตุ: ไม่พบ Email Template\n";
            errorMessage += "กรุณาตรวจสอบ Template ID ใน EmailJS Dashboard\n";
            errorMessage += "https://dashboard.emailjs.com/admin/templates";
        } else if (error.status === 400 && error.text && error.text.includes('service')) {
            errorMessage += "สาเหตุ: ไม่พบ Email Service\n";
            errorMessage += "กรุณาตรวจสอบ Service ID ใน EmailJS Dashboard\n";
            errorMessage += "https://dashboard.emailjs.com/admin";
        } else if (error.status === 400) {
            errorMessage += "สาเหตุ: ข้อมูลที่ส่งไม่ถูกต้อง\nกรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง";
        } else if (error.status === 401 || error.status === 403) {
            errorMessage += "สาเหตุ: Public Key ไม่ถูกต้อง\n";
            errorMessage += "กรุณาตรวจสอบ Public Key ใน EmailJS\n";
            errorMessage += "https://dashboard.emailjs.com/admin/account";
        } else if (error.status === 429) {
            errorMessage += "สาเหตุ: ส่งคำขอมากเกินไป\nกรุณารอสักครู่แล้วลองใหม่อีกครั้ง (ประมาณ 1-2 นาที)";
        } else if (error.text) {
            errorMessage += `รายละเอียด: ${error.text}\nแนะนำ: กรุณาลดขนาดไฟล์สลิปหรือติดต่อทางร้านโดยตรง`;
        } else {
            errorMessage += "กรุณาลองใหม่อีกครั้ง หรือติดต่อทางร้านโดยตรง\n\nหมายเลขโทร: 063-939-2988\nLine: @barayaperfume";
        }
        
        alert(errorMessage);
        
        // แสดงปุ่มติดต่อทางร้านหากมีข้อผิดพลาดครบ 3 ครั้ง
        // ค่านี้เป็น threshold ที่เหมาะสมสำหรับการแจ้งเตือน fallback option
        const MAX_ERROR_COUNT = 3;
        let errorCount = parseInt(sessionStorage.getItem('checkoutErrorCount') || '0');
        errorCount++;
        sessionStorage.setItem('checkoutErrorCount', errorCount);

        if (errorCount >= MAX_ERROR_COUNT) {
            const manualBtn = document.getElementById('manualSubmitBtn');
            if (manualBtn) {
                manualBtn.style.display = 'block';
                manualBtn.onclick = () => {
                    window.open('https://line.me/R/ti/p/@barayaperfume', '_blank');
                };
            }
        }
    });
}

// ✅ ฟังก์ชันแสดงตัวอย่างสลิป
function previewSlip() {
    let slipFile = document.getElementById("slipUpload").files[0];
    let slipPreview = document.getElementById("slipPreview");
    let slipPreviewContainer = document.getElementById("slipPreviewContainer");

    if (slipFile) {
        let reader = new FileReader();
        reader.onload = function(e) {
            slipPreview.src = e.target.result;
            slipPreviewContainer.classList.remove("hidden");
        };
        reader.readAsDataURL(slipFile);
    }
}

// ✅ ฟังก์ชันดาวน์โหลด QR Code
function downloadQRCode() {
    let qrImage = document.getElementById("qr-code");
    if (qrImage && qrImage.src) {
        let link = document.createElement("a");
        link.href = qrImage.src;
        link.download = "qr-payment.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("❌ ไม่สามารถดาวน์โหลด QR Code ได้");
    }
}

