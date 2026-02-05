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
    $customer_email_raw = trim($_POST['email'] ?? '');
    $customer_address = safe($_POST['address'] ?? '');
    $customer_phone   = safe($_POST['phone'] ?? '');
    $total_price      = safe($_POST['totalPrice'] ?? '');
    $order_details_raw = $_POST['orderDetails'] ?? '';

    // ตรวจสอบข้อมูลที่จำเป็นก่อน
    if (empty($customer_name)) {
        throw new Exception("❌ กรุณากรอกชื่อ-นามสกุล");
    }
    
    if (empty($customer_email_raw)) {
        throw new Exception("❌ กรุณากรอกอีเมล\n\nหากคุณต้องการสั่งซื้อโดยไม่มีอีเมล กรุณาติดต่อทางร้านโดยตรง:\n📞 โทร: 063-939-2988\n📱 LINE: bk0704");
    }
    
    // ตรวจสอบรูปแบบอีเมล
    $customer_email = filter_var($customer_email_raw, FILTER_VALIDATE_EMAIL);
    if (!$customer_email) {
        $safe_email = htmlspecialchars($customer_email_raw, ENT_QUOTES, 'UTF-8');
        throw new Exception("❌ รูปแบบอีเมลไม่ถูกต้อง: $safe_email\n\nกรุณาตรวจสอบอีเมลให้ถูกต้อง เช่น example@gmail.com\n\nหรือติดต่อทางร้านโดยตรง:\n📞 โทร: 063-939-2988\n📱 LINE: bk0704");
    }
    
    if (empty($customer_address)) {
        throw new Exception("❌ กรุณากรอกที่อยู่สำหรับจัดส่ง");
    }
    
    if (empty($customer_phone)) {
        throw new Exception("❌ กรุณากรอกเบอร์โทรศัพท์");
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
    // 3) ส่งอีเมลให้ร้านค้า (เจ้าของร้าน)
    // --------------------------
    $mail->addAddress('Barame07042536@gmail.com', 'เจ้าของร้าน BARAYA PERFUME');
    $mail->isHTML(true);
    $mail->Subject = "🛍️ มีคำสั่งซื้อใหม่เข้ามา - BARAYA PERFUME";

    $mail->Body = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                .header { background: linear-gradient(135deg, #d4af37, #f9d342); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #d4af37; }
                .order-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
                h2 { color: #d4af37; margin-top: 0; }
                .highlight { color: #c0392b; font-weight: bold; font-size: 1.3em; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>💐 BARAYA PERFUME</h1>
                    <h2>🛍️ คำสั่งซื้อใหม่เข้ามาแล้ว!</h2>
                </div>
                
                <div class='content'>
                    <div class='info-box'>
                        <h2>👤 ข้อมูลลูกค้า</h2>
                        <p><strong>ชื่อ-นามสกุล:</strong> $customer_name</p>
                        <p><strong>อีเมล:</strong> $customer_email</p>
                        <p><strong>เบอร์โทร:</strong> $customer_phone</p>
                        <p><strong>ที่อยู่จัดส่ง:</strong><br>$customer_address</p>
                    </div>
                    
                    <div class='order-box'>
                        <h2>📦 รายการสินค้า</h2>
                        <p>$order_details</p>
                        <hr>
                        <p class='highlight'>💰 ยอดรวมทั้งหมด: $total_price บาท</p>
                    </div>
                    
                    <div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;'>
                        <p style='margin: 0; font-weight: bold; color: #856404;'>⚠️ กรุณาตรวจสอบสลิปการโอนเงินในอีเมล</p>
                        <p style='margin: 5px 0 0 0; color: #856404;'>และติดต่อลูกค้ากลับเพื่อยืนยันการสั่งซื้อ</p>
                    </div>
                    
                    <p style='text-align: center; margin-top: 30px;'>
                        <strong>✅ โปรดเตรียมการแพ็คสินค้าและจัดส่งโดยเร็วที่สุด</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
    ";

    $mail->send();
    error_log("✅ ส่งอีเมลไปยังเจ้าของร้านสำเร็จ");

    // --------------------------
    // 4) ส่งอีเมลยืนยันให้ลูกค้า
    // --------------------------
    $mail->clearAddresses();
    
    // ตรวจสอบอีเมลอีกครั้งก่อนส่ง (เพื่อความปลอดภัย)
    if (empty($customer_email) || !filter_var($customer_email, FILTER_VALIDATE_EMAIL)) {
        error_log("⚠️ ไม่สามารถส่งอีเมลยืนยันให้ลูกค้าได้ เนื่องจากอีเมลไม่ถูกต้อง: " . ($customer_email ?? 'empty'));
        // ส่งอีเมลแจ้งเจ้าของร้านสำเร็จแล้ว ดังนั้นจะ return success แต่แจ้งว่าไม่ได้ส่งให้ลูกค้า
        echo "⚠️ ส่งอีเมลแจ้งเจ้าของร้านสำเร็จ แต่ไม่สามารถส่งอีเมลยืนยันให้ลูกค้าได้เนื่องจากอีเมลไม่ถูกต้อง\n";
        echo "กรุณาติดต่อลูกค้าด้วยวิธีอื่น หรือให้ลูกค้าติดต่อทางร้านโดยตรง";
        return; // ออกจากฟังก์ชันโดยไม่ส่งอีเมลให้ลูกค้า
    }
    
    $mail->addAddress($customer_email, $customer_name);

    $mail->Subject = "✅ ยืนยันคำสั่งซื้อ - BARAYA PERFUME";

    $mail->Body = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                .header { background: linear-gradient(135deg, #d4af37, #f9d342); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-box { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .thank-you { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; padding-top: 20px; border-top: 2px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 30px; background: #06c755; color: white; text-decoration: none; border-radius: 25px; margin: 10px 0; }
                h2 { color: #d4af37; }
                .price { font-size: 1.5em; color: #d4af37; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>💐 BARAYA PERFUME</h1>
                    <p style='font-size: 1.2em; margin: 10px 0 0 0;'>น้ำหอมแท้ หรูหรา หอมติดทน</p>
                </div>
                
                <div class='content'>
                    <div class='thank-you'>
                        <h1 style='color: #06c755; margin: 0;'>✅ คำสั่งซื้อของคุณได้รับแล้ว!</h1>
                        <p style='font-size: 1.1em; margin: 10px 0 0 0;'>ขอบคุณที่เลือกใช้บริการ BARAYA PERFUME</p>
                    </div>
                    
                    <h2>สวัสดีค่ะ คุณ $customer_name 👋</h2>
                    <p>เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว และกำลังดำเนินการตรวจสอบข้อมูล</p>
                    
                    <div class='order-box'>
                        <h3 style='margin-top: 0; color: #d4af37;'>📦 รายการสินค้าที่คุณสั่ง:</h3>
                        <div style='background: white; padding: 15px; border-radius: 5px;'>
                            $order_details
                        </div>
                        <hr style='border: none; border-top: 2px dashed #ccc; margin: 20px 0;'>
                        <p class='price'>💰 ยอดรวมทั้งหมด: $total_price บาท</p>
                    </div>
                    
                    <div class='order-box'>
                        <h3 style='margin-top: 0; color: #d4af37;'>📬 ข้อมูลการจัดส่ง:</h3>
                        <p><strong>ชื่อผู้รับ:</strong> $customer_name</p>
                        <p><strong>ที่อยู่:</strong> $customer_address</p>
                        <p><strong>เบอร์โทรติดต่อ:</strong> $customer_phone</p>
                    </div>
                    
                    <div style='background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                        <h3 style='margin-top: 0; color: #856404;'>📋 ขั้นตอนต่อไป:</h3>
                        <ol style='margin: 0; padding-left: 20px; color: #856404;'>
                            <li>เราจะตรวจสอบสลิปการโอนเงินของคุณ</li>
                            <li>ทีมงานจะติดต่อกลับเพื่อยืนยันการสั่งซื้อภายใน 24 ชั่วโมง</li>
                            <li>เราจะเริ่มดำเนินการแพ็คและจัดส่งสินค้า</li>
                            <li>คุณจะได้รับหมายเลขพัสดุสำหรับติดตามสินค้า</li>
                        </ol>
                    </div>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <p style='font-size: 1.1em; margin-bottom: 15px;'><strong>💬 มีคำถามหรือต้องการสอบถามเพิ่มเติม?</strong></p>
                        <a href='https://line.me/ti/p/OJY81U61Jk' class='button' style='color: white;'>📱 ติดต่อเราผ่าน LINE</a>
                    </div>
                    
                    <div class='footer'>
                        <p><strong>📧 อีเมล:</strong> Barame07042536@gmail.com</p>
                        <p><strong>📱 LINE ID:</strong> bk0704</p>
                        <p><strong>📞 โทร:</strong> 063-939-2988</p>
                        <hr style='border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;'>
                        <p style='color: #999; font-size: 0.85em;'>&copy; 2025 BARAYA PERFUME - น้ำหอมแท้คุณภาพพรีเมียม</p>
                        <p style='color: #999; font-size: 0.85em;'>อีเมลนี้ถูกส่งอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้โดยตรง</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    ";

    $mail->send();
    error_log("✅ ส่งอีเมลยืนยันไปยังลูกค้าสำเร็จ: " . $customer_email);

    echo "✅ ส่งอีเมลสำเร็จแล้ว - ทั้งไปยังเจ้าของร้านและลูกค้า";

} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    
    // ถ้าเป็น error จาก PHPMailer
    if (!empty($mail->ErrorInfo)) {
        error_log("❌ PHPMailer Error: " . $mail->ErrorInfo);
        
        // แปลง error message ให้เป็นภาษาไทยและเป็นมิตรกับผู้ใช้
        if (strpos($mail->ErrorInfo, 'recipients address is empty') !== false) {
            $errorMsg = "❌ เกิดข้อผิดพลาดในการส่งอีเมล\n\nกรุณาตรวจสอบว่าได้กรอกอีเมลถูกต้องแล้ว\nหรือติดต่อทางร้านโดยตรง:\n\n📞 โทร: 063-939-2988\n📱 LINE: bk0704\n📧 อีเมล: Barame07042536@gmail.com";
        } else {
            $errorMsg = "❌ เกิดข้อผิดพลาดในการส่งอีเมล\n\nรายละเอียด: " . $mail->ErrorInfo . "\n\nกรุณาติดต่อทางร้านโดยตรง:\n📞 โทร: 063-939-2988\n📱 LINE: bk0704";
        }
    }
    
    error_log("❌ ส่งอีเมลไม่สำเร็จ: " . $errorMsg);
    echo $errorMsg;
    http_response_code(500);
}
?>