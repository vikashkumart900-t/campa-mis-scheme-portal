export function getProjectStorageKey(schemeCode) {
  return `aasthaVanProjects:${schemeCode || "state-proposal"}`;
}

export function readProjects(storageKey) {
  try {
    const savedProjects = localStorage.getItem(storageKey);
    if (!savedProjects) {
      return { projects: {}, message: "" };
    }

    const parsedProjects = JSON.parse(savedProjects);
    if (!parsedProjects || typeof parsedProjects !== "object" || Array.isArray(parsedProjects)) {
      throw new Error("Saved projects have an invalid format.");
    }
    Object.entries(parsedProjects).forEach(([projectId, project]) => {
      if (
        !project ||
        project.projectId !== projectId ||
        !project.values ||
        typeof project.values !== "object" ||
        Array.isArray(project.values)
      ) {
        throw new Error("A saved project record has an invalid format.");
      }
    });
    return { projects: parsedProjects, message: "" };
  } catch (error) {
    return {
      projects: {},
      message: `Unable to read saved projects: ${error.message}`
    };
  }
}
