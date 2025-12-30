import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// IPv4 regex validation
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

interface IpAllowlistInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

function IpAllowlistInput({
  value = [],
  onChange,
  disabled = false,
}: IpAllowlistInputProps) {
  const { t } = useTranslation('dashboard');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateIp = (ip: string): boolean => {
    return IPV4_REGEX.test(ip.trim());
  };

  const handleAdd = useCallback(() => {
    const trimmedIp = inputValue.trim();

    if (!trimmedIp) {
      return;
    }

    if (!validateIp(trimmedIp)) {
      setError(t('ipAllowlist.invalidIp'));
      return;
    }

    if (value.includes(trimmedIp)) {
      setError(t('ipAllowlist.duplicateIp'));
      return;
    }

    onChange([...value, trimmedIp]);
    setInputValue('');
    setError(null);
  }, [inputValue, value, onChange, t]);

  const handleRemove = useCallback((ipToRemove: string) => {
    onChange(value.filter(ip => ip !== ipToRemove));
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) {
      setError(null);
    }
  }, [error]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-theme-text-primary">
          {t('ipAllowlist.title')}
        </label>
        {value.length === 0 && (
          <span className="text-xs text-theme-text-tertiary">
            {t('ipAllowlist.allAllowed')}
          </span>
        )}
      </div>

      {/* IP Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((ip) => (
            <div
              key={ip}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-mono"
            >
              <span>{ip}</span>
              <button
                type="button"
                onClick={() => handleRemove(ip)}
                disabled={disabled}
                className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors disabled:opacity-50"
                aria-label={t('ipAllowlist.removeIp', { ip })}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add IP Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t('ipAllowlist.placeholder')}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg bg-theme-bg-primary font-mono text-sm outline-none transition-all disabled:opacity-50 ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-theme-border focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('ipAllowlist.add')}
        </button>
      </div>

      <p className="text-xs text-theme-text-tertiary">
        {t('ipAllowlist.description')}
      </p>
    </div>
  );
}

export default IpAllowlistInput;
