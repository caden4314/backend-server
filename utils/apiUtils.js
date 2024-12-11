function handleApiError(res, error, defaultMessage = 'Internal server error') {
  console.error('API Error:', error);
  const status = error.status || 500;
  const message = error.message || defaultMessage;
  
  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
}

function createApiResponse(data, message = 'Success') {
  return {
    success: true,
    data,
    message
  };
}

module.exports = {
  handleApiError,
  createApiResponse
};