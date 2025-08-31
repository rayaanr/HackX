const hackathons = [
  {
    id: "hackathon-1",
    name: "AI Revolution 2025",
    visual:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    shortDescription: "Build the future with AI - 48 hours of innovation",
    fullDescription:
      "Join us for the most exciting AI hackathon of 2025! Teams will compete to create groundbreaking AI applications that solve real-world problems. From machine learning to natural language processing, this is your chance to push the boundaries of artificial intelligence.",
    location: "San Francisco, CA",
    techStack: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "OpenAI",
      "Hugging Face",
      "JavaScript",
      "React",
    ],
    experienceLevel: "intermediate" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-09-01T00:00:00Z"),
      registrationEndDate: new Date("2025-09-25T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-10-01T09:00:00Z"),
      hackathonEndDate: new Date("2025-10-03T18:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-10-03T19:00:00Z"),
      votingEndDate: new Date("2025-10-05T23:59:59Z"),
    },
    socialLinks: {
      website: "https://airevolution2025.com",
      twitter: "https://twitter.com/airevolution2025",
      discord: "https://discord.gg/airevolution",
    },
    prizeCohorts: [
      {
        name: "Grand Prize",
        numberOfWinners: 1,
        prizeAmount: "$10,000",
        description: "The most innovative AI solution",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Innovation",
            points: 30,
            description: "Originality and creativity of the solution",
          },
          {
            name: "Technical Excellence",
            points: 25,
            description: "Code quality and implementation",
          },
          {
            name: "Impact",
            points: 25,
            description: "Potential real-world impact",
          },
          {
            name: "Presentation",
            points: 20,
            description: "Demo and pitch quality",
          },
        ],
      },
      {
        name: "Best Student Team",
        numberOfWinners: 1,
        prizeAmount: "$2,500",
        description: "For teams with all student members",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Learning",
            points: 40,
            description: "Educational value and skill development",
          },
          {
            name: "Creativity",
            points: 35,
            description: "Creative approach to problem solving",
          },
          {
            name: "Teamwork",
            points: 25,
            description: "Collaboration and team dynamics",
          },
        ],
      },
    ],
    judges: [
      { email: "sarah.chen@techcorp.com", status: "accepted" as const },
      { email: "mike.johnson@airesearch.org", status: "pending" as const },
      { email: "alex.rodriguez@startup.io", status: "waiting" as const },
    ],
    schedule: [
      {
        name: "Opening Ceremony",
        description: "Welcome and hackathon kickoff",
        startDateTime: new Date("2025-10-01T09:00:00Z"),
        endDateTime: new Date("2025-10-01T10:00:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Dr. Elena Vasquez",
          position: "AI Research Director at TechCorp",
          xName: "Elena Vasquez",
          xHandle: "@elenatech",
          picture:
            "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
        },
      },
      {
        name: "AI Workshop",
        description: "Hands-on machine learning workshop",
        startDateTime: new Date("2025-10-01T11:00:00Z"),
        endDateTime: new Date("2025-10-01T13:00:00Z"),
        hasSpeaker: false,
      },
      {
        name: "Final Presentations",
        description: "Teams present their solutions",
        startDateTime: new Date("2025-10-03T15:00:00Z"),
        endDateTime: new Date("2025-10-03T17:00:00Z"),
        hasSpeaker: false,
      },
    ],
  },

  {
    id: "hackathon-2",
    name: "Green Tech Challenge",
    visual:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop",
    shortDescription: "Sustainable solutions for a better tomorrow",
    fullDescription:
      "Climate change is real, and technology can be part of the solution. Join developers, designers, and environmentalists to create apps and tools that help combat climate change and promote sustainability.",
    location: "Seattle, WA",
    techStack: ["React", "Node.js", "Python", "IoT", "Blockchain", "Flutter"],
    experienceLevel: "all" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-09-15T00:00:00Z"),
      registrationEndDate: new Date("2025-10-10T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-10-15T10:00:00Z"),
      hackathonEndDate: new Date("2025-10-17T16:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-10-17T17:00:00Z"),
      votingEndDate: new Date("2025-10-19T23:59:59Z"),
    },
    socialLinks: {
      website: "https://greentechchallenge.org",
      linkedin: "https://linkedin.com/company/greentechchallenge",
    },
    prizeCohorts: [
      {
        name: "Climate Impact Award",
        numberOfWinners: 1,
        prizeAmount: "$8,000",
        description: "Best solution for climate change mitigation",
        judgingMode: "hybrid" as const,
        votingMode: "public" as const,
        maxVotesPerJudge: 3,
        evaluationCriteria: [
          {
            name: "Environmental Impact",
            points: 40,
            description: "Potential to reduce carbon footprint",
          },
          {
            name: "Scalability",
            points: 30,
            description: "Ability to scale globally",
          },
          {
            name: "Feasibility",
            points: 30,
            description: "Technical and economic feasibility",
          },
        ],
      },
    ],
    judges: [
      { email: "green.expert@environment.org", status: "accepted" as const },
      { email: "tech.lead@sustainabletech.com", status: "accepted" as const },
    ],
    schedule: [
      {
        name: "Welcome & Climate Briefing",
        description: "Understanding the climate crisis through data",
        startDateTime: new Date("2025-10-15T10:00:00Z"),
        endDateTime: new Date("2025-10-15T11:30:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Prof. Maya Singh",
          position: "Climate Scientist at University of Washington",
          xName: "Maya Singh",
          xHandle: "@mayaclimate",
        },
      },
    ],
  },

  {
    id: "hackathon-3",
    name: "FinTech Revolution",
    visual:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
    shortDescription: "Democratizing finance through technology",
    fullDescription:
      "Build the future of finance! From DeFi protocols to mobile banking apps, create solutions that make financial services more accessible, secure, and user-friendly for everyone.",
    location: "New York, NY",
    techStack: [
      "Solidity",
      "Web3",
      "React",
      "Node.js",
      "MongoDB",
      "Stripe API",
      "Plaid API",
    ],
    experienceLevel: "advanced" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-10-01T00:00:00Z"),
      registrationEndDate: new Date("2025-10-20T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-10-25T09:00:00Z"),
      hackathonEndDate: new Date("2025-10-27T18:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-10-27T19:00:00Z"),
      votingEndDate: new Date("2025-10-29T23:59:59Z"),
    },
    socialLinks: {
      website: "https://fintechrevolution.com",
      twitter: "https://twitter.com/fintechrev",
      telegram: "https://t.me/fintechrevolution",
    },
    prizeCohorts: [
      {
        name: "DeFi Innovation",
        numberOfWinners: 1,
        prizeAmount: "$15,000",
        description: "Most innovative DeFi protocol or application",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Innovation",
            points: 35,
            description: "Novel approach to DeFi",
          },
          {
            name: "Security",
            points: 30,
            description: "Smart contract security and audit readiness",
          },
          {
            name: "User Experience",
            points: 20,
            description: "Ease of use and accessibility",
          },
          {
            name: "Market Potential",
            points: 15,
            description: "Commercial viability",
          },
        ],
      },
      {
        name: "Financial Inclusion",
        numberOfWinners: 1,
        prizeAmount: "$5,000",
        description: "Best solution for underserved communities",
        judgingMode: "manual" as const,
        votingMode: "private" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Impact",
            points: 50,
            description: "Potential to help underserved populations",
          },
          {
            name: "Accessibility",
            points: 30,
            description: "Easy access without barriers",
          },
          {
            name: "Sustainability",
            points: 20,
            description: "Long-term business model",
          },
        ],
      },
    ],
    judges: [
      { email: "blockchain.expert@defi.com", status: "accepted" as const },
      { email: "fintech.veteran@bank.com", status: "pending" as const },
      { email: "security.specialist@audit.firm", status: "accepted" as const },
    ],
    schedule: [
      {
        name: "DeFi Masterclass",
        description: "Deep dive into decentralized finance protocols",
        startDateTime: new Date("2025-10-25T10:00:00Z"),
        endDateTime: new Date("2025-10-25T12:00:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Raj Patel",
          position: "DeFi Protocol Architect",
          xName: "Raj Patel",
          xHandle: "@rajdefi",
          picture:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },

  {
    id: "hackathon-4",
    name: "HealthTech Heroes",
    visual:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
    shortDescription: "Technology for better healthcare outcomes",
    fullDescription:
      "Healthcare innovation that saves lives. Build apps, devices, and platforms that improve patient care, streamline medical processes, or advance medical research.",
    location: "Boston, MA",
    techStack: [
      "React Native",
      "Python",
      "TensorFlow",
      "FHIR API",
      "Swift",
      "Kotlin",
    ],
    experienceLevel: "intermediate" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-09-20T00:00:00Z"),
      registrationEndDate: new Date("2025-10-15T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-10-20T08:00:00Z"),
      hackathonEndDate: new Date("2025-10-22T17:00:00Z"),
    },
    votingPeriod: {},
    socialLinks: {
      website: "https://healthtechheroes.org",
      linkedin: "https://linkedin.com/company/healthtechheroes",
    },
    prizeCohorts: [
      {
        name: "Patient Care Excellence",
        numberOfWinners: 1,
        prizeAmount: "$12,000",
        description: "Solution that significantly improves patient outcomes",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Clinical Impact",
            points: 40,
            description: "Potential to improve patient health",
          },
          {
            name: "Usability",
            points: 25,
            description: "Easy for healthcare providers to use",
          },
          {
            name: "Evidence-Based",
            points: 20,
            description: "Grounded in medical research",
          },
          {
            name: "Implementation",
            points: 15,
            description: "Realistic deployment strategy",
          },
        ],
      },
    ],
    judges: [
      { email: "dr.smith@hospital.org", status: "accepted" as const },
      { email: "nurse.johnson@clinic.com", status: "pending" as const },
    ],
    schedule: [
      {
        name: "Healthcare API Workshop",
        description: "Working with medical data APIs and HIPAA compliance",
        startDateTime: new Date("2025-10-20T09:00:00Z"),
        endDateTime: new Date("2025-10-20T11:00:00Z"),
        hasSpeaker: false,
      },
    ],
  },

  {
    id: "hackathon-5",
    name: "EdTech Innovators",
    visual:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
    shortDescription: "Transforming education through technology",
    fullDescription:
      "Education is evolving, and technology is leading the way. Create platforms, tools, and experiences that make learning more engaging, accessible, and effective for students of all ages.",
    location: "Austin, TX",
    techStack: ["React", "Vue.js", "Python", "Unity", "AR/VR", "Firebase"],
    experienceLevel: "beginner" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-10-05T00:00:00Z"),
      registrationEndDate: new Date("2025-10-25T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-10-30T09:00:00Z"),
      hackathonEndDate: new Date("2025-11-01T16:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-11-01T17:00:00Z"),
      votingEndDate: new Date("2025-11-03T23:59:59Z"),
    },
    socialLinks: {
      website: "https://edtechinnovators.edu",
      instagram: "https://instagram.com/edtechinnovators",
    },
    prizeCohorts: [
      {
        name: "K-12 Excellence",
        numberOfWinners: 2,
        prizeAmount: "$3,000",
        description: "Best educational tool for K-12 students",
        judgingMode: "automated" as const,
        votingMode: "public" as const,
        maxVotesPerJudge: 5,
        evaluationCriteria: [
          {
            name: "Educational Value",
            points: 35,
            description: "Learning effectiveness",
          },
          {
            name: "Engagement",
            points: 30,
            description: "Student engagement level",
          },
          {
            name: "Accessibility",
            points: 20,
            description: "Inclusive design",
          },
          { name: "Innovation", points: 15, description: "Creative approach" },
        ],
      },
    ],
    judges: [
      { email: "teacher@school.edu", status: "waiting" as const },
      { email: "principal@elementary.edu", status: "invited" as const },
    ],
    schedule: [
      {
        name: "EdTech Trends",
        description: "Current trends in educational technology",
        startDateTime: new Date("2025-10-30T10:00:00Z"),
        endDateTime: new Date("2025-10-30T11:30:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Lisa Wang",
          position: "EdTech Research Lead",
          xName: "Lisa Wang",
          xHandle: "@lisaedtech",
        },
      },
    ],
  },

  {
    id: "hackathon-6",
    name: "Gaming Universe",
    visual:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop",
    shortDescription: "Create the next generation of games",
    fullDescription:
      "From indie games to AAA experiences, mobile to VR - build games that entertain, educate, and inspire. Whether you're a seasoned developer or just starting out, create something amazing!",
    location: "Los Angeles, CA",
    techStack: [
      "Unity",
      "Unreal Engine",
      "C#",
      "JavaScript",
      "Blender",
      "WebGL",
    ],
    experienceLevel: "all" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-10-10T00:00:00Z"),
      registrationEndDate: new Date("2025-11-05T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-11-10T10:00:00Z"),
      hackathonEndDate: new Date("2025-11-12T18:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-11-12T19:00:00Z"),
      votingEndDate: new Date("2025-11-15T23:59:59Z"),
    },
    socialLinks: {
      website: "https://gaminguniverse.dev",
      twitch: "https://twitch.tv/gaminguniverse",
      discord: "https://discord.gg/gaminguniverse",
    },
    prizeCohorts: [
      {
        name: "Best Overall Game",
        numberOfWinners: 1,
        prizeAmount: "$7,500",
        description: "The most fun and polished game experience",
        judgingMode: "hybrid" as const,
        votingMode: "public" as const,
        maxVotesPerJudge: 3,
        evaluationCriteria: [
          {
            name: "Fun Factor",
            points: 30,
            description: "How enjoyable the game is to play",
          },
          {
            name: "Polish",
            points: 25,
            description: "Game quality and finish",
          },
          {
            name: "Originality",
            points: 25,
            description: "Unique gameplay or concept",
          },
          {
            name: "Technical Achievement",
            points: 20,
            description: "Technical implementation quality",
          },
        ],
      },
      {
        name: "Mobile Gaming Award",
        numberOfWinners: 1,
        prizeAmount: "$2,000",
        description: "Best mobile game experience",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Mobile UX",
            points: 40,
            description: "Optimized for mobile devices",
          },
          {
            name: "Addictiveness",
            points: 35,
            description: "Keeps players coming back",
          },
          {
            name: "Performance",
            points: 25,
            description: "Smooth performance on mobile",
          },
        ],
      },
    ],
    judges: [
      { email: "gamedev@studio.com", status: "accepted" as const },
      { email: "indie.developer@games.io", status: "accepted" as const },
    ],
    schedule: [
      {
        name: "Game Design Workshop",
        description: "Fundamentals of engaging game design",
        startDateTime: new Date("2025-11-10T11:00:00Z"),
        endDateTime: new Date("2025-11-10T13:00:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Alex Chen",
          position: "Senior Game Designer at IndieCorp",
          xName: "Alex Chen",
          xHandle: "@alexgamedev",
          picture:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },

  {
    id: "hackathon-7",
    name: "Smart Cities Summit",
    visual:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop",
    shortDescription: "Building smarter, more connected cities",
    fullDescription:
      "Cities of the future need smart solutions today. Develop IoT applications, urban planning tools, and civic tech that makes cities more efficient, sustainable, and livable.",
    location: "Chicago, IL",
    techStack: ["IoT", "Python", "React", "MongoDB", "Arduino", "Raspberry Pi"],
    experienceLevel: "intermediate" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-10-15T00:00:00Z"),
      registrationEndDate: new Date("2025-11-10T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-11-15T09:00:00Z"),
      hackathonEndDate: new Date("2025-11-17T17:00:00Z"),
    },
    votingPeriod: null,
    socialLinks: {
      website: "https://smartcitiessummit.gov",
      linkedin: "https://linkedin.com/company/smartcitiessummit",
    },
    prizeCohorts: [
      {
        name: "Urban Innovation",
        numberOfWinners: 1,
        prizeAmount: "$6,000",
        description: "Most impactful solution for urban challenges",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Impact",
            points: 35,
            description: "Potential positive impact on city life",
          },
          {
            name: "Scalability",
            points: 30,
            description: "Can be implemented across multiple cities",
          },
          {
            name: "Feasibility",
            points: 20,
            description: "Realistic implementation plan",
          },
          {
            name: "Innovation",
            points: 15,
            description: "Novel approach to urban problems",
          },
        ],
      },
    ],
    judges: [
      { email: "urban.planner@city.gov", status: "pending" as const },
      { email: "iot.expert@smarttech.com", status: "accepted" as const },
    ],
    schedule: [
      {
        name: "Smart City Overview",
        description: "Current state and future of smart cities",
        startDateTime: new Date("2025-11-15T09:30:00Z"),
        endDateTime: new Date("2025-11-15T11:00:00Z"),
        hasSpeaker: false,
      },
    ],
  },

  {
    id: "hackathon-8",
    name: "Cybersecurity Shield",
    visual:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
    shortDescription: "Defending the digital world",
    fullDescription:
      "Cybersecurity threats are evolving every day. Build tools, platforms, and solutions that help protect individuals, businesses, and organizations from cyber attacks and data breaches.",
    location: "Washington, DC",
    techStack: ["Python", "Go", "Rust", "Kubernetes", "Docker", "Blockchain"],
    experienceLevel: "advanced" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-11-01T00:00:00Z"),
      registrationEndDate: new Date("2025-11-20T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-11-25T08:00:00Z"),
      hackathonEndDate: new Date("2025-11-27T20:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-11-28T00:00:00Z"),
      votingEndDate: new Date("2025-11-30T23:59:59Z"),
    },
    socialLinks: {
      website: "https://cybersecurityshield.org",
      twitter: "https://twitter.com/cybershield",
    },
    prizeCohorts: [
      {
        name: "Defense Innovation",
        numberOfWinners: 1,
        prizeAmount: "$20,000",
        description: "Most effective cybersecurity defense solution",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Effectiveness",
            points: 30,
            description: "How well it prevents/detects threats",
          },
          {
            name: "Scalability",
            points: 25,
            description: "Enterprise deployment capability",
          },
          {
            name: "Innovation",
            points: 25,
            description: "Novel security approach",
          },
          {
            name: "Usability",
            points: 20,
            description: "Easy for security teams to use",
          },
        ],
      },
      {
        name: "Privacy Protection",
        numberOfWinners: 1,
        prizeAmount: "$5,000",
        description: "Best solution for protecting user privacy",
        judgingMode: "manual" as const,
        votingMode: "private" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Privacy Impact",
            points: 50,
            description: "Effectiveness in protecting privacy",
          },
          {
            name: "User Experience",
            points: 30,
            description: "Easy for end users",
          },
          {
            name: "Technical Merit",
            points: 20,
            description: "Strong technical implementation",
          },
        ],
      },
    ],
    judges: [
      { email: "security.expert@nsa.gov", status: "accepted" as const },
      { email: "cyber.analyst@dod.gov", status: "pending" as const },
      { email: "privacy.advocate@eff.org", status: "waiting" as const },
    ],
    schedule: [
      {
        name: "Threat Landscape Briefing",
        description: "Current cybersecurity threats and trends",
        startDateTime: new Date("2025-11-25T08:30:00Z"),
        endDateTime: new Date("2025-11-25T10:00:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Commander Sarah Mitchell",
          position: "Cybersecurity Operations Director",
          xName: "Sarah Mitchell",
          xHandle: "@sarahcyber",
        },
      },
    ],
  },

  {
    id: "hackathon-9",
    name: "Social Good Hack",
    visual:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
    shortDescription: "Technology that makes a difference",
    fullDescription:
      "Use your skills to solve social problems and help communities. Build apps and platforms that address issues like poverty, inequality, accessibility, mental health, and social justice.",
    location: "Denver, CO",
    techStack: [
      "React",
      "Node.js",
      "Python",
      "MongoDB",
      "React Native",
      "Flutter",
    ],
    experienceLevel: "all" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-11-05T00:00:00Z"),
      registrationEndDate: new Date("2025-11-25T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-11-30T09:00:00Z"),
      hackathonEndDate: new Date("2025-12-02T16:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-12-02T17:00:00Z"),
      votingEndDate: new Date("2025-12-05T23:59:59Z"),
    },
    socialLinks: {
      website: "https://socialgoodhack.org",
      instagram: "https://instagram.com/socialgoodhack",
      facebook: "https://facebook.com/socialgoodhack",
    },
    prizeCohorts: [
      {
        name: "Community Impact",
        numberOfWinners: 1,
        prizeAmount: "$4,000",
        description: "Solution with the greatest potential community impact",
        judgingMode: "hybrid" as const,
        votingMode: "public" as const,
        maxVotesPerJudge: 2,
        evaluationCriteria: [
          {
            name: "Social Impact",
            points: 40,
            description: "Potential to help communities",
          },
          {
            name: "Accessibility",
            points: 25,
            description: "Inclusive and accessible design",
          },
          {
            name: "Sustainability",
            points: 20,
            description: "Long-term viability",
          },
          {
            name: "Implementation",
            points: 15,
            description: "Clear path to deployment",
          },
        ],
      },
      {
        name: "Accessibility Champion",
        numberOfWinners: 1,
        prizeAmount: "$2,000",
        description: "Best solution for improving accessibility",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Accessibility",
            points: 60,
            description: "Removes barriers for disabled users",
          },
          {
            name: "Usability",
            points: 25,
            description: "Easy to use for target audience",
          },
          {
            name: "Innovation",
            points: 15,
            description: "Creative accessibility solution",
          },
        ],
      },
    ],
    judges: [
      { email: "advocate@disability.org", status: "accepted" as const },
      { email: "director@nonprofit.org", status: "pending" as const },
    ],
    schedule: [
      {
        name: "Social Impact Design",
        description: "Designing technology for social good",
        startDateTime: new Date("2025-11-30T10:00:00Z"),
        endDateTime: new Date("2025-11-30T12:00:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Maria Rodriguez",
          position: "Social Impact Designer",
          xName: "Maria Rodriguez",
          xHandle: "@mariasocial",
          picture:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },

  {
    id: "hackathon-10",
    name: "Space Tech Frontier",
    visual:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop",
    shortDescription: "Building technology for the final frontier",
    fullDescription:
      "Space exploration is entering a new era. Develop tools, simulations, and applications for space missions, satellite data analysis, astronaut training, or space tourism. The universe awaits!",
    location: "Houston, TX",
    techStack: ["Python", "MATLAB", "C++", "Unity", "TensorFlow", "OpenGL"],
    experienceLevel: "advanced" as const,
    registrationPeriod: {
      registrationStartDate: new Date("2025-11-10T00:00:00Z"),
      registrationEndDate: new Date("2025-12-01T23:59:59Z"),
    },
    hackathonPeriod: {
      hackathonStartDate: new Date("2025-12-05T08:00:00Z"),
      hackathonEndDate: new Date("2025-12-07T18:00:00Z"),
    },
    votingPeriod: {
      votingStartDate: new Date("2025-12-07T19:00:00Z"),
      votingEndDate: new Date("2025-12-10T23:59:59Z"),
    },
    socialLinks: {
      website: "https://spacetechfrontier.nasa.gov",
      youtube: "https://youtube.com/spacetechfrontier",
    },
    prizeCohorts: [
      {
        name: "Mission Critical",
        numberOfWinners: 1,
        prizeAmount: "$25,000",
        description: "Technology that could be used in real space missions",
        judgingMode: "manual" as const,
        votingMode: "judges_only" as const,
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Mission Applicability",
            points: 30,
            description: "Usefulness for space missions",
          },
          {
            name: "Reliability",
            points: 25,
            description: "Can work in harsh space conditions",
          },
          {
            name: "Innovation",
            points: 25,
            description: "Novel approach to space challenges",
          },
          {
            name: "Technical Excellence",
            points: 20,
            description: "High-quality implementation",
          },
        ],
      },
      {
        name: "Educational Outreach",
        numberOfWinners: 1,
        prizeAmount: "$3,000",
        description: "Best tool for space education and public engagement",
        judgingMode: "automated" as const,
        votingMode: "public" as const,
        maxVotesPerJudge: 3,
        evaluationCriteria: [
          {
            name: "Educational Value",
            points: 40,
            description: "Teaches space concepts effectively",
          },
          {
            name: "Engagement",
            points: 30,
            description: "Captures user interest",
          },
          {
            name: "Accessibility",
            points: 30,
            description: "Accessible to diverse audiences",
          },
        ],
      },
    ],
    judges: [
      { email: "astronaut@nasa.gov", status: "accepted" as const },
      { email: "engineer@spacex.com", status: "pending" as const },
      { email: "scientist@jpl.nasa.gov", status: "accepted" as const },
    ],
    schedule: [
      {
        name: "Mission to Mars Keynote",
        description: "Challenges and opportunities in Mars exploration",
        startDateTime: new Date("2025-12-05T09:00:00Z"),
        endDateTime: new Date("2025-12-05T10:30:00Z"),
        hasSpeaker: true,
        speaker: {
          name: "Dr. James Parker",
          position: "Mars Mission Director at NASA",
          xName: "Dr. James Parker",
          xHandle: "@drjamesparker",
          picture:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        },
      },
      {
        name: "Satellite Data Workshop",
        description: "Working with satellite imagery and orbital data",
        startDateTime: new Date("2025-12-05T11:00:00Z"),
        endDateTime: new Date("2025-12-05T13:00:00Z"),
        hasSpeaker: false,
      },
    ],
  },
];

// Export the hackathons array and utility functions
export { hackathons };
export const mockHackathons = hackathons; // Keep for backward compatibility

// Helper function to get a random subset for testing
export function getRandomHackathons(count: number = 5) {
  const shuffled = [...hackathons].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get hackathons by experience level
export function getHackathonsByLevel(
  level: "beginner" | "intermediate" | "advanced" | "all"
) {
  return hackathons.filter(
    (h) => h.experienceLevel === level || h.experienceLevel === "all"
  );
}

// Export type
export type Hackathon = typeof hackathons[0];
