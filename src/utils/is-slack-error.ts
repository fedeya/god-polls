interface SlackError {
  data: {
    error: string;
  };
}

export const isSlackError = (error: any): error is SlackError => {
  return 'data' in error && error?.data && 'error' in error.data;
};
