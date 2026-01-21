import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useSpaces() {
  const spaces = useQuery(api.spaces.list);
  const createSpace = useMutation(api.spaces.create);
  const updateSpace = useMutation(api.spaces.update);
  const deleteSpace = useMutation(api.spaces.remove);
  const reorderSpaces = useMutation(api.spaces.reorder);

  return {
    spaces,
    isLoading: spaces === undefined,
    createSpace,
    updateSpace,
    deleteSpace,
    reorderSpaces,
  };
}
