let cart = [];

const productImages = {
    "AQUA.M": "AQUA.M.png",
    "BOMSHELL": "BOMSHELL.png",
    "BOMBSHELL": "BOMSHELL.png",
    "FIRST LOVE": "FIRST LOVE.png",
    "MONG BLACK": "MONG BLACK.png",
    "VIN VIN": "VIN VIN.png",
    "BERRY": "BERRY.png",
    "BERRY HER": "BERRY.png",
    "READY PINK": "READY PINK.png",
    "BLACK. M": "BLACK M..png",
    "BLACK.M": "BLACK M..png",
    "CRYSTAL": "CRYSTAL.png"
};

function getProductImage(name) {
    return productImages[name] || productImages[name?.toUpperCase?.()] || "BARAYA.png";
}

// โหลดตะกร้าจาก LocalStorage เมื่อเปิดหน้าเว็บ
document.addEventListener("DOMContentLoaded", function() {
    try {
        let storedCart = localStorage.getItem("cartItems");
        let storedTotal = localStorage.getItem("totalPrice");

        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (error) {
        console.error("localStorage ใช้งานไม่ได้:", error);
    }

    updateCart();
    setupLineOrderButton();
});

function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    let image = getProductImage(name);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.image = existingItem.image || image;
    } else {
        cart.push({ name, price, quantity: 1, image });
    }

    updateCart();
}

function removeFromCart(name) {
    if (cart.length === 0) return; // ป้องกันข้อผิดพลาดถ้าตะกร้าว่าง

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

function updateCart() {
    let cartList = document.getElementById("cart-items");
    let totalPriceElement = document.getElementById("total-price");
    let cartCountElement = document.getElementById("cart-count");
    let lineOrderButton = document.getElementById("lineOrderButton");

    if (!cartList || !totalPriceElement || !cartCountElement) {
        console.error("Cart elements not found");
        return;
    }

    cartList.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        item.image = item.image || getProductImage(item.name);

        let li = document.createElement("li");
        li.className = "cart-item";

        let img = document.createElement("img");
        img.className = "cart-item-image";
        img.src = item.image;
        img.alt = item.name;

        let details = document.createElement("div");
        details.className = "cart-item-details";

        let title = document.createElement("strong");
        title.textContent = item.name;

        let meta = document.createElement("span");
        meta.textContent = `จำนวน ${item.quantity} ชิ้น - ${item.price * item.quantity} บาท`;

        details.appendChild(title);
        details.appendChild(meta);

        let removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "❌ ลบ";
        removeButton.addEventListener("click", () => removeFromCart(item.name));

        li.appendChild(img);
        li.appendChild(details);
        li.appendChild(removeButton);
        cartList.appendChild(li);
        total += item.price * item.quantity;
        totalItems += item.quantity;
    });

    cartCountElement.textContent = totalItems;
    totalPriceElement.textContent = `ราคารวม: ${total} บาท`;

    // Update cart count animation
    if (window.updateCartCountAnimated) {
        updateCartCountAnimated(totalItems);
    }

    // บันทึกลง LocalStorage
    localStorage.setItem("cartItems", JSON.stringify(cart));
    localStorage.setItem("totalPrice", total);

    // เก็บ fallback URL ไว้ใช้เฉพาะกรณีที่แชร์รูปไม่ได้
    if (lineOrderButton) {
        let message = cart.length > 0 
            ? `สวัสดีค่ะ! ฉันต้องการสั่งซื้อสินค้า BARAYA PERFUME:\n\n${cart.map(item => `🌸 ${item.name} x${item.quantity} = ${item.price * item.quantity} บาท`).join("\n")}\n\n💰 ยอดรวม: ${total} บาท`
            : "สวัสดีค่ะ! ฉันต้องการสอบถามข้อมูลเพิ่มเติมเกี่ยวกับน้ำหอม BARAYA PERFUME";

        // LINE ID: bk0704
        let lineURL = `https://line.me/ti/p/~bk0704?text=${encodeURIComponent(message)}`;
        
        lineOrderButton.href = lineURL;
        lineOrderButton.dataset.lineUrl = lineURL;
        
        console.log('🔵 LINE URL updated:', lineURL);
    }
}

