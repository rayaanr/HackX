"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { UIHackathon } from "@/types/hackathon";
import { getHackathonStatusVariant } from "@/lib/helpers/status";
import { getDaysLeft, getUIHackathonStatus } from "@/lib/helpers/date";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";

interface FeaturedCarouselProps {
  hackathons: UIHackathon[];
}

export function FeaturedCarousel({ hackathons }: FeaturedCarouselProps) {
  // Filter for live hackathons (Registration Open, Registration Closed, Live, Voting)
  const liveHackathons = hackathons.filter((hackathon) => {
    const status = getUIHackathonStatus({
      ...hackathon,
      votingPeriod: hackathon.votingPeriod || undefined,
    });
    return (
      status === "Coming Soon" ||
      status === "Registration Open" ||
      status === "Registration Closed" ||
      status === "Live" ||
      status === "Voting"
    );
  });

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  // Auto-scroll functionality
  const startAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!api) return;

    intervalRef.current = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 5 seconds
  };

  // Stop auto-scroll
  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle hover events
  const handleMouseEnter = () => {
    setIsHovered(true);
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startAutoScroll();
  };

  // Update current slide index
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off?.("select", onSelect);
    };
  }, [api]);

  // Set up auto-scroll when api is available
  useEffect(() => {
    if (api) {
      startAutoScroll();
    }

    return () => {
      stopAutoScroll();
    };
  }, [api]);

  if (liveHackathons.length === 0) {
    return null;
  }

  // Calculate total prize amount
  const calculateTotalPrize = (hackathon: UIHackathon) => {
    if (!hackathon.prizeCohorts || hackathon.prizeCohorts.length === 0) {
      return "$0";
    }

    const total = hackathon.prizeCohorts.reduce((sum, cohort) => {
      const amount =
        parseFloat(cohort.prizeAmount.replace(/[^0-9.-]+/g, "")) || 0;
      return sum + amount;
    }, 0);

    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div
      className="mb-12 relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static Featured Badge */}
      <div className="absolute top-4 left-4 z-20">
        <Badge
          variant="default"
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg backdrop-blur-sm"
        >
          ⭐ Featured
        </Badge>
      </div>

      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {liveHackathons.map((hackathon) => {
            const totalPrize = calculateTotalPrize(hackathon);
            const status = getUIHackathonStatus({
              ...hackathon,
              votingPeriod: hackathon.votingPeriod || undefined,
            });
            const statusVariant = getHackathonStatusVariant(status);
            const deadline = hackathon.registrationPeriod?.registrationEndDate;

            // Calculate days left until deadline
            const daysLeft = deadline ? getDaysLeft(deadline) : 0;

            return (
              <CarouselItem key={hackathon.id}>
                <Link href={`/hackathons/${hackathon.id}`}>
                  <div
                    className="relative rounded-xl overflow-hidden text-white h-[250px] sm:h-[300px] flex items-end hover:scale-[1.02] transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%), url(${resolveIPFSToHttp(
                        hackathon.visual,
                      )})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6 z-10">
                      <Badge
                        variant={statusVariant}
                        className="text-white shadow-lg backdrop-blur-sm"
                      >
                        {status}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8 w-full">
                      {/* Main Content Row */}
                      <div className="flex items-end justify-between gap-8">
                        {/* Left Side - Title & Description */}
                        <div className="flex-1 max-w-xl">
                          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                            {hackathon.name}
                          </h1>
                          <p className="text-lg text-white/90 mb-6 leading-relaxed">
                            {hackathon.shortDescription}
                          </p>

                          {/* Key Info Pills */}
                          <div className="flex flex-wrap gap-3 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                              <span className="text-sm font-medium">
                                🏆 {totalPrize} Prize Pool
                              </span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                              <span className="text-sm font-medium">
                                📍 {hackathon.location}
                              </span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                              <span className="text-sm font-medium">
                                ⏱️{" "}
                                {deadline
                                  ? `${daysLeft} days left`
                                  : "Registration Open"}
                              </span>
                            </div>
                          </div>

                          {/* Tech Stack */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {hackathon.techStack
                              .slice(0, 4)
                              .map((tech, index) => (
                                <span
                                  key={index}
                                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-lg text-sm font-medium border border-white/20 backdrop-blur-sm"
                                >
                                  {tech}
                                </span>
                              ))}
                            {hackathon.techStack.length > 4 && (
                              <span className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium border border-white/20 backdrop-blur-sm">
                                +{hackathon.techStack.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Side - CTA */}
                        <div className="text-center">
                          <div className="mb-4">
                            <div className="text-2xl font-bold mb-1">
                              {totalPrize}
                            </div>
                            <div className="text-sm text-white/80">
                              Total Prize
                            </div>
                          </div>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 shadow-xl px-8 py-3 text-lg font-semibold"
                          >
                            Join Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                          <div className="mt-3 text-xs text-white/70">
                            {hackathon.experienceLevel === "all"
                              ? "All skill levels welcome"
                              : `${hackathon.experienceLevel} level`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 sm:left-4 bg-black/30 hover:bg-black/50 text-white border-none" />
        <CarouselNext className="right-2 sm:right-4 bg-black/30 hover:bg-black/50 text-white border-none" />
      </Carousel>

      {/* Static Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {liveHackathons.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`size-2 rounded-full transition-colors ${
              current === index ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
