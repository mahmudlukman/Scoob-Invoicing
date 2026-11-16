import { useEffect, useRef } from "react";

type OtpInputProps = {
  value: string; // digits only, e.g. "123"
  onChange: (value: string) => void;
  onComplete?: (value: string) => void; // fires when all boxes are filled
  length?: number;
  disabled?: boolean;
  hasError?: boolean; // red edges + shake
  autoFocus?: boolean;
};

const OtpInput = ({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  hasError = false,
  autoFocus = false,
}: OtpInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (index: number) => {
    const target = Math.max(0, Math.min(index, length - 1));
    inputsRef.current[target]?.focus();
  };

  const update = (next: string, focusIndex: number) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
    focusBox(focusIndex);
  };

  useEffect(() => {
    if (autoFocus) focusBox(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // On error: jump back to the first box and give phones a short buzz
  useEffect(() => {
    if (!hasError) return;
    focusBox(0);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError]);

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const existing = value[index] ?? "";

    // Deleted a digit
    if (!digits) {
      update(value.slice(0, index) + value.slice(index + 1), index);
      return;
    }

    // Typed over a filled box: keep only the newly typed digit
    let incoming = digits;
    if (existing && incoming.length > 1) {
      incoming = incoming.replace(existing, "") || existing;
    }

    // Autofill / multi-digit input
    if (incoming.length > 1) {
      const next = (value.slice(0, index) + incoming).slice(0, length);
      update(next, next.length);
      return;
    }

    const next = (
      value.slice(0, index) +
      incoming +
      value.slice(index + 1)
    ).slice(0, length);
    update(next, index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      e.preventDefault();
      update(value.slice(0, index - 1) + value.slice(index), index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(Math.min(index + 1, value.length));
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    const next = (value.slice(0, index) + digits).slice(0, length);
    update(next, next.length);
  };

  const handleFocus = (
    index: number,
    e: React.FocusEvent<HTMLInputElement>,
  ) => {
    e.target.select();
    // Boxes fill left to right: never let the user land past the next empty one
    if (index > value.length) focusBox(value.length);
  };

  return (
    <>
      <style>{`
        @keyframes otp-shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
        }
        .otp-shake { animation: otp-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
      `}</style>

      <div
        className={`flex justify-between gap-2 sm:gap-3 ${hasError ? "otp-shake" : ""}`}
        role="group"
        aria-label="Verification code"
      >
        {Array.from({ length }).map((_, i) => {
          const digit = value[i] ?? "";

          const stateClasses = hasError
            ? "border-red-500 bg-red-50 text-red-600 focus:ring-red-500/20"
            : digit
              ? "border-blue-900 bg-blue-50 text-blue-950 focus:ring-blue-900/20"
              : "border-slate-300 bg-white text-black focus:border-blue-900 focus:ring-blue-900/20";

          return (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              aria-invalid={hasError}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => handleFocus(i, e)}
              className={`flex-1 min-w-0 max-w-14 h-12 md:h-14 text-center text-xl font-semibold rounded-lg border-2 outline-none focus:ring-2 transition-colors duration-150 disabled:opacity-50 ${stateClasses}`}
            />
          );
        })}
      </div>
    </>
  );
};

export default OtpInput;
