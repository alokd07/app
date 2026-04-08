declare module "react-native-razorpay" {
  type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    order_id?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  };

  type RazorpaySuccess = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  type RazorpayCheckoutType = {
    open(options: RazorpayOptions): Promise<RazorpaySuccess>;
  };

  const RazorpayCheckout: RazorpayCheckoutType;
  export default RazorpayCheckout;
}
