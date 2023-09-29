document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.delete-review-btn').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            if (!confirm('Are you sure you want to delete this review?')) {
                return;
            }

            const reviewId = this.getAttribute('data-id');
            const courseCode = this.getAttribute('data-course');
            
            fetch(`/courses/${courseCode}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error deleting the review.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error deleting the review.');
            });
        });
    });
});
