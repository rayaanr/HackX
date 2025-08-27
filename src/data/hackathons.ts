export interface PrizeTrack {
  id: string;
  title: string;
  prize: string;
  description: string;
  suggestedDirections: string[];
  evaluationCriteria: {
    name: string;
    description: string;
    maxScore: number;
  }[];
}

export interface Judge {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

export interface Hackathon {
  id: number;
  name: string;
  status: "Live" | "Voting" | "Ended" | "Registration";
  description: string;
  deadline: Date;
  techStack: string[];
  level: "Beginner" | "Intermediate" | "Advanced" | "All";
  prize: string;
  participants: string;
  imageUrl: string;
  participantCount: number;
  winnerAnnounced?: string;
  host: string;
  hostLogo: string;
  partners: { name: string; logo: string }[];
  prizeBreakdown: { category: string; prize: string }[];
  schedule: { date: string; event: string }[];
  todos: { text: string; done: boolean }[];
  tagline: string;
  ecosystem: string;
  prizeTracks?: PrizeTrack[];
  judges?: Judge[];
  votingRules?: {
    maxVotesPerJudge: number;
  };
}

export const hackathons: Hackathon[] = [
  {
    id: 1,
    name: "ChainSpark Hackathon",
    status: "Voting",
    description:
      "ChainSpark Hackathon was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
    deadline: new Date("2025-10-01"),
    techStack: ["AI", "Python", "TensorFlow"],
    level: "Intermediate",
    prize: "20,000 USDC",
    participants: "Online",
    participantCount: 100,
    imageUrl:
      "https://a.dropoverapp.com/cloud/download/18b05c12-b45c-4cff-bb4c-7a528516f5bc/02384f08-9f73-4c09-a9da-23917f91afe7",
    host: "U2U",
    hostLogo: "",
    partners: [],
    prizeBreakdown: [],
    schedule: [],
    todos: [],
    tagline: "Rising to shape blockchain's dawn.",
    ecosystem: "U2U",
    prizeTracks: [
      {
        id: "tech-fairness",
        title: "Tech Fairness Exploration Awards",
        prize: "18,000 USD",
        description: "This track focuses on developing technologies that promote fairness and equity in digital spaces, particularly addressing bias in algorithms and data sets.",
        suggestedDirections: [
          "Developing bias detection tools for AI models",
          "Creating inclusive design frameworks for digital products",
          "Building platforms for underrepresented communities",
          "Designing transparent algorithms for public services"
        ],
        evaluationCriteria: [
          {
            name: "Innovation",
            description: "How novel and creative is the solution?",
            maxScore: 25
          },
          {
            name: "Impact",
            description: "How significant is the potential positive impact on tech fairness?",
            maxScore: 25
          },
          {
            name: "Implementation",
            description: "How well is the solution executed technically?",
            maxScore: 25
          },
          {
            name: "Presentation",
            description: "How clearly is the solution communicated?",
            maxScore: 25
          }
        ]
      },
      {
        id: "public-infrastructure",
        title: "Public Infrastructure Awards",
        prize: "25,000 USD",
        description: "This track encourages building open-source tools and platforms that serve the public good, focusing on digital infrastructure for communities.",
        suggestedDirections: [
          "Developing open-source civic engagement platforms",
          "Creating tools for transparent governance",
          "Building digital public goods for education or healthcare",
          "Designing resilient community networks"
        ],
        evaluationCriteria: [
          {
            name: "Innovation",
            description: "How novel and creative is the solution?",
            maxScore: 25
          },
          {
            name: "Impact",
            description: "How significant is the potential positive impact on public infrastructure?",
            maxScore: 25
          },
          {
            name: "Implementation",
            description: "How well is the solution executed technically?",
            maxScore: 25
          },
          {
            name: "Presentation",
            description: "How clearly is the solution communicated?",
            maxScore: 25
          }
        ]
      }
    ],
    judges: [
      {
        id: "1",
        name: "Alex Johnson",
        handle: "@alexj",
        avatar: "/placeholder-user.jpg"
      },
      {
        id: "2",
        name: "Maria Garcia",
        handle: "@mariag",
        avatar: "/placeholder-user.jpg"
      },
      {
        id: "3",
        name: "David Chen",
        handle: "@davidc",
        avatar: "/placeholder-user.jpg"
      }
    ],
    votingRules: {
      maxVotesPerJudge: 100
    }
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
    host: "U2U",
    hostLogo: "",
    partners: [],
    prizeBreakdown: [],
    schedule: [],
    todos: [],
    tagline: "Rising to shape blockchain's dawn.",
    ecosystem: "U2U",
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
    host: "U2U",
    hostLogo: "",
    partners: [],
    prizeBreakdown: [],
    schedule: [],
    todos: [],
    tagline: "Rising to shape blockchain's dawn.",
    ecosystem: "U2U",
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
    host: "U2U",
    hostLogo: "",
    partners: [],
    prizeBreakdown: [],
    schedule: [],
    todos: [],
    tagline: "Rising to shape blockchain's dawn.",
    ecosystem: "U2U",
  },
  {
    id: 5,
    name: "VietBUIDL Hackathon",
    status: "Registration",
    description:
      "This is a detailed text description of the hackathon. Highlighting the prize pool of 98,000 USD. The tracks/categories are User Applications, DePIN, and AI.",
    deadline: new Date("2025-09-19"),
    techStack: ["AI", "Web3"],
    level: "All",
    prize: "98,000 USD",
    participants: "Online",
    participantCount: 611,
    imageUrl: "",
    host: "U2U",
    hostLogo: "",
    partners: [
      { name: "Co-host", logo: "" },
      { name: "Powered by", logo: "" },
      { name: "Event Partners", logo: "" },
    ],
    prizeBreakdown: [
      { category: "User Applications", prize: "32k" },
      { category: "DePIN", prize: "22k" },
      { category: "AI", prize: "16k" },
    ],
    schedule: [
      { date: "2025-09-20", event: "Registration Opens" },
      { date: "2025-10-20", event: "Registration Closes" },
      { date: "2025-10-21", event: "Hacking Begins" },
      { date: "2025-11-21", event: "Project Submission Deadline" },
      { date: "2025-12-01", event: "Winners Announced" },
    ],
    todos: [
      { text: "Join Community", done: false },
      { text: "Complete Profile", done: false },
      { text: "Submit Project", done: false },
    ],
    tagline: "Rising to shape blockchain's dawn.",
    ecosystem: "U2U",
  },
];