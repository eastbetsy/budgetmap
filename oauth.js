document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for OAuth result
    const oauthStateId = urlParams.get('oauth_state_id');
    const error = urlParams.get('error');
    const statusElement = document.getElementById('status');
    
    if (error) {
        // Handle error
        statusElement.textContent = `Error: ${error}`;
        statusElement.className = 'error';
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    } else if (oauthStateId) {
        // Success case
        statusElement.textContent = 'Authentication successful!';
        statusElement.className = 'success';
        
        // Store the OAuth state ID if needed
        localStorage.setItem('plaidOAuthStateId', oauthStateId);
        
        // Redirect back to the main application
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    } else {
        // Unexpected state
        statusElement.textContent = 'Missing authentication parameters';
        statusElement.className = 'error';
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }
});