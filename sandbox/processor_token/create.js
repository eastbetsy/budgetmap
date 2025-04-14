const request = {
  institution_id: institutionID,
  access_token: accessToken,
};

try {
  const response = await plaidClient.sandboxProcessorTokenCreate(request);
  const processorToken = response.data.processor_token;
} catch (error) {
  // handle error
}