declare module "~encore/auth" {
  export function getAuthData(): { userID: string } | undefined;
}

declare module "~encore/clients" {
  export const checkout: {
    createCheckoutSession(req: any): Promise<any>;
    getCheckoutSession(req: any): Promise<any>;
  };
  export const orders: {
    getOrder(req: any): Promise<any>;
  };
}
