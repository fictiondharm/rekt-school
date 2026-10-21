export interface SiteNavLink {
  label: string;
  /** Where the link points. Section links are resolved against the home page. */
  href: string;
  /** Pathname prefixes that mark this link as the current page. */
  activePrefixes: string[];
  /** Set when the link targets a section that lives on the home page. */
  sectionId?: string;
}

/**
 * The one navigation bar used by every page: the home page, the course tiers,
 * the lessons, the arcade, the case files and the glossary.
 */
export const SITE_NAV: SiteNavLink[] = [
  {
    label: 'Course',
    href: '/#course',
    sectionId: 'course',
    activePrefixes: ['/basic', '/intermediate', '/pro', '/learn'],
  },
  {
    label: 'Arcade',
    href: '/games',
    activePrefixes: ['/games'],
  },
  {
    label: 'War Stories',
    href: '/war-stories',
    activePrefixes: ['/war-stories'],
  },
  {
    label: 'Glossary',
    href: '/glossary',
    activePrefixes: ['/glossary'],
  },
  {
    label: 'Pricing',
    href: '/#pricing',
    sectionId: 'pricing',
    activePrefixes: [],
  },
];
