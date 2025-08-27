export interface Hackathon {
  id: number;
  name: string;
  status: "Live" | "Voting" | "Ended";
  description: string;
  deadline: Date;
  techStack: string[];
  level: "Beginner" | "Intermediate" | "Advanced" | "All";
  prize: string;
  participants: string;
  imageUrl: string;
  participantCount: number;
  winnerAnnounced?: string;
}

export const hackathons: Hackathon[] = [
  {
    id: 1,
    name: "ChainSpark Hackathon",
    status: "Live",
    description:
      "ChainSpark Hackathon was born from a simple but radical belief: true innovation shouldn’t be strangled by black-box algorithms or centralized gatekeepers.",
    deadline: new Date("2025-10-01"),
    techStack: ["AI", "Python", "TensorFlow"],
    level: "Intermediate",
    prize: "20,000 USDC",
    participants: "Online",
    participantCount: 100,
    imageUrl:
      "https://a.dropoverapp.com/cloud/download/18b05c12-b45c-4cff-bb4c-7a528516f5bc/02384f08-9f73-4c09-a9da-23917f91afe7",
  },
  {
    id: 2,
    name: "Web3 Gaming Challenge",
    status: "Voting",
    description: "Build the next generation of decentralized games.",
    deadline: new Date("2025-09-20"),
    techStack: ["Web3", "Solidity", "React"],
    level: "Advanced",
    prize: "10 SOL",
    participants: "Online",
    participantCount: 400,
    imageUrl:
      "https://a.dropoverapp.com/cloud/download/580b0d6d-ef38-431f-b3ec-faefb7e907d1/c85048f3-eff3-4ec3-9657-5a67e9fbfb13",
  },
  {
    id: 3,
    name: "DeFi Innovation Hack",
    status: "Ended",
    description: "Create innovative decentralized finance solutions.",
    deadline: new Date("2025-07-15"),
    techStack: ["DeFi", "Ethereum", "Next.js"],
    level: "Advanced",
    prize: "40,000 USDT",
    participants: "Online",
    participantCount: 100,
    imageUrl:
      "https://a.dropoverapp.com/cloud/download/274fddc5-e30c-4450-8647-e9278423b136/4954c3c1-b4ee-4bef-a321-c0b2453dfe3f",
    winnerAnnounced: "Team BlockFlow",
  },
  {
    id: 4,
    name: "Mobile for Everyone",
    status: "Ended",
    description: "Develop mobile apps for accessibility and inclusion.",
    deadline: new Date("2025-06-01"),
    techStack: ["Mobile", "React Native", "Firebase"],
    level: "Beginner",
    prize: "5,000 USDC",
    participants: "Online",
    participantCount: 100,
    imageUrl:
      "https://a.dropoverapp.com/cloud/download/f65accf2-093a-4b4f-9c08-328c2bf718b3/38944265-f0fd-4ec8-b686-0bb1c4c41158",
    winnerAnnounced: "Team AccessApp",
  },
];
