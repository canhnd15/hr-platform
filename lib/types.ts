export type ThemePreset = "kim" | "moc" | "thuy" | "hoa" | "tho" | "custom";

export type JobStatus = "draft" | "published" | "archived";
export type JobType = "Full-Time" | "Part-Time" | "Internship";

export type NavItem = { href: string; label: string; enabled: boolean };

export type LevelOption = { value: string; label: string };
export type CategoryOption = { value: string; label: string; keyword: string };

export type InfoSection = { title: string; body: string };
export type BenefitGroup = { title: string; bullets: string[] };

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
  };
};

export type Job = {
  id: string;
  tenantId: string;
  title: string;
  level: string;
  type: JobType;
  salary: string;
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
  createdAt: string;
};
