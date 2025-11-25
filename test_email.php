<?php
header('Content-Type: text/plain; charset=utf-8');

echo "🔵 PHP is working!\n";
echo "🔵 POST data received:\n";
print_r($_POST);
echo "\n🔵 Files received:\n";
print_r($_FILES);

// ตรวจสอบว่า PHPMailer โหลดได้หรือไม่
if (file_exists('PHPMailer/PHPMailer.php')) {
    echo "\n✅ PHPMailer files found!\n";
    
    require 'PHPMailer/Exception.php';
    require 'PHPMailer/PHPMailer.php';
    require 'PHPMailer/SMTP.php';
    
    echo "✅ PHPMailer loaded successfully!\n";
} else {
    echo "\n❌ PHPMailer files not found!\n";
}

echo "\n🔵 Test complete!\n";
?>
