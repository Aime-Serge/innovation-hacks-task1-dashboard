type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Native input: keyboard, focus and screen-reader behaviour come for free. */
export function Checkbox({ id, label, checked, onCheckedChange }: CheckboxProps) {
  return (
    <div className="touch-target flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="size-5 accent-accent"
      />
      <label htmlFor={id} className="text-sm text-fg">
        {label}
      </label>
    </div>
  );
}
