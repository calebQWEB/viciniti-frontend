export interface Bank {
  id: number;
  name: string;
  code: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  created_at: string;
}

export interface BankAccountCreate {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

export interface BankVerifyRequest {
  account_number: string;
  bank_code: string;
}

export interface BankVerifyResponse {
  account_number: string;
  account_name: string;
}
