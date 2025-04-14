const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const goalButtonsContainer = document.getElementById('goal-buttons');
const ruleButtonsContainer = document.getElementById('rule-buttons');

let currentStep = 'name';
let userData = {
    name: '',
    monthlyIncome: 0,
    savings: 0,
    goal: '',
    savingsRule: ''
};

function appendMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendSpecialMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-with-buttons';
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    messageInput.value = '';

    handleResponse(message);
}

// Special messages with buttons
function selectGoal(goal) {
    goalButtonsContainer.style.display = 'none';
    appendMessage('user', goal);
    userData.goal = goal;
    
    setTimeout(() => {
        appendMessage('assistant', `Great choice! Let's work towards your goal of ${goal}.`);
        
        setTimeout(() => {
            appendMessage('assistant', `Based on your monthly income of ${userData.monthlyIncome.toFixed(2)} and savings of ${userData.savings.toFixed(2)}, I can help you create a plan to reach your goal of ${goal}.`);
            
            // move onto the savings rule options
            setTimeout(() => {
                appendMessage('assistant', "What savings rule would you like to use?");
                appendSpecialMessage("Please select a rule:");
                ruleButtonsContainer.style.display = 'flex';
                messageInput.style.display = 'none';
                currentStep = 'rule';
            }, 800);
        }, 800);
    }, 500);
}

function generatePersonalizedPlan() {
    let plan = '';
    
    switch(userData.savingsRule) {
        case '50/30/20 Rule':
            const needs = userData.monthlyIncome * 0.5;
            const wants = userData.monthlyIncome * 0.3;
            const savings = userData.monthlyIncome * 0.2;
            
            plan = `According to the 50/30/20 rule:
- Allocate $${needs.toFixed(2)} (50%) to needs (housing, utilities, food, etc.)
- Allocate $${wants.toFixed(2)} (30%) to wants (entertainment, dining out, etc.)
- Allocate $${savings.toFixed(2)} (20%) to savings/debt payoff`;
            break;
            
        case '70/20/10 Rule':
            const expenses = userData.monthlyIncome * 0.7;
            const debtPayment = userData.monthlyIncome * 0.2;
            const investment = userData.monthlyIncome * 0.1;
            
            plan = `According to the 70/20/10 rule:
- Allocate $${expenses.toFixed(2)} (70%) to expenses
- Allocate $${debtPayment.toFixed(2)} (20%) to debt repayment
- Allocate $${investment.toFixed(2)} (10%) to investments`;
            break;
            
        case '80/20 Rule':
            const spending = userData.monthlyIncome * 0.8;
            const save = userData.monthlyIncome * 0.2;
            
            plan = `According to the 80/20 rule:
- Allocate $${spending.toFixed(2)} (80%) to spending
- Allocate $${save.toFixed(2)} (20%) to savings`;
            break;
            
        default:
            plan = "Let's create a custom plan for your specific needs and goals.";
    }
    
    // specific advice
    if (userData.goal === 'Pay Off Debt') {
        plan += `\n\nSince your goal is to pay off debt, I recommend prioritizing the debt repayment portion of your budget.`;
    } else if (userData.goal === 'Emergency Fund') {
        plan += `\n\nTo build your emergency fund, I recommend setting up an automatic transfer to a high-yield savings account right after you get paid.`;
    } else if (userData.goal === 'Save for Retirement') {
        plan += `\n\nFor retirement savings, consider maximizing contributions to tax-advantaged accounts like 401(k) or IRAs.`;
    }
    
    appendMessage('assistant', plan);
}
function selectRule(rule) {
    ruleButtonsContainer.style.display = 'none';
    appendMessage('user', rule);
    userData.savingsRule = rule;
    
    setTimeout(() => {
        appendMessage('assistant', `Great choice! Let's use the ${rule} rule.`);
        
        setTimeout(() => {
            generatePersonalizedPlan();
            messageInput.style.display = 'block';
            messageInput.placeholder = "Ask me about your budget plan...";
            currentStep = 'planning';
        }, 800);
    }, 500);
}



function handleResponse(message) {
    switch(currentStep) {
        case 'name':
            userData.name = message;
            appendMessage('assistant', `Hello, ${userData.name}! Welcome to MiniEngine Finance, your personalized budgetting app.`);
            setTimeout(() => {
                appendMessage('assistant', "What is your monthly income?");
                messageInput.placeholder = "Enter your monthly income...";
                currentStep = 'income';
            }, 800);
            break;
            
        case 'income':
            userData.monthlyIncome = parseFloat(message.replace(/[^0-9.]/g, ''));
            if (isNaN(userData.monthlyIncome)) {
                appendMessage('assistant', "Please enter a valid number for your monthly income.");
                return;
            }
            setTimeout(() => {
                appendMessage('assistant', `Your monthly income is ${userData.monthlyIncome.toFixed(2)}.`);
                appendMessage('assistant', 'How much do you currently have in savings?');
                messageInput.placeholder = "Enter your savings amount";
                currentStep = 'savings';
            }, 800);
            break;
            
        case 'savings':
            userData.savings = parseFloat(message.replace(/[^0-9.]/g, ''));
            if (isNaN(userData.savings)) {
                appendMessage('assistant', "Please enter a valid number for your savings.");
                return;
            }
            setTimeout(() => {
                appendMessage('assistant', `You have ${userData.savings.toFixed(2)} in savings.`);
                appendMessage('assistant', "What is your savings goal?");
                appendSpecialMessage("Please select a goal:");
                goalButtonsContainer.style.display = 'flex';
                messageInput.style.display = 'none';
                currentStep = 'goal';
            }, 800);
            break;
            
        case 'planning':
            if (message.toLowerCase().includes('adjust') || message.toLowerCase().includes('change')) {
                appendMessage('assistant', "What would you like to adjust in your budget plan?");
            } else if (message.toLowerCase().includes('save') || message.toLowerCase().includes('download')) {
                appendMessage('assistant', "You can take a screenshot of this conversation to save your budget plan.");
            } else {
                appendMessage('assistant', "I'm here to help you with your budgeting plan. Feel free to ask any questions!");
            }
            break;
    }
}

