import { ItemCategory } from "./constants";
import { Invoice, InvoiceItem, Item, Party } from "./types";

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

export const mockInvoiceItems: InvoiceItem[] = [
  {
    id: "ii-1",
    itemId: "item-101",
    invoiceId: "inv-1",
    quantity: 120,
    price: 85,
  },
  {
    id: "ii-2",
    itemId: "item-102",
    invoiceId: "inv-1",
    quantity: 60,
    price: 140,
  },
  {
    id: "ii-3",
    itemId: "item-103",
    invoiceId: "inv-2",
    quantity: 200,
    price: 55,
  },
  {
    id: "ii-4",
    itemId: "item-104",
    invoiceId: "inv-3",
    quantity: 90,
    price: 210,
  },
];

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
    sgst: 1674,
    cgst: 1674,
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
    sgst: 990,
    cgst: 990,
    total: 12980,
    status: "PAID",
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
    sgst: 1701,
    cgst: 1701,
    total: 22302,
    status: "OVERDUE",
    notes: "Delayed due to transport issue",
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
];
