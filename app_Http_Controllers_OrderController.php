<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Mail\OrderConfirmation;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // 1) validate input...
        $data = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'items' => 'required|array',
            // ... อื่น ๆ
        ]);

        // 2) บันทึกคำสั่งซื้อลง DB
        $order = Order::create([
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'items' => json_encode($data['items']),
            'total' => $request->input('total', 0),
            // ... fields อื่น ๆ
        ]);

        // 3) ส่งอีเมล์ (queued) ให้ลูกค้าและ CC ถึงแอดมิน (config('mail.admin_email'))
        Mail::to($order->customer_email)
            ->cc(config('mail.admin_email')) // ถ้าต้องการสำเนาให้แอดมิน
            ->queue(new OrderConfirmation($order));

        // ถ้าต้องการส่งแยกฉบับ (ต่างหัวเรื่อง) ให้เรียก send/queue อีกครั้ง:
        // Mail::to(config('mail.admin_email'))->queue(new AdminOrderNotification($order));

        // 4) ตอบ HTTP
        return response()->json(['success' => true, 'order_id' => $order->id], 201);
    }
}