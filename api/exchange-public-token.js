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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicToken, metadata, userId } = req.body;

    if (!publicToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing public token'
      });
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

// move to database later
    userAccessTokens[userId] = {
      accessToken,
      itemId,
      institutionId: metadata?.institution?.institution_id,
      accounts: metadata?.accounts || []
    };

    console.log(`Stored access token for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Successfully exchanged public token'
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to exchange public token'
    });
  }
};