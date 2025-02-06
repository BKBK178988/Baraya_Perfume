<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$mail = new PHPMailer(true);

try {
    // ✅ รับข้อมูลจาก POST
    $customer_name = $_POST['name'];
    $customer_email = $_POST['email'];
    $customer_address = $_POST['address'];
    $customer_phone = $_POST['phone'];
    $order_details = $_POST['orderDetails'];
    $total_price = $_POST['totalPrice'];

    // ✅ ตั้งค่า SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com'; 
    $mail->SMTPAuth   = true;
    $mail->Username   = 'Barame07042536@gmail.com'; // 🔹 อีเมลร้านค้า
    $mail->Password   = 'eezk fcqb hjgj auhb'; // 🔹 ใช้ "App Password" ที่สร้างจาก Google
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // ✅ ตั้งค่าผู้ส่ง
    $mail->setFrom('Barame07042536@gmail.com', 'ร้านค้า Baraya Perfume');

    // ✅ ส่งอีเมลแจ้งเตือนไปยัง **ผู้ขาย**
    $mail->addAddress('Barame07042536@gmail.com', 'เจ้าของร้าน'); 

    $mail->isHTML(true);
    $mail->Subject = '🛍️ คำสั่งซื้อใหม่จากเว็บไซต์';

    // ✅ สร้างข้อความแจ้งเตือนร้านค้า
    $message_to_seller = "
        <h2>🛍️ คำสั่งซื้อใหม่</h2>
        <p><strong>👤 ชื่อลูกค้า:</strong> $customer_name</p>
        <p><strong>📧 อีเมล:</strong> $customer_email</p>
        <p><strong>🏠 ที่อยู่:</strong> $customer_address</p>
        <p><strong>📞 เบอร์โทร:</strong> $customer_phone</p>
        <p><strong>💰 ราคารวม:</strong> $total_price บาท</p>
        <h3>📦 รายการสินค้า:</h3>
        <p>$order_details</p>
        <hr>
        <p>📌 โปรดดำเนินการจัดส่งสินค้าโดยเร็วที่สุด</p>
    ";
    
    $mail->Body = $message_to_seller;
    $mail->send();

    // ✅ ส่งอีเมลยืนยันไปยัง **ลูกค้า**
    $mail->clearAddresses(); // ล้างอีเมลก่อนส่งใหม่
    $mail->addAddress($customer_email); // ส่งไปยังอีเมลลูกค้า

    $mail->Subject = "📦 คำสั่งซื้อของคุณได้รับการยืนยันแล้ว!";
    
    // ✅ สร้างข้อความสำหรับลูกค้า
    $message_to_customer = "
        <h2>✅ คำสั่งซื้อของคุณได้รับการยืนยันแล้ว!</h2>
        <p>ขอบคุณที่สั่งซื้อสินค้ากับเรา <strong>Baraya Perfume</strong></p>
        <p>คำสั่งซื้อของคุณมีรายละเอียดดังนี้:</p>
        <p><strong>💰 ราคารวม:</strong> $total_price บาท</p>
        <h3>📦 รายการสินค้า:</h3>
        <p>$order_details</p>
        <hr>
        <p>📌 เราจะดำเนินการจัดส่งให้เร็วที่สุด! กรุณารอการอัปเดต</p>
        <p>📞 หากมีข้อสงสัย ติดต่อเราได้ที่อีเมล: <a href='mailto:Barame07042536@gmail.com'>Barame07042536@gmail.com</a></p>
    ";

    $mail->Body = $message_to_customer;
    $mail->send();

    echo '✅ อีเมลแจ้งเตือนถูกส่งสำเร็จ';
} catch (Exception $e) {
    echo "❌ ไม่สามารถส่งอีเมลได้: {$mail->ErrorInfo}";
}
?>
