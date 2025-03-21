// Loading screen functionality
function showLoadingScreen() {
    return Swal.fire({
        title: 'Loading Weather Data',
        html: 'Please wait while we fetch the latest weather information...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// Export the function for use in other files
window.showLoadingScreen = showLoadingScreen; 