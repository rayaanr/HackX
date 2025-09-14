import type { ProjectFormData } from "@/lib/schemas/project-schema";

export const MOCK_PROJECT_DATA: ProjectFormData[] = [
  {
    logo: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=100&h=100&fit=crop&crop=center",
    name: "DeFi Lending Platform",
    intro:
      "A decentralized lending platform built on Ethereum with automated market makers and risk assessment.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["defi", "fintech"],
    progress:
      "MVP completed with smart contracts deployed on testnet. Frontend 80% complete with core lending and borrowing features implemented.",
    fundraisingStatus:
      "Pre-seed round raising $500K. Already secured $200K from angel investors and looking for strategic VCs.",
    description:
      "Our DeFi Lending Platform revolutionizes traditional lending by eliminating intermediaries and providing transparent, automated lending services. The platform uses advanced algorithms to assess risk and determine optimal interest rates in real-time.",
    githubLink: "https://github.com/example/defi-lending",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Solidity", "React", "Node.js", "Web3.js"],
    hackathonIds: ["1", "2"],
  },
  {
    logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop&crop=center",
    name: "AI Code Assistant",
    intro:
      "An intelligent code completion and review tool powered by advanced machine learning models.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["ai-ml", "developer-tools"],
    progress:
      "Beta version released with 1000+ active users. Training new models on 50M+ lines of code from open source repositories.",
    fundraisingStatus:
      "Series A funding of $2M completed. Revenue growing 25% MoM with enterprise clients showing strong interest.",
    description:
      "AI Code Assistant helps developers write better code faster by providing intelligent suggestions, automated code reviews, and bug detection. Our proprietary AI models understand context and coding patterns to provide highly relevant recommendations.",
    githubLink: "https://github.com/example/ai-code-assistant",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Python", "TensorFlow", "TypeScript", "Docker"],
    hackathonIds: ["3"],
  },
  {
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
    name: "Gaming Metaverse",
    intro:
      "A virtual world where players can build, trade, and compete in immersive blockchain-based games.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["gaming", "entertainment"],
    progress:
      "Alpha version with 3 mini-games launched. 5000+ NFT land parcels sold. Working on multiplayer infrastructure and VR integration.",
    fundraisingStatus:
      "Seed round of $1.5M raised from gaming VCs. Planning Series A for $5M to scale development and marketing.",
    description:
      "Our Gaming Metaverse combines the excitement of traditional gaming with the ownership and economic opportunities of blockchain technology. Players truly own their in-game assets and can trade them across different games.",
    githubLink: "https://github.com/example/gaming-metaverse",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Unity", "C#", "Solidity", "IPFS"],
    hackathonIds: ["1", "3"],
  },
  {
    logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center",
    name: "HealthTech Analytics",
    intro:
      "Advanced health analytics platform using wearable data to predict and prevent chronic diseases.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["healthcare", "ai-ml"],
    progress:
      "Clinical trials completed with 95% accuracy in early disease detection. FDA approval process initiated for medical device classification.",
    fundraisingStatus:
      "Series A of $3M secured from healthcare VCs. Revenue from B2B partnerships with hospitals growing steadily.",
    description:
      "HealthTech Analytics leverages advanced machine learning algorithms to analyze biometric data from wearable devices, providing early warning systems for potential health issues and personalized wellness recommendations.",
    githubLink: "https://github.com/example/healthtech-analytics",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Python", "TensorFlow", "React Native", "PostgreSQL"],
    hackathonIds: ["2"],
  },
  {
    logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop&crop=center",
    name: "EduChain Learning",
    intro:
      "Blockchain-based education platform with verifiable certificates and decentralized course creation.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["education", "defi"],
    progress:
      "Platform launched with 50+ courses and 2000+ students. Integration with major universities in progress for certificate verification.",
    fundraisingStatus:
      "Bootstrapped to $100K ARR. Raising seed round of $800K to expand course catalog and improve platform features.",
    description:
      "EduChain Learning democratizes education by allowing anyone to create and sell courses while ensuring certificate authenticity through blockchain technology. Students earn tokenized credentials that are globally verifiable.",
    githubLink: "https://github.com/example/educhain",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Next.js", "Solidity", "IPFS", "PostgreSQL"],
    hackathonIds: ["1"],
  },
  {
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center",
    name: "Sustainable Supply Chain",
    intro:
      "IoT-powered supply chain tracking for sustainability and transparency in global trade.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["sustainability", "iot"],
    progress:
      "Pilot program with 3 major retailers completed. 100+ suppliers onboarded with IoT sensors tracking carbon footprint and authenticity.",
    fundraisingStatus:
      "Series A of $4M raised. Expanding to European markets and developing AI-powered sustainability scoring algorithms.",
    description:
      "Our platform uses IoT sensors and blockchain technology to create an immutable record of products' journey from source to consumer, enabling true transparency in sustainability claims and supply chain authenticity.",
    githubLink: "https://github.com/example/sustainable-supply",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Python", "Arduino", "React", "Blockchain"],
    hackathonIds: ["2", "3"],
  },
  {
    logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center",
    name: "Cybersecurity Shield",
    intro:
      "AI-powered cybersecurity platform providing real-time threat detection and automated response.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["cybersecurity", "ai-ml"],
    progress:
      "Enterprise version deployed across 50+ companies. AI models detecting 99.8% of threats with <0.1% false positive rate.",
    fundraisingStatus:
      "Series B of $10M completed. Expanding globally and developing quantum-resistant encryption solutions.",
    description:
      "Cybersecurity Shield uses advanced machine learning and behavioral analysis to detect and neutralize cyber threats in real-time, providing comprehensive protection for businesses of all sizes.",
    githubLink: "https://github.com/example/cybersecurity-shield",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Python", "Kubernetes", "TensorFlow", "Go"],
    hackathonIds: ["3"],
  },
  {
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&crop=center",
    name: "Social Impact Tracker",
    intro:
      "Platform connecting nonprofits with donors through transparent impact measurement and blockchain verification.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["social-impact", "fintech"],
    progress:
      "Live platform with 200+ nonprofits and $2M+ in verified donations. Impact data tracked for 10,000+ beneficiaries worldwide.",
    fundraisingStatus:
      "Grant funding of $500K secured from impact investing foundations. Planning revenue model through platform fees.",
    description:
      "Social Impact Tracker revolutionizes charitable giving by providing real-time transparency on how donations are used and their actual impact on communities, using blockchain for immutable impact verification.",
    githubLink: "https://github.com/example/social-impact",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["React", "Node.js", "Solidity", "MongoDB"],
    hackathonIds: ["1", "2"],
  },
  {
    logo: "https://images.unsplash.com/photo-1563191911-e8e11be4b8e8?w=100&h=100&fit=crop&crop=center",
    name: "Productivity AI Suite",
    intro:
      "Comprehensive AI-powered productivity tools for teams including smart scheduling and task automation.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["productivity", "ai-ml"],
    progress:
      "SaaS platform with 10,000+ active users and $50K MRR. Enterprise features launched with Fortune 500 pilot programs.",
    fundraisingStatus:
      "Seed round of $1.2M completed. Revenue growing 30% MoM with strong product-market fit demonstrated.",
    description:
      "Productivity AI Suite combines multiple AI-powered tools to automate repetitive tasks, optimize schedules, and enhance team collaboration, resulting in 40% average productivity gains for users.",
    githubLink: "https://github.com/example/productivity-ai",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["Vue.js", "Python", "FastAPI", "Redis"],
    hackathonIds: ["2"],
  },
  {
    logo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop&crop=center",
    name: "E-commerce Revolution",
    intro:
      "Next-generation e-commerce platform with AR try-on, AI recommendations, and crypto payments.",
    itchVideo: "https://youtu.be/dQw4w9WgXcQ",
    sector: ["e-commerce", "ai-ml"],
    progress:
      "Beta platform with 500+ merchants and $1M+ GMV. AR technology achieving 60% reduction in return rates.",
    fundraisingStatus:
      "Series A of $5M raised from retail-focused VCs. Expanding merchant onboarding and developing mobile app.",
    description:
      "E-commerce Revolution transforms online shopping through immersive AR experiences, personalized AI recommendations, and seamless crypto payment integration, creating the future of digital retail.",
    githubLink: "https://github.com/example/ecommerce-revolution",
    demoVideo: "https://youtu.be/dQw4w9WgXcQ",
    techStack: ["React", "ARCore", "Stripe", "Shopify API"],
    hackathonIds: ["1", "3"],
  },
];

export const getRandomMockProject = (): ProjectFormData => {
  const randomIndex = Math.floor(Math.random() * MOCK_PROJECT_DATA.length);
  return MOCK_PROJECT_DATA[randomIndex];
};
