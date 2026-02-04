const btn = document.getElementById('btn-theme');

if (document.cookie.includes('theme=dark')) {
    document.body.classList.add('dark');
}

btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    if (document.body.classList.contains('dark')) {
        document.cookie = "theme=dark; max-age=3600; path=/";
    } else {
        document.cookie = "theme=light; max-age=3600; path=/";
    }
});