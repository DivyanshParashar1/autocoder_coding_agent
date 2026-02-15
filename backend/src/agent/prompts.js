export function plannerPrompt(userPrompt, fileList) {
  return [
    {
      role: "system",
      content: "You are an expert software planner. Produce a concise plan and key files.",
    },
    {
      role: "user",
      content: `User request:\n${userPrompt}\n\nExisting files:\n${fileList}\n\nReturn JSON with keys: summary, goals (array), files (array of file paths).`,
    },
  ];
}

export function architectPrompt(planJson) {
  return [
    {
      role: "system",
      content: "You are a software architect. Break the plan into implementable steps.",
    },
    {
      role: "user",
      content: `Plan:\n${planJson}\n\nReturn JSON with key steps: an array of objects {id, description, files}.`,
    },
  ];
}

export function coderPrompt(step, workspaceSnapshot) {
  return [
    {
      role: "system",
      content: "You are a coding agent. Produce file operations to implement the step.",
    },
    {
      role: "user",
      content: `Step:\n${JSON.stringify(step, null, 2)}\n\nWorkspace snapshot:\n${workspaceSnapshot}\n\nReturn JSON with key operations: array of {path, content, operation} where operation is 'write' or 'delete'.`,
    },
  ];
}
