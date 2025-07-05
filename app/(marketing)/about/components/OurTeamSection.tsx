import React from 'react';
import { TEAM_CONTENT, LEADERSHIP_TEAM } from '../constants';

interface AvatarProps {
  src?: string;
  fallback: string;
  alt: string;
}

function Avatar({ src, fallback, alt }: AvatarProps) {
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-base sm:text-lg md:text-xl font-medium">
          {fallback}
        </div>
      )}
    </div>
  );
}

interface OurTeamSectionProps {
  isVisible: boolean;
}

export function OurTeamSection({ isVisible }: OurTeamSectionProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-muted to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-3 sm:mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {TEAM_CONTENT.title}
          </h2>
          <p
            className={`text-muted-foreground max-w-3xl mx-auto text-sm sm:text-base md:text-lg transition-all duration-700 delay-200 px-4 sm:px-6 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {TEAM_CONTENT.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {LEADERSHIP_TEAM.map((member, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-background to-muted rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl border border-border hover:border-primary/40 transition-all duration-500 transform hover:-translate-y-2 text-center ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <Avatar src={member.image} fallback={member.name[0]} alt={member.name} />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-2 text-card-foreground">{member.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 