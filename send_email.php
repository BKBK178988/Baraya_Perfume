<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$mail = new PHPMailer(true);

try {
    // ✅ รับและตรวจสอบข้อมูลจาก POST
    if (empty($_POST['name']) || empty($_POST['email']) || empty($_POST['address']) || 
        empty($_POST['phone']) || empty($_POST['orderDetails']) || empty($_POST['totalPrice'])) {
        throw new Exception('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    $customer_name = trim($_POST['name']);
    $customer_email = filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL);
    $customer_address = trim($_POST['address']);
    $customer_phone = trim($_POST['phone']);
    $order_details = $_POST['orderDetails'];
    $total_price = trim($_POST['totalPrice']);

    // ตรวจสอบความถูกต้องของอีเมล
    if (!$customer_email) {
        throw new Exception('รูปแบบอีเมลไม่ถูกต้อง');
    }

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
    $mail->CharSet = 'UTF-8'; // ✅ รองรับภาษาไทย
    $mail->Subject = '🛍️ คำสั่งซื้อใหม่จากเว็บไซต์';

    // ✅ แปลง order details จากข้อความธรรมดาเป็น HTML
    $order_details_html = nl2br(htmlspecialchars($order_details, ENT_QUOTES, 'UTF-8'));

    // ✅ สร้างข้อความแจ้งเตือนร้านค้า
    $message_to_seller = "
        <!DOCTYPE html>
        <html lang='th'>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px; }
                .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #555; }
                .order-items { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                .footer { margin-top: 20px; padding: 15px; text-align: center; color: #777; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🛍️ คำสั่งซื้อใหม่</h2>
                </div>
                <div class='content'>
                    <div class='info-row'><span class='label'>👤 ชื่อลูกค้า:</span> $customer_name</div>
                    <div class='info-row'><span class='label'>📧 อีเมล:</span> $customer_email</div>
                    <div class='info-row'><span class='label'>🏠 ที่อยู่:</span> $customer_address</div>
                    <div class='info-row'><span class='label'>📞 เบอร์โทร:</span> $customer_phone</div>
                    <div class='info-row'><span class='label'>💰 ราคารวม:</span> $total_price บาท</div>
                    
                    <div class='order-items'>
                        <h3>📦 รายการสินค้า:</h3>
                        <p>$order_details_html</p>
                    </div>
                    
                    <p style='color: #4CAF50; font-weight: bold;'>📌 โปรดดำเนินการจัดส่งสินค้าโดยเร็วที่สุด</p>
                </div>
                <div class='footer'>
                    <p>อีเมลนี้ถูกส่งอัตโนมัติจากระบบ Baraya Perfume</p>
                </div>
            </div>
        </body>
        </html>
    ";
    
    $mail->Body = $message_to_seller;
    $mail->send();

    // ✅ ส่งอีเมลยืนยันไปยัง **ลูกค้า**
    $mail->clearAddresses(); // ล้างอีเมลก่อนส่งใหม่
    $mail->addAddress($customer_email); // ส่งไปยังอีเมลลูกค้า

    $mail->Subject = "📦 คำสั่งซื้อของคุณได้รับการยืนยันแล้ว!";
    
    // ✅ สร้างข้อความสำหรับลูกค้า
    $message_to_customer = "
        <!DOCTYPE html>
        <html lang='th'>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FF69B4; color: white; padding: 15px; text-align: center; border-radius: 5px; }
                .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #555; }
                .order-items { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF69B4; }
                .footer { margin-top: 20px; padding: 15px; text-align: center; color: #777; font-size: 12px; }
                .contact-info { background-color: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>✅ คำสั่งซื้อของคุณได้รับการยืนยันแล้ว!</h2>
                </div>
                <div class='content'>
                    <p>ขอบคุณที่สั่งซื้อสินค้ากับเรา <strong>Baraya Perfume</strong> 🌸</p>
                    <p>คำสั่งซื้อของคุณมีรายละเอียดดังนี้:</p>
                    
                    <div class='info-row'><span class='label'>💰 ราคารวม:</span> $total_price บาท</div>
                    
                    <div class='order-items'>
                        <h3>📦 รายการสินค้า:</h3>
                        <p>$order_details_html</p>
                    </div>
                    
                    <div class='contact-info'>
                        <p style='margin: 0;'><strong>📌 เราจะดำเนินการจัดส่งให้เร็วที่สุด! กรุณารอการอัปเดต</strong></p>
                    </div>
                    
                    <p>📞 หากมีข้อสงสัย ติดต่อเราได้ที่อีเมล: <a href='mailto:Barame07042536@gmail.com' style='color: #FF69B4;'>Barame07042536@gmail.com</a></p>
                </div>
                <div class='footer'>
                    <p>อีเมลนี้ถูกส่งอัตโนมัติจากระบบ Baraya Perfume</p>
                    <p>&copy; 2025 BARAYA PERFUME - น้ำหอมแท้ หรูหรา หอมติดทน</p>
                </div>
            </div>
        </body>
        </html>
    ";

    $mail->Body = $message_to_customer;
    $mail->send();

    echo '✅ อีเมลแจ้งเตือนถูกส่งสำเร็จ';
} catch (Exception $e) {
    echo "❌ ไม่สามารถส่งอีเมลได้: {$mail->ErrorInfo}";
}
?>
