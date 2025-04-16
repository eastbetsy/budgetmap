import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const userAccessTokens = {};

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://eastbetsy.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.method === 'GET' 
    ? req.query.userId 
    : req.body.userId;

  const startDate = req.method === 'GET' 
    ? req.query.startDate 
    : req.body.startDate;

  const endDate = req.method === 'GET' 
    ? req.query.endDate 
    : req.body.endDate;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Missing user ID'
    });
  }

  const userInfo = userAccessTokens[userId];
  
  if (!userInfo || !userInfo.accessToken) {
    return res.status(404).json({
      success: false,
      error: 'No access token found for this user'
    });
  }

  try {
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate 
      ? new Date(startDate) 
      : new Date(now.setDate(now.getDate() - 30));

    const startDateFormatted = start.toISOString().split('T')[0];
    const endDateFormatted = end.toISOString().split('T')[0];

    const request = {
      access_token: userInfo.accessToken,
      start_date: startDateFormatted,
      end_date: endDateFormatted,
      options: {
        include_personal_finance_category: true
      }
    };

    const response = await plaidClient.transactionsGet(request);
    
    const transactions = response.data.transactions;
    const accounts = response.data.accounts;

    res.status(200).json({
      success: true,
      data: {
        transactions,
        accounts
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transactions'
    });
  }
};