"use client";

import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext,
  type CarouselApi
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { UIHackathon } from "@/types/hackathon";
import { getHackathonStatus } from "@/lib/helpers/hackathon-transforms";
import { format } from "date-fns";
import React, { useEffect, useState, useRef } from "react";

interface FeaturedCarouselProps {
  hackathons: UIHackathon[];
}

export function FeaturedCarousel({ hackathons }: FeaturedCarouselProps) {
  // Filter for live hackathons (Registration Open, Registration Closed, Live, Voting)
  const liveHackathons = hackathons.filter((hackathon) => {
    const status = getHackathonStatus(hackathon);
    return (
      status === "Registration Open" ||
      status === "Registration Closed" ||
      status === "Live" ||
      status === "Voting"
    );
  });

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
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
      const amount = parseFloat(cohort.prizeAmount.replace(/[^0-9.-]+/g, "")) || 0;
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
      className="mb-12 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static Featured Badge */}
      <div className="absolute top-4 left-4 z-20">
        <Badge variant="secondary">Featured</Badge>
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
            const status = getHackathonStatus(hackathon);
            
            return (
              <CarouselItem key={hackathon.id}>
                <div 
                  className="relative rounded-xl overflow-hidden text-white h-[350px] sm:h-[400px] flex items-center"
                  style={{
                    background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${hackathon.visual || '/placeholder-hackathon.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="container relative z-10 px-6 sm:px-8 md:px-12">
                    <div className="max-w-2xl">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                        {hackathon.name}
                      </h1>
                      <p className="text-base sm:text-lg mb-4 sm:mb-5">
                        {hackathon.shortDescription}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6 text-center">
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">Registration Deadline</p>
                          <p className="text-sm sm:text-base">
                            {hackathon.registrationPeriod?.registrationEndDate 
                              ? format(new Date(hackathon.registrationPeriod.registrationEndDate), "dd MMM yyyy")
                              : "TBD"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">Tech Stack</p>
                          <p className="text-sm sm:text-base">
                            {hackathon.techStack && hackathon.techStack.length > 0 
                              ? hackathon.techStack.slice(0, 2).join(", ") 
                              : "Various"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">Level</p>
                          <p className="text-sm sm:text-base capitalize">
                            {hackathon.experienceLevel === "all" ? "All Levels" : hackathon.experienceLevel}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">Total Prize</p>
                          <p className="text-sm sm:text-base">{totalPrize}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Button size="lg" className="text-sm sm:text-base">
                          Start Register <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              current === index ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}