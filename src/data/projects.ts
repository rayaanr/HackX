export interface HackathonSubmission {
  hackathonId: string;
  hackathonName: string;
  hackathonImage?: string;
  status: "ended" | "live" | "voting" | "upcoming";
  submissionDate: Date;
  votingEndDate?: Date;
  prizePool: string;
  participants: number;
  techStack: string[];
  level: string;
  isWinner?: boolean;
  placement?: string;
  prizeWon?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  hackathonId: string;
  logo?: string;
  lastEdited: Date;
  builder: string;
  techStack: string[];
  status: "draft" | "submitted" | "reviewed" | "judged";
  submissionDate?: Date;
  demoUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  pitchVideoUrl?: string;
  team: {
    name: string;
    leader: string;
    members: string[];
  };
  sector?: string;
  defiProtocol?: string;
  progressDuringHackathon?: string;
  fundraisingStatus?: string;
  hackathonSubmissions?: HackathonSubmission[];
  scores?: {
    judgeId: string;
    judgeName: string;
    criteria: {
      name: string;
      score: number;
      maxScore: number;
      feedback?: string;
    }[];
    overallFeedback?: string;
    totalScore: number;
    maxTotalScore: number;
  }[];
}

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Init Club Pro",
    description: "Init Club Pro was born from a simple but radical belief: true innovation shouldn't be slowed by legacy processes or outdated infrastructure. Built for the next generation of developers.",
    fullDescription: "Init Club Pro is an innovative platform designed to accelerate developer innovation. Leveraging modern infra, it combines GameFi, SocialFi, and NFT-like engagement features such as AI-generated quizzes, live auctions, and leaderboards.",
    hackathonId: "hackathon-1", // AI Revolution 2025
    logo: "/project-logos/init-club-pro.png",
    lastEdited: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    builder: "John McKenzie",
    techStack: ["SocialFi", "Infra", "GameFi", "NFT", "AI"],
    status: "submitted",
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    demoUrl: "https://init-club-pro.vercel.app",
    githubUrl: "https://github.com/johnmckenzie/init-club-pro",
    pitchVideoUrl: "https://youtube.com/watch?v=init-club-demo",
    team: {
      name: "Innovation Labs",
      leader: "Amaan Sayyad",
      members: ["John McKenzie", "Sarah Chen", "Mike Rodriguez"]
    },
    githubUrl: "https://github.com/a",
    sector: "SocialFi",
    defiProtocol: "DeFi",
    progressDuringHackathon: "During hackathon, we accomplished the following: - Frontend Development: Built a user-friendly interface for NFT auctions, AI quizzes, and Social interaction. - Smart Contracts: Deployed key smart contracts for the token and betting Pool on the Mantle Testnet. - AI Quiz Integration: Implemented AIGC DALL-E's GPT models that generate dynamic quizzes based on live sports events. Developed a functional NFT auction system that allows users to bid using our tokens. - Testing and Deployment: Conducted rigorous testing to ensure seamless operation and deployed the project with all features integrated.",
    fundraisingStatus: "Not raised any funds, but actively looking to raise.",
    hackathonSubmissions: [
      {
        hackathonId: "ledgerforge-hackathon",
        hackathonName: "Ledgerforge Hackathon, Chain Security Club",
        status: "ended",
        submissionDate: new Date("2024-01-15"),
        prizePool: "50,000.00 USD",
        participants: 405,
        techStack: ["All tech stack"],
        level: "All levels accepted",
        isWinner: true,
        placement: "Winner",
        prizeWon: "$10,000"
      },
      {
        hackathonId: "cryptovate-hack",
        hackathonName: "Cryptovate Hack",
        status: "live",
        submissionDate: new Date("2024-12-01"),
        votingEndDate: new Date("2024-12-08"),
        prizePool: "40,000.00 USD", 
        participants: 405,
        techStack: ["All tech stack"],
        level: "All levels accepted"
      }
    ]
  },
  {
    id: "project-2", 
    name: "Ward",
    description: "Ward was born from a simple but radical belief: true innovation shouldn't be constrained by traditional boundaries. A revolutionary platform for modern healthcare management.",
    hackathonId: "hackathon-1", // AI Revolution 2025
    logo: "/project-logos/ward.png",
    lastEdited: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    builder: "John McKenzie",
    techStack: ["DeFi", "Infra"],
    status: "submitted",
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    demoUrl: "https://ward-health.vercel.app",
    githubUrl: "https://github.com/johnmckenzie/ward",
    team: {
      name: "HealthTech Innovators",
      leader: "John McKenzie",
      members: ["John McKenzie", "Dr. Emily Watson", "Alex Thompson"]
    }
  },
  {
    id: "project-3",
    name: "Wiral",
    description: "Wiral was born from a simple but radical belief: true innovation shouldn't be limited by conventional wireless technology. Next-gen connectivity solution for IoT devices.",
    hackathonId: "hackathon-1", // AI Revolution 2025
    logo: "/project-logos/wiral.png", 
    lastEdited: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    builder: "John McKenzie",
    techStack: ["DeFi", "Infra"],
    status: "submitted",
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    demoUrl: "https://wiral.tech",
    githubUrl: "https://github.com/johnmckenzie/wiral",
    videoUrl: "https://youtube.com/watch?v=wiral-demo",
    team: {
      name: "Connectivity Pioneers", 
      leader: "John McKenzie",
      members: ["John McKenzie", "Lisa Park", "David Kim"]
    }
  },
  {
    id: "project-4",
    name: "EcoTrack AI",
    description: "An intelligent environmental monitoring system that uses AI to track carbon emissions and suggest optimization strategies for businesses and individuals.",
    hackathonId: "hackathon-2", // Green Tech Challenge
    lastEdited: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    builder: "Maria Gonzalez",
    techStack: ["Python", "TensorFlow", "IoT", "React"],
    status: "submitted",
    submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    demoUrl: "https://ecotrack-ai.vercel.app",
    githubUrl: "https://github.com/mariagonzalez/ecotrack-ai",
    team: {
      name: "Green Coders",
      leader: "Maria Gonzalez",
      members: ["Maria Gonzalez", "James Wilson", "Priya Patel"]
    }
  },
  {
    id: "project-5",
    name: "DeFi Yield Optimizer",
    description: "Smart contract protocol that automatically optimizes yield farming strategies across multiple DeFi platforms while minimizing gas fees and impermanent loss.",
    hackathonId: "hackathon-3", // FinTech Revolution
    lastEdited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    builder: "Raj Patel",
    techStack: ["Solidity", "Web3", "React", "Node.js"],
    status: "submitted", 
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    demoUrl: "https://defi-yield-optimizer.app",
    githubUrl: "https://github.com/rajpatel/defi-yield-optimizer",
    team: {
      name: "DeFi Architects",
      leader: "Raj Patel",
      members: ["Raj Patel", "Angela Lee", "Marcus Johnson"]
    }
  },
  {
    id: "project-6",
    name: "MedAssist AR",
    description: "Augmented reality application for medical professionals to visualize patient data, medical imaging, and treatment protocols in real-time during procedures.",
    hackathonId: "hackathon-4", // HealthTech Heroes
    lastEdited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    builder: "Dr. Ashley Kim",
    techStack: ["Unity", "C#", "ARCore", "FHIR API"],
    status: "submitted",
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    demoUrl: "https://medassist-ar.demo.com",
    githubUrl: "https://github.com/drkimashley/medassist-ar",
    videoUrl: "https://youtube.com/watch?v=medassist-demo",
    team: {
      name: "AR Med Team",
      leader: "Dr. Ashley Kim",
      members: ["Dr. Ashley Kim", "Tom Chen", "Rachel Martinez"]
    }
  }
];

// Helper functions
export function getProjectsByHackathon(hackathonId: string): Project[] {
  return mockProjects.filter(project => project.hackathonId === hackathonId);
}

export function getProjectById(projectId: string): Project | undefined {
  return mockProjects.find(project => project.id === projectId);
}

export function getSubmittedProjectsByHackathon(hackathonId: string): Project[] {
  return mockProjects.filter(project => 
    project.hackathonId === hackathonId && project.status === "submitted"
  );
}