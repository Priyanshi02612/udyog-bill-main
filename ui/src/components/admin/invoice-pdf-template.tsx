import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { getInvoiceBuyerById, getInvoiceSellerById } from "../../utils/data";
import { Invoice } from "../../utils/types";
import {
  formatCurrency,
  formatDate,
  getInvoicePreviewMetrics,
} from "../../utils/helpers";
import { GstType, TaxMode } from "../../utils/constants";

Font.register({
  family: "NotoSans",
  fonts: [
    {
      src: "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#eef0f4",
    padding: 24,
    fontFamily: "NotoSans",
    color: "#0f172a",
    fontSize: 10,
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
  },
  topBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  companyName: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "bold",
  },
  subtleText: {
    marginTop: 2,
    fontSize: 9,
    color: "#64748b",
  },
  invoiceLabel: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#cbd5e1",
    textAlign: "right",
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  metaKey: {
    fontSize: 9,
    color: "#64748b",
  },
  metaValue: {
    fontSize: 9,
    color: "#0f172a",
    fontWeight: "bold",
  },
  billShipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  billShipBox: {
    width: "48.5%",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
  },
  sectionLabel: {
    fontSize: 8,
    color: "#8b5a2b",
    fontWeight: "bold",
    marginBottom: 6,
  },
  sectionValue: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  th: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 7,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
  },
  td: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 8,
    color: "#334155",
  },
  tdBold: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    fontSize: 8,
    color: "#0f172a",
    fontWeight: "bold",
  },
  colIndex: { width: "6%" },
  colItem: { width: "22%" },
  colHsn: { width: "10%" },
  colQty: { width: "9%" },
  colUnit: { width: "9%" },
  colGst: { width: "8%" },
  colGstAmount: { width: "14%" },
  colRate: { width: "10%" },
  colTotal: { width: "12%", textAlign: "right" },
  lowerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  termsBlock: {
    width: "48%",
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 4,
  },
  termsText: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 2,
  },
  totalsBlock: {
    width: "48%",
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalKey: {
    fontSize: 9,
    color: "#64748b",
  },
  totalValue: {
    fontSize: 9,
    color: "#0f172a",
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8b5a2b",
  },
  signatureSection: {
    marginTop: 18,
    alignItems: "flex-end",
  },
  signatureLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 20,
  },
  signatureLine: {
    width: 140,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    marginBottom: 4,
  },
  signatureRole: {
    fontSize: 8,
    color: "#64748b",
  },
  footerNote: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
});

