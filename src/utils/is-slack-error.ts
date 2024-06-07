interface SlackError {
  data: {
    error: string;
  };
}

export const isSlackError = (error: unknown): error is SlackError => {
  const cond =
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error?.data &&
    typeof error.data === 'object' &&
    'error' in error.data;

  return !!cond;
};
