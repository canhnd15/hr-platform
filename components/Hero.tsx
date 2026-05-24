"use client";

import { useTenant } from "@/components/TenantProvider";
import { SocialIcon } from "./SocialIcon";

export function Hero() {
  const { profile } = useTenant();

  const initials = (profile.fullName || "")
    .replace(/^Ms\.\s|^Mr\.\s/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="hero-section hero-bg-desktop relative overflow-hidden w-full flex items-center">
      <div className="container-app relative z-10 flex items-center w-full hero-inner">
        <div className="recruiter-intro flex items-start gap-[clamp(10px,1.11vw,16px)] w-full max-w-[560px] shrink-0 relative z-10">
          <div className="employers-logo rounded-full overflow-hidden shrink-0 shadow-md bg-white grid place-items-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-dark-3 font-bold text-2xl select-none">
                {initials || "?"}
              </span>
            )}
          </div>
          <div className="recruiter-info flex flex-col gap-[clamp(8px,0.9vw,13px)] flex-1">
            <div className="flex flex-col gap-2">
              <h1
                className="font-semibold leading-tight text-dark-3 whitespace-nowrap"
                style={{
                  fontSize: "clamp(18px, 1.81vw, 26px)",
                  letterSpacing: "-0.5px",
                }}
              >
                <span>{profile.fullName}</span>{" "}
                {profile.email && (
                  <span
                    className="text-dark-3"
                    style={{ fontSize: 16, fontWeight: 400 }}
                  >
                    ({profile.email})
                  </span>
                )}
              </h1>
              <p
                className="text-dark-3 leading-relaxed"
                style={{ fontSize: "clamp(12px, 0.97vw, 14px)" }}
              >
                {profile.title}
                <br />
                <strong className="font-bold">
                  {profile.yearsExperience} years
                </strong>{" "}
                of experience in{" "}
                <strong className="font-bold">{profile.specialty}</strong>
                <br />
                {profile.tagline}
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-[clamp(10px,1.11vw,16px)]">
              {profile.socials.facebook && (
                <SocialIcon kind="facebook" href={profile.socials.facebook} />
              )}
              {profile.socials.telegram && (
                <SocialIcon kind="telegram" href={profile.socials.telegram} />
              )}
              {profile.socials.whatsapp && (
                <SocialIcon kind="whatsapp" href={profile.socials.whatsapp} />
              )}
              {profile.socials.linkedin && (
                <SocialIcon kind="linkedin" href={profile.socials.linkedin} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
