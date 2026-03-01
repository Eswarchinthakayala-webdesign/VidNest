import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useRef } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef(null)
  
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = (event) => {
    const nextTheme = isDark ? "light" : "dark"

    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    // Get click coordinates for the transition origin, falling back to button center
    const rect = buttonRef.current?.getBoundingClientRect()
    const x = event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2)
    const y = event?.clientY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2)
    
    // Calculate the distance to the furthest corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme)
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: isDark ? "::view-transition-old(root)" : "::view-transition-new(root)",
        }
      )
    })

  }

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="relative rounded-full w-10 h-10 transition-colors hover:bg-accent/50 group"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
             key={isDark ? "moon" : "sun"}
             initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
             animate={{ scale: 1, rotate: 0, opacity: 1 }}
             exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
             transition={{ 
               type: "spring", 
               stiffness: 300, 
               damping: 20,
               duration: 0.3
             }}
             className="relative z-10"
          >
             {isDark ? (
               <Moon className="h-5 w-5 text-foreground" />
             ) : (
               <Sun className="h-5 w-5 text-foreground" />
             )}
          </motion.div>
        </AnimatePresence>
        
        {/* Animated background pulse on hover */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/5 -z-0"
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )

}
