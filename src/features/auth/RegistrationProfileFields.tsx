import { t } from "@/i18n";
import { Checkbox } from "@/ui/Checkbox";
import { FormField } from "@/ui/FormField";
import { Input, Select } from "@/ui/Input";

const CHOOSE_ONE = "Choose one";
const DISCIPLINES = [
  ["backend", "Backend"],
  ["frontend", "Frontend"],
  ["full_stack", "Full-stack"],
  ["mobile", "Mobile"],
  ["devops_cloud", "DevOps and cloud"],
  ["data_ai", "Data and AI"],
  ["security", "Security"],
  ["qa", "QA and testing"],
  ["other", "Other"],
] as const;
const SENIORITIES = [
  ["student_intern", "Student or intern"],
  ["junior", "Junior"],
  ["mid", "Mid-level"],
  ["senior", "Senior"],
  ["lead_or_above", "Lead or above"],
] as const;
const EMPLOYMENT_STATUSES = [
  ["employed", "Employed"],
  ["freelance", "Freelance"],
  ["student", "Student"],
  ["between_roles", "Between roles"],
] as const;

type Props = {
  termsAccepted: boolean;
  ageConfirmed: boolean;
  onTermsAccepted: (checked: boolean) => void;
  onAgeConfirmed: (checked: boolean) => void;
};

function Choices({ choices }: { choices: readonly (readonly [string, string])[] }) {
  return (
    <>
      <option value="">{CHOOSE_ONE}</option>
      {choices.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  );
}

/** Task 1 mirrors the professional information required by final Task 4 registration. */
export function RegistrationProfileFields({
  termsAccepted,
  ageConfirmed,
  onTermsAccepted,
  onAgeConfirmed,
}: Props) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-md border border-line-strong p-3">
      <legend className="px-1 text-sm font-semibold">{t("auth.professionalDetails")}</legend>
      <FormField id="reg-discipline" label={t("auth.discipline")}>
        {(c) => (
          <Select {...c} name="discipline" defaultValue="">
            <Choices choices={DISCIPLINES} />
          </Select>
        )}
      </FormField>
      <FormField id="reg-seniority" label={t("auth.seniority")}>
        {(c) => (
          <Select {...c} name="seniority" defaultValue="">
            <Choices choices={SENIORITIES} />
          </Select>
        )}
      </FormField>
      <FormField id="reg-employment" label={t("auth.employmentStatus")}>
        {(c) => (
          <Select {...c} name="employmentStatus" defaultValue="">
            <Choices choices={EMPLOYMENT_STATUSES} />
          </Select>
        )}
      </FormField>
      <FormField id="reg-company" label={t("auth.companyName")}>
        {(c) => <Input {...c} name="companyName" autoComplete="organization" maxLength={120} />}
      </FormField>
      <FormField id="reg-job-title" label={t("auth.jobTitle")}>
        {(c) => <Input {...c} name="jobTitle" autoComplete="organization-title" maxLength={100} />}
      </FormField>
      <FormField id="reg-country" label={t("auth.country")}>
        {(c) => <Input {...c} name="country" autoComplete="country-name" maxLength={2} />}
      </FormField>
      <FormField id="reg-city" label={t("auth.city")}>
        {(c) => <Input {...c} name="city" autoComplete="address-level2" maxLength={80} />}
      </FormField>
      <FormField id="reg-time-zone" label={t("auth.timeZone")}>
        {(c) => <Input {...c} name="timeZone" defaultValue="UTC" maxLength={64} />}
      </FormField>
      <Checkbox
        id="reg-terms"
        label={t("auth.termsAccepted")}
        checked={termsAccepted}
        onCheckedChange={onTermsAccepted}
      />
      <Checkbox
        id="reg-age"
        label={t("auth.ageConfirmed")}
        checked={ageConfirmed}
        onCheckedChange={onAgeConfirmed}
      />
    </fieldset>
  );
}
