const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const router = express.Router();

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Route to create link token
router.post('/create-link-token', async (req, res) => {
  try {
    const userId = req.body.userId || 'user-' + Math.floor(Math.random() * 10000);
    const request = {
      user: {
        client_user_id: userId
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
    
    res.json({
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
});

module.exports = router;