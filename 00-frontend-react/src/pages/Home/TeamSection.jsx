import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

const TeamMember = ({ image, name, role, description }) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-purple-100 group-hover:ring-purple-300 transition-all">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
            }}
          />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-lg">
            Team Member
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-2 mb-4">
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <p className="text-sm font-semibold text-purple-600">{role}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
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
    <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md mb-4">
            <UsersIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">Meet Our Team</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            The People Behind{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Linglooma
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A passionate team dedicated to helping you achieve your English goals
          </p>
        </div>
        
        {/* First Row - 3 members */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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
