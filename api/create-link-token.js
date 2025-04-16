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

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://eastbetsy.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body || {};
    const clientUserId = userId || 'user-' + Math.floor(Math.random() * 10000);
    
    const request = {
      user: {
        client_user_id: clientUserId
      },
      client_name: 'BudgetMapAI',
      products: ['transactions'],
      transactions: {
        days_requested: 30
      },
      country_codes: ['US'],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
      redirect_uri: 'https://eastbetsy.github.io/budgetmap/oauth-page.html',
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings']
        },
        credit: {
          account_subtypes: ['credit card']
        }
      }
    };
    
    const response = await plaidClient.linkTokenCreate(request);
    const linkToken = response.data.link_token;
    
    res.status(200).json({
      success: true,
      link_token: linkToken
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create link token'
    });
  }
};