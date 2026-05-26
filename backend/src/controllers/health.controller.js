export const getHealth = (req, res) => {
  res.json({
    serverVersion: '1.0.0',
    apiVersion: 'v1',
    status: 'ok'
  });
};
