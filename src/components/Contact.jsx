import './Contact.css';

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <span className="contact-badge">GET IN TOUCH</span>
        <h2 className="contact-heading">Contact Now</h2>
        <p className="contact-sub">
          Have an exciting project, collaboration opportunity, or just want to say hello? Let's connect and build something remarkable.
        </p>

        <div className="contact-ctas">
          <a href="mailto:nagaspreetham@gmail.com" className="contact-btn">
            <span>Send an Email</span>
            <svg className="btn-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              GitHub
            </a>
            <span className="social-dot">/</span>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              LinkedIn
            </a>
            <span className="social-dot">/</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
