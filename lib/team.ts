import type { StaticImageData } from "next/image";
import muiz from "@/app/assets/team/muiz-set.png";
import oyinkansola from "@/app/assets/team/oyinkansola-set.png";

/**
 * The people behind Klario, and how the team is weighted.
 *
 * Content lives here rather than in the component (same split as lib/investors.ts)
 * so names, roles and photos can be updated without touching markup.
 *
 * `photo: null` renders a monogram medallion instead, so a member with no
 * headshot yet never leaves a hole in the row.
 */

export type TeamMember = {
  name: string;
  /** The job, as it would appear on a card. */
  role: string;
  /** Which of the three disciplines they sit in; omitted for the founder. */
  division?: string;
  /** One line on what they actually own. */
  line: string;
  /** Override the derived monogram — some names go by three letters, not two. */
  initials?: string;
  /**
   * A headshot imported from app/assets/team, or null while we wait on one.
   * Static imports let Next hash and size the file; no /public copy needed.
   *
   * Use the *-set.png files: one canvas, one head size, crown at the same
   * height, so the roster reads as one set rather than nine different crops.
   */
  photo: StaticImageData | null;
};

export type Discipline = { label: string; count: number };

export const TEAM_INTRO = {
  eyebrow: "The team",
  heading: "Nine people, and",
  emphasis: "three disciplines.",
  lede: "Deliberately weighted towards the parts of this that are not code, because the hard part of a money product is proving what happened, not shipping a screen.",
};

/**
 * Shown under the portrait — the shape of the team at a glance.
 * Counts must add up to TEAM.length; the heading says nine.
 */
export const DISCIPLINES: Discipline[] = [
  { label: "Marketing & research", count: 4 },
  { label: "Accounting & legal compliance", count: 3 },
  { label: "Engineering", count: 2 },
];

const MARKETING = "Marketing & research";
const COMPLIANCE = "Accounting & legal compliance";
const ENGINEERING = "Engineering";

export const TEAM: TeamMember[] = [
  {
    name: "Muiz Owolabi",
    role: "Founder & CEO, Software Engineer",
    division: ENGINEERING,
    line: "Built Klario himself, and still writes the parts that move money.",
    photo: muiz,
  },
  {
    name: "Musa Lawal",
    role: "Head of Accounting & Legal Compliance",
    division: COMPLIANCE,
    line: "Turns raw bank data into records a lender or a regulator will accept.",
    photo: null,
  },
  {
    name: "Seun Alao",
    role: "Accounting & Legal Compliance",
    division: COMPLIANCE,
    line: "Owns the books and the filings that sit behind every claim we make.",
    photo: null,
  },
  {
    name: "Damilola Folorunsho",
    role: "Accounting & Legal Compliance",
    division: COMPLIANCE,
    line: "Keeps the audit trail honest, which is what makes the rest of it worth anything.",
    photo: null,
  },
  {
    name: "Oluwatomiwa Awodokun",
    role: "Head of Marketing & Research",
    division: MARKETING,
    line: "Ran the two research waves that put 331 Nigerians behind our assumptions.",
    photo: null,
  },
  {
    name: "Taofeeq Abdulrauf",
    role: "Social Media Manager, Twitter (X)",
    division: MARKETING,
    initials: "TAO",
    line: "Runs Klario on Twitter (X), and is one of the two faces people recognise it by.",
    photo: null,
  },
  {
    name: "Oyinkansola Agwunobi",
    role: "Content & Social Media Manager, Instagram and TikTok",
    division: MARKETING,
    line: "Writes what Klario says out loud and puts a face to it on Instagram and TikTok.",
    photo: oyinkansola,
  },
  {
    name: "Hadiza Oni",
    role: "Social Media Manager, LinkedIn",
    division: MARKETING,
    line: "Runs LinkedIn, where the partners and institutions we work with are watching.",
    photo: null,
  },
  {
    name: "Daniel Oso",
    role: "CTO, Software Engineer — Application & Development",
    division: ENGINEERING,
    line: "The app on both platforms, the server behind it, and the admin console.",
    photo: null,
  },
];

/**
 * "Muiz Owolabi" -> "MO", for the awaiting-photo medallion. A member can
 * override it with `initials` when they go by something else.
 */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
