import type { HackathonFormData } from "@/types/hackathon";

// Helper function to create dates relative to now
function createDate(
  daysFromNow: number,
  hoursOffset = 0,
  minutesOffset = 0,
): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hoursOffset, minutesOffset, 0, 0);
  return date;
}

// Helper function to create testing periods with proper phase separation
function createTestingPeriods(offsetMinutes = 0) {
  const now = new Date();
  const baseTime = new Date(now.getTime() + (3 + offsetMinutes) * 60000); // Current time + 3 minute + offset

  return {
    registrationPeriod: {
      registrationStartDate: new Date(baseTime.getTime()), // Start at base time
      registrationEndDate: new Date(baseTime.getTime() + 5 * 60000), // +5 minutes (ends before submission)
    },
    hackathonPeriod: {
      hackathonStartDate: new Date(baseTime.getTime() + 2 * 60000), // +2 minutes (1 minute gap after registration)
      hackathonEndDate: new Date(baseTime.getTime() + 9 * 60000), // +9 minutes (5 minute submission window)
    },
    votingPeriod: {
      votingStartDate: new Date(baseTime.getTime() + 11 * 60000), // +11 minutes (2 minute gap after submission)
      votingEndDate: new Date(baseTime.getTime() + 20 * 60000), // +20 minutes (10 minute voting window)
    },
  };
}

