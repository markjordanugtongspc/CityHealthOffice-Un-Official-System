<!-- Prevent FOUC: Hide body until CSS loads -->
<style>
    body:not(.loaded) {
        visibility: hidden;
        opacity: 0;
    }
    body.loaded {
        visibility: visible;
        opacity: 1;
        transition: opacity 0.2s ease-in;
    }
    #page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f4f8fb 60%, #dbeafe 100%);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    #page-loader .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e2e8f0;
        border-top-color: #224796;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    #page-loader .text {
        margin-top: 1rem;
        color: #223557;
        font-weight: 500;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>

<!-- Page Loader (shown during asset loading) -->
<div id="page-loader">
    <div class="spinner"></div>
    <p class="text">Loading page...</p>
</div>