function waitForImages(container) {
    const images = Array.from(container.querySelectorAll("img"));
    return Promise.all(images.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

function isLineInAppBrowser() {
    return /Line\//i.test(navigator.userAgent);
}

function isIOSBrowser() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (
        navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
    );
}

function showImageSavePreview(imageUrl, filename, revokeUrl, options = {}) {
    const existingModal = document.querySelector(".image-save-modal");
    if (existingModal) existingModal.remove();

    const title = options.title || "บันทึกรูปภาพ";
    const help = options.help || "ใน LINE ให้กดค้างที่รูป แล้วเลือกบันทึกรูปภาพ";
    const actionLabel = options.actionLabel || "ดาวน์โหลดอีกครั้ง";
    const secondaryLabel = options.secondaryLabel || "";
    const secondaryUrl = options.secondaryUrl || "";

    const modal = document.createElement("div");
    modal.className = "image-save-modal";
    modal.innerHTML = `
        <div class="image-save-panel" role="dialog" aria-modal="true" aria-label="บันทึกรูปภาพ">
            <button type="button" class="image-save-close" aria-label="ปิด">×</button>
            <div class="image-save-title">${title}</div>
            <p class="image-save-help">${help}</p>
            <img class="image-save-preview" src="${imageUrl}" alt="${filename}">
            <button type="button" class="image-save-download">${actionLabel}</button>
            ${secondaryUrl ? `<a class="image-save-secondary" href="${secondaryUrl}" target="_blank" rel="noopener">${secondaryLabel}</a>` : ""}
        </div>
    `;

    const closeModal = () => {
        modal.remove();
        if (revokeUrl) {
            setTimeout(() => URL.revokeObjectURL(imageUrl), 100);
        }
    };

    modal.querySelector(".image-save-close").addEventListener("click", closeModal);
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });
    modal.querySelector(".image-save-download").addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    document.body.appendChild(modal);
}

async function createOrderImageBlob() {
    if (cart.length === 0) {
        throw new Error("กรุณาเพิ่มสินค้าลงตะกร้าก่อน");
    }

    if (typeof html2canvas === "undefined") {
        throw new Error("โปรดรีเฟรชหน้าเว็บแล้วลองใหม่");
    }

    const captureElement = createOrderCaptureElement();
    document.body.appendChild(captureElement);

    try {
        await waitForImages(captureElement);

        const canvas = await html2canvas(captureElement, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
            allowTaint: true
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png", 1));
        if (!blob) throw new Error("ไม่สามารถสร้างรูปภาพได้");
        return blob;
    } finally {
        captureElement.remove();
    }
}

async function saveImageBlob(blob, filename, shareTitle, shareText) {
    const shouldUsePreview = isLineInAppBrowser() || isIOSBrowser();

    if (!shouldUsePreview && typeof File !== "undefined") {
        const file = new File([blob], filename, { type: blob.type || "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: shareTitle,
                text: shareText
            });
            return;
        }
    }

    const url = URL.createObjectURL(blob);

    if (shouldUsePreview) {
        showImageSavePreview(url, filename, true);
        return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

async function shareImageBlob(blob, filename, shareTitle, shareText, fallbackUrl) {
    if (typeof File !== "undefined" && navigator.share) {
        const file = new File([blob], filename, { type: blob.type || "image/png" });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: shareTitle,
                    text: shareText
                });
                return true;
            } catch (error) {
                if (error.name === "AbortError") {
                    return true;
                }
                console.warn("Native image share failed, showing preview fallback:", error);
            }
        }
    }

    const url = URL.createObjectURL(blob);
    showImageSavePreview(url, filename, true, {
        title: "แชร์รูปออเดอร์",
        help: "เครื่องนี้ยังแชร์ไฟล์รูปตรงๆ ไม่ได้ ให้กดค้างที่รูปเพื่อบันทึก แล้วส่งรูปนี้ใน LINE",
        actionLabel: "ดาวน์โหลดรูป",
        secondaryLabel: fallbackUrl ? "เปิด LINE พร้อมข้อความ" : "",
        secondaryUrl: fallbackUrl || ""
    });
    return false;
}

async function shareCartOrderImage() {
    if (cart.length === 0) {
        const lineButton = document.getElementById("lineOrderButton");
        if (lineButton?.dataset.lineUrl) {
            window.open(lineButton.dataset.lineUrl, "_blank");
            return;
        }

        alert("⚠️ กรุณาเพิ่มสินค้าลงตะกร้าก่อนแชร์ออเดอร์");
        return;
    }

    let blob;
    try {
        if (window.showLoading) showLoading("กำลังสร้างรูปออเดอร์...");
        blob = await createOrderImageBlob();
        await shareImageBlob(
            blob,
            `BARAYA_ORDER_${Date.now()}.png`,
            "BARAYA PERFUME ORDER",
            "รูปออเดอร์ BARAYA PERFUME",
            document.getElementById("lineOrderButton")?.dataset.lineUrl || ""
        );
    } catch (error) {
        console.error("Share order image failed:", error);
        alert("❌ ไม่สามารถแชร์รูปออเดอร์ได้: " + error.message);
    } finally {
        if (window.hideLoading) hideLoading();
    }
}

