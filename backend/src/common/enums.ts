export enum TaxMode {
  CGST_SGST = 'CGST_SGST',
  IGST = 'IGST',
}

export enum GstType {
  NO_GST = 'NO_GST',
  GST_5 = 'GST_5',
  GST_12 = 'GST_12',
  GST_18 = 'GST_18',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum InvoiceSubmitStatus {
  DRAFT = InvoiceStatus.DRAFT,
  SENT = InvoiceStatus.SENT,
  PAID = InvoiceStatus.PAID,
}
