import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { BankAccount } from "@/types/bank_account";

/** Whether the user has saved a payout bank account. Shares the cache with BankAccountSection. */
export const useHasPayoutAccount = () => {
  const { data, isPending } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const response = await api.get("/bank-accounts/");
      return response.data as BankAccount[];
    },
  });

  return {
    hasPayoutAccount: (data?.length ?? 0) > 0,
    isLoading: isPending,
  };
};
