import { motion } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: FadeInProps) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 30,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
      margin: "-50px",
    }}
    transition={{
      duration: 0.7,
      delay,
      ease: "easeOut",
    }}
    className={className}
  >
    {children}
  </motion.div>
);
