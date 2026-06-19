const nodemailer = require('nodemailer')

const transporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST, port: +process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

const send = async (to, subject, html) => transporter().sendMail({
  from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
  to, subject, html
})

const wrap = (body) => `
<div style="background:#F5F3EE;padding:32px 16px;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden">
<div style="background:#0D0B1A;padding:24px 28px">
  <span style="display:inline-block;width:38px;height:38px;background:#FF5C00;border-radius:10px;text-align:center;line-height:38px;color:#fff;font-weight:800;font-size:18px">Q</span>
  <span style="color:#fff;font-size:20px;font-weight:800;margin-left:10px">QuickTix</span>
</div>
<div style="padding:28px">${body}</div>
<div style="background:#F5F3EE;padding:16px 28px;text-align:center;font-size:12px;color:#9E9788">
  &copy; ${new Date().getFullYear()} QuickTix &middot; Made with &#x1F9E1; in Nigeria
</div>
</div></div>`

const sendWelcome = async (user) => send(user.email, `Welcome to QuickTix, ${user.name.split(' ')[0]}! 🎉`,
  wrap(`<h2 style="color:#0D0B1A;font-size:22px;margin-bottom:8px">Welcome, ${user.name.split(' ')[0]}! 🎉</h2>
<p style="color:#4A4560;font-size:15px;line-height:1.7">You're all set. Start creating events and selling tickets in Naira.</p>
<a href="${process.env.CLIENT_URL}/create-event" style="display:inline-block;margin-top:20px;background:#FF5C00;color:#fff;text-decoration:none;padding:13px 28px;border-radius:50px;font-weight:700">Create Your First Event →</a>`))

const sendTicket = async (ticket, event) => {
  const d = new Date(event.date).toLocaleDateString('en-NG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
  send(ticket.attendeeEmail, `Your ticket for ${event.title} 🎟️`, wrap(`
<h2 style="color:#0D0B1A;font-size:22px;margin-bottom:4px">Ticket Confirmed! 🎟️</h2>
<p style="color:#4A4560;font-size:15px;margin-bottom:20px">Hi ${ticket.attendeeName.split(' ')[0]}, you're registered for <strong>${event.title}</strong>.</p>
<div style="background:#F5F3EE;border-radius:14px;padding:18px 20px;margin-bottom:20px">
  <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E8E4DA"><span style="color:#9E9788;font-size:13px">EVENT</span><span style="color:#0D0B1A;font-size:13px;font-weight:600">${event.title}</span></div>
  <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E8E4DA"><span style="color:#9E9788;font-size:13px">DATE</span><span style="color:#0D0B1A;font-size:13px;font-weight:600">${d}</span></div>
  <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E8E4DA"><span style="color:#9E9788;font-size:13px">VENUE</span><span style="color:#0D0B1A;font-size:13px;font-weight:600">${event.location}</span></div>
  <div style="display:flex;justify-content:space-between;padding:7px 0"><span style="color:#9E9788;font-size:13px">TICKET ID</span><span style="color:#FF5C00;font-size:13px;font-weight:700;font-family:monospace">${ticket.ticketId}</span></div>
</div>
${ticket.qrCode ? `<div style="text-align:center;background:#0D0B1A;border-radius:14px;padding:20px"><img src="${ticket.qrCode}" width="150" height="150" style="border-radius:8px"/><p style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:8px">Show at entry gate</p></div>` : ''}
<a href="${process.env.CLIENT_URL}/ticket/${ticket.ticketId}" style="display:inline-block;margin-top:20px;background:#FF5C00;color:#fff;text-decoration:none;padding:13px 28px;border-radius:50px;font-weight:700">View Ticket Online</a>`))
}

const sendPasswordReset = async (user, url) => send(user.email, 'Reset your QuickTix password 🔐',
  wrap(`<h2 style="color:#0D0B1A;font-size:22px;margin-bottom:8px">Reset your password 🔐</h2>
<p style="color:#4A4560;font-size:15px;line-height:1.7">Click below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
<a href="${url}" style="display:inline-block;margin-top:20px;background:#FF5C00;color:#fff;text-decoration:none;padding:13px 28px;border-radius:50px;font-weight:700">Reset Password →</a>
<p style="color:#9E9788;font-size:12px;margin-top:16px">If you didn't request this, ignore this email.</p>`))

module.exports = { sendWelcome, sendTicket, sendPasswordReset }
