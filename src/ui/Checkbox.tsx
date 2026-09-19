import { Checkbox as RadixCheckbox } from "radix-ui";
import { Icon } from "./Icon";

type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Checkbox({ id, label, checked, onCheckedChange }: CheckboxProps) {
  return (
    <div className="touch-target flex items-center gap-2">
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="flex size-5 items-center justify-center rounded-sm border border-line-strong bg-surface data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <RadixCheckbox.Indicator className="text-on-accent">
          <Icon name="check" className="size-3" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id} className="text-sm text-fg">
        {label}
      </label>
    </div>
  );
}
