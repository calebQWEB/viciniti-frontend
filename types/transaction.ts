export type TransactionStatus = "pending" | "success" | "failed";
export type TransactionType = "payment" | "payout";

export interface Transaction {
  id: string;
  user_id: string;
  reference: string;
  amount: number;
  fee: number;
  type: TransactionType;
  status: TransactionStatus;
  created_at: string;
}
