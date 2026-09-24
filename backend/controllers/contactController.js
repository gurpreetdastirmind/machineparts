// backend/controllers/contactController.js
const nodemailer = require('nodemailer');

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // 1. Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required.' 
      });
    }

    // 2. Create Transporter (Using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password here
      }
    });

    // 3. Setup Email Data
    const mailOptions = {
      from: `"${name}" <${email}>`, // Sender address
      to: process.env.ADMIN_EMAIL,   // Receiver (You)
      replyTo: email,                // Reply to the customer
      subject: subject || `New Contact Message from ${name}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // 4. Send Email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully!' 
    });

  } catch (error) {
    console.error('Nodemailer Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please try again later.',
      error: error.message 
    });
  }
};