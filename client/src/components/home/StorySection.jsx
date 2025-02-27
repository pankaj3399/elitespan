import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Story1 from "../../assets/Story1.png";
import Story2 from "../../assets/Story2.png";
import Story3 from "../../assets/Story3.jpg";
import Story4 from "../../assets/Story4.jpg";
import Story5 from "../../assets/Story5.jpg";
import Story6 from "../../assets/Story6.jpg";
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
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="text-white text-xl font-medium mb-2">Story {number} (Area)</h3>
        <p className="text-white/90 text-sm">{text}</p>
      </div>
    </motion.div>
  );
};

const StorySection = () => {
  const containerControls = useAnimation();
  const containerRef = useRef(null);
  
  const stories = [
    // {
    //   image: Story1,
    //   number: "1",
    //   text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    // },
    // {
    //   image: Story2,
    //   number: "2",
    //   text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    // },
    {
      image: Story6,
      number: "1",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      image: Story3,
      number: "2",
      text: "Lorem ipsum magnam facilis taciti goiundae. Eam nuisquam koras oniga maki omarc vae, natus."
    },
    {
      image: Story4,
      number: "3",
      text: "Lorem ipsum minsig penyer putyus a tirant, kavel sunt phosis. In posuere felis non diam."
    },
    {
      image: Story5,
      number: "4",
      text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat."
    },
    // {
    //   image: Story7,
    //   number: "7",
    //   text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat."
    // },
    // {
    //   image: Story8,
    //   number: "8",
    //   text: "Lorem ifutilismanen ut sis. Qing hest nascetur purus id fermentum, congue eleifend erat."
    // }
  ];

  // Create three sets of stories for seamless infinite scroll
  const extendedStories = [...stories, ...stories, ...stories];

  useEffect(() => {
    let animationFrame;
    let startTime = null;
    const duration = 40000; // 40 seconds
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (containerRef.current) {
        const singleSetWidth = containerRef.current.children[0].offsetWidth * stories.length;
        const progress = (elapsed % duration) / duration;
        const x = -progress * singleSetWidth;
        
        containerControls.set({ x });
        
        if (elapsed >= duration) {
          startTime = timestamp;
        }
      }
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [containerControls, stories.length]);

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
          ref={containerRef}
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