// AWS Lambda Function Code
const mysql = require('mysql2/promise');
const plaid = require('plaid'); // Make sure to add this dependency to your Lambda

// Initialize Plaid client
const plaidClient = new plaid.PlaidApi(
  new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox, // Change to development or production as needed
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

// Create a database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.handler = async (event) => {
  try {
    // Parse the incoming webhook data
    const body = JSON.parse(event.body);
    console.log('Received webhook:', body);

    // Process webhook based on webhook_type and webhook_code
    if (body.webhook_type === 'TRANSACTIONS' && 
        (body.webhook_code === 'INITIAL_UPDATE' || 
         body.webhook_code === 'HISTORICAL_UPDATE' || 
         body.webhook_code === 'DEFAULT_UPDATE')) {
      
      const itemId = body.item_id;
      
      // Get access token from your secure storage
      const accessToken = await getAccessTokenForItemId(itemId);
      
      if (!accessToken) {
        console.error('No access token found for item_id:', itemId);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid item_id' }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
      
      // Calculate date 30 days ago for transactions request
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      
      // Format dates as YYYY-MM-DD
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get transactions from Plaid
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDateStr,
        end_date: endDateStr,
        options: {
          include_personal_finance_category: true
        }
      });
      
      const transactions = transactionsResponse.data.transactions;
      
      // Store transactions in MySQL
      await storeTransactionsInMySQL(itemId, transactions);
      
      console.log(`Successfully stored ${transactions.length} transactions for item ${itemId}`);
    }
    
    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process webhook' }),
      headers: { 'Content-Type': 'application/json' }
    };
  } finally {
    // Clean up any connections to avoid memory leaks
    pool.end();
  }
};

async function getAccessTokenForItemId(itemId) {
  // Retrieve the access token from MySQL
  try {
    const [rows] = await pool.execute(
      'SELECT access_token FROM plaid_items WHERE item_id = ?',
      [itemId]
    );
    
    return rows.length > 0 ? rows[0].access_token : null;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
}

async function storeTransactionsInMySQL(itemId, transactions) {
  // Use a connection from the pool
  const connection = await pool.getConnection();
  
  try {
    // Start a transaction
    await connection.beginTransaction();
    
    for (const transaction of transactions) {
      // Check if transaction already exists
      const [existingRows] = await connection.execute(
        'SELECT transaction_id FROM plaid_transactions WHERE transaction_id = ?',
        [transaction.transaction_id]
      );
      
      if (existingRows.length > 0) {
        // Update existing transaction
        await connection.execute(`
          UPDATE plaid_transactions SET
            account_id = ?,
            amount = ?,
            date = ?,
            name = ?,
            merchant_name = ?,
            category = ?,
            pending = ?,
            transaction_type = ?,
            payment_channel = ?,
            authorized_date = ?,
            transaction_data = ?,
            updated_at = NOW()
          WHERE transaction_id = ?
        `, [
          transaction.account_id,
          transaction.amount,
          transaction.date,
          transaction.name,
          transaction.merchant_name || null,
          JSON.stringify(transaction.category),
          transaction.pending ? 1 : 0,
          transaction.transaction_type,
          transaction.payment_channel,
          transaction.authorized_date || null,
          JSON.stringify(transaction),
          transaction.transaction_id
        ]);
      } else {
        // Insert new transaction
        await connection.execute(`
          INSERT INTO plaid_transactions (
            transaction_id, 
            item_id,
            account_id, 
            amount, 
            date, 
            name,
            merchant_name,
            category,
            pending,
            transaction_type,
            payment_channel,
            authorized_date,
            transaction_data,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          transaction.transaction_id,
          itemId,
          transaction.account_id,
          transaction.amount,
          transaction.date,
          transaction.name,
          transaction.merchant_name || null,
          JSON.stringify(transaction.category),
          transaction.pending ? 1 : 0,
          transaction.transaction_type,
          transaction.payment_channel,
          transaction.authorized_date || null,
          JSON.stringify(transaction)
        ]);
      }
    }
    
    // Commit the transaction
    await connection.commit();
  } catch (error) {
    // If error, rollback changes
    await connection.rollback();
    throw error;
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
}