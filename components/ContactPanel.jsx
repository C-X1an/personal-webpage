import { useEffect, useState } from 'react';

import styles from '../styles/ContentPanels.module.css';

const initialValues = {
  name: '',
  email: '',
  message: '',
};

function sanitizeValue(value, { preserveLineBreaks = false } = {}) {
  const nextValue = String(value || '').replace(/[<>]/g, '').replace(/\r/g, '');

  if (preserveLineBreaks) {
    return nextValue
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();
  }

  return nextValue.replace(/\s+/g, ' ').trim();
}

function sanitizeValues(values) {
  return {
    name: sanitizeValue(values.name),
    email: sanitizeValue(values.email),
    message: sanitizeValue(values.message, { preserveLineBreaks: true }),
  };
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.5v-1.77c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.1 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 7.82c.85 0 1.71.12 2.51.36 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.97-2.34 4.84-4.58 5.09.36.32.68.95.68 1.92v2.84c0 .28.18.6.69.5A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6.75h16A1.25 1.25 0 0 1 21.25 8v8A1.25 1.25 0 0 1 20 17.25H4A1.25 1.25 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m3.5 8 8.01 5.72a.85.85 0 0 0 .98 0L20.5 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResumeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 3.75h7.25L18.25 8v12.25H7V3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 3.75V8h4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 11.5h6M9.5 14.5h6M9.5 17.5h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function validate(values) {
  const errors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.message.trim().length < 10) {
    errors.message = 'Message should be at least 10 characters.';
  }

  return errors;
}

function buildMailto(values) {
  const body = encodeURIComponent(
    `Name: ${values.name || ''}\nEmail: ${values.email || ''}\n\n${values.message || ''}`,
  );

  return `mailto:?subject=${encodeURIComponent('Portfolio enquiry for Chong Xian')}&body=${body}`;
}

export default function ContactPanel() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  const mailtoHref = buildMailto(sanitizeValues(values));

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedValues = sanitizeValues(values);
    const validationErrors = validate(cleanedValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!endpoint) {
      setToast({
        tone: 'error',
        message:
          'Form delivery is not configured yet. Use the mail fallback below while NEXT_PUBLIC_FORMSPREE_ENDPOINT is unset.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let response = await postContact(endpoint, cleanedValues);

      if (!response.ok) {
        response = await postContact('/api/contact', cleanedValues);
      }

      if (!response.ok) {
        const payload = await readJson(response);
        throw new Error(payload.message || 'Request failed');
      }

      setValues(initialValues);
      setToast({
        tone: 'success',
        message: 'Message sent. The garden kiosk has your note.',
      });
    } catch (error) {
      setToast({
        tone: 'error',
        message:
          error instanceof Error && error.message
            ? error.message
            : 'The request did not reach Formspree. Use the mail fallback or GitHub link below.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.contactShell}>
      <div className={styles.contactGrid}>
        <section className={styles.contactCard} aria-labelledby="contact-panel-title">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Contact kiosk</p>
            <h3 id="contact-panel-title" className={styles.title}>
              Send a note without leaving the garden.
            </h3>
            <p className={styles.lead}>
              Formspree handles delivery on the client side. If the request fails,
              the panel falls back to a mail draft and direct profile links.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.field}>
              <span>Name (optional)</span>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                autoComplete="name"
                aria-label="Name"
              />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email ? (
                <p id="contact-email-error" className={styles.fieldError}>
                  {errors.email}
                </p>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Message</span>
              <textarea
                name="message"
                value={values.message}
                onChange={handleChange}
                rows="6"
                required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
              />
              {errors.message ? (
                <p id="contact-message-error" className={styles.fieldError}>
                  {errors.message}
                </p>
              ) : null}
            </label>

            <div className={styles.submitRow}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
              <a href={mailtoHref} className={styles.subtleLink}>
                Open mail draft
              </a>
            </div>
          </form>

          {toast ? (
            <p
              className={`${styles.toast} ${
                toast.tone === 'success' ? styles.toastSuccess : styles.toastError
              }`}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {toast.message}
            </p>
          ) : null}
        </section>

        <aside className={styles.socialStack} aria-label="Contact links">
          <div className={styles.socialCard}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Elsewhere</p>
              <p className={styles.lead}>
                GitHub, resume access, and a direct mail draft stay reachable from
                the same panel.
              </p>
            </div>

            <div className={styles.socialList}>
              <a
                href="https://github.com/C-X1an"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <GithubIcon className={styles.socialIcon} />
                <span className={styles.socialText}>
                  <span className={styles.socialTitle}>GitHub</span>
                  <span className={styles.socialLabel}>github.com/C-X1an</span>
                </span>
              </a>

              <a href={mailtoHref} className={styles.socialLink}>
                <MailIcon className={styles.socialIcon} />
                <span className={styles.socialText}>
                  <span className={styles.socialTitle}>Email draft</span>
                  <span className={styles.socialLabel}>Open a prepared message</span>
                </span>
              </a>

              <a
                href="/api/asset/resume/Chong_Xian_resume.pdf"
                className={styles.socialLink}
                download
              >
                <ResumeIcon className={styles.socialIcon} />
                <span className={styles.socialText}>
                  <span className={styles.socialTitle}>Resume</span>
                  <span className={styles.socialLabel}>Download PDF</span>
                </span>
              </a>
            </div>
          </div>

          {!endpoint ? (
            <p className={styles.fallbackNote}>
              Set <code>NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> in the environment
              to activate live form delivery.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

async function postContact(url, payload) {
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
