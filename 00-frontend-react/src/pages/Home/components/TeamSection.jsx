import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

const TeamMember = ({ image, name, role, description }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="relative mb-6">
        <div className="mx-auto h-28 w-28 overflow-hidden rounded-full ring-4 ring-brand-50">
          <img 
            src={image} 
            alt={name} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
            }}
          />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
            Team Member
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-2 mb-4">
        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        <p className="text-sm font-semibold text-brand-700">{role}</p>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
      
    </div>
  );
};

const TeamSection = () => {
  const teamMembers = [
    {
      image: "/images/img_imagefotor2025051113567_1.png",
      name: "Mai Tấn Trung",
      role: "Frontend & UI/UX Designer",
      description: "Worked on the React interface and product design."
    },
    {
      image: "/images/img_image_2.png",
      name: "Bùi Trung Thanh",
      role: "Database & API Architect",
      description: "Worked on the database and backend API."
    },
    {
      image: "/images/img_animenamngau001fotor20250511114918_1.png",
      name: "Trần Thế Pháp",
      role: "Backend Developer",
      description: "Worked on backend architecture and application services."
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5">
            <UsersIcon className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Meet our team</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            The people behind Linglooma
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A passionate team dedicated to helping you achieve your English goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.slice(0, 3).map((member, index) => (
            <TeamMember
              key={index}
              image={member.image}
              name={member.name}
              role={member.role}
              description={member.description}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default TeamSection;
