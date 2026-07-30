import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordField({ inputStyle, onFocus, onBlur, style, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ position: "relative", ...style }}>
      <input
        {...inputProps}
        type={isVisible ? "text" : "password"}
        style={{ ...inputStyle, paddingRight: 42 }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? "Ascunde parola" : "Arata parola"}
        title={isVisible ? "Ascunde parola" : "Arata parola"}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 34,
          height: 34,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {isVisible ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export default PasswordField;
