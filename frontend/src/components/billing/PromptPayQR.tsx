"use client";

import { useState, useEffect } from "react";
import { QrCode, DollarSign, User, ShieldCheck } from "lucide-react";
import QRCode from 'qrcode'
import generatePayload from 'promptpay-qr';

interface PromptPayQRProps {
  amount: number;
}

export default function PromptPayQR({ amount }: PromptPayQRProps) {
  const [qrCode, setQrCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  // Get PromptPay ID from environment variable
  const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_QR_ID;

  useEffect(() => {
    if (promptPayId && amount > 0) {
      try {
        const payload = generatePayload(promptPayId, { amount });
        
        // Generate QR Code as base64 image
        QRCode.toDataURL(payload, { 
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, (err, url) => {
          if (err) {
            console.error("Error generating QR Code image:", err);
            setError("ไม่สามารถสร้าง QR Code ได้");
            setQrCode("");
          } else {
            setQrCode(url);
            setError("");
          }
        });
      } catch (err) {
        console.error("Error generating PromptPay QR:", err);
        setError("ไม่สามารถสร้าง QR Code ได้");
        setQrCode("");
      }
    }
  }, [promptPayId, amount]);



  if (error) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h4>
          <p className="text-sm text-gray-600">ไม่สามารถสร้าง QR Code ได้</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6 inline-block">
          <div className="text-center">
            <div className="w-56 h-56 bg-red-50 rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-red-200">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-red-400 mx-auto mb-4" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-sm mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">กำลังสร้าง QR Code</h4>
          <p className="text-sm text-gray-600">กรุณารอสักครู่...</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6 inline-block">
          <div className="animate-pulse">
            <div className="w-56 h-56 bg-gray-200 rounded-xl mx-auto flex items-center justify-center">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>
            <div className="mt-4 text-center">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-sm mx-auto">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">PromptPay QR Code</h4>
        <p className="text-sm text-gray-600">สแกนเพื่อชำระเงิน</p>
      </div>

      {/* QR Code Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6 inline-block">
        {/* QR Code */}
        <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
          <img 
            src={qrCode} 
            alt="PromptPay QR Code"
            className="w-56 h-56 mx-auto drop-shadow-lg"
          />
        </div>
        
        {/* Scan Instructions */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">พร้อมสแกน</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500">
            เปิด mobile banking app และสแกน QR Code
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-sm mx-auto">
        <div className="space-y-4">
          {/* PromptPay ID */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <User />
              </div>
              <span className="text-sm font-medium text-gray-700">PromptPay ID</span>
            </div>
            <span className="text-sm font-bold text-gray-900 font-mono">{promptPayId}</span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <DollarSign />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">จำนวนเงิน</span>
            </div>
            <span className="text-lg font-bold text-green-700">฿{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <ShieldCheck />
            </svg>
            <span className="text-xs font-medium">การชำระเงินปลอดภัย 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
