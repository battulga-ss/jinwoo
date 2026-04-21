export const getSecret = () => {
  return process.env.JWT_SECRET || 'secret';
};
