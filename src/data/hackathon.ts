import type { HackathonFormData } from "@/types/hackathon";

// Helper function to create dates relative to now
function createDate(daysFromNow: number, hoursOffset = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hoursOffset, 0, 0, 0);
  return date;
}

// Mock hackathon data for testing
export const mockHackathons: HackathonFormData[] = [
  {
    name: "AI Revolution Hackathon",
    shortDescription: "Build the next generation of AI-powered applications that will transform how we work and live.",
    fullDescription: `Join us for the AI Revolution Hackathon, where developers, designers, and innovators come together to create groundbreaking AI applications. This 48-hour intensive event will challenge participants to leverage cutting-edge AI technologies including machine learning, natural language processing, and computer vision.

Participants will have access to premium API credits, expert mentorship, and state-of-the-art development tools. Whether you're building a productivity assistant, a creative AI tool, or a revolutionary healthcare solution, this hackathon provides the perfect platform to bring your AI vision to life.

The event features workshops on prompt engineering, fine-tuning models, and deploying AI applications at scale. Our panel of AI experts and venture capitalists will provide feedback and guidance throughout the event.`,
    registrationPeriod: {
      registrationStartDate: createDate(1),
      registrationEndDate: createDate(14),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(15),
      hackathonEndDate: createDate(17),
    },
    votingPeriod: {
      votingStartDate: createDate(17, 2),
      votingEndDate: createDate(19),
    },
    techStack: ["JavaScript", "Python", "React", "Node.js", "TensorFlow", "OpenAI API", "Hugging Face"],
    experienceLevel: "intermediate" as const,
    location: "San Francisco, CA (Hybrid)",
    socialLinks: {
      website: "https://airevolution.dev",
      discord: "https://discord.gg/airevhack",
      twitter: "https://twitter.com/airevhackathon",
      telegram: "",
      github: "https://github.com/ai-revolution-hack",
    },
    prizeCohorts: [
      {
        name: "Best AI Innovation",
        numberOfWinners: 1,
        prizeAmount: "10000",
        description: "Most innovative use of AI technology",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Innovation", points: 40, description: "Originality and creativity of the AI solution" },
          { name: "Technical Excellence", points: 30, description: "Quality of implementation and code" },
          { name: "Impact Potential", points: 20, description: "Potential real-world impact and scalability" },
          { name: "Presentation", points: 10, description: "Quality of demo and presentation" },
        ],
      },
      {
        name: "Best Social Impact",
        numberOfWinners: 2,
        prizeAmount: "5000",
        description: "AI solutions addressing social challenges",
        judgingMode: "automated",
        votingMode: "private",
        maxVotesPerJudge: 3,
        evaluationCriteria: [
          { name: "Social Impact", points: 50, description: "Potential to address real social problems" },
          { name: "Feasibility", points: 30, description: "Realistic implementation and deployment" },
          { name: "User Experience", points: 20, description: "Ease of use and accessibility" },
        ],
      },
    ],
    judges: [
      { email: "sarah.chen@aiventures.com", status: "invited" },
      { email: "michael.rodriguez@techcorp.ai", status: "accepted" },
      { email: "dr.aisha.patel@stanford.edu", status: "accepted" },
    ],
    schedule: [
      {
        name: "Opening Ceremony & Keynote",
        description: "Welcome address and AI industry keynote by leading experts",
        startDateTime: createDate(15, 9),
        endDateTime: createDate(15, 10),
        hasSpeaker: true,
        speaker: {
          name: "Dr. Elena Vasquez",
          position: "Chief AI Officer at TechCorp",
          xName: "Elena Vasquez",
          xHandle: "@elenavasquez_ai",
          picture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
      },
      {
        name: "Team Formation & Ideation",
        description: "Network with fellow hackers and form your dream team",
        startDateTime: createDate(15, 10),
        endDateTime: createDate(15, 11),
        hasSpeaker: false,
      },
      {
        name: "Hacking Begins",
        description: "Start building your AI-powered applications",
        startDateTime: createDate(15, 11),
        endDateTime: createDate(17, 9),
        hasSpeaker: false,
      },
      {
        name: "Final Presentations",
        description: "Present your projects to judges and attendees",
        startDateTime: createDate(17, 9),
        endDateTime: createDate(17, 12),
        hasSpeaker: false,
      },
    ],
  },
  {
    name: "DeFi Summer Hackathon",
    shortDescription: "Build the future of decentralized finance with cutting-edge blockchain technology.",
    fullDescription: `The DeFi Summer Hackathon is the premier event for blockchain developers and financial innovators. Over 3 days, teams will compete to build revolutionary DeFi protocols, trading bots, yield farming strategies, and financial infrastructure.

With $100K+ in prizes and direct access to top VCs, this hackathon is your gateway to the DeFi ecosystem. Participants get free access to premium blockchain APIs, development tools, and expert mentorship from DeFi protocol founders.

Focus areas include: automated market makers, lending protocols, cross-chain bridges, MEV strategies, governance mechanisms, and novel tokenomics models.`,
    registrationPeriod: {
      registrationStartDate: createDate(2),
      registrationEndDate: createDate(20),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(21),
      hackathonEndDate: createDate(24),
    },
    votingPeriod: {
      votingStartDate: createDate(24, 3),
      votingEndDate: createDate(26),
    },
    techStack: ["Solidity", "Web3.js", "Ethers.js", "React", "Node.js", "Hardhat", "The Graph"],
    experienceLevel: "advanced" as const,
    location: "Miami, FL",
    socialLinks: {
      website: "https://defisummer.hack",
      discord: "https://discord.gg/defisummer",
      twitter: "https://twitter.com/defisummerhack",
      telegram: "https://t.me/defisummerhack",
      github: "https://github.com/defi-summer",
    },
    prizeCohorts: [
      {
        name: "Best DeFi Protocol",
        numberOfWinners: 1,
        prizeAmount: "25000",
        description: "Most innovative DeFi protocol or infrastructure",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Innovation", points: 35, description: "Novel approach to DeFi challenges" },
          { name: "Security", points: 30, description: "Smart contract security and audit readiness" },
          { name: "Tokenomics", points: 20, description: "Sustainable token economics design" },
          { name: "User Experience", points: 15, description: "Intuitive interface and user flow" },
        ],
      },
      {
        name: "Best Trading Tool",
        numberOfWinners: 2,
        prizeAmount: "10000",
        description: "Innovative trading bots, analytics, or strategy tools",
        judgingMode: "hybrid",
        votingMode: "private",
        maxVotesPerJudge: 2,
        evaluationCriteria: [
          { name: "Performance", points: 40, description: "Trading performance and profitability" },
          { name: "Technical Implementation", points: 30, description: "Code quality and architecture" },
          { name: "Risk Management", points: 30, description: "Risk controls and safety measures" },
        ],
      },
    ],
    judges: [
      { email: "andre.cronje@yearn.finance", status: "accepted" },
      { email: "stani.kulechov@aave.com", status: "invited" },
      { email: "kain.warwick@synthetix.io", status: "accepted" },
    ],
    schedule: [
      {
        name: "DeFi State of the Union",
        description: "Current state and future of decentralized finance",
        startDateTime: createDate(21, 8),
        endDateTime: createDate(21, 9),
        hasSpeaker: true,
        speaker: {
          name: "Andre Cronje",
          position: "Founder of Yearn Finance",
          xName: "Andre Cronje",
          xHandle: "@andrecronje",
          picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
      },
      {
        name: "Smart Contract Security Workshop",
        description: "Best practices for secure DeFi development",
        startDateTime: createDate(21, 10),
        endDateTime: createDate(21, 12),
        hasSpeaker: true,
        speaker: {
          name: "Trail of Bits Security Team",
          position: "Security Auditors",
          xName: "Trail of Bits",
          xHandle: "@trailofbits",
          picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Climate Tech Innovation Challenge",
    shortDescription: "Develop technology solutions to combat climate change and build a sustainable future.",
    fullDescription: `The Climate Tech Innovation Challenge brings together developers, scientists, and entrepreneurs to build impactful solutions for our planet's most pressing environmental challenges.

Focus areas include carbon tracking, renewable energy optimization, sustainable supply chains, climate data analytics, and green finance solutions. Participants will work with real climate datasets and have access to environmental APIs and satellite imagery.

This hackathon partners with leading climate organizations, offering winners the opportunity to pilot their solutions with real-world partners and access to climate-focused accelerator programs.`,
    registrationPeriod: {
      registrationStartDate: createDate(3),
      registrationEndDate: createDate(18),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(22),
      hackathonEndDate: createDate(24),
    },
    votingPeriod: {
      votingStartDate: createDate(24, 4),
      votingEndDate: createDate(26),
    },
    techStack: ["Python", "React", "Node.js", "TensorFlow", "AWS", "Google Earth Engine", "D3.js"],
    experienceLevel: "all" as const,
    location: "Boulder, CO",
    socialLinks: {
      website: "https://climatetech.dev",
      discord: "https://discord.gg/climatetech",
      twitter: "https://twitter.com/climatetechhack",
      telegram: "",
      github: "https://github.com/climate-tech-hack",
    },
    prizeCohorts: [
      {
        name: "Biggest Impact Potential",
        numberOfWinners: 1,
        prizeAmount: "15000",
        description: "Solution with highest potential environmental impact",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Environmental Impact", points: 50, description: "Potential to reduce emissions or environmental harm" },
          { name: "Scalability", points: 25, description: "Ability to scale globally" },
          { name: "Feasibility", points: 25, description: "Technical and economic feasibility" },
        ],
      },
    ],
    judges: [
      { email: "dr.jane.smith@climatedata.org", status: "accepted" },
      { email: "carlos.mendez@sustaintech.com", status: "invited" },
    ],
    schedule: [
      {
        name: "Climate Data Deep Dive",
        description: "Understanding climate datasets and APIs",
        startDateTime: createDate(22, 9),
        endDateTime: createDate(22, 11),
        hasSpeaker: true,
        speaker: {
          name: "Dr. Jane Smith",
          position: "Climate Data Scientist",
          xName: "Jane Smith",
          xHandle: "@drjanesmith",
          picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Gaming Metaverse Builders",
    shortDescription: "Create immersive gaming experiences and metaverse applications using the latest tech.",
    fullDescription: `Enter the Gaming Metaverse Builders hackathon and create the next generation of gaming experiences. Build multiplayer games, virtual worlds, NFT-based gaming economies, or AR/VR experiences that will define the future of digital entertainment.

Participants get access to game engines, 3D asset libraries, blockchain gaming SDKs, and cloud gaming infrastructure. Whether you're building a mobile game, web3 gaming protocol, or immersive VR experience, this hackathon has the resources you need.

Special tracks include: play-to-earn mechanics, social gaming features, cross-platform compatibility, and accessibility in gaming.`,
    registrationPeriod: {
      registrationStartDate: createDate(1),
      registrationEndDate: createDate(12),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(13),
      hackathonEndDate: createDate(15),
    },
    votingPeriod: {
      votingStartDate: createDate(15, 6),
      votingEndDate: createDate(17),
    },
    techStack: ["Unity", "Unreal Engine", "JavaScript", "C#", "Solidity", "WebGL", "Three.js"],
    experienceLevel: "intermediate" as const,
    location: "Los Angeles, CA",
    socialLinks: {
      website: "https://gamingmeta.hack",
      discord: "https://discord.gg/gamingmeta",
      twitter: "https://twitter.com/gamingmetahack",
      telegram: "",
      github: "https://github.com/gaming-metaverse",
    },
    prizeCohorts: [
      {
        name: "Best Game Experience",
        numberOfWinners: 1,
        prizeAmount: "20000",
        description: "Most engaging and fun gaming experience",
        judgingMode: "hybrid",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Fun Factor", points: 40, description: "How enjoyable and engaging the game is" },
          { name: "Innovation", points: 30, description: "Creative gameplay mechanics or features" },
          { name: "Technical Quality", points: 20, description: "Performance, graphics, and polish" },
          { name: "Accessibility", points: 10, description: "Inclusive design and accessibility features" },
        ],
      },
      {
        name: "Best Web3 Integration",
        numberOfWinners: 1,
        prizeAmount: "8000",
        description: "Best use of blockchain technology in gaming",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Blockchain Innovation", points: 60, description: "Creative use of blockchain technology" },
          { name: "User Experience", points: 40, description: "Seamless integration of web3 features" },
        ],
      },
    ],
    judges: [
      { email: "alex.gaming@unity.com", status: "accepted" },
      { email: "maria.vr@oculusstudios.com", status: "invited" },
    ],
    schedule: [
      {
        name: "Game Design Workshop",
        description: "Principles of engaging game design and user retention",
        startDateTime: createDate(13, 10),
        endDateTime: createDate(13, 12),
        hasSpeaker: true,
        speaker: {
          name: "Alex Chen",
          position: "Senior Game Designer at Unity",
          xName: "Alex Chen",
          xHandle: "@alexchengames",
          picture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "HealthTech Innovation Lab",
    shortDescription: "Transform healthcare through technology - build solutions that save lives and improve wellbeing.",
    fullDescription: `The HealthTech Innovation Lab focuses on creating technology solutions that address critical healthcare challenges. From telemedicine platforms to AI-powered diagnostics, from mental health apps to medical device integrations - this hackathon covers the full spectrum of digital health innovation.

Participants will work with anonymized health datasets, medical APIs, and have access to healthcare professionals for domain expertise. Special emphasis on HIPAA compliance, data security, and evidence-based solutions.

Key focus areas: remote patient monitoring, health data analytics, personalized medicine, mental health support, healthcare accessibility, and medical AI applications.`,
    registrationPeriod: {
      registrationStartDate: createDate(5),
      registrationEndDate: createDate(19),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(25),
      hackathonEndDate: createDate(27),
    },
    votingPeriod: {
      votingStartDate: createDate(27, 2),
      votingEndDate: createDate(29),
    },
    techStack: ["React", "Node.js", "Python", "TensorFlow", "FHIR", "AWS", "MongoDB"],
    experienceLevel: "intermediate" as const,
    location: "Boston, MA",
    socialLinks: {
      website: "https://healthtech.innovation",
      discord: "https://discord.gg/healthtech",
      twitter: "https://twitter.com/healthtechhack",
      telegram: "",
      github: "https://github.com/healthtech-lab",
    },
    prizeCohorts: [
      {
        name: "Best Patient Impact",
        numberOfWinners: 1,
        prizeAmount: "12000",
        description: "Solution with greatest potential to improve patient outcomes",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Patient Impact", points: 50, description: "Potential to improve health outcomes" },
          { name: "Clinical Validation", points: 30, description: "Evidence-based approach and validation" },
          { name: "Usability", points: 20, description: "Ease of use for patients and providers" },
        ],
      },
    ],
    judges: [
      { email: "dr.sarah.patel@massgeneralhospital.org", status: "accepted" },
      { email: "john.healthtech@philips.com", status: "invited" },
    ],
    schedule: [
      {
        name: "Digital Health Regulations",
        description: "Understanding HIPAA, FDA, and healthcare compliance",
        startDateTime: createDate(25, 9),
        endDateTime: createDate(25, 11),
        hasSpeaker: true,
        speaker: {
          name: "Dr. Sarah Patel",
          position: "Chief Medical Officer",
          xName: "Sarah Patel MD",
          xHandle: "@drsarahpatel",
          picture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "EdTech Learning Revolution",
    shortDescription: "Revolutionize education with innovative technology that makes learning accessible and engaging.",
    fullDescription: `The EdTech Learning Revolution hackathon challenges participants to build the future of education. Create platforms, tools, and experiences that make learning more effective, accessible, and enjoyable for learners of all ages.

Focus areas include: personalized learning platforms, virtual classrooms, educational games, assessment tools, accessibility features, teacher productivity tools, and educational content creation platforms.

Participants get access to educational datasets, learning management system APIs, and guidance from experienced educators and learning scientists.`,
    registrationPeriod: {
      registrationStartDate: createDate(4),
      registrationEndDate: createDate(16),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(18),
      hackathonEndDate: createDate(20),
    },
    votingPeriod: {
      votingStartDate: createDate(20, 3),
      votingEndDate: createDate(22),
    },
    techStack: ["React", "Vue.js", "Node.js", "Python", "Firebase", "WebRTC", "Chart.js"],
    experienceLevel: "beginner" as const,
    location: "Austin, TX (Virtual)",
    socialLinks: {
      website: "https://edtech.revolution",
      discord: "https://discord.gg/edtechrev",
      twitter: "https://twitter.com/edtechrevhack",
      telegram: "",
      github: "https://github.com/edtech-revolution",
    },
    prizeCohorts: [
      {
        name: "Most Innovative Learning Tool",
        numberOfWinners: 1,
        prizeAmount: "8000",
        description: "Creative approach to solving learning challenges",
        judgingMode: "automated",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Learning Effectiveness", points: 40, description: "Potential to improve learning outcomes" },
          { name: "User Engagement", points: 30, description: "How engaging and motivating the tool is" },
          { name: "Accessibility", points: 30, description: "Inclusive design for diverse learners" },
        ],
      },
    ],
    judges: [
      { email: "prof.martinez@stanford.edu", status: "accepted" },
      { email: "lisa.edtech@pearson.com", status: "invited" },
    ],
    schedule: [
      {
        name: "Learning Science Fundamentals",
        description: "Evidence-based approaches to effective learning",
        startDateTime: createDate(18, 9),
        endDateTime: createDate(18, 11),
        hasSpeaker: true,
        speaker: {
          name: "Prof. Maria Martinez",
          position: "Education Psychology Professor",
          xName: "Maria Martinez PhD",
          xHandle: "@profmariamartinez",
          picture: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Fintech Disruption Challenge",
    shortDescription: "Build the next generation of financial services that democratize access to financial tools.",
    fullDescription: `The Fintech Disruption Challenge invites developers to reimagine financial services for the digital age. Create solutions for payments, lending, investing, insurance, personal finance management, and financial inclusion.

Key themes include: neobanking, embedded finance, alternative credit scoring, robo-advisors, cryptocurrency integration, and financial wellness tools. Participants get access to financial APIs, sandbox environments, and mentorship from fintech founders and financial services experts.

Special focus on financial inclusion, serving underbanked populations, and building trust in digital financial services.`,
    registrationPeriod: {
      registrationStartDate: createDate(6),
      registrationEndDate: createDate(21),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(28),
      hackathonEndDate: createDate(30),
    },
    votingPeriod: {
      votingStartDate: createDate(30, 4),
      votingEndDate: createDate(32),
    },
    techStack: ["React", "Node.js", "Python", "Stripe API", "Plaid", "AWS", "PostgreSQL"],
    experienceLevel: "intermediate" as const,
    location: "New York, NY",
    socialLinks: {
      website: "https://fintech.disruption",
      discord: "https://discord.gg/fintechdev",
      twitter: "https://twitter.com/fintechhack",
      telegram: "",
      github: "https://github.com/fintech-disruption",
    },
    prizeCohorts: [
      {
        name: "Most Disruptive Solution",
        numberOfWinners: 1,
        prizeAmount: "18000",
        description: "Solution that challenges traditional financial services",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Market Disruption", points: 35, description: "Potential to disrupt existing financial services" },
          { name: "User Experience", points: 25, description: "Intuitive and trustworthy user interface" },
          { name: "Security & Compliance", points: 25, description: "Financial regulations and security measures" },
          { name: "Business Model", points: 15, description: "Sustainable and scalable business model" },
        ],
      },
      {
        name: "Financial Inclusion Award",
        numberOfWinners: 1,
        prizeAmount: "7000",
        description: "Best solution for underserved financial populations",
        judgingMode: "hybrid",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Accessibility", points: 50, description: "Reaches underserved populations effectively" },
          { name: "Impact Potential", points: 30, description: "Potential for positive financial inclusion impact" },
          { name: "Sustainability", points: 20, description: "Long-term viability and sustainability" },
        ],
      },
    ],
    judges: [
      { email: "david.fintech@stripe.com", status: "accepted" },
      { email: "ana.banking@jpmorgan.com", status: "invited" },
    ],
    schedule: [
      {
        name: "Fintech Regulation Workshop",
        description: "Navigating financial regulations and compliance",
        startDateTime: createDate(28, 10),
        endDateTime: createDate(28, 12),
        hasSpeaker: true,
        speaker: {
          name: "David Chen",
          position: "Fintech Regulatory Expert",
          xName: "David Chen",
          xHandle: "@davidfintechlaw",
          picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Smart City Solutions Hub",
    shortDescription: "Design technology solutions that make cities more sustainable, efficient, and livable.",
    fullDescription: `The Smart City Solutions Hub challenges participants to tackle urban challenges through innovative technology. Build solutions for transportation, energy management, waste reduction, public safety, citizen engagement, and urban planning.

Participants will work with real city datasets, IoT sensor data, and geographic information systems. Focus areas include traffic optimization, air quality monitoring, smart grid management, citizen service platforms, and urban sustainability metrics.

This hackathon partners with city governments and urban planning organizations to provide real-world implementation opportunities for winning solutions.`,
    registrationPeriod: {
      registrationStartDate: createDate(7),
      registrationEndDate: createDate(23),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(35),
      hackathonEndDate: createDate(37),
    },
    votingPeriod: {
      votingStartDate: createDate(37, 5),
      votingEndDate: createDate(39),
    },
    techStack: ["React", "Python", "IoT", "PostgreSQL", "Google Maps API", "TensorFlow", "Grafana"],
    experienceLevel: "all" as const,
    location: "Seattle, WA",
    socialLinks: {
      website: "https://smartcity.solutions",
      discord: "https://discord.gg/smartcitydev",
      twitter: "https://twitter.com/smartcityhack",
      telegram: "",
      github: "https://github.com/smart-city-hub",
    },
    prizeCohorts: [
      {
        name: "Best Urban Innovation",
        numberOfWinners: 1,
        prizeAmount: "15000",
        description: "Most innovative solution for urban challenges",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Urban Impact", points: 40, description: "Potential to improve city operations or citizen life" },
          { name: "Scalability", points: 30, description: "Ability to scale across different cities" },
          { name: "Data Integration", points: 20, description: "Effective use of urban data sources" },
          { name: "Citizen Engagement", points: 10, description: "Involvement and benefit to citizens" },
        ],
      },
    ],
    judges: [
      { email: "mayor.office@seattle.gov", status: "invited" },
      { email: "urban.planning@citytech.org", status: "accepted" },
    ],
    schedule: [
      {
        name: "Urban Data Analytics Workshop",
        description: "Working with city datasets and IoT sensor data",
        startDateTime: createDate(35, 9),
        endDateTime: createDate(35, 11),
        hasSpeaker: true,
        speaker: {
          name: "Dr. Lisa Urban",
          position: "Smart Cities Researcher",
          xName: "Lisa Urban PhD",
          xHandle: "@drlisaurban",
          picture: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Cybersecurity Defense Challenge",
    shortDescription: "Build next-generation cybersecurity tools to protect against evolving digital threats.",
    fullDescription: `The Cybersecurity Defense Challenge brings together ethical hackers, security researchers, and developers to build innovative security solutions. Create tools for threat detection, vulnerability assessment, secure communications, privacy protection, and incident response.

Focus areas include: AI-powered threat detection, zero-trust architectures, secure software development tools, privacy-preserving technologies, and automated security response systems. Participants get access to security datasets, penetration testing environments, and guidance from cybersecurity experts.

This hackathon emphasizes ethical hacking, responsible disclosure, and building defensive (not offensive) security tools.`,
    registrationPeriod: {
      registrationStartDate: createDate(8),
      registrationEndDate: createDate(25),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(40),
      hackathonEndDate: createDate(42),
    },
    votingPeriod: {
      votingStartDate: createDate(42, 3),
      votingEndDate: createDate(44),
    },
    techStack: ["Python", "Go", "Rust", "Docker", "Kubernetes", "Machine Learning", "Cryptography"],
    experienceLevel: "advanced" as const,
    location: "Washington, DC",
    socialLinks: {
      website: "https://cybersec.defense",
      discord: "https://discord.gg/cybersecdev",
      twitter: "https://twitter.com/cybersechack",
      telegram: "",
      github: "https://github.com/cybersec-defense",
    },
    prizeCohorts: [
      {
        name: "Best Security Innovation",
        numberOfWinners: 1,
        prizeAmount: "22000",
        description: "Most innovative cybersecurity solution",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Security Effectiveness", points: 50, description: "How well the solution addresses security threats" },
          { name: "Innovation", points: 25, description: "Novel approach to cybersecurity challenges" },
          { name: "Practical Deployment", points: 15, description: "Real-world implementation feasibility" },
          { name: "Ethical Considerations", points: 10, description: "Responsible and ethical security practices" },
        ],
      },
      {
        name: "Best Privacy Tool",
        numberOfWinners: 1,
        prizeAmount: "8000",
        description: "Outstanding privacy-preserving technology",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Privacy Protection", points: 60, description: "Effectiveness at preserving user privacy" },
          { name: "Usability", points: 25, description: "Easy to use without compromising security" },
          { name: "Technical Merit", points: 15, description: "Sound cryptographic or technical implementation" },
        ],
      },
    ],
    judges: [
      { email: "chief.security@cybercorp.com", status: "accepted" },
      { email: "research@eff.org", status: "invited" },
    ],
    schedule: [
      {
        name: "Ethical Hacking Principles",
        description: "Responsible security research and disclosure practices",
        startDateTime: createDate(40, 9),
        endDateTime: createDate(40, 11),
        hasSpeaker: true,
        speaker: {
          name: "Marcus Security",
          position: "Senior Security Researcher",
          xName: "Marcus Security",
          xHandle: "@marcussecurity",
          picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Social Impact Tech Marathon",
    shortDescription: "Leverage technology to create positive social change and address humanitarian challenges.",
    fullDescription: `The Social Impact Tech Marathon focuses on building technology solutions that create meaningful positive change in society. Address challenges in poverty alleviation, education access, healthcare delivery, disaster response, human rights, and social justice.

Participants will work on real-world problems identified by NGOs and social organizations. Focus areas include: humanitarian aid coordination, social welfare distribution, community organizing tools, accessibility technologies, and platforms for social good.

This hackathon connects technologists with social impact organizations to ensure solutions address real needs and have pathways to implementation.`,
    registrationPeriod: {
      registrationStartDate: createDate(10),
      registrationEndDate: createDate(30),
    },
    hackathonPeriod: {
      hackathonStartDate: createDate(45),
      hackathonEndDate: createDate(47),
    },
    votingPeriod: {
      votingStartDate: createDate(47, 4),
      votingEndDate: createDate(49),
    },
    techStack: ["React", "Node.js", "Python", "MongoDB", "SMS APIs", "Translation APIs", "Maps"],
    experienceLevel: "all" as const,
    location: "Chicago, IL (Hybrid)",
    socialLinks: {
      website: "https://socialimpact.tech",
      discord: "https://discord.gg/socialimpact",
      twitter: "https://twitter.com/socialimpactdev",
      telegram: "",
      github: "https://github.com/social-impact-tech",
    },
    prizeCohorts: [
      {
        name: "Greatest Social Impact",
        numberOfWinners: 1,
        prizeAmount: "10000",
        description: "Solution with highest potential for positive social change",
        judgingMode: "hybrid",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Social Impact", points: 60, description: "Potential to create positive social change" },
          { name: "Community Need", points: 25, description: "Addresses genuine community-identified needs" },
          { name: "Implementation Plan", points: 15, description: "Clear path to real-world deployment" },
        ],
      },
      {
        name: "Best Accessibility Solution",
        numberOfWinners: 1,
        prizeAmount: "5000",
        description: "Outstanding accessibility and inclusion technology",
        judgingMode: "automated",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          { name: "Accessibility Impact", points: 70, description: "Improves accessibility for people with disabilities" },
          { name: "Inclusive Design", points: 30, description: "Universal design principles and broad inclusion" },
        ],
      },
    ],
    judges: [
      { email: "director@unitednations.org", status: "invited" },
      { email: "social.good@techforgood.org", status: "accepted" },
    ],
    schedule: [
      {
        name: "Social Impact Design Thinking",
        description: "Human-centered design for social good",
        startDateTime: createDate(45, 9),
        endDateTime: createDate(45, 11),
        hasSpeaker: true,
        speaker: {
          name: "Sarah Johnson",
          position: "Social Impact Designer",
          xName: "Sarah Johnson",
          xHandle: "@sarahjohnsondesign",
          picture: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
];

// Helper function to get a random mock hackathon
export function getRandomMockHackathon(): HackathonFormData {
  const randomIndex = Math.floor(Math.random() * mockHackathons.length);
  return { ...mockHackathons[randomIndex] }; // Return a copy to avoid mutations
}

// Helper function to get multiple random mock hackathons
export function getRandomMockHackathons(count: number): HackathonFormData[] {
  const shuffled = [...mockHackathons].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, mockHackathons.length));
}

// Export all mock data for testing
export { mockHackathons as allMockHackathons };