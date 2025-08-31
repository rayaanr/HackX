import type { Hackathon } from "@/data/hackathons";

export const getHackathonStatus = (hackathon: Hackathon) => {
  const now = Date.now();
  
  if (hackathon.registrationPeriod?.registrationEndDate && now < hackathon.registrationPeriod.registrationEndDate.getTime()) {
    return "Registration Open";
  }
  if (hackathon.hackathonPeriod?.hackathonStartDate && now < hackathon.hackathonPeriod.hackathonStartDate.getTime()) {
    return "Registration Closed";
  }
  if (hackathon.hackathonPeriod?.hackathonEndDate && now < hackathon.hackathonPeriod.hackathonEndDate.getTime()) {
    return "Live";
  }
  if (hackathon.votingPeriod?.votingEndDate && now < hackathon.votingPeriod.votingEndDate.getTime()) {
    return "Voting";
  }
  return "Ended";
};