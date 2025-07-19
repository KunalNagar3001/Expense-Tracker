const LoadingSpinner = ({ size = 'md' }) => {
    const sizes = {
      sm: 'spinner-sm',
      md: 'spinner-md',
      lg: 'spinner-lg'
    };
    
    return (
      <div className="spinner-wrapper">
        <div className={`spinner ${sizes[size]}`}></div>
      </div>
    );
  };

  export default LoadingSpinner;