const InvoicePdfPage = ({ invoice }: { invoice: Invoice }) => {
  const buyerInfo = getInvoiceBuyerById(invoice.buyerId);
  const sellerInfo = getInvoiceSellerById(invoice.sellerId);
  const applyGst = invoice.gstType !== GstType.NO_GST;
  const taxMode = invoice.taxMode;

  const {
    taxableSubtotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    cgstRate,
    sgstRate,
    igstRate,
    effectiveGstRate,
    roundOff,
  } = getInvoicePreviewMetrics(invoice.items, invoice.gstType, taxMode);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.sheet}>
        <View style={styles.topBlock}>
          <View>
            <Text style={styles.companyName}>{sellerInfo?.businessName}</Text>
            <Text style={styles.subtleText}>{sellerInfo?.registeredAddress}</Text>
            <Text style={styles.subtleText}>
              {sellerInfo?.state}
            </Text>
            <Text style={styles.subtleText}>GSTIN: {sellerInfo?.gstin}</Text>
            <Text style={styles.subtleText}>Email: {sellerInfo?.email}</Text>
          </View>

          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Date: </Text>
              <Text style={styles.metaValue}>
                {formatDate(invoice.invoiceDate)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Due Date: </Text>
              <Text style={styles.metaValue}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>PO Ref: </Text>
              <Text style={styles.metaValue}>#{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.billShipRow}>
          <View style={styles.billShipBox}>
            <Text style={styles.sectionLabel}>BILL TO</Text>
            <Text style={styles.sectionValue}>
              {buyerInfo?.businessName || invoice.buyerId}
            </Text>
            <Text style={styles.subtleText}>{buyerInfo?.registeredAddress}</Text>
            <Text style={styles.subtleText}>
             {buyerInfo?.state}
            </Text>
            <Text style={styles.subtleText}>GSTIN: {buyerInfo?.gstin}</Text>
            <Text style={styles.subtleText}>Contact: {buyerInfo?.phone}</Text>
          </View>

          <View style={styles.billShipBox}>
            <Text style={styles.sectionLabel}>SHIP FROM</Text>
            <Text style={styles.sectionValue}>{sellerInfo?.businessName}</Text>
            <Text style={styles.subtleText}>{sellerInfo?.registeredAddress}</Text>
            <Text style={styles.subtleText}>
              {sellerInfo?.state}
            </Text>
            <Text style={styles.subtleText}>Contact: {sellerInfo?.phone}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colIndex]}>#</Text>
            <Text style={[styles.th, styles.colItem]}>Item Name</Text>
            <Text style={[styles.th, styles.colHsn]}>HSN Code</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit</Text>
            <Text style={[styles.th, styles.colGst]}>GST</Text>
            <Text style={[styles.th, styles.colGstAmount]}>GST Amount</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colTotal]}>Total</Text>
          </View>

          {invoice.items.map((item, index) => {
            const itemTaxableAmount = Number(item.basePrice) * Number(item.quantity);
            const itemGstAmount = (itemTaxableAmount * effectiveGstRate) / 100;
            const itemTotalWithGst = itemTaxableAmount + itemGstAmount;

            return (
              <View style={styles.tableRow} key={item.id}>
                <Text style={[styles.td, styles.colIndex]}>
                  {`0${index + 1}`.slice(-2)}
                </Text>
                <Text style={[styles.tdBold, styles.colItem]}>
                  {item.itemId}
                </Text>
                <Text style={[styles.td, styles.colHsn]}>5577</Text>
                <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.colUnit]}>Pcs</Text>
                <Text style={[styles.td, styles.colGst]}>
                  {effectiveGstRate.toFixed(2)}%
                </Text>
                <Text style={[styles.td, styles.colGstAmount]}>
                  {formatCurrency(itemGstAmount)}
                </Text>
                <Text style={[styles.td, styles.colRate]}>
                  {formatCurrency(Number(item.basePrice))}
                </Text>
                <Text style={[styles.tdBold, styles.colTotal]}>
                  {formatCurrency(itemTotalWithGst)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.lowerRow}>
          <View style={styles.termsBlock}>
            <Text style={styles.termsTitle}>Terms & Conditions:</Text>
            <Text style={styles.termsText}>
              1. Goods once sold will not be taken back.
            </Text>
            <Text style={styles.termsText}>
              2. Interest @ 18% p.a. will be charged if payment is not made
              within 30 days.
            </Text>
            <Text style={styles.termsText}>
              3. Subject to Surat jurisdiction only.
            </Text>
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalLine}>
              <Text style={styles.totalKey}>Sub Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(taxableSubtotal)}
              </Text>
            </View>
            {applyGst ? (
              taxMode === TaxMode.IGST ? (
                <View style={styles.totalLine}>
                  <Text style={styles.totalKey}>
                    IGST ({igstRate.toFixed(2)}%)
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(igstAmount)}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.totalLine}>
                    <Text style={styles.totalKey}>
                      CGST ({cgstRate.toFixed(2)}%)
                    </Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(cgstAmount)}
                    </Text>
                  </View>
                  <View style={styles.totalLine}>
                    <Text style={styles.totalKey}>
                      SGST ({sgstRate.toFixed(2)}%)
                    </Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(sgstAmount)}
                    </Text>
                  </View>
                </>
              )
            ) : null}
            <View style={styles.totalLine}>
              <Text style={styles.totalKey}>Tax Breakdown</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalGstAmount)}
              </Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalKey}>Round Off</Text>
              <Text style={styles.totalValue}>{formatCurrency(roundOff)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalLine}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.signatureLabel}>Authorized Signatory</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureRole}>Finance Director</Text>
        </View>

        <Text style={styles.footerNote}>
          This is a computer-generated document with digital authorization.
        </Text>
      </View>
    </Page>
  );
};

export const InvoicePdf = ({ invoice }: { invoice: Invoice }) => {
  return (
    <Document>
      <InvoicePdfPage invoice={invoice} />
    </Document>
  );
};

export const InvoicesPdf = ({ invoices }: { invoices: Invoice[] }) => {
  return (
    <Document>
      {invoices.map((invoice) => (
        <InvoicePdfPage key={invoice.id} invoice={invoice} />
      ))}
    </Document>
  );
};
