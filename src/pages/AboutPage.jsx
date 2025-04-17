import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import styles from "../css/AboutUs.module.css";
import mission from "../assets/mission.png";
import team from "../assets/newteam.jpg";
import values from "../assets/values.jpg";

const Section = ({ title, text, image, reverse }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.7 });

  const textVariants = {
    hidden: { opacity: 0, x: reverse ? 300 : -300 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.1, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  return (
    <section
      ref={ref}
      className={`${styles.section} ${reverse ? styles.reverse : ""}`}
    >
      <motion.div
        className={styles.text}
        variants={textVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <h2>{title}</h2>
        <p>{text}</p>
      </motion.div>
      <motion.div
        className={styles.imageWrapper}
        variants={imageVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <img src={image} alt={title} className={styles.image} />
      </motion.div>
    </section>
  );
};

const AboutUs = () => {
  return (
    <div className={styles.about}>
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <h1>Who We Are</h1>
        <p>
          We’re two passionate developers — one Greek, one French — brought
          together by a shared curiosity for AI and human potential. This site
          is where our cultures, ideas, and creativity meet.
        </p>
      </motion.div>

      <Section
        title="Our Mission"
        text="Our mission is to help people grow and become the best version of themselves — every single day. Through technology, creativity, and curiosity, we aim to inspire continuous self-improvement and meaningful progress."
        image={mission}
      />

      <Section
        title="Our Team"
        text="We’re a duo of developers united by a deep passion for artificial intelligence and personal growth. From different backgrounds, we work together to build tools that empower, motivate, and connect."
        image={team}
        reverse
      />

      <Section
        title="Our Values"
        text="We believe in a future where people are more productive, happier, and less stressed. Our values revolve around clarity, resilience, and balance — helping others thrive in a world that's constantly evolving."
        image={values}
      />
    </div>
  );
};

export default AboutUs;
