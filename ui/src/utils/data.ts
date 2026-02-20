import { GstType, ItemCategory, TaxMode } from "./constants";
import {
  Inventory,
  InventoryItem as InventoryItemType,
  Invoice,
  InvoiceItem,
  InvoicePartyInfo,
  Item,
  Party,
} from "./types";

export const initialItems: Item[] = [
  {
    _id: "65f1c9a1b4e5a12c9d000001",
    name: "Dyed Silk Fabric – Royal Blue",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkfqPDkJIb-RIrB6SxyZlVO9fpc5hTfSy5hw&s",
    category: ItemCategory.FABRIC,
    description:
      "Premium Mulberry silk fabric dyed using reactive dyes with excellent color fastness. Ideal for luxury ethnic wear and premium drapery.",

    basePrice: 850,
    unit: "meter",
    gstPercentage: 12,
    hsnCode: 5007,

    color: "#4169E1", // Royal Blue
    materialType: "Mulberry Silk",
    designPattern: "Plain / Solid",

    ownerId: "65f1c9a1b4e5a12c9dOWNER1",
    isActive: false,

    createdAt: "2023-10-12T05:15:00.000Z",
    updatedAt: "2023-10-20T09:30:00.000Z",
  },

  {
    _id: "65f1c9a1b4e5a12c9d000002",
    name: "Printed Rayon Fabric – Floral",
    imageUrl:
      "https://fabcurate.com/cdn/shop/products/31003173-A.jpg?v=1600516988&width=1445",
    category: ItemCategory.FABRIC,
    description:
      "Soft rayon fabric with digital floral print. Lightweight and breathable for summer garments.",

    basePrice: 185,
    unit: "meter",
    gstPercentage: 5,
    hsnCode: 5516,

    color: "#87CEEB", // Sky Blue
    materialType: "Rayon",
    designPattern: "Floral",

    ownerId: "65f1c9a1b4e5a12c9dOWNER1",
    isActive: true,

    createdAt: "2023-09-18T08:45:00.000Z",
    updatedAt: "2023-09-18T08:45:00.000Z",
  },

  {
    _id: "65f1c9a1b4e5a12c9d000003",
    name: "Embroidered Silk Fabric – Maroon",
    imageUrl:
      "https://kapdashop.com/cdn/shop/products/4924379-1669450241076.jpg?v=1742220397&width=2048",
    category: ItemCategory.FABRIC,
    description:
      "Heavy silk fabric with zari embroidery suitable for bridal lehengas and festive wear.",

    basePrice: 420,
    unit: "meter",
    gstPercentage: 12,
    hsnCode: 5007,

    color: "#800000", // Maroon
    materialType: "Silk",
    designPattern: "Ethnic Embroidery",

    ownerId: "65f1c9a1b4e5a12c9dOWNER2",
    isActive: true,

    createdAt: "2023-08-05T06:20:00.000Z",
    updatedAt: "2023-08-22T10:10:00.000Z",
  },

  {
    _id: "65f1c9a1b4e5a12c9d000004",
    name: "Cotton Yarn 30s",
    imageUrl:
      "https://cpimg.tistatic.com/07818697/b/4/Cotton-Weaving-Yarn.jpeg",
    category: ItemCategory.MATERIAL,
    description:
      "Combed cotton yarn suitable for weaving and knitting applications.",

    basePrice: 310,
    unit: "kg",
    gstPercentage: 5,
    hsnCode: 5205,

    color: "#F8F8F0", // Off White
    materialType: "Cotton",

    ownerId: "65f1c9a1b4e5a12c9dOWNER1",
    isActive: true,

    createdAt: "2023-07-14T04:30:00.000Z",
    updatedAt: "2023-07-14T04:30:00.000Z",
  },

  {
    _id: "65f1c9a1b4e5a12c9d000005",
    name: "Polyester Sewing Thread – 40s",
    imageUrl:
      "https://d91ztqmtx7u1k.cloudfront.net/ClientContent/Images/ExtraLarge/325s-spun-polyester-thread-bl-20240607203147518.jpg",
    category: ItemCategory.THREAD,
    description:
      "High-strength polyester sewing thread suitable for industrial stitching.",

    basePrice: 65,
    unit: "cone",
    gstPercentage: 12,
    hsnCode: 5401,

    materialType: "Linen",
    color: "#000000", // Black

    ownerId: "65f1c9a1b4e5a12c9dOWNER3",
    isActive: true,

    createdAt: "2023-06-01T07:10:00.000Z",
    updatedAt: "2023-06-15T11:40:00.000Z",
  },

  {
    _id: "65f1c9a1b4e5a12c9d000006",
    name: "Discontinued Linen Fabric",
    imageUrl:
      "https://cdn11.bigcommerce.com/s-z9t2ne/images/stencil/800w/blog_images/post/a/c/a/g/beige-linen-fabric-1686828266.jpg",
    category: ItemCategory.FABRIC,
    description:
      "Previously stocked linen fabric, no longer in active production.",

    basePrice: 260,
    unit: "meter",
    gstPercentage: 5,
    hsnCode: 5309,

    materialType: "Linen",
    color: "#F5F5DC", // Beige

    ownerId: "65f1c9a1b4e5a12c9dOWNER2",
    isActive: false,

    createdAt: "2022-11-10T09:00:00.000Z",
    updatedAt: "2023-01-02T12:00:00.000Z",
  },
  {
    _id: "65f1c9a1b4e5a12c9d000006",
    name: "Discontinued Linen Fabric",
    imageUrl:
      "https://cdn11.bigcommerce.com/s-z9t2ne/images/stencil/800w/blog_images/post/a/c/a/g/beige-linen-fabric-1686828266.jpg",
    category: ItemCategory.FABRIC,
    description:
      "Previously stocked linen fabric, no longer in active production.",

    basePrice: 260,
    unit: "meter",
    gstPercentage: 5,
    hsnCode: 5309,

    materialType: "Linen",
    color: "#F5F5DC", // Beige

    ownerId: "65f1c9a1b4e5a12c9dOWNER2",
    isActive: false,

    createdAt: "2022-11-10T09:00:00.000Z",
    updatedAt: "2023-01-02T12:00:00.000Z",
  },
  {
    _id: "65f1c9a1b4e5a12c9d000006",
    name: "Discontinued Linen Fabric",
    imageUrl:
      "https://cdn11.bigcommerce.com/s-z9t2ne/images/stencil/800w/blog_images/post/a/c/a/g/beige-linen-fabric-1686828266.jpg",
    category: ItemCategory.FABRIC,
    description:
      "Previously stocked linen fabric, no longer in active production.",

    basePrice: 260,
    unit: "meter",
    gstPercentage: 5,
    hsnCode: 5309,

    materialType: "Linen",
    color: "#F5F5DC", // Beige

    ownerId: "65f1c9a1b4e5a12c9dOWNER2",
    isActive: false,

    createdAt: "2022-11-10T09:00:00.000Z",
    updatedAt: "2023-01-02T12:00:00.000Z",
  },
];

