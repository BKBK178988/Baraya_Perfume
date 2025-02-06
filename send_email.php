<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$mail = new PHPMailer(true);

try {
    // ตั้งค่า SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com'; 
    $mail->SMTPAuth   = true;
    $mail->Username   = 'Barame07042536@gmail.com'; // 🔹 ใส่อีเมลของคุณ
    $mail->Password   = 'eezk fcqb hjgj auhb'; // 🔹 ใช้ "App Password" ที่สร้างจาก Google
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // ตั้งค่าผู้ส่งและผู้รับ
    $mail->setFrom('Barame07042536@gmail.com', 'Your Store');
    $mail->addAddress('Barame07042536@gmail.com', 'Seller'); // 🔹 เปลี่ยนอีเมลผู้รับ (เจ้าของร้าน)

    // ตั้งค่าข้อความ
    $mail->isHTML(true);
    $mail->Subject = '🛍️ คำสั่งซื้อใหม่จากเว็บไซต์';
    $mail->Body    = $_POST['message']; // รับข้อความจาก JavaScript

    $mail->send();
    echo '✅ อีเมลแจ้งเตือนถูกส่งสำเร็จ';
} catch (Exception $e) {
    echo "❌ ไม่สามารถส่งอีเมลได้: {$mail->ErrorInfo}";
}
?>