function setupLineOrderButton() {
    const lineOrderButton = document.getElementById("lineOrderButton");
    if (!lineOrderButton || lineOrderButton.dataset.imageShareReady === "true") return;

    lineOrderButton.dataset.imageShareReady = "true";
    lineOrderButton.addEventListener("click", async event => {
        event.preventDefault();
        await shareCartOrderImage();
    });
}

function createOrderCaptureElement() {
    let total = 0;
    let totalItems = 0;
    const capture = document.createElement("div");
    capture.className = "order-capture";

    const header = document.createElement("div");
    header.className = "order-capture-header";
    header.innerHTML = `
        <div class="order-brand">BARAYA PERFUME</div>
        <div class="order-title">รายการออเดอร์</div>
    `;
    capture.appendChild(header);

    const list = document.createElement("div");
    list.className = "order-capture-list";

    cart.forEach(item => {
        const image = item.image || getProductImage(item.name);
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        totalItems += item.quantity;

        const row = document.createElement("div");
        row.className = "order-capture-item";
        row.innerHTML = `
            <img class="order-capture-image" src="${image}" alt="${item.name}">
            <div class="order-capture-details">
                <strong>${item.name}</strong>
                <span>${item.price} บาท / ชิ้น</span>
            </div>
            <div class="order-capture-qty">x${item.quantity}</div>
            <div class="order-capture-price">${lineTotal} บาท</div>
        `;
        list.appendChild(row);
    });

    capture.appendChild(list);

    const totalBox = document.createElement("div");
    totalBox.className = "order-capture-total";
    totalBox.innerHTML = `
        <span>รวม ${totalItems} ชิ้น</span>
        <strong>${total} บาท</strong>
    `;
    capture.appendChild(totalBox);

    const footer = document.createElement("div");
    footer.className = "order-capture-footer";
    footer.textContent = "ส่งรูปนี้ให้ร้านเพื่อยืนยันรายการสินค้า";
    capture.appendChild(footer);

    return capture;
}

async function saveCartOrderImage() {
    if (cart.length === 0) {
        alert("⚠️ กรุณาเพิ่มสินค้าลงตะกร้าก่อนบันทึกออเดอร์");
        return;
    }

    if (typeof html2canvas === "undefined") {
        alert("❌ โปรดรีเฟรชหน้าเว็บแล้วลองใหม่");
        return;
    }

    try {
        if (window.showLoading) showLoading("กำลังสร้างรูปออเดอร์...");

        const blob = await createOrderImageBlob();

        await saveImageBlob(
            blob,
            `BARAYA_ORDER_${Date.now()}.png`,
            "BARAYA PERFUME ORDER",
            "รายการสินค้าที่ต้องการสั่งซื้อ"
        );

        if (window.toast) {
            const message = isLineInAppBrowser() || isIOSBrowser()
                ? "เปิดรูปสำหรับบันทึกแล้ว"
                : "บันทึกรูปออเดอร์สำเร็จ!";
            toast.success(message);
        } else {
            const message = isLineInAppBrowser() || isIOSBrowser()
                ? "✅ เปิดรูปแล้ว กรุณากดค้างที่รูปเพื่อบันทึก"
                : "✅ บันทึกรูปออเดอร์สำเร็จ!";
            alert(message);
        }
    } catch (error) {
        console.error("Save order image failed:", error);
        alert("❌ เกิดข้อผิดพลาด: " + error.message);
    } finally {
        if (window.hideLoading) hideLoading();
    }
}

window.saveCartOrderImage = saveCartOrderImage;
window.shareCartOrderImage = shareCartOrderImage;
window.showImageSavePreview = showImageSavePreview;

function toggleCart() {
    let cartElement = document.getElementById("cart");
    if (!cartElement) {
        console.error("❌ ไม่พบ <div id='cart'> ใน HTML");
        return;
    }
    
    // ใช้ class 'show' แทน 'hidden' สำหรับ modern design
    if (cartElement.classList.contains('show')) {
        cartElement.classList.remove('show');
    } else {
        cartElement.classList.add('show');
        // ลบ hidden class ถ้ามี (สำหรับ compatibility)
        cartElement.classList.remove('hidden');
    }
    
    console.log('Cart toggled, classes:', cartElement.className);
}
