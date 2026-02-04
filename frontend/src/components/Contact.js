import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Send us a message!</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-box">
            <h3>📧 Email</h3>
            <p>support@bookverse.com</p>
          </div>
          <div className="info-box">
            <h3>📞 Phone</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="info-box">
            <h3>📍 Address</h3>
            <p>123 Book Street, Library City, BC 12345</p>
          </div>
          <div className="info-box">
            <h3>⏰ Hours</h3>
            <p>Mon - Fri: 9AM - 6PM</p>
            <p>Sat - Sun: 10AM - 4PM</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {submitted && (
            <div className="success-message">
              ✓ Thank you! We've received your message and will get back to you soon.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              rows="6"
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-submit">Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
