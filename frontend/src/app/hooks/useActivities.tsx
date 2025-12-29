import useSWR from "swr";
import { useApiDataStore } from "../storesNode/apiDataStore";

export function useActivities(courseId: string, moduleId: string) {
    const {fetchActivities} = useApiDataStore();
  return useSWR(
    ["activities", courseId, moduleId],
    () => fetchActivities(courseId, moduleId),
    { revalidateOnFocus: false }
  );
}