export const mockInventoryItems: InventoryItemType[] = [
  {
    id: "inv-item-1",
    inventoryId: "inventory-1",
    itemId: "65f1c9a1b4e5a12c9d000001",
    totalStock: 520,
    currentStock: 470,
  },
  {
    id: "inv-item-2",
    inventoryId: "inventory-1",
    itemId: "65f1c9a1b4e5a12c9d000003",
    totalStock: 320,
    currentStock: 280,
  },
  {
    id: "inv-item-3",
    inventoryId: "inventory-2",
    itemId: "65f1c9a1b4e5a12c9d000002",
    totalStock: 740,
    currentStock: 610,
  },
  {
    id: "inv-item-4",
    inventoryId: "inventory-2",
    itemId: "65f1c9a1b4e5a12c9d000004",
    totalStock: 260,
    currentStock: 200,
  },
  {
    id: "inv-item-5",
    inventoryId: "inventory-3",
    itemId: "65f1c9a1b4e5a12c9d000005",
    totalStock: 900,
    currentStock: 760,
  },
  {
    id: "inv-item-6",
    inventoryId: "inventory-3",
    itemId: "65f1c9a1b4e5a12c9d000006",
    totalStock: 180,
    currentStock: 0,
  },
];

export const mockInventories: Inventory[] = [
  {
    id: "inventory-1",
    collection: "Silk Collection",
    lotNumber: "LOT-2026-001",
    itemsCount: 2,
    totalStock: 750,
    dateReceived: "2026-01-08",
    totalValue: 516100,
    inventoryItems: mockInventoryItems.filter(
      (inventoryItem) => inventoryItem.inventoryId === "inventory-1",
    ),
  },
  {
    id: "inventory-2",
    collection: "Cotton & Rayon Collection",
    lotNumber: "LOT-2026-002",
    itemsCount: 2,
    totalStock: 810,
    dateReceived: "2026-01-14",
    totalValue: 174850,
    inventoryItems: mockInventoryItems.filter(
      (inventoryItem) => inventoryItem.inventoryId === "inventory-2",
    ),
  },
  {
    id: "inventory-3",
    collection: "Thread & Linen Collection",
    lotNumber: "LOT-2026-003",
    itemsCount: 2,
    totalStock: 760,
    dateReceived: "2026-01-19",
    totalValue: 49400,
    inventoryItems: mockInventoryItems.filter(
      (inventoryItem) => inventoryItem.inventoryId === "inventory-3",
    ),
  },
];

