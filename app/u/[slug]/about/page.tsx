import { Hero } from "@/components/Hero";
import { Markdown } from "@/components/Markdown";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function AboutPage({
  params,
}: {
  params: { slug: string };
}) {
  const tenant = await getTenantBySlug(params.slug);
  if (!tenant) notFound();
  if (!tenant.pages.about.visible) notFound();

  const about = tenant.pages.about;
  const profile = tenant.profile;

  return (
    <>
      <Hero />
      <section className="info-section w-full bg-white" style={{ padding: "64px 0" }}>
        <div className="container-app">
          {about.mode === "cv_upload" ? (
            <CvBlock cvUrl={about.cvUrl} cvFileName={about.cvFileName} />
          ) : (
            <TemplateBlock
              profile={profile}
              about={about.about}
              skills={about.skills}
              experiences={about.experiences}
              education={about.education}
            />
          )}
        </div>
      </section>
    </>
  );
}

function CvBlock({
  cvUrl,
  cvFileName,
}: {
  cvUrl: string | null;
  cvFileName: string | null;
}) {
  if (!cvUrl) {
    return (
      <div className="bg-white border border-gray-4 rounded-xl p-8 text-center">
        <p className="text-dark-3 text-base">
          The CV hasn't been uploaded yet. Please check back later.
        </p>
      </div>
    );
  }
  return (
    <div
      className="bg-white border border-gray-4 rounded-xl overflow-hidden flex flex-col"
      style={{ minHeight: 700 }}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-4 bg-gray-5">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-gray-2 font-semibold">
            Resume
          </span>
          <span className="text-sm font-semibold text-dark-1 truncate">
            {cvFileName ?? "CV.pdf"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-3 text-dark-1 rounded-full px-4 h-10 font-semibold hover:bg-gray-4/40 transition-colors inline-flex items-center text-sm"
          >
            Open in new tab
          </a>
          <a
            href={cvUrl}
            download
            className="bg-primary text-white rounded-full px-5 h-10 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors inline-flex items-center text-sm"
          >
            Download CV
          </a>
        </div>
      </div>
      <iframe
        src={cvUrl}
        title="Resume PDF"
        className="flex-1 w-full"
        style={{ minHeight: 700, border: 0 }}
      />
    </div>
  );
}

function TemplateBlock({
  profile,
  about,
  skills,
  experiences,
  education,
}: {
  profile: {
    fullName: string;
    title: string;
    avatarUrl: string | null;
    yearsExperience: number;
    specialty: string;
  };
  about: string;
  skills: string[];
  experiences: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: { school: string; degree: string; period: string }[];
}) {
  const empty =
    !about &&
    skills.length === 0 &&
    experiences.length === 0 &&
    education.length === 0;

  if (empty) {
    return (
      <div className="bg-white border border-gray-4 rounded-xl p-8 text-center">
        <p className="text-dark-3 text-base">
          This profile hasn't been filled in yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-4 rounded-xl p-8 md:p-10 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-24 h-24 rounded-full object-cover border border-gray-4 shrink-0"
          />
        ) : null}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-dark-1">{profile.fullName}</h2>
          {profile.title && (
            <p className="text-base text-gray-1">{profile.title}</p>
          )}
          {(profile.yearsExperience > 0 || profile.specialty) && (
            <p className="text-sm text-gray-1">
              {profile.yearsExperience > 0 ? (
                <>
                  <strong className="font-bold text-dark-1">
                    {profile.yearsExperience} years
                  </strong>
                  {profile.specialty ? " · " : ""}
                </>
              ) : null}
              {profile.specialty}
            </p>
          )}
        </div>
      </div>

      {about && (
        <section>
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-1 mb-3">
            About
          </h3>
          <div className="text-dark-3 leading-relaxed text-base">
            <Markdown source={about} />
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-1 mb-3">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-primary-tint text-primary rounded-full px-3 py-1 text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section>
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-1 mb-4">
            Experience
          </h3>
          <ul className="flex flex-col gap-5">
            {experiences.map((e, i) => (
              <li
                key={i}
                className="border-l-2 border-primary pl-4 flex flex-col gap-1"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-dark-1">
                    {e.title}
                    {e.company ? (
                      <span className="text-gray-1 font-normal">
                        {" "}
                        · {e.company}
                      </span>
                    ) : null}
                  </p>
                  {e.period && (
                    <span className="text-sm text-gray-2">{e.period}</span>
                  )}
                </div>
                {e.description && (
                  <p className="text-sm text-dark-3 leading-relaxed">
                    {e.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-1 mb-4">
            Education
          </h3>
          <ul className="flex flex-col gap-3">
            {education.map((e, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline justify-between gap-2"
              >
                <div className="flex flex-col">
                  <p className="font-semibold text-dark-1">{e.school}</p>
                  {e.degree && (
                    <p className="text-sm text-gray-1">{e.degree}</p>
                  )}
                </div>
                {e.period && (
                  <span className="text-sm text-gray-2">{e.period}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
