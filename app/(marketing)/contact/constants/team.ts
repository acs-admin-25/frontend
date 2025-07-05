/**
 * Team member data constants for the contact page
 */

export interface TeamMember {
  name: string;
  role: string;
  isCoFounder?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Anay Pant",
    role: "Chief Executive Officer",
    isCoFounder: true,
  },
  {
    name: "Siddarth Nuthi",
    role: "Chief Technology Officer",
    isCoFounder: true,
  },
  {
    name: "Alejo Cagliolo",
    role: "Chief Operating Officer",
  },
  {
    name: "Utsav Arora",
    role: "Chief Software Officer",
  },
  {
    name: "Parshawn Haynes",
    role: "Chief Marketing Officer",
  },
]; 