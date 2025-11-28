<?php
header('Content-Type: text/plain; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// Log ข้อมูลที่ได้รับ
error_log("📩 POST: " . print_r($_POST, true));
error_log("📎 FILES: " . print_r($_FILES, true));

$mail = new PHPMailer(true);

try {

    // --------------------------
    // 1) รับและตรวจสอบข้อมูล
    // --------------------------
    function safe($v) { return htmlspecialchars(trim($v), ENT_QUOTES, 'UTF-8'); }

    $customer_name    = safe($_POST['name'] ?? '');
    $customer_email   = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $customer_address = safe($_POST['address'] ?? '');
    $customer_phone   = safe($_POST['phone'] ?? '');
    $total_price      = safe($_POST['totalPrice'] ?? '');
    $order_details_raw = $_POST['orderDetails'] ?? '';

    if (!$customer_email || empty($customer_name)) {
        throw new Exception("ข้อมูลลูกค้าไม่ครบถ้วน");
    }

    // แปลงรายการสินค้าเป็น HTML
    $order_details = nl2br(htmlspecialchars($order_details_raw, ENT_QUOTES, 'UTF-8'));

    // --------------------------
    // 2) ตั้งค่า SMTP
    // --------------------------
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'Barame07042536@gmail.com';
    $mail->Password   = 'eezk fcqb hjgj auhb';  // Gmail App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // ผู้ส่ง
    $mail->setFrom('Barame07042536@gmail.com', 'BARAYA PERFUME');

    // --------------------------
    // 3) ส่งอีเมลให้ร้านค้า
    // --------------------------
    $mail->addAddress('Barame07042536@gmail.com', 'เจ้าของร้าน');
    $mail->isHTML(true);
    $mail->Subject = "🛍️ มีคำสั่งซื้อใหม่เข้ามา!";

    $mail->Body = "
        <h2>🛍️ คำสั่งซื้อใหม่จากหน้าเว็บ</h2>
        <p><b>ชื่อลูกค้า:</b> $customer_name</p>
        <p><b>อีเมล:</b> $customer_email</p>
        <p><b>ที่อยู่:</b> $customer_address</p>
        <p><b>เบอร์โทร:</b> $customer_phone</p>
        <p><b>ราคารวม:</b> $total_price บาท</p>
        <hr>
        <h3>📦 รายการที่สั่ง:</h3>
        <p>$order_details</p>
        <hr>
        <p style='color:#28a745;font-weight:bold;'>โปรดเตรียมการแพ็คสินค้าด่วน ✔</p>
    ";

    $mail->send();

    // --------------------------
    // 4) ส่งอีเมลยืนยันให้ลูกค้า
    // --------------------------
    $mail->clearAddresses();
    $mail->addAddress($customer_email);

    $mail->Subject = "📦 คำสั่งซื้อของคุณได้รับแล้ว - BARAYA PERFUME";

    $mail->Body = "
        <h2>🌸 ขอบคุณสำหรับการสั่งซื้อค่ะ!</h2>
        <p>คุณได้ทำการสั่งซื้อสินค้าจากร้าน <b>BARAYA PERFUME</b></p>
        <p><b>ยอดรวมทั้งหมด:</b> $total_price บาท</p>
        <hr>
        <h3>📦 รายการสินค้าที่คุณสั่ง:</h3>
        <p>$order_details</p>
        <hr>
        <p>เราจะติดต่อกลับและจัดส่งโดยเร็วที่สุดค่ะ ❤️</p>
        <p>หากมีข้อสงสัยติดต่อได้ที่: <b>Barame07042536@gmail.com</b></p>
    ";

    $mail->send();

    echo "✅ ส่งอีเมลสำเร็จแล้ว";

} catch (Exception $e) {
    echo "❌ ส่งอีเมลไม่สำเร็จ: " . $mail->ErrorInfo;
}
?>