// Helper function to create testing schedule events aligned with hackathon periods
function createTestingSchedule(offsetMinutes = 0) {
  const now = new Date();
  const baseTime = new Date(now.getTime() + (3 + offsetMinutes) * 60000); // Current time + 3 minutes + offset

  return [
    {
      name: "Registration Closes",
      description: "Last chance to register for the hackathon",
      startDateTime: new Date(baseTime.getTime() + 2 * 60000), // Registration almost over
      endDateTime: new Date(baseTime.getTime() + 3 * 60000), // Registration ends
      hasSpeaker: false,
    },
    {
      name: "Opening Ceremony & Submission Phase Begins",
      description: "Welcome address and submission phase starts",
      startDateTime: new Date(baseTime.getTime() + 4 * 60000), // Submission starts
      endDateTime: new Date(baseTime.getTime() + 5 * 60000), // +1 minute
      hasSpeaker: true,
      speaker: {
        name: "Event Speaker",
        position: "Industry Expert",
        xName: "Event Speaker",
        xHandle: "@eventspeaker",
        picture:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
    },
    {
      name: "Final Presentations & Submission Deadline",
      description: "Present your projects and final submission deadline",
      startDateTime: new Date(baseTime.getTime() + 8 * 60000), // Near submission end
      endDateTime: new Date(baseTime.getTime() + 9 * 60000), // Submission ends
      hasSpeaker: false,
    },
  ];
}

// Mock hackathon data for testing
export const mockHackathons: HackathonFormData[] = [
  {
    name: "AI Revolution Hackathon",
    visual:
      "https://a.dropoverapp.com/cloud/download/66603fd5-1fa4-42b5-adc5-ad2666eba69a/7f05c217-21e8-4e4d-885e-62bf14a4c86f",
    shortDescription:
      "Build the next generation of AI-powered applications that will transform how we work and live.",
    fullDescription: `# AI Revolution Hackathon

Join us for the **AI Revolution Hackathon**, where developers, designers, and innovators come together to create groundbreaking AI applications. This 48-hour intensive event will challenge participants to leverage cutting-edge AI technologies including:

- Machine learning
- Natural language processing
- Computer vision

## What You'll Get

Participants will have access to:

1. **Premium API credits** for major AI platforms
2. **Expert mentorship** from industry leaders
3. **State-of-the-art development tools**

> Whether you're building a productivity assistant, a creative AI tool, or a revolutionary healthcare solution, this hackathon provides the perfect platform to bring your AI vision to life.

## Event Highlights

The event features workshops on:
- Prompt engineering
- Fine-tuning models
- Deploying AI applications at scale

Our panel of AI experts and venture capitalists will provide feedback and guidance throughout the event.`,
    ...createTestingPeriods(0),
    techStack: [
      "JavaScript",
      "Python",
      "React",
      "Node.js",
      "TensorFlow",
      "OpenAI API",
      "Hugging Face",
    ],
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
          {
            name: "Innovation",
            points: 40,
            description: "Originality and creativity of the AI solution",
          },
          {
            name: "Technical Excellence",
            points: 30,
            description: "Quality of implementation and code",
          },
          {
            name: "Impact Potential",
            points: 20,
            description: "Potential real-world impact and scalability",
          },
          {
            name: "Presentation",
            points: 10,
            description: "Quality of demo and presentation",
          },
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
          {
            name: "Social Impact",
            points: 50,
            description: "Potential to address real social problems",
          },
          {
            name: "Feasibility",
            points: 30,
            description: "Realistic implementation and deployment",
          },
          {
            name: "User Experience",
            points: 20,
            description: "Ease of use and accessibility",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0x1234567890123456789012345678901234567890",
        status: "invited",
      },
      {
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        status: "accepted",
      },
      {
        address: "0xfedcbafedcbafedcbafedcbafedcbafedcbafed",
        status: "accepted",
      },
    ],
    schedule: createTestingSchedule(0),
  },
  {
    name: "DeFi Summer Hackathon",
    visual:
      "https://a.dropoverapp.com/cloud/download/d500a8f6-87b3-4000-928f-e623142395be/bb330154-cbbc-40da-8a4b-79b1a5c1fdcc",
    shortDescription:
      "Build the future of decentralized finance with cutting-edge blockchain technology.",
    fullDescription: `## About DeFi Summer Hackathon

The **DeFi Summer Hackathon** is the premier event for blockchain developers and financial innovators. Over 3 days, teams will compete to build revolutionary DeFi protocols, trading bots, yield farming strategies, and financial infrastructure.

### Prize Pool & Benefits

- **$100K+** in total prizes
- Direct access to top VCs
- Premium blockchain APIs (free access)
- Development tools and infrastructure
- Expert mentorship from DeFi protocol founders

### Focus Areas

Build innovative solutions in:

1. **Automated Market Makers (AMMs)**
2. **Lending Protocols**
3. **Cross-chain Bridges**
4. **MEV Strategies**
5. **Governance Mechanisms**
6. **Novel Tokenomics Models**

> This hackathon is your gateway to the DeFi ecosystem and the future of decentralized finance.`,
    ...createTestingPeriods(1),
    techStack: [
      "Solidity",
      "Web3.js",
      "Ethers.js",
      "React",
      "Node.js",
      "Hardhat",
      "The Graph",
    ],
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
          {
            name: "Innovation",
            points: 35,
            description: "Novel approach to DeFi challenges",
          },
          {
            name: "Security",
            points: 30,
            description: "Smart contract security and audit readiness",
          },
          {
            name: "Tokenomics",
            points: 20,
            description: "Sustainable token economics design",
          },
          {
            name: "User Experience",
            points: 15,
            description: "Intuitive interface and user flow",
          },
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
          {
            name: "Performance",
            points: 40,
            description: "Trading performance and profitability",
          },
          {
            name: "Technical Implementation",
            points: 30,
            description: "Code quality and architecture",
          },
          {
            name: "Risk Management",
            points: 30,
            description: "Risk controls and safety measures",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0x9876543210987654321098765432109876543210",
        status: "accepted",
      },
      {
        address: "0x1111222233334444555566667777888899990000",
        status: "invited",
      },
      {
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        status: "accepted",
      },
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
          picture:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
          picture:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Climate Tech Innovation Challenge",
    visual:
      "https://a.dropoverapp.com/cloud/download/3da232c1-d264-4600-a484-7fabc39c868e/43f0958d-5d92-4198-b67e-27ce445effa8",
    shortDescription:
      "Develop technology solutions to combat climate change and build a sustainable future.",
    fullDescription: `# 🌍 Climate Tech Innovation Challenge

The **Climate Tech Innovation Challenge** is the premier event for developers, scientists, and innovators committed to fighting climate change through technology. This intensive weekend hackathon brings together passionate minds to build solutions that will help create a sustainable future for our planet.

## 🎯 Mission Statement

In an era where **climate action is no longer optional**, we're empowering technologists to build the tools our planet desperately needs. From carbon tracking to renewable energy optimization, your code can make the difference between a livable and uninhabitable future.

## 💡 Why Participate?

### **Make Real Impact**
- Contribute to **meaningful solutions** that address one of humanity's greatest challenges
- Build tools that could be deployed by **NGOs and governments** worldwide
- Join a community of **climate-conscious developers** making a difference

### **Access Premium Resources**
- **Free API access** to premium climate datasets (NASA, NOAA, European Space Agency)
- **$10,000+ in cloud credits** across AWS, Google Cloud, and Azure
- **Direct mentorship** from climate scientists and sustainability experts
- **Real-time satellite data** and environmental sensor networks

### **Career & Networking Opportunities**
- Connect with **climate tech startups** and green energy companies
- **Job placement assistance** with our partner organizations
- Access to **$50M+ climate tech fund** for promising solutions
- **1:1 sessions** with VCs specializing in climate investments

## 🔬 Focus Areas & Technologies

### **Carbon Management**
- **Carbon footprint calculators** for individuals and corporations
- **Supply chain emissions tracking** with blockchain verification
- **Automated ESG reporting** for financial institutions
- **Carbon offset marketplace** platforms

### **Renewable Energy Optimization**
- **Smart grid management** systems
- **Solar panel efficiency optimization** using IoT and AI
- **Wind farm predictive analytics**
- **Home energy management** applications

### **Climate Data & Analytics**
- **Extreme weather prediction** models
- **Deforestation monitoring** using satellite imagery
- **Ocean health tracking** systems
- **Agricultural climate adaptation** tools

### **Sustainable Finance**
- **Green investment platforms**
- **Climate risk assessment** for insurance
- **Sustainable crypto mining** solutions
- **Impact measurement** dashboards

## 🛠️ Technical Resources

### **APIs & Data Sources**
- NASA Climate Change API
- OpenWeatherMap Climate Data
- World Bank Climate Change Knowledge Portal
- Google Earth Engine
- Carbon Interface API

### **Development Tools**
- Pre-configured **Docker containers** with climate datasets
- **Jupyter notebooks** with sample analysis code
- **ML model templates** for environmental prediction
- **Blockchain templates** for carbon credit tracking

## 📊 Challenge Tracks

### 🏆 **Grand Prize Track** - *$15,000*
> Most innovative solution with highest environmental impact potential

### 🌱 **Youth Climate Action** - *$5,000*
> Best solution by participants under 25 years old

### 🏢 **Corporate Sustainability** - *$7,500*
> Tools for enterprise-level environmental management

### 🌊 **Ocean Conservation** - *$5,000*
> Marine ecosystem protection and restoration tools

## 🎓 Learning & Workshops

- **Climate Science 101** - Understanding the data behind climate change
- **Sustainable Development Goals** - Building for UN SDGs
- **Green UX Design** - Creating environmentally conscious interfaces
- **Impact Measurement** - Quantifying environmental benefits

## 🤝 Partner Organizations

- **350.org** - Climate action network
- **Climate Tech Alliance** - Industry consortium
- **Green New Deal Network** - Policy advocacy
- **Sunrise Movement** - Youth climate activism

> **"Technology is our most powerful tool in the fight against climate change. Every line of code you write this weekend could help save our planet."** 
> 
> *- Dr. Jane Smith, Lead Climate Data Scientist*

---

**Ready to code for the climate?** Join us in building technology that doesn't just change the world – it saves it. 🌍💻`,
    ...createTestingPeriods(2),
    techStack: [
      "Python",
      "React",
      "Node.js",
      "TensorFlow",
      "AWS",
      "Google Earth Engine",
      "D3.js",
    ],
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
          {
            name: "Environmental Impact",
            points: 50,
            description: "Potential to reduce emissions or environmental harm",
          },
          {
            name: "Scalability",
            points: 25,
            description: "Ability to scale globally",
          },
          {
            name: "Feasibility",
            points: 25,
            description: "Technical and economic feasibility",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        status: "accepted",
      },
      {
        address: "0xcccccccccccccccccccccccccccccccccccccccc",
        status: "invited",
      },
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
          picture:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Gaming Metaverse Builders",
    visual:
      "https://a.dropoverapp.com/cloud/download/e90da2d9-127b-4b27-8aa3-c5a8c19efab6/3a6ae356-1fc0-467d-91bf-4d75aeb45694",
    shortDescription:
      "Create immersive gaming experiences and metaverse applications using the latest tech.",
    fullDescription: `# 🎮 Gaming Metaverse Builders Hackathon

Step into the future of digital entertainment! The **Gaming Metaverse Builders** hackathon is where gaming visionaries come together to create the next generation of immersive experiences. Build games that transcend reality, economies that reward players, and worlds where imagination becomes interactive.

## 🚀 The Vision

We're building the **metaverse** - not just as a buzzword, but as a living, breathing digital universe where players can:
- **Own their gaming assets** through blockchain technology
- **Earn real value** from their gaming skills and time
- **Connect socially** across virtual worlds and experiences
- **Create and share** their own content within games

## 💎 What Makes This Special?

### **Premium Development Resources**
- **Unity Pro licenses** for all participants ($1,800 value)
- **Unreal Engine marketplace credits** ($500 per team)
- **Adobe Creative Cloud access** for asset creation
- **Figma professional plans** for UI/UX design
- **Photon multiplayer infrastructure** (free tier)

### **Exclusive Asset Libraries**
- **10,000+ 3D models** from Sketchfab Pro
- **Royalty-free music and SFX** from AudioJungle
- **Character animation rigs** and motion capture data
- **Environment textures** and material packs
- **Pre-built shader collections**

### **Blockchain Gaming Infrastructure**
- **Polygon network** free transactions for testing
- **OpenSea API access** for NFT integration
- **Moralis Web3 SDKs** with premium features
- **Chainlink VRF** for provably fair randomness
- **The Graph protocol** for blockchain data indexing

## 🎯 Challenge Categories

### 🏆 **Best Overall Game Experience** - *$20,000*
> The most engaging, polished, and fun gaming experience

**Judging Criteria:**
- **Gameplay Innovation** (40%) - Unique mechanics and engaging gameplay
- **Technical Excellence** (25%) - Performance, graphics, and polish
- **Player Retention** (20%) - Hooks that keep players coming back
- **Accessibility** (15%) - Inclusive design for all players

### 💰 **Best Web3 Gaming Integration** - *$8,000*
> Seamless integration of blockchain technology in gaming

**Focus Areas:**
- **Play-to-Earn Economics** - Sustainable token economies
- **NFT Utility** - Beyond just collectibles
- **Cross-Game Asset Portability**
- **Decentralized Governance** in gaming communities

### 🌐 **Best Metaverse Experience** - *$6,000*
> Virtual worlds that foster community and creativity

### 📱 **Best Mobile Game** - *$4,000*
> Outstanding mobile gaming experience

### ♿ **Accessibility Champion** - *$3,000*
> Game design that breaks barriers and includes everyone

## 🛠️ Technical Tracks

### **Traditional Game Development**
- **2D/3D Games** using Unity, Unreal, or Godot
- **Mobile Games** for iOS and Android
- **Browser Games** with WebGL and JavaScript
- **Console-Style** experiences

### **Emerging Technologies**
- **VR/AR Games** using Oculus SDK, ARCore, ARKit
- **AI-Powered NPCs** with personality and learning
- **Procedural Generation** for infinite content
- **Real-time Ray Tracing** for stunning visuals

### **Web3 & Blockchain Gaming**
- **Smart Contract Games** on Ethereum, Polygon, Solana
- **NFT Integration** for unique in-game assets
- **DeFi Gaming** with yield farming mechanics
- **DAO-Governed Games** with community ownership

## 🎓 Masterclasses & Workshops

### **Day 1 Workshops**
- **Game Design Psychology** - What makes games addictive?
- **Monetization Strategies** - From F2P to Web3 economics
- **Rapid Prototyping** - MVP to playable in hours
- **Art Style Development** - Creating memorable visuals

### **Day 2 Technical Sessions**
- **Multiplayer Architecture** - Building scalable game servers
- **Blockchain Integration** - Web3 gaming best practices
- **Performance Optimization** - 60 FPS on any device
- **Publishing Strategies** - App stores to Steam

### **Day 3 Business Focus**
- **Pitch Perfect** - Presenting your game effectively
- **Community Building** - Growing your player base
- **Funding Strategies** - From grants to VC investment
- **Legal Considerations** - IP, contracts, and compliance

## 🏢 Industry Mentors

- **Epic Games** - Unreal Engine experts
- **Unity Technologies** - Game development leads
- **Polygon Studios** - Web3 gaming specialists
- **Immutable** - NFT gaming infrastructure
- **Axie Infinity** - Play-to-earn pioneers
- **Decentraland** - Metaverse platform builders

## 🎊 Special Events

### **Gaming Tournament Night**
Compete in popular games while networking with fellow developers

### **VR Experience Showcase**
Demo the latest VR games and technology

### **Indie Game Exhibition**
Showcase successful indie games from past winners

### **VC Speed Dating**
Pitch your game concept to gaming-focused investors

## 🎁 Prizes Beyond Money

- **Publishing deals** with major game studios
- **Incubator program** admission (3-month programs)
- **Conference speaking** opportunities
- **Marketplace featuring** on Steam, Epic Games Store
- **Press coverage** in gaming media outlets

> **"The best games are built by developers who understand that great gameplay transcends technology. Whether you're using cutting-edge VR or simple 2D sprites, focus on fun first."**
>
> *- Alex Chen, Senior Game Designer at Unity*

---

**Ready to build the future of gaming?** Grab your controllers, fire up your engines, and let's create experiences that will be played for years to come! 🕹️✨`,
    ...createTestingPeriods(2),
    techStack: [
      "Unity",
      "Unreal Engine",
      "JavaScript",
      "C#",
      "Solidity",
      "WebGL",
      "Three.js",
    ],
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
          {
            name: "Fun Factor",
            points: 40,
            description: "How enjoyable and engaging the game is",
          },
          {
            name: "Innovation",
            points: 30,
            description: "Creative gameplay mechanics or features",
          },
          {
            name: "Technical Quality",
            points: 20,
            description: "Performance, graphics, and polish",
          },
          {
            name: "Accessibility",
            points: 10,
            description: "Inclusive design and accessibility features",
          },
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
          {
            name: "Blockchain Innovation",
            points: 60,
            description: "Creative use of blockchain technology",
          },
          {
            name: "User Experience",
            points: 40,
            description: "Seamless integration of web3 features",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0xdddddddddddddddddddddddddddddddddddddddd",
        status: "accepted",
      },
      {
        address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        status: "invited",
      },
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
          picture:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "HealthTech Innovation Lab",
    visual:
      "https://a.dropoverapp.com/cloud/download/e8f5b0b7-3b84-41fe-90f7-601acea2eb29/620ac0ff-59c9-4d64-a72f-dcc591cc9a21",
    shortDescription:
      "Transform healthcare through technology - build solutions that save lives and improve wellbeing.",
    fullDescription: `# 🏥 HealthTech Innovation Lab

**Transforming Healthcare Through Technology**

The HealthTech Innovation Lab is where medical professionals, software developers, and health innovators converge to solve the most pressing challenges in healthcare. This intensive hackathon focuses on building technology that can **save lives**, **improve patient outcomes**, and **make healthcare accessible to all**.

## 🎯 Our Mission

Healthcare is at a critical inflection point. With rising costs, physician shortages, and an aging population, we need **technology solutions** that can:
- **Scale medical expertise** to underserved communities
- **Predict and prevent** health issues before they become critical
- **Personalize treatment** based on individual patient data
- **Streamline healthcare delivery** for providers and patients

## 💡 Innovation Focus Areas

### 🔬 **AI-Powered Diagnostics**
- **Medical imaging analysis** (X-rays, MRIs, CT scans)
- **Symptom checker applications** with ML-driven insights
- **Drug discovery acceleration** using computational biology
- **Predictive health analytics** for early intervention

### 📱 **Digital Health Platforms**
- **Telemedicine solutions** for remote consultations
- **Patient management systems** for chronic disease care
- **Medication adherence tracking** with smart reminders
- **Health record interoperability** solutions

### 🧠 **Mental Health Technology**
- **AI therapy chatbots** for 24/7 support
- **Stress and mood monitoring** using wearable data
- **Digital therapeutics** for anxiety and depression
- **Peer support platforms** for mental health communities

### 🏠 **Remote Patient Monitoring**
- **IoT health devices** integration and data analysis
- **Elderly care monitoring** systems
- **Chronic disease management** platforms
- **Post-surgery recovery** tracking applications

### ♿ **Healthcare Accessibility**
- **Vision/hearing impairment** assistive technologies
- **Language translation** for medical consultations
- **Simplified health interfaces** for low-literacy populations
- **Mobile health solutions** for developing regions

## 🛡️ Compliance & Security First

### **HIPAA Compliance Workshop**
- Understanding **Protected Health Information (PHI)**
- **De-identification techniques** for health data
- **Secure data transmission** protocols
- **Audit logging** and compliance monitoring

### **Medical Device Regulations**
- **FDA approval pathways** for digital health tools
- **Clinical validation requirements**
- **Risk management frameworks**
- **Quality management systems**

### **Data Security Standards**
- **Encryption at rest and in transit**
- **Zero-trust architecture** for health systems
- **Penetration testing** for medical applications
- **Incident response** for healthcare breaches

## 📊 Available Data & APIs

### **Anonymized Health Datasets**
- **MIMIC Critical Care Database** - ICU patient data
- **NIH Clinical Center datasets** - research-grade health data
- **Synthetic patient records** for testing and development
- **Medical imaging datasets** (with proper anonymization)

### **Medical APIs & Tools**
- **FHIR (Fast Healthcare Interoperability Resources)** standards
- **Epic MyChart API** for patient engagement
- **Cerner PowerChart** integration tools
- **FDA Drug Label API** for medication information
- **ICD-10 and CPT coding** databases

### **AI/ML Resources**
- **Google Healthcare AI** tools and models
- **AWS HealthLake** for health data analytics
- **Microsoft Healthcare Bot** framework
- **NVIDIA Clara** for medical imaging AI

## 🏆 Prize Categories

### 🥇 **Best Patient Impact** - *$12,000*
> Solution with greatest potential to improve patient outcomes

**Evaluation Focus:**
- **Clinical evidence** supporting the solution
- **Patient safety** considerations and risk mitigation
- **Measurable health outcomes** improvement
- **Healthcare provider adoption** feasibility

### 🧠 **Mental Health Innovation** - *$8,000*
> Outstanding mental health technology solution

### 🌍 **Global Health Access** - *$6,000*
> Technology that democratizes healthcare access

### 🔬 **AI Medical Breakthrough** - *$10,000*
> Most innovative use of AI in healthcare

### 👩‍⚕️ **Healthcare Provider Tools** - *$5,000*
> Best solution for improving provider workflows

## 👨‍⚕️ Medical Expert Panel

### **Clinical Advisors**
- **Dr. Sarah Patel, MD** - Chief Medical Officer, Digital Health Platform
- **Dr. Michael Chen, MD, PhD** - Cardiologist & Health Informatics Expert
- **Dr. Lisa Rodriguez, RN, MSN** - Nursing Informatics Specialist
- **Dr. James Kim, MD** - Emergency Medicine & Telemedicine Pioneer

### **Industry Mentors**
- **Epic Systems** - EHR integration experts
- **Teladoc** - Telemedicine platform leaders
- **Fitbit/Google Health** - Consumer health technology
- **IBM Watson Health** - AI in healthcare specialists

## 🎓 Educational Workshops

### **Medical Fundamentals for Developers**
- **Healthcare workflows** and provider needs
- **Medical terminology** and clinical processes
- **Patient safety principles** in software design
- **Evidence-based medicine** and clinical trials

### **Technical Deep Dives**
- **HL7 FHIR** implementation workshop
- **Medical device cybersecurity** best practices
- **Healthcare data analytics** with real datasets
- **Clinical decision support** system design

### **Regulatory & Business**
- **FDA digital health pathways** and submission process
- **Healthcare reimbursement** models and coding
- **Clinical validation** study design
- **Healthcare sales cycles** and procurement

## 🤝 Implementation Partners

### **Healthcare Systems**
- **Mayo Clinic** - Innovation lab collaboration
- **Kaiser Permanente** - Population health insights
- **Cleveland Clinic** - Digital transformation leaders

### **Payer Organizations**
- **Anthem** - Health insurance innovation
- **Humana** - Medicare Advantage technology
- **Aetna** - Digital health partnerships

## 🎁 Beyond Prize Money

- **Clinical pilot programs** with partner healthcare systems
- **FDA consultation sessions** for regulatory pathway
- **Healthcare accelerator** program invitations
- **HIMSS conference** speaking opportunities
- **Journal publication** support for research outcomes
- **Patent filing** assistance for breakthrough innovations

## ⚖️ Ethical Guidelines

### **Patient Privacy First**
- All solutions must prioritize patient data protection
- **Informed consent** mechanisms for data usage
- **Data minimization** principles in application design

### **Health Equity Considerations**
- Solutions should address **healthcare disparities**
- **Accessibility standards** compliance (WCAG 2.1)
- **Cultural competency** in health technology design

> **"Healthcare technology should amplify human compassion, not replace it. The best health tech solutions enhance the doctor-patient relationship while making care more accessible and effective."**
>
> *- Dr. Sarah Patel, MD, Chief Medical Officer*

---

**Ready to save lives through code?** Join us in building technology that doesn't just disrupt healthcare – it heals it. 💊💻`,
    ...createTestingPeriods(2),
    techStack: [
      "React",
      "Node.js",
      "Python",
      "TensorFlow",
      "FHIR",
      "AWS",
      "MongoDB",
    ],
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
        description:
          "Solution with greatest potential to improve patient outcomes",
        judgingMode: "manual",
        votingMode: "public",
        maxVotesPerJudge: 1,
        evaluationCriteria: [
          {
            name: "Patient Impact",
            points: 50,
            description: "Potential to improve health outcomes",
          },
          {
            name: "Clinical Validation",
            points: 30,
            description: "Evidence-based approach and validation",
          },
          {
            name: "Usability",
            points: 20,
            description: "Ease of use for patients and providers",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0xffffffffffffffffffffffffffffffffffffffff",
        status: "accepted",
      },
      {
        address: "0x0000111122223333444455556666777788889999",
        status: "invited",
      },
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
          picture:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "EdTech Learning Revolution",
    visual:
      "https://a.dropoverapp.com/cloud/download/a8be990d-3572-448a-b3ae-1aab2529314a/f15f6277-43f3-4e5b-906f-ccfbbe7537e7",
    shortDescription:
      "Revolutionize education with innovative technology that makes learning accessible and engaging.",
    fullDescription: `# 📚 EdTech Learning Revolution

**Reimagining Education for the Digital Age**

The **EdTech Learning Revolution** is where educators, developers, and learning scientists unite to transform how the world learns. Build technology that makes education **personalized**, **accessible**, and **engaging** for learners from kindergarten to corporate training.

## 🎯 The Education Crisis We're Solving

Education faces unprecedented challenges:
- **Learning loss** from disrupted schooling
- **Teacher shortages** affecting 50+ countries
- **Digital divide** limiting access to quality education
- **One-size-fits-all** approaches failing diverse learners
- **Skills gap** between education and workforce needs

**Technology is the key to democratizing world-class education.**

## 💡 Innovation Opportunities

### 🧠 **Personalized Learning**
- **AI tutoring systems** that adapt to individual learning styles
- **Learning path optimization** based on student performance data
- **Skill gap identification** and targeted remediation
- **Multi-modal content delivery** (visual, auditory, kinesthetic)

### 🎮 **Gamified Education**
- **Educational game platforms** that make learning addictive
- **Progress tracking systems** with achievements and badges
- **Peer competition features** for collaborative learning
- **Virtual reality experiences** for immersive education

### 🏫 **Classroom Technology**
- **Interactive whiteboard applications** for hybrid learning
- **Real-time collaboration tools** for group projects
- **Student engagement analytics** for teachers
- **Automated grading systems** with detailed feedback

### 📊 **Learning Analytics**
- **Predictive models** for student success and at-risk identification
- **Learning outcome measurement** and assessment tools
- **Curriculum effectiveness analysis**
- **Parent/guardian engagement dashboards**

### 🌍 **Accessibility & Inclusion**
- **Multi-language learning platforms**
- **Assistive technology** for learners with disabilities
- **Offline-capable educational apps** for low-connectivity areas
- **Culturally responsive** educational content

## 🛠️ Available Resources

### **Educational Datasets**
- **Khan Academy** anonymized learning progression data
- **edX course completion** and engagement metrics
- **PISA international assessment** results and trends
- **Common Core State Standards** alignment data
- **UNESCO education statistics** by country and region

### **Learning Platform APIs**
- **Google Classroom API** for assignment and grade management
- **Canvas LMS API** for institutional learning management
- **Blackboard Learn API** for course content integration
- **Moodle Web Services** for open-source LMS connectivity
- **Microsoft Education APIs** for Office 365 integration

### **Content & Curriculum Resources**
- **OpenStax** free textbook content and APIs
- **MIT OpenCourseWare** materials and datasets
- **Wikipedia Education Program** content and editing tools
- **Creative Commons** educational resource libraries

## 🏆 Challenge Tracks

### 🥇 **Most Innovative Learning Tool** - *$8,000*
> Revolutionary approach to solving educational challenges

**Judging Criteria:**
- **Learning effectiveness** (40%) - Measurable improvement in learning outcomes
- **User engagement** (30%) - How well it motivates and retains learners
- **Accessibility** (20%) - Inclusive design for diverse populations
- **Scalability** (10%) - Potential for widespread adoption

### 👨‍🏫 **Teacher Productivity Champion** - *$5,000*
> Tools that save educators time and improve teaching quality

### 🎯 **Personalization Pioneer** - *$6,000*
> Best adaptive learning technology

### 🌟 **Student Engagement Leader** - *$4,000*
> Most engaging and motivating learning experience

### ♿ **Accessibility Excellence** - *$3,000*
> Outstanding inclusive design for learners with disabilities

## 👩‍🏫 Educational Expert Panel

### **Pedagogy Specialists**
- **Prof. Maria Martinez, PhD** - Educational Psychology, Stanford
- **Dr. James Thompson** - Learning Sciences, MIT
- **Sarah Kim, MEd** - Special Education Technology
- **Dr. Lisa Chen** - Multilingual Education Research

### **Industry Mentors**
- **Coursera** - Online learning platform experts
- **Duolingo** - Language learning gamification
- **Khan Academy** - Personalized learning pioneers
- **Pearson Education** - Educational content and assessment
- **Google for Education** - Classroom technology integration

## 📖 Learning Science Workshops

### **Foundations of Effective Learning**
- **Cognitive load theory** and interface design
- **Spaced repetition** and retention optimization
- **Motivation psychology** in educational technology
- **Assessment design** for learning vs. testing

### **Technology Integration Best Practices**
- **Universal Design for Learning (UDL)** principles
- **Learning analytics** interpretation and application
- **Privacy protection** in educational technology (FERPA compliance)
- **Evidence-based design** using education research

### **User Experience in Education**
- **Child-friendly interface design** principles
- **Accessibility standards** (WCAG) for educational content
- **Multi-device learning** experience design
- **Onboarding and user adoption** strategies

## 🎓 Target Audiences

### **K-12 Education**
- **Elementary school** (ages 5-10) learning foundations
- **Middle school** (ages 11-13) engagement and exploration
- **High school** (ages 14-18) college and career preparation

### **Higher Education**
- **University courses** and degree programs
- **Professional certification** and continuing education
- **Research collaboration** and academic networking

### **Corporate Training**
- **Employee onboarding** and skills development
- **Compliance training** and certification tracking
- **Leadership development** programs
- **Technical skills** upskilling and reskilling

### **Lifelong Learning**
- **Adult learners** returning to education
- **Hobby and interest-based** learning communities
- **Senior citizen** technology and education programs

## 🌐 Global Impact Opportunities

### **Developing Country Education**
- **Offline-first applications** for limited internet connectivity
- **Low-cost device optimization** for basic smartphones/tablets
- **Local language support** and cultural adaptation
- **Teacher training platforms** for under-resourced schools

### **Crisis Response Education**
- **Refugee education** continuity platforms
- **Disaster recovery** learning systems
- **Pandemic-resilient** education delivery
- **Conflict zone** safe learning environments

## 💻 Technical Specifications

### **Recommended Tech Stack**
- **Frontend**: React, Vue.js, Angular for web applications
- **Mobile**: React Native, Flutter for cross-platform apps
- **Backend**: Node.js, Python (Django/Flask), Ruby on Rails
- **Database**: PostgreSQL, MongoDB for educational data
- **Analytics**: Google Analytics, Mixpanel for learning insights
- **AI/ML**: TensorFlow, PyTorch for personalization features

### **Platform Integration**
- **Single Sign-On (SSO)** with Google, Microsoft, Apple
- **Learning Tools Interoperability (LTI)** standard compliance
- **SCORM/xAPI** for content packaging and tracking
- **QTI** for assessment interoperability

## 🎁 Prize Package Includes

### **Development Resources**
- **AWS Education credits** ($2,000 value)
- **Google Cloud education grants**
- **Microsoft Azure for Students** premium access
- **GitHub Education Pack** with premium tools

### **Business Development**
- **Education accelerator** program interviews
- **School district pilot** program opportunities
- **Education conference** speaking slots (ISTE, EdTechHub)
- **Venture capital** introductions specializing in EdTech

### **Research Collaboration**
- **Academic paper** co-authoring opportunities
- **Research study** participation for solution validation
- **Institutional review board** guidance for educational research

## 📚 Success Stories & Inspiration

> **"The tools that will transform education aren't just about technology – they're about understanding how humans learn and using that knowledge to create more effective and joyful learning experiences."**
>
> *- Prof. Maria Martinez, PhD, Educational Psychology*

### **Past Winner Spotlights**
- **MathBot** (2023) - AI tutor now used in 500+ schools
- **AccessLearn** (2022) - Accessibility platform serving 10,000+ students with disabilities
- **TeacherFlow** (2021) - Lesson planning tool saving teachers 5+ hours per week

---

**Ready to revolutionize learning?** Join us in building the future of education – where every learner can reach their full potential! 🎓✨`,
    ...createTestingPeriods(3),
    techStack: [
      "React",
      "Vue.js",
      "Node.js",
      "Python",
      "Firebase",
      "WebRTC",
      "Chart.js",
    ],
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
          {
            name: "Learning Effectiveness",
            points: 40,
            description: "Potential to improve learning outcomes",
          },
          {
            name: "User Engagement",
            points: 30,
            description: "How engaging and motivating the tool is",
          },
          {
            name: "Accessibility",
            points: 30,
            description: "Inclusive design for diverse learners",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0x1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b",
        status: "accepted",
      },
      {
        address: "0x9a8b7c6d5e4f9a8b7c6d5e4f9a8b7c6d5e4f9a8b",
        status: "invited",
      },
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
          picture:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },
  {
    name: "Fintech Disruption Challenge",
    visual:
      "https://a.dropoverapp.com/cloud/download/5798ca73-c2b8-4d34-9eeb-c45d3ac63284/1639b412-31d0-421e-b01f-2eeab22512b7",
    shortDescription:
      "Build the next generation of financial services that democratize access to financial tools.",
    fullDescription: `# 💰 Fintech Disruption Challenge

**Democratizing Financial Services Through Innovation**

The **Fintech Disruption Challenge** brings together developers, financial experts, and entrepreneurs to reimagine how financial services work in the digital age. Build solutions that make financial tools **accessible**, **transparent**, and **beneficial** for everyone, not just the privileged few.

## 🎯 The Financial Revolution

Traditional financial services are failing millions of people:
- **2 billion adults** remain unbanked worldwide
- **High fees and barriers** exclude low-income populations
- **Complex processes** make financial management difficult
- **Lack of transparency** in pricing and terms
- **Limited access** to credit and investment opportunities

**It's time to rebuild finance from the ground up.**

## 💡 Innovation Areas

### 💳 **Next-Generation Payments**
- **Instant cross-border transfers** with minimal fees
- **Cryptocurrency payment gateways** for merchants
- **Offline payment solutions** for developing regions
- **Micro-payment systems** for content creators
- **Biometric authentication** for payment security

### 🏦 **Neobanking & Digital Banking**
- **Mobile-first banking** experiences
- **AI-powered financial advice** and budgeting
- **Customizable financial products** based on user needs
- **Community banking** platforms for local economies
- **Sustainable banking** with ESG integration

### 📊 **Investment & Wealth Management**
- **Robo-advisors** for automated investing
- **Fractional investing** in real estate, art, and commodities
- **Social trading platforms** with copy-trading features
- **ESG investment screening** and impact measurement
- **Gamified investing** education and practice platforms

### 🏠 **Alternative Lending**
- **AI-driven credit scoring** using alternative data
- **Peer-to-peer lending** platforms
- **Invoice financing** for small businesses
- **Rent-to-own** and flexible payment solutions
- **Microfinance** platforms for developing economies

### 🛡️ **Insurance Innovation**
- **Parametric insurance** using IoT and weather data
- **On-demand insurance** for gig economy workers
- **Blockchain-based claims** processing
- **AI fraud detection** and prevention
- **Personalized premiums** based on behavior data

## 🛠️ Available APIs & Resources

### **Payment Processing**
- **Stripe API** - Global payment infrastructure
- **PayPal API** - Digital wallet and payments
- **Square API** - Point-of-sale and payments
- **Dwolla API** - ACH and bank transfers
- **Circle API** - Cryptocurrency payments

### **Banking Infrastructure**
- **Plaid API** - Bank account connectivity
- **Yodlee API** - Financial data aggregation
- **Synapse API** - Banking-as-a-Service
- **Solarisbank API** - Digital banking platform
- **Marqeta API** - Modern card issuing

### **Investment Data**
- **Alpha Vantage** - Stock market data
- **Quandl** - Financial and economic data
- **IEX Cloud** - Real-time and historical market data
- **Polygon.io** - Real-time market data APIs
- **Yahoo Finance API** - Market data and news

### **Credit & Risk Assessment**
- **Experian API** - Credit reporting and verification
- **TransUnion API** - Identity verification and fraud prevention
- **SentiLink API** - Synthetic identity detection
- **Alloy API** - Identity verification and fraud prevention

## 🏆 Prize Categories

### 🥇 **Most Disruptive Solution** - *$18,000*
> Solution that fundamentally challenges traditional financial services

**Evaluation Criteria:**
- **Market disruption potential** (35%) - Ability to challenge incumbents
- **User experience excellence** (25%) - Intuitive and trustworthy interface
- **Security & compliance** (25%) - Regulatory adherence and data protection
- **Business model viability** (15%) - Sustainable revenue and growth model

### 🌍 **Financial Inclusion Champion** - *$7,000*
> Outstanding solution for underserved populations

### 🤖 **AI Innovation Award** - *$5,000*
> Best use of artificial intelligence in financial services

### 🔐 **Security Excellence** - *$4,000*
> Outstanding approach to financial security and privacy

### 🚀 **Startup Ready** - *$6,000*
> Most investment-ready business model and execution

## 🎓 Educational Workshops

### **Fintech Fundamentals**
- **Payment systems architecture** and infrastructure
- **Regulatory landscape** (PCI DSS, KYC, AML, GDPR)
- **Financial product design** and user experience
- **Risk management** in financial services

### **Technical Deep Dives**
- **Blockchain integration** in financial applications
- **Machine learning** for fraud detection and credit scoring
- **API security** and financial data protection
- **Open banking** standards and implementation

### **Business & Legal**
- **Fintech business models** and monetization strategies
- **Compliance requirements** by jurisdiction
- **Partnership strategies** with traditional financial institutions
- **Fundraising** for fintech startups

## 🏢 Industry Mentors & Partners

### **Fintech Leaders**
- **Stripe** - Payment processing experts
- **Robinhood** - Commission-free investing pioneers
- **Chime** - Neobanking user experience leaders
- **Square** - Small business financial services
- **Plaid** - Financial infrastructure specialists

### **Traditional Finance**
- **JPMorgan Chase** - Digital transformation in banking
- **Goldman Sachs** - Investment banking and consumer finance
- **Visa** - Global payment network innovation
- **Mastercard** - Payment technology and security

### **Regulatory Experts**
- **CFPB advisors** - Consumer protection compliance
- **SEC specialists** - Securities regulation guidance
- **State banking** department representatives
- **International compliance** experts

## 💼 Challenge Tracks

### **Consumer Fintech**
- **Personal finance management** and budgeting tools
- **Digital wallets** and payment applications
- **Investment apps** and robo-advisors
- **Credit building** and financial education platforms

### **Business Fintech**
- **Small business lending** and cash flow management
- **Accounts payable/receivable** automation
- **Expense management** and corporate cards
- **Business banking** and treasury management

### **Emerging Markets**
- **Mobile money** solutions for developing countries
- **Agricultural finance** and supply chain financing
- **Remittance platforms** for migrant workers
- **Microinsurance** products for low-income populations

### **Institutional Fintech**
- **RegTech** compliance and reporting automation
- **Trade finance** digitization and blockchain
- **Institutional trading** platforms and algorithms
- **Risk management** and portfolio analytics

## 🌟 Success Metrics & Impact

### **Financial Inclusion Metrics**
- Number of previously unbanked individuals served
- Reduction in financial service costs for users
- Improvement in financial literacy and education
- Geographic reach in underserved markets

### **Innovation Metrics**
- Technical innovation and differentiation
- User adoption and engagement rates
- Security and compliance implementation
- Scalability and performance benchmarks

## 🎁 Prize Package Benefits

### **Development Resources**
- **AWS credits** for financial services infrastructure
- **Stripe Atlas** for business incorporation
- **Legal consultation** for compliance and regulations
- **Accounting services** for financial management

### **Business Development**
- **VC introductions** with fintech-focused investors
- **Banking partnership** facilitation
- **Regulatory sandbox** program applications
- **Accelerator program** fast-track applications

### **Market Access**
- **Bank partnership** pilot program opportunities
- **Fintech conference** speaking opportunities
- **Industry publication** feature articles
- **Customer acquisition** channel partnerships

## ⚖️ Compliance & Ethics

### **Regulatory Compliance**
- All solutions must adhere to applicable financial regulations
- **Data privacy** protection (GDPR, CCPA compliance)
- **Anti-money laundering** (AML) considerations
- **Know Your Customer** (KYC) requirements

### **Ethical Finance**
- **Fair lending** practices and bias prevention
- **Transparent pricing** and fee structures
- **Consumer protection** and financial education
- **Responsible innovation** that serves users' best interests

> **"The future of finance is not about replacing banks – it's about making financial services work better for everyone. Build solutions that are more transparent, more accessible, and more aligned with people's real needs."**
>
> *- David Chen, Fintech Regulatory Expert*

---

**Ready to disrupt finance for good?** Join us in building the financial tools that will empower the next billion people to achieve financial freedom! 💳✨`,
    ...createTestingPeriods(4),
    techStack: [
      "React",
      "Node.js",
      "Python",
      "Stripe API",
      "Plaid",
      "AWS",
      "PostgreSQL",
    ],
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
          {
            name: "Market Disruption",
            points: 35,
            description: "Potential to disrupt existing financial services",
          },
          {
            name: "User Experience",
            points: 25,
            description: "Intuitive and trustworthy user interface",
          },
          {
            name: "Security & Compliance",
            points: 25,
            description: "Financial regulations and security measures",
          },
          {
            name: "Business Model",
            points: 15,
            description: "Sustainable and scalable business model",
          },
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
          {
            name: "Accessibility",
            points: 50,
            description: "Reaches underserved populations effectively",
          },
          {
            name: "Impact Potential",
            points: 30,
            description: "Potential for positive financial inclusion impact",
          },
          {
            name: "Sustainability",
            points: 20,
            description: "Long-term viability and sustainability",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0x2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c",
        status: "accepted",
      },
      {
        address: "0x8c7b6a5d4e3f2c1b8c7b6a5d4e3f2c1b8c7b6a5d",
        status: "invited",
      },
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
          picture:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
      },
    ],
  },

  //   {
  //     name: "Smart City Solutions Hub",
  //     shortDescription:
  //       "Design technology solutions that make cities more sustainable, efficient, and livable.",
  //     fullDescription: `# 🏙️ Smart City Solutions Hub

  // **Building the Cities of Tomorrow, Today**

  // The **Smart City Solutions Hub** is where urban planners, technologists, and civic innovators collaborate to solve the complex challenges facing modern cities. With over **68% of the world's population** expected to live in cities by 2050, we need smart, sustainable, and citizen-centric urban solutions.

  // ## 🎯 Urban Challenges We're Addressing

  // Cities worldwide face unprecedented challenges:
  // - **Traffic congestion** costing billions in lost productivity
  // - **Air pollution** affecting public health and quality of life
  // - **Energy inefficiency** contributing to climate change
  // - **Housing affordability** displacing communities
  // - **Digital divide** creating unequal access to city services
  // - **Aging infrastructure** struggling with growing populations

  // **Smart technology can help cities become more livable, sustainable, and equitable.**

  // ## 💡 Innovation Focus Areas

  // ### 🚗 **Smart Transportation**
  // - **Traffic flow optimization** using real-time data and AI
  // - **Public transit planning** with predictive analytics
  // - **Autonomous vehicle integration** and infrastructure
  // - **Bike-sharing and micro-mobility** platform optimization
  // - **Parking management** and dynamic pricing systems
  // - **Multi-modal journey planning** for seamless transportation

  // ### 🌬️ **Environmental Monitoring**
  // - **Air quality tracking** with IoT sensor networks
  // - **Noise pollution monitoring** and mitigation
  // - **Water quality assessment** and contamination detection
  // - **Urban heat island** mapping and cooling strategies
  // - **Green space optimization** for maximum environmental benefit
  // - **Carbon footprint tracking** for neighborhoods and districts

  // ### ⚡ **Smart Energy & Utilities**
  // - **Smart grid management** with renewable integration
  // - **Energy consumption optimization** for public buildings
  // - **Street lighting automation** based on foot traffic and weather
  // - **District heating/cooling** efficiency improvements
  // - **EV charging network** optimization and load balancing
  // - **Community solar** and energy sharing platforms

  // ### 🏠 **Urban Planning & Housing**
  // - **Zoning analysis** and development impact assessment
  // - **Affordable housing** location optimization
  // - **Gentrification monitoring** and community protection
  // - **Infrastructure planning** with predictive modeling
  // - **Public space utilization** analysis and optimization
  // - **Construction permit** streamlining and automation

  // ### 🚨 **Public Safety & Emergency Response**
  // - **Crime prediction** and prevention systems
  // - **Emergency response optimization** and resource allocation
  // - **Disaster preparedness** and early warning systems
  // - **Public health monitoring** and outbreak prevention
  // - **Community policing** platforms and engagement tools
  // - **Emergency evacuation** route planning and simulation

  // ### 👥 **Citizen Engagement & Services**
  // - **Digital government services** and one-stop portals
  // - **Community feedback** platforms and issue reporting
  // - **Participatory budgeting** and civic engagement tools
  // - **Accessibility improvements** for disabled citizens
  // - **Multi-language support** for diverse populations
  // - **Digital literacy** programs and resource access

  // ## 📊 Available Data & Resources

  // ### **Real City Datasets**
  // - **Seattle Open Data** - Traffic, permits, 911 calls, utilities
  // - **NYC Open Data** - 311 requests, transportation, housing
  // - **London Data Store** - Population, environment, economy
  // - **San Francisco DataSF** - Budget, infrastructure, public health
  // - **Barcelona Open Data** - Smart city sensors and services

  // ### **IoT & Sensor Networks**
  // - **LoRaWAN** development kits for IoT prototyping
  // - **Air quality sensors** (PM2.5, NO2, CO2) with APIs
  // - **Traffic counting** cameras and pedestrian sensors
  // - **Smart parking** sensor simulation environments
  // - **Weather stations** and environmental monitoring tools

  // ### **Mapping & GIS Tools**
  // - **Mapbox APIs** for custom mapping applications
  // - **Google Maps Platform** with urban planning features
  // - **OpenStreetMap** data and routing services
  // - **ArcGIS** development platform and spatial analysis
  // - **GTFS data** for public transportation integration

  // ### **Cloud Infrastructure**
  // - **AWS IoT Core** for device management and data processing
  // - **Google Cloud IoT** platform and analytics tools
  // - **Microsoft Azure** smart city solution templates
  // - **IBM Watson** IoT and AI services for cities

  // ## 🏆 Challenge Categories

  // ### 🥇 **Best Urban Innovation** - *$15,000*
  // > Most innovative solution addressing critical urban challenges

  // **Evaluation Criteria:**
  // - **Urban impact potential** (40%) - Ability to improve city operations or citizen life
  // - **Scalability across cities** (30%) - Adaptability to different urban contexts
  // - **Data integration excellence** (20%) - Effective use of urban data sources
  // - **Citizen engagement** (10%) - Level of community involvement and benefit

  // ### 🌱 **Sustainability Champion** - *$8,000*
  // > Outstanding environmental and sustainability solution

  // ### 🚦 **Transportation Innovation** - *$6,000*
  // > Best solution for urban mobility and transportation

  // ### 👤 **Citizen Experience** - *$5,000*
  // > Most user-friendly and accessible citizen service

  // ### 🔬 **Data Analytics Excellence** - *$4,000*
  // > Best use of urban data for insights and prediction

  // ## 🏢 City Government Partners

  // ### **Participating Cities**
  // - **Seattle, WA** - Smart city innovation lab
  // - **Austin, TX** - Digital inclusion and equity focus
  // - **Barcelona, Spain** - European smart city leader
  // - **Singapore** - Urban sensing and IoT integration
  // - **Toronto, Canada** - Waterfront smart city development

  // ### **Urban Planning Organizations**
  // - **American Planning Association** - Professional planning resources
  // - **Urban Land Institute** - Sustainable development expertise
  // - **C40 Cities** - Climate action and sustainability
  // - **Smart Cities Council** - Industry best practices and standards

  // ## 🎓 Learning Workshops

  // ### **Smart City Fundamentals**
  // - **IoT architecture** for urban applications
  // - **Data privacy** and citizen rights in smart cities
  // - **Interoperability standards** for city systems
  // - **Equity considerations** in smart city deployment

  // ### **Technical Implementation**
  // - **Sensor network design** and deployment strategies
  // - **Edge computing** for real-time urban data processing
  // - **City API development** and integration patterns
  // - **Cybersecurity** for critical urban infrastructure

  // ### **Urban Planning & Policy**
  // - **Participatory design** methods for inclusive solutions
  // - **Public-private partnership** models for smart cities
  // - **Regulatory frameworks** for urban technology deployment
  // - **Community engagement** strategies for technology adoption

  // ## 🌟 Implementation Pathways

  // ### **Pilot Program Opportunities**
  // - **3-month pilot programs** with partner cities
  // - **Municipal budget allocation** for promising solutions
  // - **City department** integration and testing environments
  // - **Citizen co-design** sessions for solution refinement

  // ### **Scaling & Commercialization**
  // - **Smart city accelerator** program partnerships
  // - **Government procurement** process guidance
  // - **International expansion** support for global cities
  // - **Standards development** participation opportunities

  // ## 💻 Technical Requirements

  // ### **Recommended Tech Stack**
  // - **Frontend**: React, Vue.js, Angular for citizen-facing applications
  // - **Mobile**: React Native, Flutter for mobile city services
  // - **Backend**: Node.js, Python, Java for city service APIs
  // - **Database**: PostgreSQL, MongoDB for urban data storage
  // - **Analytics**: Apache Spark, Elasticsearch for large-scale data analysis
  // - **IoT**: MQTT, LoRaWAN, NB-IoT for sensor connectivity
  // - **Mapping**: Leaflet, Mapbox GL JS for geographic visualizations

  // ### **Data Standards**
  // - **GTFS** for public transportation data
  // - **CityGML** for 3D city modeling
  // - **FIWARE** for smart city data management
  // - **Open311** for citizen service requests
  // - **CKAN** for open data publishing

  // ## 🎁 Prize Benefits

  // ### **Development Support**
  // - **Cloud infrastructure credits** ($5,000 value)
  // - **IoT hardware** and sensor development kits
  // - **GIS software licenses** and mapping tools
  // - **Urban planning** consultation and guidance

  // ### **Implementation Partners**
  // - **City government** meetings and pilot opportunities
  // - **Urban planning** firm partnerships
  // - **Smart city** vendor ecosystem introductions
  // - **International city** network connections

  // ### **Recognition & Exposure**
  // - **Smart Cities Expo** presentation opportunities
  // - **Urban planning** conference speaking slots
  // - **Government technology** publication features
  // - **Smart city** industry report inclusion

  // ## 🤝 Community Impact

  // ### **Equity & Inclusion Focus**
  // - Solutions must address **digital divide** and accessibility
  // - **Community input** required in solution design
  // - **Affordable access** to smart city services
  // - **Privacy protection** and algorithmic fairness

  // ### **Environmental Justice**
  // - **Air quality improvement** in disadvantaged neighborhoods
  // - **Green infrastructure** access and distribution
  // - **Climate resilience** for vulnerable communities
  // - **Environmental data** transparency and access

  // > **"Smart cities aren't about technology – they're about people. The best urban innovations are those that put citizens at the center and use technology to make cities more equitable, sustainable, and livable for everyone."**
  // >
  // > *- Dr. Lisa Urban, PhD, Smart Cities Researcher*

  // ---

  // **Ready to build smarter cities?** Join us in creating urban solutions that make cities work better for everyone! 🌆🔧`,
  //     ...createTestingPeriods(5),
  //     techStack: [
  //       "React",
  //       "Python",
  //       "IoT",
  //       "PostgreSQL",
  //       "Google Maps API",
  //       "TensorFlow",
  //       "Grafana",
  //     ],
  //     experienceLevel: "all" as const,
  //     location: "Seattle, WA",
  //     socialLinks: {
  //       website: "https://smartcity.solutions",
  //       discord: "https://discord.gg/smartcitydev",
  //       twitter: "https://twitter.com/smartcityhack",
  //       telegram: "",
  //       github: "https://github.com/smart-city-hub",
  //     },
  //     prizeCohorts: [
  //       {
  //         name: "Best Urban Innovation",
  //         numberOfWinners: 1,
  //         prizeAmount: "15000",
  //         description: "Most innovative solution for urban challenges",
  //         judgingMode: "manual",
  //         votingMode: "public",
  //         maxVotesPerJudge: 1,
  //         evaluationCriteria: [
  //           {
  //             name: "Urban Impact",
  //             points: 40,
  //             description: "Potential to improve city operations or citizen life",
  //           },
  //           {
  //             name: "Scalability",
  //             points: 30,
  //             description: "Ability to scale across different cities",
  //           },
  //           {
  //             name: "Data Integration",
  //             points: 20,
  //             description: "Effective use of urban data sources",
  //           },
  //           {
  //             name: "Citizen Engagement",
  //             points: 10,
  //             description: "Involvement and benefit to citizens",
  //           },
  //         ],
  //       },
  //     ],
  //     judges: [
  //       {
  //         address: "0x3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d",
  //         status: "invited",
  //       },
  //       {
  //         address: "0x7b6a5d4e3f2c1b7b6a5d4e3f2c1b7b6a5d4e3f2c",
  //         status: "accepted",
  //       },
  //     ],
  //     schedule: [
  //       {
  //         name: "Urban Data Analytics Workshop",
  //         description: "Working with city datasets and IoT sensor data",
  //         startDateTime: createDate(35, 9),
  //         endDateTime: createDate(35, 11),
  //         hasSpeaker: true,
  //         speaker: {
  //           name: "Dr. Lisa Urban",
  //           position: "Smart Cities Researcher",
  //           xName: "Lisa Urban PhD",
  //           xHandle: "@drlisaurban",
  //           picture:
  //             "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face",
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     name: "Cybersecurity Defense Challenge",
  //     shortDescription:
  //       "Build next-generation cybersecurity tools to protect against evolving digital threats.",
  //     fullDescription: `# 🛡️ Cybersecurity Defense Challenge

  // **Defending the Digital World, One Line of Code at a Time**

  // The **Cybersecurity Defense Challenge** unites ethical hackers, security researchers, and developers to build the next generation of defensive security tools. In an era where **cyberattacks occur every 39 seconds** and data breaches cost companies an average of **$4.45 million**, we need innovative security solutions that can keep pace with evolving threats.

  // ## 🎯 The Cybersecurity Crisis

  // The digital threat landscape is more dangerous than ever:
  // - **Ransomware attacks** increased by 41% in 2023
  // - **Supply chain attacks** targeting software dependencies
  // - **AI-powered attacks** using deepfakes and automated social engineering
  // - **IoT vulnerabilities** in smart devices and industrial systems
  // - **Cloud misconfigurations** exposing sensitive data
  // - **Zero-day exploits** targeting previously unknown vulnerabilities

  // **We need defensive tools that are smarter, faster, and more adaptive than the attackers.**

  // ## 💡 Innovation Opportunity Areas

  // ### 🤖 **AI-Powered Threat Detection**
  // - **Behavioral analytics** for anomaly detection
  // - **Malware classification** using machine learning
  // - **Phishing detection** with natural language processing
  // - **Network intrusion detection** with deep learning
  // - **Fraud prevention** using pattern recognition
  // - **Automated threat hunting** and incident response

  // ### 🏰 **Zero-Trust Architecture**
  // - **Identity verification** and continuous authentication
  // - **Micro-segmentation** for network isolation
  // - **Privileged access management** systems
  // - **Device trust assessment** and compliance monitoring
  // - **Application security** with runtime protection
  // - **Data loss prevention** with encryption and monitoring

  // ### 🔒 **Privacy-Preserving Technologies**
  // - **Homomorphic encryption** for secure computation
  // - **Differential privacy** for data analytics
  // - **Secure multi-party computation** protocols
  // - **Anonymous authentication** systems
  // - **Privacy-friendly** biometric authentication
  // - **Blockchain-based** identity management

  // ### 🛠️ **Secure Development Tools**
  // - **Static code analysis** for vulnerability detection
  // - **Dynamic application security testing** automation
  // - **Dependency scanning** for supply chain security
  // - **Security-focused IDE plugins** and linting tools
  // - **Automated penetration testing** frameworks
  // - **Secure coding** education and training platforms

  // ### 🚨 **Incident Response & Recovery**
  // - **Automated incident response** orchestration
  // - **Digital forensics** and evidence collection tools
  // - **Threat intelligence** aggregation and analysis
  // - **Disaster recovery** and business continuity planning
  // - **Communication** and coordination during security incidents
  // - **Post-incident analysis** and improvement recommendations

  // ## 🛠️ Available Resources & Datasets

  // ### **Security Datasets**
  // - **CICIDS2017** - Network intrusion detection dataset
  // - **Malware samples** from VX Underground (safely sandboxed)
  // - **Phishing email** datasets for ML training
  // - **Network traffic** captures for analysis
  // - **Vulnerability databases** (CVE, NVD, CWE)

  // ### **Testing Environments**
  // - **Kali Linux** virtual machines with security tools
  // - **Metasploitable** vulnerable systems for testing
  // - **DVWA** (Damn Vulnerable Web Application) instances
  // - **Docker containers** with vulnerable applications
  // - **Cloud sandboxes** for malware analysis

  // ### **Security APIs & Tools**
  // - **VirusTotal API** for malware detection
  // - **Shodan API** for internet-connected device scanning
  // - **Have I Been Pwned API** for breach detection
  // - **URLVoid API** for malicious URL detection
  // - **AlienVault OTX** for threat intelligence

  // ### **Development Infrastructure**
  // - **SIEM platforms** (Splunk, ELK Stack) for log analysis
  // - **Vulnerability scanners** (OpenVAS, Nessus) APIs
  // - **Network monitoring** tools (Wireshark, tcpdump)
  // - **Cryptographic libraries** and implementations
  // - **Blockchain platforms** for security applications

  // ## 🏆 Prize Categories

  // ### 🥇 **Best Security Innovation** - *$22,000*
  // > Most innovative and effective cybersecurity solution

  // **Evaluation Criteria:**
  // - **Security effectiveness** (50%) - How well it addresses security threats
  // - **Innovation and novelty** (25%) - Unique approach to cybersecurity challenges
  // - **Practical deployment** (15%) - Real-world implementation feasibility
  // - **Ethical considerations** (10%) - Responsible and ethical security practices

  // ### 🔐 **Best Privacy Tool** - *$8,000*
  // > Outstanding privacy-preserving technology

  // ### 🤖 **AI Security Excellence** - *$6,000*
  // > Best use of artificial intelligence in cybersecurity

  // ### 🛡️ **Enterprise Security Solution** - *$5,000*
  // > Best security tool for organizational deployment

  // ### 📱 **Consumer Security Champion** - *$4,000*
  // > Most user-friendly security tool for individuals

  // ## 👨‍💻 Security Expert Panel

  // ### **Industry Leaders**
  // - **Marcus Security** - Senior Security Researcher, Vulnerability Discovery
  // - **Dr. Sarah Chen** - Cryptography Expert, Privacy Technologies
  // - **Alex Rodriguez** - CISO, Enterprise Security Architecture
  // - **Maya Patel** - Incident Response Specialist, Digital Forensics

  // ### **Academic Researchers**
  // - **Prof. John Smith** - Cybersecurity Research, AI in Security
  // - **Dr. Lisa Johnson** - Privacy Engineering, Differential Privacy
  // - **Prof. David Kim** - Network Security, Intrusion Detection
  // - **Dr. Emma Thompson** - Applied Cryptography, Secure Protocols

  // ### **Ethical Hacking Community**
  // - **Bug bounty hunters** from HackerOne and Bugcrowd
  // - **Red team** specialists from leading cybersecurity firms
  // - **Security conference** speakers (DEF CON, Black Hat, BSides)
  // - **Open source security** project maintainers

  // ## 🎓 Educational Workshops

  // ### **Ethical Hacking Principles**
  // - **Responsible disclosure** practices and coordinated vulnerability disclosure
  // - **Legal considerations** in security research and testing
  // - **Bug bounty programs** and vulnerability reporting
  // - **Penetration testing** methodologies and frameworks

  // ### **Advanced Security Techniques**
  // - **Reverse engineering** and malware analysis
  // - **Cryptographic implementation** best practices
  // - **Network protocol analysis** and security assessment
  // - **Binary exploitation** and defense mechanisms

  // ### **Enterprise Security**
  // - **Risk assessment** and management frameworks
  // - **Compliance requirements** (SOC 2, ISO 27001, GDPR)
  // - **Security architecture** design and implementation
  // - **Incident response** planning and execution

  // ### **Emerging Threat Landscape**
  // - **AI and ML** attacks and defenses
  // - **IoT security** challenges and mitigation
  // - **Cloud security** architecture and configuration
  // - **Supply chain** security and dependency management

  // ## 🔬 Challenge Tracks

  // ### **Web Application Security**
  // - **OWASP Top 10** vulnerability mitigation tools
  // - **API security** testing and protection
  // - **Client-side security** and browser protection
  // - **Authentication and authorization** improvements

  // ### **Network Security**
  // - **Intrusion detection and prevention** systems
  // - **Network segmentation** and isolation tools
  // - **DDoS protection** and mitigation strategies
  // - **Wireless security** and protocol protection

  // ### **Endpoint Security**
  // - **Anti-malware** and behavioral detection
  // - **Host-based intrusion detection**
  // - **Device management** and compliance monitoring
  // - **Mobile security** and app protection

  // ### **Cloud Security**
  // - **Container security** and orchestration protection
  // - **Serverless security** monitoring and protection
  // - **Cloud configuration** assessment and hardening
  // - **Multi-cloud security** management and visibility

  // ## 🏢 Industry Partnerships

  // ### **Cybersecurity Companies**
  // - **CrowdStrike** - Endpoint protection and threat intelligence
  // - **Palo Alto Networks** - Network security and cloud protection
  // - **Okta** - Identity and access management
  // - **Rapid7** - Vulnerability management and incident response

  // ### **Technology Giants**
  // - **Microsoft** - Cloud security and threat protection
  // - **Google** - Project Zero vulnerability research
  // - **Amazon** - AWS security services and tools
  // - **Cloudflare** - DDoS protection and web security

  // ### **Government & Defense**
  // - **CISA** (Cybersecurity & Infrastructure Security Agency)
  // - **NSA** Cybersecurity Directorate
  // - **Department of Defense** Cyber Command
  // - **FBI** Cyber Division

  // ## 🎁 Prize Package Benefits

  // ### **Security Tools & Software**
  // - **Professional security tool licenses** (Burp Suite Pro, Nessus Professional)
  // - **Cloud security credits** for AWS, Azure, Google Cloud
  // - **Hardware security modules** and testing equipment
  // - **Cryptographic development** libraries and tools

  // ### **Education & Certification**
  // - **Security certification vouchers** (CISSP, CEH, OSCP)
  // - **Security conference** tickets and training courses
  // - **Online security** training platform access
  // - **Mentorship programs** with security professionals

  // ### **Career Development**
  // - **Security firm** job placement assistance
  // - **Bug bounty program** participation opportunities
  // - **Security research** collaboration and publishing
  // - **Speaking opportunities** at security conferences

  // ## ⚖️ Ethical Guidelines & Rules

  // ### **Responsible Security Research**
  // - All tools must be **defensive in nature** - no offensive capabilities
  // - **Responsible disclosure** required for any vulnerabilities discovered
  // - **No unauthorized testing** on systems without explicit permission
  // - **Privacy protection** must be built into all solutions

  // ### **Legal Compliance**
  // - Solutions must comply with **applicable laws and regulations**
  // - **Export control** considerations for cryptographic implementations
  // - **Data protection** and privacy law compliance (GDPR, CCPA)
  // - **Ethical use** policies and user agreements

  // ### **Community Standards**
  // - **Open source preferred** for maximum security benefit
  // - **Documentation and education** components required
  // - **Bias and fairness** considerations in AI security tools
  // - **Accessibility** for users with different technical skill levels

  // ## 🌟 Real-World Impact

  // ### **Success Metrics**
  // - **Vulnerability detection** rate and accuracy improvements
  // - **False positive reduction** in security monitoring
  // - **Response time** improvements for security incidents
  // - **Cost savings** from automated security processes

  // ### **Deployment Opportunities**
  // - **Enterprise pilot programs** with partner organizations
  // - **Open source** project integration and contribution
  // - **Security vendor** partnership and acquisition possibilities
  // - **Government agency** evaluation and procurement

  // > **"The best cybersecurity solutions are those that make security accessible and usable for everyone. We're not just building tools to catch the bad guys – we're building tools that help good people stay safe in an increasingly dangerous digital world."**
  // >
  // > *- Marcus Security, Senior Security Researcher*

  // ---

  // **Ready to defend the digital frontier?** Join us in building the security tools that will protect individuals, businesses, and nations from cyber threats! 🔐💻`,
  //     ...createTestingPeriods(6),
  //     techStack: [
  //       "Python",
  //       "Go",
  //       "Rust",
  //       "Docker",
  //       "Kubernetes",
  //       "Machine Learning",
  //       "Cryptography",
  //     ],
  //     experienceLevel: "advanced" as const,
  //     location: "Washington, DC",
  //     socialLinks: {
  //       website: "https://cybersec.defense",
  //       discord: "https://discord.gg/cybersecdev",
  //       twitter: "https://twitter.com/cybersechack",
  //       telegram: "",
  //       github: "https://github.com/cybersec-defense",
  //     },
  //     prizeCohorts: [
  //       {
  //         name: "Best Security Innovation",
  //         numberOfWinners: 1,
  //         prizeAmount: "22000",
  //         description: "Most innovative cybersecurity solution",
  //         judgingMode: "manual",
  //         votingMode: "public",
  //         maxVotesPerJudge: 1,
  //         evaluationCriteria: [
  //           {
  //             name: "Security Effectiveness",
  //             points: 50,
  //             description: "How well the solution addresses security threats",
  //           },
  //           {
  //             name: "Innovation",
  //             points: 25,
  //             description: "Novel approach to cybersecurity challenges",
  //           },
  //           {
  //             name: "Practical Deployment",
  //             points: 15,
  //             description: "Real-world implementation feasibility",
  //           },
  //           {
  //             name: "Ethical Considerations",
  //             points: 10,
  //             description: "Responsible and ethical security practices",
  //           },
  //         ],
  //       },
  //       {
  //         name: "Best Privacy Tool",
  //         numberOfWinners: 1,
  //         prizeAmount: "8000",
  //         description: "Outstanding privacy-preserving technology",
  //         judgingMode: "manual",
  //         votingMode: "public",
  //         maxVotesPerJudge: 1,
  //         evaluationCriteria: [
  //           {
  //             name: "Privacy Protection",
  //             points: 60,
  //             description: "Effectiveness at preserving user privacy",
  //           },
  //           {
  //             name: "Usability",
  //             points: 25,
  //             description: "Easy to use without compromising security",
  //           },
  //           {
  //             name: "Technical Merit",
  //             points: 15,
  //             description: "Sound cryptographic or technical implementation",
  //           },
  //         ],
  //       },
  //     ],
  //     judges: [
  //       {
  //         address: "0x4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e",
  //         status: "accepted",
  //       },
  //       {
  //         address: "0x6a5d4e3f2c1b6a5d4e3f2c1b6a5d4e3f2c1b6a5d",
  //         status: "invited",
  //       },
  //     ],
  //     schedule: [
  //       {
  //         name: "Ethical Hacking Principles",
  //         description: "Responsible security research and disclosure practices",
  //         startDateTime: createDate(40, 9),
  //         endDateTime: createDate(40, 11),
  //         hasSpeaker: true,
  //         speaker: {
  //           name: "Marcus Security",
  //           position: "Senior Security Researcher",
  //           xName: "Marcus Security",
  //           xHandle: "@marcussecurity",
  //           picture:
  //             "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     name: "Social Impact Tech Marathon",
  //     shortDescription:
  //       "Leverage technology to create positive social change and address humanitarian challenges.",
  //     fullDescription: `# 🌟 Social Impact Tech Marathon

  // **Technology for Humanity - Building Solutions That Matter**

  // The **Social Impact Tech Marathon** is where compassionate technologists, social workers, and change-makers unite to tackle the world's most pressing social challenges. This isn't just a hackathon - it's a movement to use technology as a force for **social justice**, **human dignity**, and **positive transformation**.

  // ## 🎯 Our Mission

  // Technology has the power to amplify human potential and address systemic inequalities. We're building solutions for:
  // - **1 billion people** living in extreme poverty worldwide
  // - **773 million adults** who cannot read or write
  // - **2.2 billion people** without access to clean water
  // - **1 billion people** with disabilities facing accessibility barriers
  // - **100 million people** displaced by conflict and disaster

  // **Every line of code can be a tool for justice and human flourishing.**

  // ## 💡 Impact Areas

  // ### 🏠 **Poverty & Economic Empowerment**
  // - **Microfinance platforms** for unbanked populations
  // - **Job matching** and skills training for underemployed communities
  // - **Digital marketplaces** for informal economy workers
  // - **Financial literacy** education and tools
  // - **Social safety net** optimization and fraud prevention
  // - **Universal basic income** distribution and management systems

  // ### 🎓 **Education Access & Equity**
  // - **Offline learning platforms** for low-connectivity areas
  // - **Adult literacy** programs with AI-powered adaptation
  // - **Vocational training** marketplaces and certification
  // - **Educational resource** sharing for under-resourced schools
  // - **Language learning** tools for refugees and immigrants
  // - **Girls' education** safety and empowerment platforms

  // ### 🏥 **Healthcare Access & Delivery**
  // - **Community health worker** training and coordination tools
  // - **Maternal health** monitoring in remote areas
  // - **Mental health** support for underserved populations
  // - **Medication adherence** for chronic disease management
  // - **Health information** systems for low-resource settings
  // - **Disease surveillance** and epidemic prevention

  // ### 🌍 **Humanitarian Aid & Disaster Response**
  // - **Emergency communication** systems for disaster zones
  // - **Resource coordination** for relief organizations
  // - **Refugee services** integration and case management
  // - **Missing persons** location and family reunification
  // - **Aid distribution** tracking and accountability
  // - **Early warning systems** for vulnerable communities

  // ### ⚖️ **Human Rights & Social Justice**
  // - **Legal aid** access and case management
  // - **Police accountability** and community oversight
  // - **Voting access** and election integrity tools
  // - **Immigration services** navigation and support
  // - **Domestic violence** safety and resource platforms
  // - **Discrimination reporting** and advocacy tools

  // ### ♿ **Accessibility & Inclusion**
  // - **Assistive technology** for people with disabilities
  // - **Sign language** translation and communication tools
  // - **Audio description** and visual accessibility
  // - **Cognitive accessibility** for learning differences
  // - **Transportation accessibility** planning and routing
  // - **Employment inclusion** platforms and accommodation tools

  // ## 🤝 NGO & Community Partners

  // ### **Global Organizations**
  // - **United Nations** - Sustainable Development Goals alignment
  // - **Doctors Without Borders** - Healthcare delivery in crisis zones
  // - **Oxfam** - Poverty alleviation and emergency response
  // - **Amnesty International** - Human rights documentation and advocacy
  // - **World Food Programme** - Food security and nutrition

  // ### **Local Community Organizations**
  // - **Community health centers** and local clinics
  // - **Adult literacy programs** and education nonprofits
  // - **Housing assistance** and homelessness service providers
  // - **Legal aid societies** and immigration support organizations
  // - **Disability advocacy** groups and accessibility organizations

  // ### **Social Enterprises**
  // - **Grameen Foundation** - Microfinance and financial inclusion
  // - **Kiva** - Crowd-funded microloans for entrepreneurs
  // - **charity: water** - Clean water and sanitation projects
  // - **Room to Read** - Global education and girls' empowerment
  // - **Ashoka** - Social entrepreneurship and changemaker networks

  // ## 📊 Available Data & Resources

  // ### **Social Impact Datasets**
  // - **World Bank Open Data** - Poverty, education, health indicators
  // - **UN Data** - Global development and humanitarian statistics
  // - **USAID Development Data Library** - Aid effectiveness and outcomes
  // - **Our World in Data** - Global problems and progress metrics
  // - **Humanitarian Data Exchange** - Crisis and emergency response data

  // ### **APIs for Social Good**
  // - **Google.org APIs** - Crisis information and mapping
  // - **Microsoft AI for Good** - Humanitarian AI tools and services
  // - **Twilio.org** - Communication tools for nonprofits
  // - **Slack for Nonprofits** - Collaboration and coordination tools
  // - **Salesforce Nonprofit Cloud** - Case management and donor tracking

  // ### **Development Tools**
  // - **GitHub for Nonprofits** - Free repository hosting and tools
  // - **Google Ad Grants** - Free advertising for eligible nonprofits
  // - **Microsoft 365 Nonprofit** - Productivity and collaboration suite
  // - **Amazon Web Services** - Nonprofit credits and cloud infrastructure
  // - **Figma for Nonprofits** - Design and prototyping tools

  // ## 🏆 Impact Categories

  // ### 🥇 **Greatest Social Impact** - *$10,000*
  // > Solution with highest potential for positive social change

  // **Evaluation Criteria:**
  // - **Social impact potential** (60%) - Scale and depth of positive change
  // - **Community-centered design** (25%) - Built with and for affected communities
  // - **Implementation pathway** (15%) - Clear route to real-world deployment

  // ### 🌍 **Global Development Innovation** - *$6,000*
  // > Best solution addressing international development challenges

  // ### 🏠 **Community Empowerment** - *$5,000*
  // > Outstanding tool for local community organizing and advocacy

  // ### ♿ **Accessibility Excellence** - *$5,000*
  // > Best technology improving accessibility and inclusion

  // ### 📱 **Mobile-First Impact** - *$4,000*
  // > Best mobile solution for low-resource environments

  // ## 🎓 Social Impact Workshops

  // ### **Human-Centered Design**
  // - **Community co-design** methods and participatory development
  // - **Cultural competency** in technology design
  // - **Trauma-informed** design for vulnerable populations
  // - **Accessibility** and universal design principles

  // ### **Development Context**
  // - **Technology in low-resource** settings and infrastructure constraints
  // - **Digital divide** considerations and offline-first design
  // - **Local capacity building** and technology transfer
  // - **Sustainability** and long-term maintenance planning

  // ### **Social Sector Operations**
  // - **Nonprofit technology** needs and constraints
  // - **Grant funding** for social impact technology
  // - **Partnership development** with NGOs and community organizations
  // - **Impact measurement** and social return on investment

  // ### **Ethics & Responsibility**
  // - **Data sovereignty** and community data rights
  // - **Consent and privacy** in vulnerable populations
  // - **Avoiding technological** colonialism and imposing solutions
  // - **Power dynamics** and technology access inequities

  // ## 💻 Technical Considerations

  // ### **Low-Resource Deployment**
  // - **Offline-first** application design and synchronization
  // - **Low-bandwidth** optimization and progressive web apps
  // - **Basic device** compatibility (feature phones, older smartphones)
  // - **Power efficiency** for areas with limited electricity
  // - **Local language** support and internationalization

  // ### **Security & Privacy**
  // - **Extra privacy protection** for vulnerable populations
  // - **Secure communication** in oppressive regimes
  // - **Data minimization** and protection by design
  // - **Anonymous reporting** and whistleblower protection

  // ### **Scalability & Sustainability**
  // - **Open source** development for community ownership
  // - **Local hosting** and regional deployment options
  // - **Training materials** and capacity building resources
  // - **Maintenance planning** and long-term support

  // ## 🌟 Real-World Implementation

  // ### **Pilot Program Pathways**
  // - **NGO partnerships** for immediate pilot deployment
  // - **Community validation** and user feedback integration
  // - **Impact measurement** and outcome tracking
  // - **Scaling strategies** for regional and global expansion

  // ### **Funding & Support**
  // - **Social impact accelerator** program connections
  // - **Grant writing** assistance for continued development
  // - **Corporate social responsibility** partnership opportunities
  // - **Foundation funding** introductions and applications

  // ## 🎁 Prize Package & Support

  // ### **Development Resources**
  // - **Cloud infrastructure** credits for deployment
  // - **Translation services** for multi-language support
  // - **User research** and community engagement support
  // - **Legal consultation** for data privacy and compliance

  // ### **Partnership Opportunities**
  // - **NGO implementation** partnerships and pilot programs
  // - **Social impact investor** introductions and funding
  // - **Corporate CSR** collaboration and scaling support
  // - **Academic research** partnerships and validation studies

  // ### **Long-term Impact**
  // - **Continued mentorship** with social impact professionals
  // - **Conference speaking** opportunities at social sector events
  // - **Media coverage** and storytelling support
  // - **Career placement** in social impact technology organizations

  // ## ⚖️ Ethical Framework

  // ### **Community-Centered Principles**
  // - **Nothing about us, without us** - Community involvement in all stages
  // - **Local ownership** and capacity building prioritized
  // - **Cultural sensitivity** and context-appropriate design
  // - **Power redistribution** rather than reinforcement of inequalities

  // ### **Responsible Technology**
  // - **Do no harm** as fundamental design principle
  // - **Transparency** in algorithms and decision-making systems
  // - **Accountability** mechanisms for negative impacts
  // - **Equitable access** and digital inclusion considerations

  // ## 🌈 Success Stories & Inspiration

  // > **"Technology alone cannot solve social problems, but when designed with and for communities, it can amplify human agency and create pathways to justice that didn't exist before."**
  // >
  // > *- Sarah Johnson, Social Impact Designer*

  // ### **Past Winner Impact**
  // - **HealthConnect** (2023) - Now serving 50,000+ patients in rural clinics
  // - **EduBridge** (2022) - Helped 10,000+ adults learn to read and write
  // - **SafeHaven** (2021) - Provided emergency assistance to 5,000+ domestic violence survivors

  // ---

  // **Ready to change the world through code?** Join us in building technology that doesn't just disrupt markets – it transforms lives and communities! 🌟💝`,
  //     ...createTestingPeriods(7),
  //     techStack: [
  //       "React",
  //       "Node.js",
  //       "Python",
  //       "MongoDB",
  //       "SMS APIs",
  //       "Translation APIs",
  //       "Maps",
  //     ],
  //     experienceLevel: "all" as const,
  //     location: "Chicago, IL (Hybrid)",
  //     socialLinks: {
  //       website: "https://socialimpact.tech",
  //       discord: "https://discord.gg/socialimpact",
  //       twitter: "https://twitter.com/socialimpactdev",
  //       telegram: "",
  //       github: "https://github.com/social-impact-tech",
  //     },
  //     prizeCohorts: [
  //       {
  //         name: "Greatest Social Impact",
  //         numberOfWinners: 1,
  //         prizeAmount: "10000",
  //         description:
  //           "Solution with highest potential for positive social change",
  //         judgingMode: "hybrid",
  //         votingMode: "public",
  //         maxVotesPerJudge: 1,
  //         evaluationCriteria: [
  //           {
  //             name: "Social Impact",
  //             points: 60,
  //             description: "Potential to create positive social change",
  //           },
  //           {
  //             name: "Community Need",
  //             points: 25,
  //             description: "Addresses genuine community-identified needs",
  //           },
  //           {
  //             name: "Implementation Plan",
  //             points: 15,
  //             description: "Clear path to real-world deployment",
  //           },
  //         ],
  //       },
  //       {
  //         name: "Best Accessibility Solution",
  //         numberOfWinners: 1,
  //         prizeAmount: "5000",
  //         description: "Outstanding accessibility and inclusion technology",
  //         judgingMode: "automated",
  //         votingMode: "public",
  //         maxVotesPerJudge: 1,
  //         evaluationCriteria: [
  //           {
  //             name: "Accessibility Impact",
  //             points: 70,
  //             description: "Improves accessibility for people with disabilities",
  //           },
  //           {
  //             name: "Inclusive Design",
  //             points: 30,
  //             description: "Universal design principles and broad inclusion",
  //           },
  //         ],
  //       },
  //     ],
  //     judges: [
  //       {
  //         address: "0x5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f",
  //         status: "invited",
  //       },
  //       {
  //         address: "0x5d4e3f2c1b5d4e3f2c1b5d4e3f2c1b5d4e3f2c1b",
  //         status: "accepted",
  //       },
  //     ],
  //     schedule: [
  //       {
  //         name: "Social Impact Design Thinking",
  //         description: "Human-centered design for social good",
  //         startDateTime: createDate(45, 9),
  //         endDateTime: createDate(45, 11),
  //         hasSpeaker: true,
  //         speaker: {
  //           name: "Sarah Johnson",
  //           position: "Social Impact Designer",
  //           xName: "Sarah Johnson",
  //           xHandle: "@sarahjohnsondesign",
  //           picture:
  //             "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
  //         },
  //       },
  //     ],
  //   },
];

// Helper function to get a random mock hackathon
export function getRandomMockHackathon(): HackathonFormData {
  const randomIndex = Math.floor(Math.random() * mockHackathons.length);
  const mockData = { ...mockHackathons[randomIndex] }; // Return a copy to avoid mutations

  // Remove visual from mock data - users should upload their own images
  delete mockData.visual;

  return mockData;
}

// Helper function to get multiple random mock hackathons
export function getRandomMockHackathons(count: number): HackathonFormData[] {
  const shuffled = [...mockHackathons].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, mockHackathons.length));
}

// Export all mock data for testing
export { mockHackathons as allMockHackathons };
