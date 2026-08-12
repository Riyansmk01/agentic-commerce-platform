export interface ReadinessScore {
  total: number;
  status: "incomplete" | "needs_attention" | "ready_for_testing" | "strong";
  breakdown: {
    merchantIdentity: number;
    supportContact: number;
    returnPolicy: number;
    shippingPolicy: number;
    catalogPublished: number;
    productTitles: number;
    productIdentifiers: number;
    prices: number;
    stock: number;
    imagesAndUrls: number;
  };
  actions: string[];
}
