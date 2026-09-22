import { formText } from "@/lib/form";
import type { RegistrationProfile } from "@/services/auth";

/** Returns the complete Task 4-compatible profile, or null with incomplete/inconsistent fields. */
export function registrationProfile(
  form: FormData,
  termsAccepted: boolean,
  ageConfirmed: boolean,
): RegistrationProfile | null {
  const text = (key: string) => formText(form, key);
  const discipline = text("discipline");
  const seniority = text("seniority");
  const employmentStatus = text("employmentStatus");
  const companyName = text("companyName");
  const jobTitle = text("jobTitle");
  const country = text("country").toUpperCase();
  const city = text("city");
  const timeZone = text("timeZone");
  const needsWorkDetails = employmentStatus === "employed" || employmentStatus === "freelance";
  if (
    discipline === "" ||
    seniority === "" ||
    employmentStatus === "" ||
    !/^[A-Z]{2}$/.test(country) ||
    timeZone === "" ||
    !termsAccepted ||
    !ageConfirmed ||
    (needsWorkDetails && (companyName === "" || jobTitle === ""))
  ) {
    return null;
  }
  return {
    discipline,
    seniority,
    employmentStatus,
    ...(companyName === "" ? {} : { companyName }),
    ...(jobTitle === "" ? {} : { jobTitle }),
    country,
    ...(city === "" ? {} : { city }),
    timeZone,
    termsAccepted: true,
    ageConfirmed: true,
  };
}
