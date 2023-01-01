export const sleep = async (ms = 1000) => {
  return await new Promise((r) => setTimeout(r, ms));
};