export const mockInvoiceItems: InvoiceItem[] = [
  {
    id: "ii-1",
    itemId: "item-101",
    itemName: "Dyed Silk Fabric - Royal Blue",
    invoiceId: "inv-1",
    quantity: 120,
    basePrice: 85,
    hsnCode: 0,
    unit: "Meter",
    gstPercentage: 0,
  },
  {
    id: "ii-2",
    itemId: "item-102",
    itemName: "Printed Rayon Fabric - Floral",
    invoiceId: "inv-1",
    quantity: 60,
    basePrice: 140,
    hsnCode: 0,
    unit: "Meter",
    gstPercentage: 0,
  },
  {
    id: "ii-3",
    itemId: "item-103",
    invoiceId: "inv-2",
    quantity: 200,
    basePrice: 55,
    hsnCode: 0,
    unit: "Kg",
    gstPercentage: 0,
    itemName: "Cotton Yarn 30s",
  },
  {
    id: "ii-4",
    itemId: "item-104",
    invoiceId: "inv-3",
    quantity: 90,
    basePrice: 210,
    hsnCode: 0,
    unit: "Meter",
    gstPercentage: 0,
    itemName: "Embroidered Silk Fabric - Maroon",
  },
  {
    id: "ii-5",
    itemId: "item-105",
    invoiceId: "inv-4",
    quantity: 150,
    basePrice: 95,
    hsnCode: 0,
    unit: "Cones",
    gstPercentage: 0,
    itemName: "Polyester Sewing Thread - 40s",
  },
  {
    id: "ii-6",
    itemId: "item-106",
    invoiceId: "inv-4",
    quantity: 80,
    basePrice: 160,
    hsnCode: 0,
    unit: "Meter",
    gstPercentage: 0,
    itemName: "Mulberry Silk Lining Fabric",
  },
  {
    id: "ii-7",
    itemId: "item-107",
    invoiceId: "inv-5",
    quantity: 75,
    basePrice: 320,
    hsnCode: 0,
    unit: "Meter",
    gstPercentage: 0,
    itemName: "Premium Cotton Blend Fabric",
  },
  {
    id: "ii-8",
    itemId: "item-108",
    invoiceId: "inv-5",
    quantity: 40,
    basePrice: 180,
    hsnCode: 0,
    unit: "Pack",
    gstPercentage: 0,
    itemName: "Thread Cones Assorted Pack",
  },
  {
    id: "ii-9",
    itemId: "item-109",
    invoiceId: "inv-6",
    quantity: 36,
    basePrice: 280,
    hsnCode: 0,
    unit: "Set",
    gstPercentage: 0,
    itemName: "Sample Swatch Set",
  },
];

