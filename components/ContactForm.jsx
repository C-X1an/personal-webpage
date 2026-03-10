import { useState } from 'react';

import styles from '../styles/ContactForm.module.css';

const initialValues = {
  name: '',
  email: '',
  message: '',
};

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    tone: 'neutral',
    message:
      'Task_02 scaffold only: this form will submit through Formspree after the API route is wired.',
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      setFeedback({
        tone: response.ok ? 'success' : 'error',
        message:
          payload.message ||
          'The contact endpoint did not return a usable status message.',
      });
    } catch {
      setFeedback({
        tone: 'error',
        message:
          'The request could not reach the scaffolded contact endpoint. Formspree wiring is still pending.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="contact-title">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Contact preview</p>
        <h2 id="contact-title" className={styles.title}>
          Leave a note for the kiosk.
        </h2>
        <p className={styles.body}>
          The final site will post this form to Formspree through a Next API
          route. This task keeps the UI and request shape in place without
          claiming delivery is live yet.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            autoComplete="name"
            required
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
          />
        </label>

        <label className={styles.field}>
          <span>Message</span>
          <textarea
            name="message"
            value={values.message}
            onChange={handleChange}
            rows="5"
            required
          />
        </label>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending preview...' : 'Send message'}
        </button>

        <p
          className={`${styles.feedback} ${styles[`feedback${feedback.tone}`]}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      </form>
    </section>
  );
}
