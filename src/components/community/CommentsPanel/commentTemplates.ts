export const PLACEHOLDER = "[Type here...]";

export type CommentTemplate = {
  label: string;
  value: string;
};

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  {
    label: "Suggest an idea 💡",
    value:
      "### 💡 Suggest an idea\n\nWhat problem or improvement do you see?\n- ${PLACEHOLDER}\n\nWhy would this help?\n- ${PLACEHOLDER}\n\n(Optional) Examples or references:\n- ${PLACEHOLDER}\n",
  },
  {
    label: "Design feedback 🎨",
    value:
      "### 🎨 Design feedback\n\nWhat feels unclear or confusing?\n- ${PLACEHOLDER}\n\nWhat could be improved visually or UX-wise?\n- ${PLACEHOLDER}\n\n(Optional) Screenshots, sketches, or references:\n- ${PLACEHOLDER}\n",
  },
  {
    label: "Try to reproduce 🧪",
    value:
      "### 🧪 Try to reproduce\n\nWhat did you try?\n- ${PLACEHOLDER}\n\nWhat happened?\n- ${PLACEHOLDER}\n\nWhat did you expect instead?\n- ${PLACEHOLDER}\n\nEnvironment (optional):\n- Browser / device: ${PLACEHOLDER}\n- OS: ${PLACEHOLDER}\n",
  },
  {
    label: "Advice / architecture 🧠",
    value:
      "### 🧠 Advice / architecture\n\nHigh-level suggestion or concern:\n- ${PLACEHOLDER}\n\nReasoning:\n- ${PLACEHOLDER}\n\nTrade-offs or alternatives:\n- ${PLACEHOLDER}\n",
  },
  {
    label: "Code fix 💻",
    value:
      "### 💻 Code fix\n\nWhat part of the codebase would you change?\n- ${PLACEHOLDER}\n\nProposed approach:\n- ${PLACEHOLDER}\n\n(Optional) Links to files or PR:\n- ${PLACEHOLDER}\n",
  },
];
