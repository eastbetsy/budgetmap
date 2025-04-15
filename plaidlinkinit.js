document.addEventListener('DOMContentLoaded', function() {
    const plaidLinkButton = document.getElementById('plaid-link-button');
    const plaidLinkStatus = document.getElementById('plaid-link-status');
    
    if (plaidLinkButton) {
        plaidLinkButton.addEventListener('click', function() {
            initializePlaidLink();
        });
    }
    
    async function initializePlaidLink() {
        // Update status
        if (plaidLinkStatus) {
            plaidLinkStatus.innerHTML = '<p>Connecting to bank...</p>';
        }
        
        try {
            const response = await fetch('https://budgetmapai.vercel.app/api/create-link-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId') || `user-${Date.now()}`
                })
            });
            
            const data = await response.json();
            
            if (!data.success || !data.link_token) {
                throw new Error(data.error || 'Failed to get link token');
            }
            
            const linkToken = data.link_token;
            
            const handler = Plaid.create({
                token: linkToken,
                onSuccess: async (public_token, metadata) => {
                    if (plaidLinkStatus) {
                        plaidLinkStatus.innerHTML = '<p class="success-message">Account successfully connected!</p>';
                    }
                    
                    console.log('Public Token:', public_token);
                    console.log('Metadata:', metadata);
                    
                    try {
                        const exchangeResponse = await fetch('https://budgetmapai.vercel.app/api/exchange-public-token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                publicToken: public_token,
                                metadata: metadata,
                                userId: localStorage.getItem('userId') || `user-${Date.now()}`
                            })
                        });
                        
                        const exchangeData = await exchangeResponse.json();
                        
                        if (exchangeData.success) {
                            console.log('Access token obtained successfully');
                        } else {
                            console.error('Failed to exchange public token:', exchangeData.error);
                            if (plaidLinkStatus) {
                                plaidLinkStatus.innerHTML = '<p class="warning-message">Connected, but failed to save connection details.</p>';
                            }
                        }
                    } catch (exchangeError) {
                        console.error('Error exchanging public token:', exchangeError);
                    }
                },
                onExit: (err, metadata) => {
                    if (err) {
                        if (plaidLinkStatus) {
                            plaidLinkStatus.innerHTML = `<p class="error-message">Error: ${err.error_message || 'Connection failed'}</p>`;
                        }
                        console.error('Plaid Link Error:', err);
                    } else {
                        if (plaidLinkStatus) {
                            plaidLinkStatus.innerHTML = '<p>Connection canceled</p>';
                        }
                    }
                },
                onEvent: (eventName, metadata) => {
                    console.log('Plaid Link Event:', eventName, metadata);
                }
            });
            
            handler.open();
        } catch (error) {
            console.error('Failed to initialize Plaid Link:', error);
            if (plaidLinkStatus) {
                plaidLinkStatus.innerHTML = '<p class="error-message">Failed to initialize bank connection. Please try again later.</p>';
            }
        }
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const oauthStateId = urlParams.get('oauth_state_id');
    
    if (oauthStateId) {
        console.log('Returned from OAuth flow with state ID:', oauthStateId);
        localStorage.setItem('plaidOAuthStateId', oauthStateId);
        
        if (plaidLinkStatus) {
            plaidLinkStatus.innerHTML = '<p>Completing authentication...</p>';
        }
        initializePlaidLink();
    }
});