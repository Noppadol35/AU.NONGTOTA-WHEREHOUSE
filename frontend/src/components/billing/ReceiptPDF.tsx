"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// ── Register Thai Font ──────────────────────────────────────────────────────
Font.register({
  family: "Sarabun",
  fonts: [
    { src: "https://raw.githubusercontent.com/google/fonts/main/ofl/sarabun/Sarabun-Regular.ttf", fontWeight: 400 },
    { src: "https://raw.githubusercontent.com/google/fonts/main/ofl/sarabun/Sarabun-Bold.ttf", fontWeight: 700 },
  ],
});

// ── Types ────────────────────────────────────────────────────────────────────
export interface ReceiptTransaction {
  product: { name: string; sku: string; sellPrice: number };
  qtyChange: number;
}

export interface ReceiptData {
  jobNumber: string;
  customerName: string;
  phoneNumber: string;
  carType: string;
  transactions: ReceiptTransaction[];
  totalAmount: number;
  laborCost: number;
  paymentMethod: "cash" | "promptpay";
  qrCodeDataUrl?: string;
}

// ── Thai Baht Text Converter ─────────────────────────────────────────────────
function bahtText(n: number): string {
  const thaiDigits = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const thaiPositions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  if (n === 0) return "ศูนย์บาทถ้วน";

  const intPart = Math.floor(Math.abs(n));
  const decPart = Math.round((Math.abs(n) - intPart) * 100);

  function convertGroup(num: number): string {
    if (num === 0) return "";
    const str = String(num);
    let result = "";
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const pos = len - i - 1;
      if (digit === 0) continue;
      if (pos === 0 && digit === 1 && len > 1) {
        result += "เอ็ด";
      } else if (pos === 1 && digit === 1) {
        result += "สิบ";
      } else if (pos === 1 && digit === 2) {
        result += "ยี่สิบ";
      } else {
        result += thaiDigits[digit] + thaiPositions[pos];
      }
    }
    return result;
  }

  function convertFull(num: number): string {
    if (num === 0) return "";
    if (num < 1000000) return convertGroup(num);
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return convertFull(millions) + "ล้าน" + convertFull(remainder);
  }

  let result = "";
  if (intPart > 0) {
    result += convertFull(intPart) + "บาท";
  }
  if (decPart > 0) {
    result += convertGroup(decPart) + "สตางค์";
  } else {
    result += "ถ้วน";
  }
  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtMoney(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Styles ───────────────────────────────────────────────────────────────────
const c = {
  primary: "#ea580c",
  primaryLight: "#fff7ed",
  dark: "#1a1a1a",
  muted: "#737373",
  subtle: "#a3a3a3",
  border: "#e5e5e5",
  bg: "#fafafa",
};

const s = StyleSheet.create({
  page: { fontFamily: "Sarabun", fontSize: 9, padding: 30, paddingBottom: 20, color: c.dark },

  // ── Top Header Row (Shop left, Receipt title right) ──
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: `2px solid ${c.primary}`,
  },
  shopCol: { width: "60%" },
  shopName: { fontSize: 20, fontWeight: 700, color: c.primary, marginBottom: 1 },
  shopSubtitle: { fontSize: 9, color: "#525252", marginBottom: 3 },
  shopAddress: { fontSize: 7.5, color: c.muted, lineHeight: 1.5 },
  titleCol: { width: "38%", textAlign: "right" },
  receiptBadge: {
    fontSize: 14,
    fontWeight: 700,
    color: c.dark,
    marginBottom: 6,
  },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  metaLabel: { fontSize: 7.5, color: c.muted, width: 50, textAlign: "right", marginRight: 6 },
  metaValue: { fontSize: 8, fontWeight: 700, width: 80, textAlign: "right" },

  // ── Customer ──
  customerBox: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: c.bg,
    borderRadius: 4,
    border: `1px solid ${c.border}`,
  },
  customerTitle: { fontSize: 8, fontWeight: 700, color: "#525252", marginBottom: 5 },
  customerGrid: { flexDirection: "row", justifyContent: "space-between" },
  customerItem: { flexDirection: "row" },
  customerLabel: { fontSize: 7.5, color: c.muted, marginRight: 4 },
  customerValue: { fontSize: 8, fontWeight: 700 },

  // ── Table ──
  table: { marginBottom: 8 },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderTop: `1px solid #d4d4d4`,
    borderBottom: `1px solid #d4d4d4`,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tRow: { flexDirection: "row", borderBottom: `1px solid #f0f0f0`, paddingVertical: 3, paddingHorizontal: 6 },
  tRowAlt: { flexDirection: "row", borderBottom: `1px solid #f0f0f0`, paddingVertical: 3, paddingHorizontal: 6, backgroundColor: c.bg },
  cNo: { width: "6%", fontSize: 8, textAlign: "center" },
  cName: { width: "36%", fontSize: 8 },
  cQty: { width: "16%", fontSize: 8, textAlign: "center" },
  cPrice: { width: "21%", fontSize: 8, textAlign: "right" },
  cTotal: { width: "21%", fontSize: 8, textAlign: "right" },
  cHead: { fontWeight: 700, fontSize: 7.5, color: "#525252" },

  // ── Summary ──
  summaryWrap: { alignItems: "flex-end", marginBottom: 4 },
  summaryInner: { width: 320 },
  sRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1.5 },
  sLabel: { fontSize: 8, color: "#525252", width: 180 },
  sValue: { fontSize: 8, textAlign: "right", width: 130 },
  sSuffix: { fontSize: 7, color: c.muted, marginLeft: 2 },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 2,
    borderTop: `2px solid ${c.primary}`,
    borderBottom: `2px solid ${c.primary}`,
  },
  grandLabel: { fontSize: 10, fontWeight: 700, width: 180 },
  grandValue: { fontSize: 10, fontWeight: 700, color: c.primary, width: 130, textAlign: "right" },
  bahtTextRow: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: c.primaryLight,
    borderRadius: 3,
    marginTop: 4,
  },
  bahtText: { fontSize: 8, color: c.primary, textAlign: "center" },

  // ── Footer Section ──
  footerWrap: {
    marginTop: "auto",
    paddingTop: 10,
    borderTop: `1px solid ${c.border}`,
  },
  // Payment row
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: `1px solid ${c.border}`,
  },
  paymentLabel: { fontSize: 8, color: "#525252", marginRight: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  checkbox: { width: 11, height: 11, border: `1.5px solid ${c.subtle}`, borderRadius: 2, marginRight: 5, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { width: 11, height: 11, border: `1.5px solid ${c.primary}`, borderRadius: 2, marginRight: 5, justifyContent: "center", alignItems: "center" },
  checkboxText: { fontSize: 8, color: "#525252" },
  checkMark: { fontSize: 9, color: c.primary, fontWeight: 700, marginTop: -1 },
  // QR + Signatures row
  footerBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  // QR
  qrWrap: { alignItems: "center", width: "25%" },
  qrImg: { width: 80, height: 80, marginBottom: 3 },
  qrCaption: { fontSize: 7, color: c.muted, textAlign: "center" },
  // Signatures
  sigRow: { flexDirection: "row", width: "70%", justifyContent: "space-around" },
  sigBlock: { alignItems: "center", width: "45%" },
  sigLine: { borderBottom: `1px dotted ${c.subtle}`, width: "100%", marginTop: 28, marginBottom: 3 },
  sigName: { fontSize: 8, color: c.muted, marginBottom: 6 },
  sigDateRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  sigDateLabel: { fontSize: 7.5, color: c.subtle, marginRight: 4 },
  sigDateDots: { borderBottom: `1px dotted ${c.subtle}`, flex: 1 },
  // Thank you
  thanksText: { textAlign: "center", fontSize: 7, color: c.subtle, marginTop: 10 },
});