export const MOCK_BUYERS: InvoicePartyInfo[] = [
  {
    id: "party-1",
    businessName: "Radhe Krishna Silks",
    gstin: "24AAAAA0000A1Z5",
    contactPerson: "Amit Shah",
    phone: "+91 98765 43210",
    email: "accounts@radhekrishnasilks.in",
    addressLine1: "Shop 17, Ring Road Textile Market",
    city: "Surat",
    state: "Gujarat",
    pincode: "395002",
  },
  {
    id: "party-2",
    businessName: "Bharat Textiles",
    gstin: "09BBBBB1111B2Z3",
    contactPerson: "Vikram Malhotra",
    phone: "+91 98111 22446",
    email: "finance@bharattextiles.in",
    addressLine1: "C-204, Cloth Merchants Complex",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
  },
  {
    id: "party-3",
    businessName: "New Fashion Hub",
    gstin: "27CCCCC2222C3Z1",
    contactPerson: "Sunita Rao",
    phone: "+91 98205 11335",
    email: "billing@newfashionhub.in",
    addressLine1: "12, Fashion Street, Kalbadevi",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400002",
  },
  {
    id: "party-4",
    businessName: "Om Sai Creations",
    gstin: "19DDDDD3333D4Z9",
    contactPerson: "Deepak Joshi",
    phone: "+91 98300 88442",
    email: "accounts@omsaicreations.in",
    addressLine1: "45, Burrabazar Textile Lane",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700007",
  },
  {
    id: "party-5",
    businessName: "Shree Ganesh Fabrics",
    gstin: "29EEEEE4444E5Z2",
    contactPerson: "Rohit Mehta",
    phone: "+91 98450 66022",
    email: "payables@shreeganeshfabrics.in",
    addressLine1: "No. 6, Textile Hub, Chickpet",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560053",
  },
];

export const MOCK_SELLERS: InvoicePartyInfo[] = [
  {
    id: "seller-1",
    businessName: "Vastra Fabrik Manufacturers",
    gstin: "24AAACV1234F1Z5",
    contactPerson: "Priyansh Patel",
    phone: "+91 99099 44002",
    email: "billing@vastrafabrik.com",
    addressLine1: "Unit 42, Textile Industrial Estate",
    city: "Surat",
    state: "Gujarat",
    pincode: "395003",
  },
];

export const getInvoiceBuyerById = (buyerId: string) =>
  MOCK_BUYERS.find((buyer) => buyer.id === buyerId);

export const getInvoiceSellerById = (sellerId: string) =>
  MOCK_SELLERS.find((seller) => seller.id === sellerId);

