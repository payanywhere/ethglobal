export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  }
} as const

export const ANIMATION_TRANSITION = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const // cubic-bezier(0.4, 0, 0.2, 1)
} as const
