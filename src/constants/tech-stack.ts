import type { Option } from "@/components/ui/multiselect";

// https://github.com/marwin1991/profile-technology-icons
// prettier-ignore
export const TECH_STACK = [
  {
    value: "javascript",
    label: "JavaScript",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/javascript.png",
  },
  {
    value: "typescript",
    label: "TypeScript",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png",
  },
  {
    value: "react",
    label: "React",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/react.png",
  },
  {
    value: "nextjs",
    label: "Next.js",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/nextjs.png",
  },
  {
    value: "vuejs",
    label: "Vue.js",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/vuejs.png",
  },
  {
    value: "angular",
    label: "Angular",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/angular.png",
  },
  {
    value: "nodejs",
    label: "Node.js",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/nodejs.png",
  },
  {
    value: "python",
    label: "Python",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/python.png",
  },
  {
    value: "django",
    label: "Django",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/django.png",
  },
  {
    value: "flask",
    label: "Flask",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/flask.png",
  },
  {
    value: "java",
    label: "Java",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/java.png",
  },
  {
    value: "spring",
    label: "Spring",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/spring.png",
  },
  {
    value: "cpp",
    label: "C++",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/cpp.png",
  },
  {
    value: "csharp",
    label: "C#",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/csharp.png",
  },
  {
    value: "go",
    label: "Go",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/go.png",
  },
  {
    value: "rust",
    label: "Rust",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/rust.png",
  },
  {
    value: "php",
    label: "PHP",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/php.png",
  },
  {
    value: "ruby",
    label: "Ruby",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/ruby.png",
  },
  {
    value: "rails",
    label: "Rails",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/rails.png",
  },
  {
    value: "swift",
    label: "Swift",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/swift.png",
  },
  {
    value: "kotlin",
    label: "Kotlin",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/kotlin.png",
  },
  {
    value: "flutter",
    label: "Flutter",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/flutter.png",
  },
  {
    value: "react-native",
    label: "React Native",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/react-native.png",
  },
  {
    value: "unity",
    label: "Unity",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/unity.png",
  },
  {
    value: "unreal",
    label: "Unreal Engine",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/unreal.png",
  },
  {
    value: "tensorflow",
    label: "TensorFlow",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/tensorflow.png",
  },
  {
    value: "pytorch",
    label: "PyTorch",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/pytorch.png",
  },
  {
    value: "ai-ml",
    label: "AI/ML",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/ai-ml.png",
  },
  {
    value: "machine-learning",
    label: "Machine Learning",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/machine-learning.png",
  },
  {
    value: "blockchain",
    label: "Blockchain",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/blockchain.png",
  },
  {
    value: "web3",
    label: "Web3",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/web3.png",
  },
  {
    value: "ethereum",
    label: "Ethereum",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/ethereum.png",
  },
  {
    value: "solidity",
    label: "Solidity",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/solidity.png",
  },
  {
    value: "bitcoin",
    label: "Bitcoin",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/bitcoin.png",
  },
  {
    value: "defi",
    label: "DeFi",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/defi.png",
  },
  {
    value: "nft",
    label: "NFT",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/nft.png",
  },
  {
    value: "iot",
    label: "IoT",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/iot.png",
  },
  {
    value: "ar-vr",
    label: "AR/VR",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/ar-vr.png",
  },
  {
    value: "mobile",
    label: "Mobile",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/mobile.png",
  },
  {
    value: "desktop",
    label: "Desktop",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/desktop.png",
  },
  {
    value: "web",
    label: "Web",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/web.png",
  },
  {
    value: "cloud",
    label: "Cloud",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/cloud.png",
  },
  {
    value: "aws",
    label: "AWS",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/aws.png",
  },
  {
    value: "azure",
    label: "Azure",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/azure.png",
  },
  {
    value: "gcp",
    label: "GCP",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/gcp.png",
  },
  {
    value: "docker",
    label: "Docker",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png",
  },
  {
    value: "kubernetes",
    label: "Kubernetes",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/kubernetes.png",
  },
  {
    value: "devops",
    label: "DevOps",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/devops.png",
  },
  {
    value: "firebase",
    label: "Firebase",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/firebase.png",
  },
  {
    value: "mongodb",
    label: "MongoDB",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/mongodb.png",
  },
  {
    value: "postgresql",
    label: "PostgreSQL",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/postgresql.png",
  },
  {
    value: "mysql",
    label: "MySQL",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/mysql.png",
  },
  {
    value: "redis",
    label: "Redis",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/redis.png",
  },
  {
    value: "graphql",
    label: "GraphQL",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/graphql.png",
  },
  {
    value: "rest-api",
    label: "REST API",
    icon: "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/rest.png",
  },
];
