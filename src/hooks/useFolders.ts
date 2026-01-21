import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api, type Id } from "@/lib/convex";

export function useFolders(spaceId: Id<"spaces"> | undefined) {
  const folders = useQuery(api.folders.list, spaceId ? { spaceId } : "skip");
  const createFolderMutation = useMutation(api.folders.create);
  const updateFolderMutation = useMutation(api.folders.update);
  const deleteFolderMutation = useMutation(api.folders.remove);
  const reorderFoldersMutation = useMutation(api.folders.reorder);

  const createFolder = async (args: {
    spaceId: Id<"spaces">;
    name: string;
    color: string;
    icon?: string;
  }) => {
    try {
      const id = await createFolderMutation(args);
      toast.success("Folder created");
      return id;
    } catch (error) {
      toast.error("Failed to create folder");
      throw error;
    }
  };

  const updateFolder = async (args: {
    id: Id<"folders">;
    name?: string;
    color?: string;
    icon?: string;
  }) => {
    try {
      return await updateFolderMutation(args);
    } catch (error) {
      toast.error("Failed to update folder");
      throw error;
    }
  };

  const deleteFolder = async (args: { id: Id<"folders">; moveTodosToRoot: boolean }) => {
    try {
      const result = await deleteFolderMutation(args);
      toast.success("Folder deleted");
      return result;
    } catch (error) {
      toast.error("Failed to delete folder");
      throw error;
    }
  };

  const reorderFolders = async (args: { folderIds: Id<"folders">[] }) => {
    try {
      return await reorderFoldersMutation(args);
    } catch (error) {
      toast.error("Failed to reorder folders");
      throw error;
    }
  };

  return {
    folders,
    isLoading: folders === undefined,
    createFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
  };
}
