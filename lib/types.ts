export type ThemePreset = "kim" | "moc" | "thuy" | "hoa" | "tho" | "custom";

export type JobStatus = "draft" | "published" | "archived";
export type JobType = "Full-Time" | "Part-Time" | "Internship";
export type LocationType = "Onsite" | "Hybrid" | "Remote";
export type Currency = "USD" | "VND";

export type NavItem = { href: string; label: string; enabled: boolean };

export type LevelOption = { value: string; label: string };
export type CategoryOption = { value: string; label: string; keyword: string };

export type InfoSection = { title: string; body: string };
export type BenefitGroup = { title: string; bullets: string[] };

export type AboutMode = "cv_upload" | "template";
export type Experience = {
  title: string;
  company: string;
  period: string;
  description: string;
};
export type Education = { school: string; degree: string; period: string };
export type AboutPage = {
  visible: boolean;
  mode: AboutMode;
  cvUrl: string | null;
  cvFileName: string | null;
  about: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
};

export type Socials = {
  facebook?: string;
  telegram?: string;
  whatsapp?: string;
  linkedin?: string;
};

export type TenantConfig = {
  id: string;
  slug: string;
  status: "active" | "suspended";

  branding: {
    logoUrl: string | null;
    primaryColor: string;
    themePreset: ThemePreset;
    fontFamily: string;
  };

  profile: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
    title: string;
    yearsExperience: number;
    specialty: string;
    tagline: string;
    socials: Socials;
    ctaUrl: string;
  };

  company: {
    name: string;
    fullName: string;
    sizeRange: string;
    headquarter: string;
    representativeOffices: string;
    mainClients: string;
    description: string;
  };

  nav: NavItem[];

  ui: {
    showLocationsFilter: boolean;
    showLevelFilter: boolean;
    showCategoryFilter: boolean;
    locations: string[];
    levels: LevelOption[];
    categories: CategoryOption[];
  };

  pages: {
    information: { visible: boolean; sections: InfoSection[] };
    benefits: { visible: boolean; groups: BenefitGroup[] };
    about: AboutPage;
  };
};

export type Job = {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  level: string;
  type: JobType;
  locationType: LocationType;
  salary: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: Currency | null;
  company: string;
  location: string;
  description: string;
  requirements: string;
  benefits: string;
  isHot: boolean;
  displayOrder: number;
  status: JobStatus;
  createdAt: string;
};

export type Application = {
  id: string;
  tenantId: string;
  jobId: string;
  formType: "apply" | "refer";
  name: string;
  phone: string;
  email: string;
  candidateName: string | null;
  candidatePhone: string | null;
  candidateEmail: string | null;
  cvUrl: string | null;
  stage: string;
  rating: number;
  lastStageChangeAt: string;
  createdAt: string;
};

export type ApplicationEventKind = "stage_change" | "rating" | "note" | "reject";

export type ApplicationEvent = {
  id: string;
  tenantId: string;
  applicationId: string;
  kind: ApplicationEventKind;
  fromStage: string | null;
  toStage: string | null;
  rating: number | null;
  note: string | null;
  rejectReason: string | null;
  actorUserId: string | null;
  createdAt: string;
};
