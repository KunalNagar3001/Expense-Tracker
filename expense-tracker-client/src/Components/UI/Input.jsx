const Input = ({ label, type = 'text', placeholder, value, onChange, error, icon: Icon, ...props }) => {
    return (
      <div className="input-wrapper">
        {label && (
          <label className="input-label">
            {label}
          </label>
        )}
        <div className="input-inner-wrapper">
          {Icon && (
            <div className="input-icon-wrapper">
              <Icon className="input-icon" />
            </div>
          )}
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`input-field${Icon ? ' input-field-with-icon' : ''}${error ? ' input-field-error' : ''}`}
            {...props}
          />
        </div>
        {error && (
          <p className="input-error-text">{error}</p>
        )}
      </div>
    );
  };

  export default Input;