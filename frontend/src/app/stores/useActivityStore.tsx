import { create } from "zustand";
import { IActivity } from "../utilsNode";

interface Submission {
  _id: string;
  studentName: string;
  activityId: string;
  fileName: string;
  fileUrl: string;
  activity: IActivity;
  feedback?: {
    grade: number | null;
    feedbackText: string | null;
  };
}

interface ActivityState {
  submissions: Submission[];
  setSubmissions: (subs: Submission[]) => void;
  updateFeedback: (
    submissionId: string,
    grade: number | null,
    feedbackText: string | null
  ) => void;
  reset: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  submissions: [],
  setSubmissions: (subs) => set({ submissions: subs }),
  updateFeedback: (submissionId, grade, feedbackText) =>
    set((state) => ({
      submissions: state.submissions.map((sub) =>
        sub._id === submissionId
          ? { ...sub, feedback: { grade, feedbackText } }
          : sub
      ),
    })),
  reset: () => set({ submissions: [] }),
}));
