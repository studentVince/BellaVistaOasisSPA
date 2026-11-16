const APP = { user: null, csrf: '', cat: {}, rw: {} };

// ---------- Small helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const peso = n => '₱' + Number(n).toLocaleString('en-PH');
const dur  = c => c.m == 60 ? '1 hour' : '1.5 hours';
const $    = id => document.getElementById(id);

// 13:00 -> 1:00 PM
function formatTime(t) {
    const [h, m] = t.split(':');
    return (h % 12 || 12) + ':' + m + (h < 12 ? ' AM' : ' PM');
}

// Talk to api.php. GET by default, POST when post = true.
async function api(action, data = {}, post = false) {
    const url = 'api.php?a=' + action + (post ? '' : '&' + new URLSearchParams(data));
    const options = post ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF': APP.csrf },
        body: JSON.stringify(data),
    } : {};

    const res  = await fetch(url, options);
    const json = await res.json().catch(() => ({ error: 'The server did not answer. Is Apache running?' }));
    if (!res.ok) {
        const error = new Error(json.error || 'Something went wrong.');
        error.status = res.status;
        throw error;
    }
    return json;
}
// ---------- Messages ----------
function notice(message) {
    const box = $('flash');
    box.textContent = message;
    box.hidden = false;
    window.scrollTo(0, 0);
}
// Show a message on the next page (used before redirecting)
function noticeNext(message) {
    sessionStorage.setItem('flash', message);
}
async function init() {
    Object.assign(APP, await api('me'));
    const u = APP.user;

    $('nav').innerHTML = `
        <a class=logo href=index.html>${LOGO}Bella Vista Oasis Spa</a>
        <a href=index.html>Home</a>
        <a href=gallery.html>Rooms</a>
        <a href=book.html>Book</a>
        <a href=account.html>${u ? 'My membership' : 'Sign in'}</a>
        ${u && u.role == 'admin' ? '<a href=admin.html>Admin</a>' : ''}`;

    $('nav').insertAdjacentHTML('afterend', '<div id=flash class=flash hidden></div>');

    document.body.insertAdjacentHTML('beforeend', `
        <dialog id=tc>
            <div style="padding: 1.5rem">
                <h2>Terms and conditions</h2>
                <ol>
                    <li><b>Arrival.</b> Arrive 15 minutes early. Late arrivals get a shorter session so the next booking stays on time.</li>
                    <li><b>Cancellation.</b> Cancel or reschedule at least 6 hours before. Late cancellations forfeit any downpayment.</li>
                    <li><b>Health.</b> Tell us about medical conditions, injuries or pregnancy before choosing a service.</li>
                    <li><b>Quiet.</b> Keep silence and low volume on the premises.</li>
                </ol>
                <form method=dialog><button class=btn>Close</button></form>
            </div>
        </dialog>`);

    const saved = sessionStorage.getItem('flash');
    if (saved) {
        sessionStorage.removeItem('flash');
        notice(saved);
    }
}