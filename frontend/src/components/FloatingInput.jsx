// One floating-label field, light or dark, input or textarea.
// Replaces the ~6 copies of this markup that used to live in
// Booking.jsx, Contact.jsx, Reviews.jsx and CartDrawer.jsx.
export default function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  pattern,
  title,
  textarea = false,
  rows = 3,
  dark = false,
}) {
  const Field = textarea ? 'textarea' : 'input';

  return (
    <div className="relative pt-2">
      <Field
        id={id}
        type={textarea ? undefined : type}
        rows={textarea ? rows : undefined}
        required={required}
        pattern={pattern}
        title={title}
        value={value}
        onChange={onChange}
        placeholder={label}
        className={`peer ${dark ? 'input-editorial-dark' : 'input-editorial'} placeholder-transparent ${
          textarea ? 'resize-none' : ''
        }`}
      />
      <label htmlFor={id} className={`field-label ${dark ? 'field-label-dark' : ''}`}>
        {label}
      </label>
    </div>
  );
}
