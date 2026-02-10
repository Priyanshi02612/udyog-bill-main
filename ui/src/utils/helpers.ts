export const formatCurrency = (amount: number) =>
  amount === 0 ? "Nil" : `₹${amount.toLocaleString("en-IN")}`;
