import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api, type Id } from "@/lib/convex";

export function useSpaces() {
  const spaces = useQuery(api.spaces.list);
  const createSpaceMutation = useMutation(api.spaces.create);
  const updateSpaceMutation = useMutation(api.spaces.update);
  const deleteSpaceMutation = useMutation(api.spaces.remove);
  const reorderSpacesMutation = useMutation(api.spaces.reorder);

  const createSpace = async (args: { name: string; color: string; icon: string }) => {
    try {
      const id = await createSpaceMutation(args);
      toast.success("Space created");
      return id;
    } catch (error) {
      toast.error("Failed to create space");
      throw error;
    }
  };

  const updateSpace = async (args: { id: Id<"spaces">; name?: string; color?: string; icon?: string }) => {
    try {
      return await updateSpaceMutation(args);
    } catch (error) {
      toast.error("Failed to update space");
      throw error;
    }
  };

  const deleteSpace = async (args: { id: Id<"spaces"> }) => {
    try {
      const result = await deleteSpaceMutation(args);
      toast.success("Space deleted");
      return result;
    } catch (error) {
      toast.error("Failed to delete space");
      throw error;
    }
  };

  const reorderSpaces = async (args: { spaceIds: Id<"spaces">[] }) => {
    try {
      return await reorderSpacesMutation(args);
    } catch (error) {
      toast.error("Failed to reorder spaces");
      throw error;
    }
  };

  return {
    spaces,
    isLoading: spaces === undefined,
    createSpace,
    updateSpace,
    deleteSpace,
    reorderSpaces,
  };
}
