import './Contact.css';

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <p className="contact-sub">
          Have an exciting project, collaboration opportunity, or just want to say hello?
        </p>
        <p className="contact-sub">
          Let's connect and build something remarkable.
        </p>

        {/* Hover trigger container for email address & send a message button */}
        <div className="contact-email-trigger">
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nagasaipreetham@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-email">
            <span className="email-user">nagasaipreetham</span>
            <span className="email-domain">@gmail.com</span>
          </a>

          {/* Comet trail line container — layout-stable space holder */}
          <div className="email-underline-wrapper">
            <div className="email-underline"></div>
          </div>

          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nagasaipreetham@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-message-link">
            SEND A MESSAGE <span className="arrow">↗</span>
          </a>
        </div>

        {/* Divider line with text */}
        <div className="contact-divider">
          <span className="contact-divider-text">OR FIND ME ON</span>
        </div>

        {/* Center links grid (wrapped & centered) */}
        <div className="social-links-grid">
          <a href="https://x.com/MaddulaPreetham" target="_blank" rel="noopener noreferrer" className="social-link">
            X
          </a>
          <a href="https://www.linkedin.com/in/nagasaipreetham/" target="_blank" rel="noopener noreferrer" className="social-link">
            LINKEDIN
          </a>
          <a href="https://www.instagram.com/preetham_0405?igsh=MWtseHFwMW1oNWhhMA==" target="_blank" rel="noopener noreferrer" className="social-link">
            INSTAGRAM
          </a>
          <a href="https://discordapp.com/users/preetham.dev" target="_blank" rel="noopener noreferrer" className="social-link">
            DISCORD
          </a>
          <a href="https://github.com/nagasaipreetham" target="_blank" rel="noopener noreferrer" className="social-link">
            GITHUB
          </a>
        </div>
      </div>
    </section>
  );
}
