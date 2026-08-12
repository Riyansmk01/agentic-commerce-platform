import { api } from "encore.dev/api";
import db from "./db";
import { slugify } from "./helpers";

interface CreateDemoProductsRequest {
  organizationId: string;
}

interface CreateDemoProductsResponse {
  createdCount: number;
  productIds: string[];
}

const DEMO_PRODUCTS = [
  {
    title: "Sepatu Lari Nike Air Zoom Pegasus",
    description: "Sepatu lari premium dengan teknologi Air Zoom untuk kenyamanan maksimal saat berlari.",
    brand: "Nike",
    category: "Sepatu",
    primaryImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    variants: [
      { title: "Size 40 - Hitam", sku: "NK-PEG-40-BLK", listAmount: 1450000, qty: 15 },
      { title: "Size 42 - Hitam", sku: "NK-PEG-42-BLK", listAmount: 1450000, qty: 8 },
      { title: "Size 43 - Putih", sku: "NK-PEG-43-WHT", listAmount: 1450000, qty: 3 },
      { title: "Size 44 - Merah", sku: "NK-PEG-44-RED", listAmount: 1500000, qty: 0 },
    ],
  },
  {
    title: "Tas Ransel Laptop Eiger 30L",
    description: "Tas ransel multifungsi dengan kompartemen laptop 15 inch dan material tahan air.",
    brand: "Eiger",
    category: "Tas",
    primaryImageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    variants: [
      { title: "Hitam", sku: "EG-RL30-BLK", listAmount: 785000, qty: 25 },
      { title: "Abu-abu", sku: "EG-RL30-GRY", listAmount: 785000, qty: 12 },
    ],
  },
  {
    title: "Kaos Polo Uniqlo Dry-EX",
    description: "Kaos polo berbahan Dry-EX yang menyerap keringat dan cepat kering, cocok untuk aktivitas harian.",
    brand: "Uniqlo",
    category: "Pakaian",
    primaryImageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400",
    variants: [
      { title: "S - Navy", sku: "UQ-DREX-S-NVY", listAmount: 299000, qty: 30 },
      { title: "M - Navy", sku: "UQ-DREX-M-NVY", listAmount: 299000, qty: 45 },
      { title: "L - Putih", sku: "UQ-DREX-L-WHT", listAmount: 299000, qty: 20 },
      { title: "XL - Hitam", sku: "UQ-DREX-XL-BLK", listAmount: 299000, qty: 18 },
    ],
  },
  {
    title: "Dompet Kulit Pria Fossil Ryan",
    description: "Dompet kulit asli premium dengan desain bifold ramping dan banyak slot kartu.",
    brand: "Fossil",
    category: "Aksesori",
    primaryImageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
    variants: [
      { title: "Cokelat Muda", sku: "FS-RYN-TAN", listAmount: 650000, saleAmount: 520000, qty: 10 },
      { title: "Hitam", sku: "FS-RYN-BLK", listAmount: 650000, qty: 7 },
    ],
  },
  {
    title: "Sneakers Adidas Stan Smith",
    description: "Sneakers klasik ikonik dengan upper kulit dan sol karet yang nyaman untuk sehari-hari.",
    brand: "Adidas",
    category: "Sepatu",
    primaryImageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
    variants: [
      { title: "Size 39 - Putih/Hijau", sku: "AD-SS-39-WHG", listAmount: 1299000, qty: 6 },
      { title: "Size 41 - Putih/Hijau", sku: "AD-SS-41-WHG", listAmount: 1299000, qty: 11 },
      { title: "Size 43 - Putih/Navy", sku: "AD-SS-43-WHN", listAmount: 1299000, qty: 4 },
    ],
  },
];

// Creates sample Indonesian merchant products for demonstration and testing purposes.
export const createDemoProducts = api<CreateDemoProductsRequest, CreateDemoProductsResponse>(
  { expose: true, method: "POST", path: "/catalog/demo" },
  async (req) => {
    const productIds: string[] = [];

    for (const demo of DEMO_PRODUCTS) {
      const slug = slugify(demo.title) + "-" + Date.now().toString(36);
      const existing = await db.queryRow<{ id: string }>`
        SELECT id FROM products WHERE organization_id = ${req.organizationId} AND slug = ${slug}
      `;
      if (existing) continue;

      const product = await db.queryRow<{ id: string }>`
        INSERT INTO products (organization_id, slug, title, description, brand, category, primary_image_url, status, source)
        VALUES (${req.organizationId}, ${slug}, ${demo.title}, ${demo.description}, ${demo.brand},
          ${demo.category}, ${demo.primaryImageUrl}, 'active', 'demo')
        RETURNING id
      `;
      if (!product) continue;
      productIds.push(product.id);

      for (const v of demo.variants) {
        const variant = await db.queryRow<{ id: string }>`
          INSERT INTO product_variants (organization_id, product_id, sku, title, attributes)
          VALUES (${req.organizationId}, ${product.id}, ${v.sku}, ${v.title}, '{}')
          RETURNING id
        `;
        if (!variant) continue;

        await db.exec`
          INSERT INTO prices (organization_id, variant_id, currency, list_amount, sale_amount)
          VALUES (${req.organizationId}, ${variant.id}, 'IDR', ${v.listAmount}, ${(v as any).saleAmount ?? null})
        `;

        const qty = v.qty;
        const availStatus = qty > 10 ? "in_stock" : qty > 0 ? "low_stock" : "out_of_stock";
        await db.exec`
          INSERT INTO inventory (organization_id, variant_id, quantity_available, availability_status)
          VALUES (${req.organizationId}, ${variant.id}, ${qty}, ${availStatus})
        `;
      }
    }

    return { createdCount: productIds.length, productIds };
  }
);
