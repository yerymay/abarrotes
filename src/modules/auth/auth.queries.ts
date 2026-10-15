import { useQuery } from "@tanstack/react-query";
import { me } from "./auth.functions";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const user = await me();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        isAdmin: user.isAdmin,
      };
    },
  });
}
