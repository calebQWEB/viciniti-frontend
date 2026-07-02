"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { BankAccount, Bank, BankAccountCreate } from "@/types/bank_account";
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  Loader2,
  Star,
  CreditCard,
} from "lucide-react";

export default function BankAccountSection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedAccount, setVerifiedAccount] = useState<{
    account_name: string;
    account_number: string;
  } | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  // Fetch saved bank accounts
  const { data: bankAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const response = await api.get("/bank-accounts/");
      return response.data as BankAccount[];
    },
  });

  // Fetch list of banks
  const { data: banks, isLoading: loadingBanks } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const response = await api.get("/bank-accounts/banks");
      return response.data as Bank[];
    },
    enabled: showForm,
  });

  // Add bank account
  const { mutate: addAccount, isPending: adding } = useMutation({
    mutationFn: async (data: BankAccountCreate) => {
      const response = await api.post("/bank-accounts/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Failed to save bank account.");
    },
  });

  // Delete bank account
  const { mutate: deleteAccount } = useMutation({
    mutationFn: async (accountId: string) => {
      await api.delete(`/bank-accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });

  // Set default bank account
  const { mutate: setDefault } = useMutation({
    mutationFn: async (accountId: string) => {
      await api.patch(`/bank-accounts/${accountId}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });

  const handleVerify = async () => {
    if (!selectedBank || !accountNumber) {
      setError("Please select a bank and enter an account number.");
      return;
    }

    if (accountNumber.length !== 10) {
      setError("Account number must be 10 digits.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await api.post("/bank-accounts/verify-account", {
        account_number: accountNumber,
        bank_code: selectedBank.code,
      });
      setVerifiedAccount(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Could not verify account. Please check the details.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = () => {
    if (!verifiedAccount || !selectedBank) return;

    addAccount({
      bank_name: selectedBank.name,
      bank_code: selectedBank.code,
      account_number: verifiedAccount.account_number,
      account_name: verifiedAccount.account_name,
      is_default: isDefault,
    });
  };

  //   const handleSave = () => {
  //     if (!selectedBank || !accountNumber) {
  //       setError("Please select a bank and enter an account number.");
  //       return;
  //     }

  //     addAccount({
  //       bank_name: selectedBank.name,
  //       bank_code: selectedBank.code,
  //       account_number: accountNumber,
  //       account_name: verifiedAccount?.account_name || "Account Holder",
  //       is_default: isDefault,
  //     });
  //   };

  const resetForm = () => {
    setShowForm(false);
    setSelectedBank(null);
    setAccountNumber("");
    setVerifiedAccount(null);
    setIsDefault(false);
    setError("");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Payout Bank Account
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Account
          </button>
        )}
      </div>

      {/* Saved Accounts */}
      {loadingAccounts ? (
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading accounts...
        </div>
      ) : bankAccounts && bankAccounts.length > 0 ? (
        <div className="space-y-2 mb-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {account.bank_name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {account.account_number} · {account.account_name}
                  </p>
                  {account.is_default && (
                    <span className="text-[9px] font-bold text-[#2D6A4F] uppercase tracking-wide">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!account.is_default && (
                  <button
                    onClick={() => setDefault(account.id)}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#2D6A4F] transition"
                    title="Set as default"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteAccount(account.id)}
                  className="text-[10px] font-bold text-gray-400 hover:text-rose-500 transition"
                  title="Remove account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-xs text-gray-400 font-medium mb-4">
            No bank accounts saved yet. Add one to receive payouts.
          </p>
        )
      )}

      {/* Add Account Form */}
      {showForm && (
        <div className="space-y-3 pt-2">
          {/* Bank Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
              Select Bank
            </label>
            {loadingBanks ? (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading banks...
              </div>
            ) : (
              <select
                className="input w-full text-sm"
                value={selectedBank?.code || ""}
                onChange={(e) => {
                  const bank = banks?.find((b) => b.code === e.target.value);
                  setSelectedBank(bank || null);
                  setVerifiedAccount(null);
                  setError("");
                }}
              >
                <option value="">Select a bank</option>
                {banks?.map((bank) => (
                  <option key={bank.id} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">
              Account Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, ""));
                  setVerifiedAccount(null);
                  setError("");
                }}
                placeholder="10-digit account number"
                className="input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={
                  verifying || !selectedBank || accountNumber.length !== 10
                }
                className="px-3 py-2 bg-[#2D6A4F] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {verifying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>

          {/* Verified Account Name */}
          {verifiedAccount && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800">
                  {verifiedAccount.account_name}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  Account verified successfully
                </p>
              </div>
            </div>
          )}

          {/* Set as Default */}
          {verifiedAccount && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs font-medium text-gray-600">
                Set as default payout account
              </span>
            </label>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!verifiedAccount || adding}
              //disabled={adding}
              className="flex-1 py-2.5 bg-[#2D6A4F] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              {adding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Account"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
