<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject("ยืนยันคำสั่งซื้อ #{$this->order->id}")
                    ->view('emails.order_confirmation') // สร้าง view resources/views/emails/order_confirmation.blade.php
                    ->with(['order' => $this->order]);
    }
}