export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    buyerId: "party-1",
    sellerId: "seller-1",
    invoiceDate: "2025-01-05",
    dueDate: "2025-01-20",
    items: mockInvoiceItems.filter((i) => i.invoiceId === "inv-1"),
    subtotal: 18600,
    gstType: GstType.GST_18,
    taxMode: TaxMode.CGST_SGST,
    sgst: 1674,
    cgst: 1674,
    igst: 0,
    total: 21948,
    status: "SENT",
    paymentTerms: "15 Days Credit",
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    buyerId: "party-1",
    sellerId: "seller-1",
    invoiceDate: "2025-01-12",
    dueDate: "2025-01-27",
    items: mockInvoiceItems.filter((i) => i.invoiceId === "inv-2"),
    subtotal: 11000,
    gstType: GstType.GST_12,
    taxMode: TaxMode.CGST_SGST,
    sgst: 660,
    cgst: 660,
    igst: 0,
    total: 12320,
    status: "PAID",
    paymentTerms: "Immediate Payment",
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    buyerId: "party-2",
    sellerId: "seller-1",
    invoiceDate: "2025-01-18",
    dueDate: "2025-02-02",
    items: mockInvoiceItems.filter((i) => i.invoiceId === "inv-3"),
    subtotal: 18900,
    gstType: GstType.GST_18,
    taxMode: TaxMode.CGST_SGST,
    sgst: 1701,
    cgst: 1701,
    igst: 0,
    total: 22302,
    status: "OVERDUE",
    notes: "Delayed due to transport issue",
    paymentTerms: "15 Days Credit",
  },
  {
    id: 4,
    invoiceNumber: "INV-2025-004",
    buyerId: "party-3",
    sellerId: "seller-1",
    invoiceDate: "2025-01-22",
    dueDate: "2025-02-06",
    items: mockInvoiceItems.filter((i) => i.invoiceId === "inv-4"),
    subtotal: 27050,
    gstType: GstType.GST_5,
    taxMode: TaxMode.IGST,
    sgst: 0,
    cgst: 0,
    igst: 1352.5,
    total: 28403,
    status: "ACCEPTED",
    paymentTerms: "15 Days Credit",
  },
  {
    id: 5,
    invoiceNumber: "INV-2025-005",
    buyerId: "party-4",
    sellerId: "seller-1",
    invoiceDate: "2025-01-26",
    dueDate: "2025-02-10",
    items: mockInvoiceItems.filter((i) => i.invoiceId === "inv-5"),
    subtotal: 31200,
    gstType: GstType.GST_5,
    taxMode: TaxMode.CGST_SGST,
    sgst: 780,
    cgst: 780,
    igst: 0,
    total: 32760,
    status: "DRAFT",
    notes: "Awaiting internal approval before dispatch.",
  },
  {
    id: 6,
    invoiceNumber: "INV-2025-006",
    buyerId: "party-5",
    sellerId: "seller-1",
    invoiceDate: "2025-01-30",
    dueDate: "2025-02-14",
    items: mockInvoiceItems.filter((i) => i.invoiceId === "inv-6"),
    subtotal: 10080,
    gstType: GstType.NO_GST,
    sgst: 0,
    cgst: 0,
    igst: 0,
    total: 10080,
    status: "REJECTED",
    notes: "Rejected due to quantity mismatch in purchase order.",
    paymentTerms: "Against Delivery",
  },
];

export const MOCK_WHOLESALERS: Party[] = [
  {
    id: 1,
    businessName: "Radhe Krishna Silks",
    gstin: "24AAAAA0000A1Z5",
    contactPerson: "Amit Shah",
    phone: "9876543210",
    email: "test@gmail.com",
    address: "Surat, GJ",
    outstanding: 1245000,
    overdueInvoices: 4,
    invoices: mockInvoices.filter((inv) => inv.buyerId === "party-1"),
  },
  {
    id: 2,
    businessName: "Bharat Textiles",
    gstin: "09BBBBB1111B2Z3",
    contactPerson: "Vikram Malhotra",
    address: "Ahmedabad, GJ",
    phone: "9876543210",
    email: "test@gmail.com",
    outstanding: 230000,
    overdueInvoices: 0,
    invoices: [],
  },
  {
    id: 3,
    businessName: "New Fashion Hub",
    gstin: "27CCCCC2222C3Z1",
    contactPerson: "Sunita Rao",
    phone: "9876543210",
    email: "test@gmail.com",
    address: "Mumbai, MH",
    outstanding: 815400,
    overdueInvoices: 1,
    invoices: mockInvoices.filter((inv) => inv.buyerId === "party-2"),
  },
  {
    id: 4,
    businessName: "Om Sai Creations",
    gstin: "19DDDDD3333D4Z9",
    contactPerson: "Deepak Joshi",
    phone: "9876543210",
    email: "test@gmail.com",
    address: "Kolkata, WB",
    outstanding: 0,
    overdueInvoices: 0,
    invoices: [],
  },
  {
    id: 5,
    businessName: "Shree Ganesh Fabrics",
    gstin: "29EEEEE4444E5Z2",
    contactPerson: "Rohit Mehta",
    phone: "9876543210",
    email: "test@gmail.com",
    address: "Bengaluru, KA",
    outstanding: 560000,
    overdueInvoices: 2,
    invoices: [],
  },
  {
    id: 6,
    businessName: "Shree Ganesh Fabrics1",
    gstin: "29EEEEE4444E5Z2",
    contactPerson: "Rohit Mehta",
    phone: "9876543210",
    email: "test@gmail.com",
    address: "Bengaluru, KA",
    outstanding: 560000,
    overdueInvoices: 2,
    invoices: [],
  },
];
