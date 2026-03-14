import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetTopScores(gameName: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topScores", gameName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores(gameName);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      gameName,
      score,
    }: { gameName: string; score: bigint }) => {
      if (!actor) return;
      await actor.saveScore(gameName, score);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topScores", variables.gameName],
      });
    },
  });
}
