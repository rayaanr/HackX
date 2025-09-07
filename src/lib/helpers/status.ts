import type { UIHackathon } from "@/types/hackathon";

export const getHackathonStatus = (hackathon: UIHackathon) => {
  const now = Date.now();

  if (
    hackathon.registrationPeriod?.registrationEndDate &&
    now < hackathon.registrationPeriod.registrationEndDate.getTime()
  ) {
    return "Registration Open";
  }
  if (
    hackathon.hackathonPeriod?.hackathonStartDate &&
    now < hackathon.hackathonPeriod.hackathonStartDate.getTime()
  ) {
    return "Registration Closed";
  }
  if (
    hackathon.hackathonPeriod?.hackathonEndDate &&
    now < hackathon.hackathonPeriod.hackathonEndDate.getTime()
  ) {
    return "Live";
  }
  if (
    hackathon.votingPeriod?.votingEndDate &&
    now < hackathon.votingPeriod.votingEndDate.getTime() &&
    (!hackathon.votingPeriod.votingStartDate ||
      now >= hackathon.votingPeriod.votingStartDate.getTime())
  ) {
    return "Voting";
  }
  return "Ended";
};
