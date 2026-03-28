const JWT_SEGMENT_COUNT = 3;
const ERROR_NO_TOKEN = "Serverul nu a returnat token-ul.";

export const parseJwtFromResponse = (
  tokenValue: unknown,
): { token: string | null; error: string | null } => {
  if (typeof tokenValue !== "string") {
    return { token: null, error: ERROR_NO_TOKEN };
  }

  const rawToken = tokenValue.replace(/^Bearer\s+/i, "").trim();
  if (!rawToken) {
    return { token: null, error: ERROR_NO_TOKEN };
  }

  if (rawToken.split(".").length !== JWT_SEGMENT_COUNT) {
    return { token: null, error: "Format token invalid." };
  }

  return { token: rawToken, error: null };
};
