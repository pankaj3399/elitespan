import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import Story1 from "../../assets/Story1.png";
import Story2 from "../../assets/Story2.png";
import Story3 from "../../assets/Story3.png";
import Story4 from "../../assets/Story4.png";
import Story5 from "../../assets/Story5.png";
import Story6 from "../../assets/Story6.png";
import Story7 from "../../assets/Story7.png";
import Story8 from "../../assets/Story8.png";

const StoryCard = ({ image, number, text }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="relative min-w-[400px] h-[500px] rounded-2xl overflow-hidden mx-3"
    >
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={`Story ${number}`} 
          className="w-full h-full object-cover object-top" // Changed to object-top
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" /> {/* Enhanced gradient */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="text-white text-xl font-medium mb-2">Story {number} (Area)</h3>
        <p className="text-white/90 text-sm">{text}</p> {/* Increased text opacity */}
      </div>
    </motion.div>
  );
};

const StorySection = () => {
  const containerControls = useAnimation();
  
  const stories = [
    {
      image: Story1,
      number: "1",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      image: Story2,
      number: "2",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      image: Story6,
      number: "3",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      image: Story3,
      number: "4",
      text: "Lorem ipsum magnam facilis taciti goiundae. Eam nuisquam koras oniga maki omarc vae, natus. Dia mikrokosm tartochia resalkiga, lippa igit lithe kisam ert mihilsen."
    },
    {
      image: Story4,
      number: "5",
      text: "Lorem ipsum minsig penyer putyus a tirant, kavel sunt phosis. In posuere felis non diam. Proin eget. Diritadit sed ta fsnyre selctor fty byur kjst. Mekonsting nyra sirkiga sv dirm denn to duning."
    },
    {
      image: Story5,
      number: "6",
      text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat, volutpat at felis. Platea sapien Grade demi ut nonumen, em fugt."
    },
    {
      image: Story7,
      number: "7",
      text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat, volutpat at felis. Platea sapien Grade demi ut nonumen, em fugt."
    },
    {
      image: Story8,
      number: "8",
      text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat, volutpat at felis. Platea sapien Grade demi ut nonumen, em fugt."
    }
  ];

  // Duplicate stories for infinite scroll effect
  const extendedStories = [...stories, ...stories];

  useEffect(() => {
    const startAnimation = async () => {
      await containerControls.start({
        x: [0, -1600],
        transition: {
          x: {
            repeat: Infinity,
            duration: 40,
            ease: "linear"
          }
        }
      });
    };
    startAnimation();
  }, [containerControls]);

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-16 overflow-x-hidden"
    >
      <div className="relative w-full">
        <motion.div 
          className="flex"
          animate={containerControls}
        >
          {extendedStories.map((story, index) => (
            <StoryCard
              key={`${story.number}-${index}`}
              image={story.image}
              number={story.number}
              text={story.text}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default StorySection;