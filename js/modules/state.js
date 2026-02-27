export const state = {
  taskName: "",
  checklist: {
    objective: false,
    owner: false,
    estimate: false
  },
  proofUrl: ""
};

export const taskPattern = /^[A-Z]+-[A-Z]+-[A-Z0-9-]+$/;
