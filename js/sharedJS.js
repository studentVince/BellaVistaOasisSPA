// Home-page dependencies copied from the shared app.js
const APP = { user: null, csrf: '', cat: {}, rw: {} };
const $ = id => document.getElementById(id);

async function api(action, data = {}, post = false) {
    const url = '../api.php?a=' + action + (post ? '' : '&' + new URLSearchParams(data));
    const options = post ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF': APP.csrf },
        body: JSON.stringify(data),
    } : {};

    const res  = await fetch(url, options);
    const json = await res.json();
    if (!res.ok) {
        const error = new Error(json.error || 'Something went wrong.');
        error.status = res.status;
        throw error;
    }
    return json;
}

function notice(message) {
    const box = $('flash');
    box.textContent = message;
    box.hidden = false;
    window.scrollTo(0, 0);
}

const LOGO = `
    <svg width=28 height=28 viewBox="0 0 28 28">
        <circle cx=14 cy=10 r=7 fill="#b8923f"/>
        <path d="M2 18q3-3 6 0t6 0 6 0 6 0M2 24q3-3 6 0t6 0 6 0 6 0" stroke="#d9cbe8" fill=none stroke-width=2 />
    </svg>`;

function renderNav(user) {
    const nav = $('nav');
    if (!nav) {
        throw new Error('Navigation element #nav was not found.');
    }

    nav.innerHTML = `
        <a class="navbar-logo" href="index.html">${LOGO}Bella Vista Oasis Spa</a>
        <a href="gallery.html">Gallery</a>
        <a href="booking.html">Book</a>
        <a href="companyDetails.html">About Us</a>
        <a href="termsAndConditions.html">Terms &amp; Conditions</a>
        <a href="account.html">${user ? 'My membership' : 'Sign in'}</a>
        ${user && user.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}`;
}

async function init() {
    const nav = $('nav');
    if (!nav) {
        throw new Error('Navigation element #nav was not found.');
    }

    renderNav(null);

    nav.insertAdjacentHTML('afterend', '<div id="flash" class="flash" hidden></div>');

    const saved = sessionStorage.getItem('flash');
    if (saved) {
        sessionStorage.removeItem('flash');
        notice(saved);
    }

    try {
        Object.assign(APP, await api('me'));
        renderNav(APP.user);
    } catch (error) {
        console.error('Could not load the current user; showing the public navigation.', error);
    }
}

init().catch(error => console.error('Could not initialize the page:', error));
