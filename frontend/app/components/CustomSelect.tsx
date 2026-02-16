/**
 * CustomSelect Component
 * 
 * Dropdown select dengan custom arrow yang terlihat jelas di semua perangkat
 * termasuk mobile (iOS Safari, Android Chrome, dll)
 */

type CustomSelectProps = {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string | number; label: string }>;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    placeholder?: string;
};

export default function CustomSelect({
    value,
    onChange,
    options,
    className = "",
    disabled = false,
    required = false,
    name,
    placeholder,
}: CustomSelectProps) {
    return (
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`appearance-none bg-white pr-8 ${className}`}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {/* Custom Dropdown Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}
