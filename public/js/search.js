// Display the courses in the list that match the input search term
function initSearch(courseList) {
    const courseSearchInput = document.getElementById('courseSearch');
    const courses = [...courseList.querySelectorAll('.col-md-4')];

    courseSearchInput.addEventListener('input', () => {
        const searchTerm = courseSearchInput.value.toLowerCase();

        courses.forEach(course => {
            const title = course.querySelector('.course-title').textContent.toLowerCase();
            const courseCode = course.querySelector('.course-code').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || courseCode.includes(searchTerm)) {
                course.style.display = 'block';
            } else {
                course.style.display = 'none';
            }
        });
    });
}