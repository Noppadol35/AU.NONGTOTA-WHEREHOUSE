"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, SwitchCamera } from "lucide-react";

interface CameraDevice {
  id: string;
  label: string;
}

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScannerDialog({ isOpen, onClose, onScanSuccess }: BarcodeScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ barcode: string; time: number } | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  // Preload beep sound
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    beepAudioRef.current = new Audio("/sounds/scanner-beep.mp3");
    beepAudioRef.current.preload = "auto";
  }, []);

  const playBeep = useCallback(() => {
    try {
      if (beepAudioRef.current) {
        beepAudioRef.current.currentTime = 0; // rewind so it can play again immediately
        beepAudioRef.current.play().catch(() => {});
      }
    } catch {
      // Silently ignore
    }
  }, []);

  // Scan success handler
  const handleScanSuccess = useCallback((decodedText: string) => {
    const now = Date.now();
    const last = lastScannedRef.current;

    // Cooldown logic: Ignore if it's the SAME barcode scanned within 1.5 seconds
    if (last && last.barcode === decodedText && now - last.time < 1500) {
      return;
    }

    lastScannedRef.current = { barcode: decodedText, time: now };

    // Beep + Vibrate feedback
    playBeep();
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }

    setScanCount((c) => c + 1);
    onScanSuccess(decodedText);
  }, [playBeep, onScanSuccess]);

  // Start camera with a specific device ID
  const startCamera = useCallback(async (cameraId: string) => {
    if (!scannerRef.current) return;
    setIsStarting(true);
    setError(null);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
    };

    try {
      await scannerRef.current.start(
        cameraId,
        config,
        handleScanSuccess,
        () => { /* ignore scan errors */ }
      );
      setIsStarting(false);
    } catch (err: any) {
      console.error("Camera start error:", err);
      setError("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตการเข้าถึงกล้อง");
      setIsStarting(false);
    }
  }, [handleScanSuccess]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1 || !scannerRef.current) return;

    const nextIndex = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIndex);

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      await startCamera(cameras[nextIndex].id);
    } catch (err) {
      console.error("Switch camera error:", err);
    }
  }, [cameras, activeCameraIndex, startCamera]);

  // Initialize scanner when dialog opens
  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        const s = scannerRef.current;
        if (s.isScanning) {
          s.stop().then(() => s.clear()).catch(console.error);
        } else {
          s.clear();
        }
        scannerRef.current = null;
      }
      setScanCount(0);
      return;
    }

    setIsStarting(true);
    setError(null);

    const timer = setTimeout(async () => {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      try {
        // Enumerate available cameras
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          setError("ไม่พบกล้องในอุปกรณ์นี้");
          setIsStarting(false);
          return;
        }

        const cameraList = devices.map((d) => ({ id: d.id, label: d.label || `กล้อง ${d.id.slice(0, 6)}` }));
        setCameras(cameraList);

        // Try to pick the back camera by default (usually labeled "back" or "environment")
        let defaultIdx = cameraList.findIndex((c) =>
          c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("rear") || c.label.toLowerCase().includes("environment")
        );
        if (defaultIdx === -1) defaultIdx = cameraList.length - 1; // last one is usually back camera on mobile
        setActiveCameraIndex(defaultIdx);

        await startCamera(cameraList[defaultIdx].id);
      } catch (err: any) {
        console.error("Camera init error:", err);
        setError("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตการเข้าถึงกล้อง");
        setIsStarting(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(console.error);
        } else {
          scannerRef.current.clear();
        }
        scannerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>สแกนบาร์โค้ดผ่านกล้อง</DialogTitle>
          <DialogDescription>
            วางบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน สามารถสแกนต่อเนื่องได้เลย
          </DialogDescription>
        </DialogHeader>

        {/* Camera viewport */}
        <div className="relative w-full rounded-xl overflow-hidden bg-black min-h-[300px] flex items-center justify-center">
          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin mb-2" />
              <p className="text-sm font-medium text-white/80">กำลังเปิดกล้อง...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 p-6 text-center z-10">
              <p className="text-red-300 font-medium mb-2">{error}</p>
              <p className="text-sm text-red-400">
                1. ลองรีเฟรชหน้าเว็บ<br/>
                2. ตรวจสอบว่าบราวเซอร์ได้รับอนุญาตให้ใช้กล้องหรือไม่
              </p>
            </div>
          )}
          <div id="barcode-reader" className="w-full"></div>

          {/* Switch Camera Button (overlay) */}
          {cameras.length > 1 && !error && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              disabled={isStarting}
              className="absolute top-3 right-3 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10 backdrop-blur-sm"
              title={`สลับกล้อง (${cameras[activeCameraIndex]?.label})`}
            >
              <SwitchCamera className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            {cameras.length > 0 && `📷 ${cameras[activeCameraIndex]?.label}`}
          </span>
          {scanCount > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              สแกนแล้ว {scanCount} รายการ
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
