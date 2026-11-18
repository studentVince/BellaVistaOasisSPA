const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const peso = n => '₱' + Number(n).toLocaleString('en-PH');
const dur  = c => c.m == 60 ? '1 hour' : '1.5 hours';