// Helper: เพิ่มช่องว่างต่อท้ายข้อความ เพื่อแก้ปัญหา @react-pdf วัดความกว้างภาษาไทยผิด
function pad(text: string): string {
  return text + "  ";
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ReceiptPDF({ data }: { data: ReceiptData }) {
  const subtotal = data.totalAmount + data.laborCost;
  const vatAmount = subtotal * 0.07;
  const grandTotal = subtotal + vatAmount;
  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const grandTotalText = bahtText(grandTotal);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ═══════ TOP HEADER ═══════ */}
        <View style={s.topRow}>
          {/* Left: Shop info */}
          <View style={s.shopCol}>
            <Text style={s.shopName}>อู่น้อง.โตต้า</Text>
            <Text style={s.shopSubtitle}>ศูนย์บริการซ่อมรถยนต์ TOYOTA และ รถยนต์ทุกยี่ห้อ</Text>
            <Text style={s.shopAddress}>
              91/38 หมู่3 ถ.สุขุมวิท ต.บ้านสวน อ.เมืองชลบุรี จ.ชลบุรี 20000
            </Text>
            <Text style={s.shopAddress}>เลขประจำตัวผู้เสียภาษี </Text>
            <Text style={s.shopAddress}>โทร: 089-247-2518</Text>
          </View>
          {/* Right: Receipt title + meta */}
          <View style={s.titleCol}>
            <Text style={s.receiptBadge}>ใบเสร็จรับเงิน</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>เลขที่งาน</Text>
              <Text style={s.metaValue}>{data.jobNumber}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>วันที่</Text>
              <Text style={s.metaValue}>{today}</Text>
            </View>
          </View>
        </View>

        {/* ═══════ CUSTOMER INFO ═══════ */}
        <View style={s.customerBox}>
          <Text style={s.customerTitle}>ข้อมูลลูกค้า</Text>
          <View style={s.customerGrid}>
            <View style={s.customerItem}>
              <Text style={s.customerLabel}>ชื่อลูกค้า:</Text>
              <Text style={s.customerValue}>{data.customerName}</Text>
            </View>
            <View style={s.customerItem}>
              <Text style={s.customerLabel}>เบอร์โทร:</Text>
              <Text style={s.customerValue}>{data.phoneNumber}</Text>
            </View>
            <View style={s.customerItem}>
              <Text style={s.customerLabel}>ประเภทรถ:</Text>
              <Text style={s.customerValue}>{data.carType}</Text>
            </View>
          </View>
        </View>

        {/* ═══════ ITEMS TABLE ═══════ */}
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.cNo, s.cHead]}>#</Text>
            <Text style={[s.cName, s.cHead]}>{pad("รายละเอียด")}</Text>
            <Text style={[s.cQty, s.cHead]}>{pad("จำนวน")}</Text>
            <Text style={[s.cPrice, s.cHead]}>{pad("ราคาต่อหน่วย")}</Text>
            <Text style={[s.cTotal, s.cHead]}>{pad("มูลค่า")}</Text>
          </View>
          {data.transactions.map((tx, idx) => {
            const qty = Math.abs(tx.qtyChange);
            const lineTotal = (tx.product?.sellPrice || 0) * qty;
            return (
              <View key={idx} style={idx % 2 === 1 ? s.tRowAlt : s.tRow}>
                <Text style={s.cNo}>{idx + 1}</Text>
                <Text style={s.cName}>{pad(tx.product?.name || "-")}</Text>
                <Text style={s.cQty}>{qty}</Text>
                <Text style={s.cPrice}>{fmtMoney(tx.product?.sellPrice || 0)}</Text>
                <Text style={s.cTotal}>{fmtMoney(lineTotal)}</Text>
              </View>
            );
          })}
        </View>

        {/* ═══════ SUMMARY ═══════ */}
        <View style={s.summaryWrap}>
          <View style={s.summaryInner}>
            <View style={s.sRow}>
              <Text style={s.sLabel}>{pad("รวมเป็นเงิน")}</Text>
              <Text style={s.sValue}>{pad(fmtMoney(data.totalAmount) + " บาท")}</Text>
            </View>
            {data.laborCost > 0 && (
              <View style={s.sRow}>
                <Text style={s.sLabel}>{pad("ค่าแรงงาน")}</Text>
                <Text style={s.sValue}>{pad(fmtMoney(data.laborCost) + " บาท")}</Text>
              </View>
            )}
            <View style={s.sRow}>
              <Text style={s.sLabel}>{pad("จำนวนเงินรวม")}</Text>
              <Text style={s.sValue}>{pad(fmtMoney(subtotal) + " บาท")}</Text>
            </View>
            <View style={s.sRow}>
              <Text style={s.sLabel}>{pad("ภาษีมูลค่าเพิ่ม 7%")}</Text>
              <Text style={s.sValue}>{pad(fmtMoney(vatAmount) + " บาท")}</Text>
            </View>
            <View style={s.grandRow}>
              <Text style={s.grandLabel}>{pad("จำนวนเงินรวมทั้งสิ้น")}</Text>
              <Text style={s.grandValue}>{pad(fmtMoney(grandTotal) + " บาท")}</Text>
            </View>
          </View>
          {/* Thai Baht Text */}
          <View style={s.bahtTextRow}>
            <Text style={s.bahtText}>({grandTotalText})</Text>
          </View>
        </View>

        {/* ═══════ FOOTER ═══════ */}
        <View style={s.footerWrap}>
          {/* Payment Method Row */}
          <View style={s.paymentRow}>
            <Text style={s.paymentLabel}>{pad("การชำระเงิน:")}</Text>
            <View style={s.checkboxRow}>
              <View style={data.paymentMethod === "cash" ? s.checkboxChecked : s.checkbox}>
                {data.paymentMethod === "cash" && <Text style={s.checkMark}>✓</Text>}
              </View>
              <Text style={s.checkboxText}>{pad("เงินสด")}</Text>
            </View>
            <View style={s.checkboxRow}>
              <View style={data.paymentMethod === "promptpay" ? s.checkboxChecked : s.checkbox}>
                {data.paymentMethod === "promptpay" && <Text style={s.checkMark}>✓</Text>}
              </View>
              <Text style={s.checkboxText}>{pad("โอนเงิน / PromptPay")}</Text>
            </View>
          </View>

          {/* QR (only for PromptPay) + Signatures */}
          <View style={s.footerBottomRow}>
            {/* QR Code — only shown if PromptPay */}
            {data.paymentMethod === "promptpay" && data.qrCodeDataUrl ? (
              <View style={s.qrWrap}>
                <Image style={s.qrImg} src={data.qrCodeDataUrl} />
                <Text style={s.qrCaption}>{pad("สแกนชำระเงิน")}</Text>
                <Text style={s.qrCaption}>{pad("฿" + fmtMoney(grandTotal))}</Text>
              </View>
            ) : (
              <View style={{ width: "25%" }} />
            )}

            {/* Signatures */}
            <View style={s.sigRow}>
              <View style={s.sigBlock}>
                <View style={s.sigLine} />
                <Text style={s.sigName}>{pad("ผู้จ่ายเงิน")}</Text>
                <View style={s.sigDateRow}>
                  <Text style={s.sigDateLabel}>{pad("วันที่")}</Text>
                  <View style={s.sigDateDots} />
                </View>
              </View>
              <View style={s.sigBlock}>
                <View style={s.sigLine} />
                <Text style={s.sigName}>{pad("ผู้รับเงิน")}</Text>
                <View style={s.sigDateRow}>
                  <Text style={s.sigDateLabel}>{pad("วันที่")}</Text>
                  <View style={s.sigDateDots} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Thank you */}
        <Text style={s.thanksText}>
          {pad("ขอบคุณที่ใช้บริการ อู่น้อง.โตต้า — ศูนย์บริการซ่อมรถยนต์")}
        </Text>
      </Page>
    </Document>
  );
}
