import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import Story3 from "../../assets/Story3.png";
import Story4 from "../../assets/Story4.png";
import Story5 from "../../assets/Story5.png";
import Story6 from "../../assets/Story6.png";

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
      <img 
        src={image} 
        alt={`Story ${number}`} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="text-white text-xl font-medium mb-2">Story {number} (Area)</h3>
        <p className="text-white/80 text-sm">{text}</p>
      </div>
    </motion.div>
  );
};

const StorySection = () => {
  const containerControls = useAnimation();
  
  const stories = [
    {
      image: Story3,
      number: "3",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      image: Story4,
      number: "4",
      text: "Lorem ipsum magnam facilis taciti goiundae. Eam nuisquam koras oniga maki omarc vae, natus. Dia mikrokosm tartochia resalkiga, lippa igit lithe kisam ert mihilsen."
    },
    {
      image: Story5,
      number: "5",
      text: "Lorem ipsum minsig penyer putyus a tirant, kavel sunt phosis. In posuere felis non diam. Proin eget. Diritadit sed ta fsnyre selctor fty byur kjst. Mekonsting nyra sirkiga sv dirm denn to duning."
    },
    {
      image: Story6,
      number: "6",
      text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat, volutpat at felis. Platea sapien Grade demi ut nonumen, em fugt."
    }
  ];

  // Duplicate stories for infinite scroll effect
  const extendedStories = [...stories, ...stories];

  useEffect(() => {
    const startAnimation = async () => {
      await containerControls.start({
        x: [0, -1600], // Move four cards (400px each * 4 = 1600px)
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