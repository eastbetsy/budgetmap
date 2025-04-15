document.addEventListener('DOMContentLoaded', function() {
    const plaidLinkButton = document.getElementById('plaid-link-button');
    const plaidLinkStatus = document.getElementById('plaid-link-status');
    
    plaidLinkButton.addEventListener('click', function() {
        initializePlaidLink();
    });
    
    function initializePlaidLink() {
        const linkToken = 'REPLACE_WITH_LINK_TOKEN_FROM_SERVER';
        
        try {
            const handler = Plaid.create({
                token: linkToken,
                onSuccess: (public_token, metadata) => {
                    plaidLinkStatus.innerHTML = '<p class="success-message">Account successfully connected!</p>';
                    console.log('Public Token:', public_token);
                    console.log('Metadata:', metadata);
                },
                onExit: (err, metadata) => {
                    if (err) {
                        plaidLinkStatus.innerHTML = `<p class="error-message">Error: ${err.error_message}</p>`;
                        console.error('Plaid Link Error:', err);
                    }
                },
                onEvent: (eventName, metadata) => {
                    console.log('Plaid Link Event:', eventName, metadata);
                }
            });
            
            handler.open();
        } catch (error) {
            console.error('Failed to initialize Plaid Link:', error);
            plaidLinkStatus.innerHTML = '<p class="error-message">Failed to initialize bank connection. Please try again later.</p>';
        }
    }
});