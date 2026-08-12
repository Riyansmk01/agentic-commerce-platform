import { api } from "encore.dev/api";
import merchantsDb from "../merchants/db";
import catalogDb from "../catalog/db";
import policiesDb from "../policies/db";
import { ReadinessScore } from "./types";

interface GetReadinessScoreParams { organizationId: string; }
interface GetReadinessScoreResponse { score: ReadinessScore; }

// Calculates and returns the agent-readiness score for a merchant.
export const getReadinessScore = api<GetReadinessScoreParams, GetReadinessScoreResponse>(
  { expose: true, method: "GET", path: "/readiness/:organizationId" },
  async (req) => {
    const { organizationId } = req;

    const profile = await merchantsDb.queryRow<{
      display_name: string; support_email: string | null; support_phone: string | null;
      description: string | null;
    }>`SELECT display_name, support_email, support_phone, description FROM merchant_profiles WHERE organization_id = ${organizationId}`;

    const returnPolicy = await policiesDb.queryRow<{ id: string }>`
      SELECT id FROM merchant_policies WHERE organization_id = ${organizationId} AND policy_type = 'returns' AND active = true
    `;
    const shippingPolicy = await policiesDb.queryRow<{ id: string }>`
      SELECT id FROM merchant_policies WHERE organization_id = ${organizationId} AND policy_type = 'shipping' AND active = true
    `;

    const activeProducts = await catalogDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM products WHERE organization_id = $1 AND status = 'active'`,
      organizationId
    );

    const productsWithTitles = await catalogDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM products WHERE organization_id = $1 AND status = 'active' AND title IS NOT NULL AND title != ''`,
      organizationId
    );

    const variantsWithSku = await catalogDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE p.organization_id = $1 AND p.status = 'active' AND pv.sku IS NOT NULL`,
      organizationId
    );

    const variantsWithPrice = await catalogDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM prices pr
       JOIN product_variants pv ON pv.id = pr.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE p.organization_id = $1 AND p.status = 'active'`,
      organizationId
    );

    const variantsWithStock = await catalogDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM inventory i
       JOIN product_variants pv ON pv.id = i.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE p.organization_id = $1 AND p.status = 'active' AND i.availability_status != 'unknown'`,
      organizationId
    );

    const productsWithImages = await catalogDb.rawQueryRow<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM products WHERE organization_id = $1 AND status = 'active' AND primary_image_url IS NOT NULL`,
      organizationId
    );

    const totalActive = parseInt(activeProducts?.count ?? "0", 10);
    const actions: string[] = [];
    const breakdown = {
      merchantIdentity: 0,
      supportContact: 0,
      returnPolicy: 0,
      shippingPolicy: 0,
      catalogPublished: 0,
      productTitles: 0,
      productIdentifiers: 0,
      prices: 0,
      stock: 0,
      imagesAndUrls: 0,
    };

    if (profile?.display_name && profile?.description) {
      breakdown.merchantIdentity = 10;
    } else {
      actions.push("Complete merchant identity: add display name and description.");
    }

    if (profile?.support_email || profile?.support_phone) {
      breakdown.supportContact = 10;
    } else {
      actions.push("Add support contact: email or phone number.");
    }

    if (returnPolicy) {
      breakdown.returnPolicy = 10;
    } else {
      actions.push("Add a return policy.");
    }

    if (shippingPolicy) {
      breakdown.shippingPolicy = 10;
    } else {
      actions.push("Add a shipping policy.");
    }

    if (totalActive > 0) {
      breakdown.catalogPublished = 10;
    } else {
      actions.push("Publish at least one product in your catalog.");
    }

    if (totalActive > 0) {
      const titlesCount = parseInt(productsWithTitles?.count ?? "0", 10);
      breakdown.productTitles = titlesCount === totalActive ? 10 : Math.round((titlesCount / totalActive) * 10);
      if (titlesCount < totalActive) actions.push("Ensure all active products have titles.");
    }

    if (totalActive > 0) {
      const skuCount = parseInt(variantsWithSku?.count ?? "0", 10);
      breakdown.productIdentifiers = skuCount > 0 ? 10 : 0;
      if (skuCount === 0) actions.push("Add SKUs to product variants for better agent identification.");
    }

    if (totalActive > 0) {
      const priceCount = parseInt(variantsWithPrice?.count ?? "0", 10);
      breakdown.prices = priceCount > 0 ? 10 : 0;
      if (priceCount === 0) actions.push("Add prices to your product variants.");
    }

    if (totalActive > 0) {
      const stockCount = parseInt(variantsWithStock?.count ?? "0", 10);
      breakdown.stock = stockCount > 0 ? 10 : 0;
      if (stockCount === 0) actions.push("Set inventory levels for your product variants.");
    }

    if (totalActive > 0) {
      const imgCount = parseInt(productsWithImages?.count ?? "0", 10);
      breakdown.imagesAndUrls = imgCount === totalActive ? 10 : Math.round((imgCount / totalActive) * 10);
      if (imgCount < totalActive) actions.push("Add product images to all active products.");
    }

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const status: ReadinessScore["status"] =
      total < 30 ? "incomplete" :
      total < 60 ? "needs_attention" :
      total < 85 ? "ready_for_testing" : "strong";

    return {
      score: { total, status, breakdown, actions },
    };
  }
);
