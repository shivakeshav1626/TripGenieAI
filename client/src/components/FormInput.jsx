const FormInput = ({ label, error, className = "", inputClassName = "", ...props }) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input {...props} className={`input-field ${inputClassName}`} />
      {error ? <span className="mt-2 block text-sm text-red-300">{error}</span> : null}
    </label>
  );
};

export default FormInput;
