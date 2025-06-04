import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

interface Restaurant {
  income: number;
  outcome: number;
  balance: number;
}

export const useFinanceStats = () => {
  return useQuery({
    queryKey: ["finance-stats"],
    queryFn: async () => {
      const res = await api.get<Restaurant>("/restaurant");
      const { income, outcome, balance } = res.data;
      return { income, expense: outcome, profit: balance };
    },
  });
};
